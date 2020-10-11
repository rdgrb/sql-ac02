const { ipcRenderer } = require("electron");
const $ = require("jquery");

ipcRenderer.on('request-connection-update', (event, arg) => {
    showActualConfig(arg.configObject);
})

const formQuery = document.getElementById("formQuery");
formQuery.addEventListener('submit', handleReload);

function handleReload(e) {
    e.preventDefault();
}

let alreadyConnected = false;
function onLoad() {
    const config = JSON.parse(localStorage.getItem("sql-config"));
    if (config !== null) {
        showActualConfig(config);
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

        $("#btnSendFile, #btnSendQuery").prop("disabled", true);

        alreadyConnected = false;
    } else {
        createFormWindow();
    }
}

function showActualConfig(configObject) {
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

    $("#btnSendFile, #btnSendQuery").prop("disabled", false);
}


function createFormWindow() {
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;

    const formWindow = new BrowserWindow({
        width: 500,
        height: 510,
        center: true,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
    })

    formWindow.setMenuBarVisibility(false);
    formWindow.loadFile('src/pages/FormConexao/index.html');
}

function sendQuery() {
    const query = $("#inputQuery").val();
    const config = JSON.parse(localStorage.getItem("sql-config"));

    const table = $("#log-datatable")[0];
    clearTable(table);

    if (query !== "") {
        queryData(config, query).then(response => {
            const columnsList = Object.keys(response.recordset.columns);
            const headerRow = table.insertRow(0);
            for (let i = 0; i < columnsList.length; i++) {
                const cell = headerRow.insertCell(i);
                cell.innerHTML = columnsList[i];
            }

            const dataList = response.recordset;
            for (let i = 0; i < dataList.length; i++) {
                let row = table.insertRow(i + 1);
                let columnsList = Object.entries(dataList[i]);

                for (let j = 0; j < columnsList.length; j++) {
                    let cell = row.insertCell(j);
                    cell.innerHTML = columnsList[j][1];
                }
            }
        });

        $("#log-console").addClass("d-none");
        $("#log-datatable").removeClass("d-none");
    } else {
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
