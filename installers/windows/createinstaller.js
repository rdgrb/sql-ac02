const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        console.error(error.message || error)
        process.exit(1)
    })

function getInstallerConfig() {
    console.log('creating windows installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath, 'dist')

    return Promise.resolve({
        appDirectory: path.join(outPath, 'app-win32-x64'),
        authors: 'Rodrigo Ribeiro - 1903955',
        noMsi: true,
        outputDirectory: path.join(outPath, 'windows-installer'),
        exe: 'sql_ac02.exe',
        setupExe: 'setup_sqlac02.exe',
        setupIcon: path.join(rootPath, 'src', 'assets', 'icon', 'icon.ico')
    })
}