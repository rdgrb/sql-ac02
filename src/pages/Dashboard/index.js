const { ipcRenderer } = require("electron");
const $ = require("jquery");
const remote = require('electron').remote;
const { dialog } = require("electron").remote;
const fs = require("fs");

ipcRenderer.on('request-connection-update', (event, arg) => {
    showActualConfig(arg.configObject);
})

const formQuery = document.getElementById("formQuery");
const formFile = document.getElementById("formFile");
formQuery.addEventListener('submit', handleReload);
formFile.addEventListener('submit', handleReload);

function handleReload(e) {
    e.preventDefault();
}

let alreadyConnected = false;
function onLoad() {
    const config = JSON.parse(localStorage.getItem("sql-config"));
    if (config !== null) {
        showActualConfig(config);
    } else {
        $("#conexao-ativa").html(`
            <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <p class="card-text">Nenhuma conexão adicionada.</p>
            </div>
        `);
    }
}

function checkSQLConfigClick() {
    if (alreadyConnected) {
        localStorage.removeItem("sql-config");
        $("#conexao-ativa").html(`
            <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <p class="card-text">Nenhuma conexão adicionada.</p>
            </div>
        `);

        $("#btnConfig")
            .removeClass("btn-danger")
            .addClass("btn-success")
            .html("ADICIONAR");

        $("#btnSendFile, #btnSendQuery, #btnChooseFile").prop("disabled", true);

        alreadyConnected = false;
    } else {
        createFormWindow();
    }
}

let sqlConfig;
function showActualConfig(configObject) {
    sqlConfig = configObject;
    $("#conexao-ativa").html(`
        <div class="card w-100 bg-card-header">
            <div class="card-body d-flex justify-content-between align-items-center">
                <span>Servidor</span>
                <span>${configObject.server}</span>
            </div>
        </div>
        <div class="card w-100 bg-card-header">
            <div class="card-body d-flex justify-content-between align-items-center">
                <span>Usuário</span>
                <span>${configObject.user}</span>
            </div>
        </div>
        <hr class="hr-divider">
        <div class="card w-100 bg-card-header">
            <div class="card-body d-flex justify-content-between align-items-center">
                <span>BD</span>
            <span>${configObject.database}</span>
            </div>
        </div>
    `);

    alreadyConnected = true;

    $("#btnConfig")
        .removeClass("btn-success")
        .addClass("btn-danger")
        .html("REMOVER");

    $("#btnSendFile, #btnSendQuery, #btnChooseFile").prop("disabled", false);
}

function createFormWindow() {
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;

    const path = require('path')
    const rootPath = require('electron-root-path').rootPath;

    const formWindow = new BrowserWindow({
        width: 600,
        height: 400,
        center: true,
        frame: false,
        resizable: false,
        icon: path.join(rootPath, 'src/assets/icon/icon_alt.ico'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
    })

    formWindow.setMenuBarVisibility(false);
    formWindow.loadFile('src/pages/FormConexao/index.html');
}

function sendQuery() {
    $("#loadingQuery").removeClass("d-none");

    const query = $("#inputQuery").val();
    const config = JSON.parse(localStorage.getItem("sql-config"));

    const table = $("#log-datatable")[0];
    clearTable(table);

    if (query !== "") {
        sendRequest(config, query).then(response => {
            if (isResponseAnError(response)) {
                $("#log-datable").addClass("d-none");
                $("#log-console").removeClass("d-none");
            } else {
                const columnsList = Object.keys(response.recordset.columns);
                const headerRow = table.insertRow(0);
                for (let i = 0; i < columnsList.length; i++) {
                    const cell = headerRow.insertCell(i);
                    cell.innerHTML = columnsList[i];
                    cell.className = "table-header";
                }

                const dataList = response.recordset;
                for (let i = 0; i < dataList.length; i++) {
                    let row = table.insertRow(i + 1);
                    let columnsList = Object.entries(dataList[i]);

                    for (let j = 0; j < columnsList.length; j++) {
                        let cell = row.insertCell(j);
                        if (j == 0) {
                            cell.className = "font-weight-bold";
                        }
                        cell.innerHTML = columnsList[j][1];
                    }
                }

                $("#log-console").addClass("d-none");
                $("#log-datatable").removeClass("d-none");

            }
        }).finally(() => {
            $("#loadingQuery").addClass("d-none");
        });
    } else {
        $("#loadingQuery").addClass("d-none");
        $("#inputQuery").addClass("is-invalid");
    }
}

function clearTable(table) {
    let tableRows = table.rows.length;
    while (tableRows > 0) {
        table.deleteRow(tableRows - 1);
        tableRows -= 1;
    }
}

function openCSVFile() {
    let currentWindow = remote.getCurrentWindow();

    $("#lblFilePath").html("Nenhum arquivo selecionado");
    dialog.showOpenDialog(currentWindow, {
        properties: ["openFile"],
        filters: [
            { name: "Arquivo .csv", extensions: ["csv"] },
        ]
    }).then(result => {
        if (!result.canceled) {
            objList = [];
            $("#lblFilePath").html(result.filePaths[0]);

            const fileContent = fs.readFileSync(result.filePaths[0]).toString();
            let linhasCSV = fileContent.split(/r\n|\n/);

            const headerCSV = linhasCSV[0].split(",");
            linhasCSV.slice(0, 1);

            let headerList = [];
            headerCSV.forEach(element => {
                headerList.push($.trim(element));
            });

            for (let i = 1; i < linhasCSV.length; i++) {
                let dataObj = {};
                let dataRow = linhasCSV[i].split(",");

                for (let j = 0; j < dataRow.length; j++) {
                    dataObj[headerList[j]] = $.trim(dataRow[j]);
                }

                objList.push(dataObj);
            }
        }
    })
}

let objList = []
function sendData() {
    $("#loadingSendFile").removeClass("d-none");
    $("#log-datatable").addClass("d-none");

    const tableName = $("#inputTable").val();
    let insertQuery = `
        INSERT INTO ${tableName} 
        (${getQueryFormattedValue(objList[0], true)})
        VALUES 
    `;

    for (let i = 0; i < objList.length; i++) {
        insertQuery += `(${getQueryFormattedValue(objList[i], false)}`;

        if (i === objList.length - 1) {
            insertQuery += ")";
        } else {
            insertQuery += "), ";
        }
    }

    sendRequest(sqlConfig, insertQuery).then(response => {
        if (!isResponseAnError(response)) {
            $("#log-console").append(`
                <li>[LOG] <span class="text-success"> Dados inseridos com sucesso.</span>
                ${response.rowsAffected[0]} linhas afetadas.</li>
            `);
        }
    }).finally(() => {
        $("#loadingSendFile").addClass("d-none");
    })
}

function isResponseAnError(response) {
    if (response.code) {
        switch (response.code) {
            case "EREQUEST":
                $("#log-console").append(`
                    <li>[LOG] <span class="text-danger"> ERRO DE REQUEST </span>${response.message}</li>
                `)
                return true;
            case "ETIMEOUT":
                $("#log-console").append(`
                    <li>[LOG] <span class="text-warning"> A conexão com o SQL expirou. Reabra a aplicação. </span></li>
                `)

                return true;
            default:
                $("#log-console").append(`
                    <li>[LOG] <span class="text-danger"> ERRO ${response.code} </span> ${response.message}</li>
                `)
                return true;
        }
    } else {
        return false;
    }
}

function getQueryFormattedValue(object, isHeader) {
    let queryString = "";

    const keysLength = Object.entries(object).length;
    let keyCount = 0;

    if (isHeader) {
        Object.entries(object).forEach(([key, value]) => {
            keyCount === keysLength - 1 ? queryString += `${key}` : queryString += `${key}, `;
            keyCount += 1;
        });
    } else {
        Object.entries(object).forEach(([key, value]) => {
            keyCount === keysLength - 1 ?
                queryString += `${getFormattedValue(value)}` : queryString += `${getFormattedValue(value)}, `;
            keyCount += 1;
        });
    }

    return queryString;
}

function getFormattedValue(data) {
    if (isNaN(data)) {
        return `'${data}'`;
    } else {
        return `${data}`;
    }
}

function clearConsole() {
    $("#log-datatable").addClass("d-none");
    $("#log-console").removeClass("d-none").html(`
        <li>[LOG] Console limpo.</li>
    `);
}