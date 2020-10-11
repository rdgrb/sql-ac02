function minimizar() {
    executarToolbar("minimizar");
}

function maximizar() {
    executarToolbar("maximizar");
}

function fechar() {
    executarToolbar("fechar");
}

function executarToolbar(acao) {
    const remote = require('electron').remote;

    let janela = remote.getCurrentWindow();
    console.log(janela.getTitle());
    switch (acao) {
        case "maximizar":
            janela.isMaximized() ? janela.unmaximize() : janela.maximize()
            break;
        case "minimizar":
            janela.minimize();
            break;
        case "fechar":
            janela.close();
            break;
    }
}