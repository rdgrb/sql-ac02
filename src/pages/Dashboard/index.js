function abrirFormAddConexao() {
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;

    const formAddConexao = new BrowserWindow({
        width: 500,
        height: 500,
        center: true,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
    })

    formAddConexao.setMenuBarVisibility(false);
    formAddConexao.loadFile('src/pages/FormConexao/index.html');
}