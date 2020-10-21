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
    const outPath = path.join(rootPath, 'dist', 'win')

    return Promise.resolve({
        appDirectory: path.join(outPath, 'AC02 - ADS 2B-win32-x64'),
        authors: 'Rodrigo Ribeiro - RA: 1903955 (ADS 2B)',
        noMsi: true,
        outputDirectory: path.join(outPath, 'windows-installer'),
        exe: 'AC02 - ADS 2B.exe',
        setupExe: 'AC02-Setup.exe',
        setupIcon: path.join(rootPath, 'src', 'assets', 'icon', 'icon.ico')
    })
}