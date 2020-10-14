const $ = require("jquery");

const form = document.getElementById("formConnection");
form.addEventListener('submit', handleReload);

function handleReload(e) {
    e.preventDefault();
}

let configObj = {
    server: "",
    user: "",
    password: "",
    database: "",
}
function saveData() {
    if (validateForm()) {
        configObj.database = $("#inputDatabase").val();

        saveConnectionConfig(configObj);
        updateDashboard(configObj);

        fechar();
    }
}

function validateForm() {
    clearValidation();

    let valid = true;
    if ($("#inputUsername").val() === "") {
        $("#inputUsername").addClass("is-invalid");
        valid = false;
    }

    if ($("#inputPassword").val() === "") {
        $("#inputPassword").addClass("is-invalid");
        valid = false;
    }

    if ($("#inputDatabase").val() === "default" || $("#inputDatabase").val() === "loadingDefault") {
        $("#inputDatabase").addClass("is-invalid");
        valid = false;
    }

    return valid;
}

function clearValidation() {
    $("#inputDatabase, #inputUsername, #inputPassword").removeClass("is-invalid");
}

function clearDatabaseList() {
    $("#inputDatabase").html(`
        <option selected value="default">Nenhum banco de dados selecionado</option>
        <option id="optionLoading" class="d-none" value="loadingDefault">Carregando...</option>
    `);
}

let alreadyListed = false;
function getDatabases() {
    configObj.server = $("#inputServer").val("") ? "localhost" : $("#inputServer").val();
    configObj.user = $("#inputUsername").val();
    configObj.password = $("#inputPassword").val();

    if (configObj.user !== "" && configObj.password !== "") {
        $("#inputDatabase").val("loadingDefault");
        $("#optionLoading").removeClass("d-none");

        clearDatabaseList();

        configObj.database = "master";

        const query = "SELECT * FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')";
        sendRequest(configObj, query).then(response => {
            console.log(response);
            if (!isResponseAnError(response)) {
                response.recordset.forEach(database => {
                    $("#inputDatabase").append(`
                            <option value="${database.name}">${database.name}</option>
                        `);
                });

                $("#inputDatabase").val("default");
                $("#optionLoading").addClass("d-none");
            }
        })
    }
}

function isResponseAnError(response) {
    if (response.code) {
        $("#errorTitle").html(`ERRO - <span class="text-warning">${response.code}</span>`)
        $("#errorText").html(`Falha ao recuperar lista de Databases: <br> ${response.message}`);
        $('#errorModal').modal();

        return true;
    } else {
        return false;
    }
}

function updateDashboard(config) {
    const { ipcRenderer } = require("electron");

    let data = {
        configObject: config,
    };

    ipcRenderer.send("request-connection-update", data);
}
