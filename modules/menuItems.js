const { app, BrowserWindow, ipcMain: ipc, Menu, shell, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const Windows = require('./windows');
const Settings = require('./settings');
const log = require('./utils/logger').create('menuItems');
const swarmLog = require('./utils/logger').create('swarm');
const updateChecker = require('./updateChecker');
const hotelbyteNode = require('./hotelbyteNode.js');
const ClientBinaryManager = require('./clientBinaryManager');

import { setLanguage, toggleSwarm, toggleSwarmOnStart } from './core/settings/actions';
import { SwarmState } from './core/settings/reducer';
import swarmNode from './swarmNode.js';

// Make easier to return values for specific systems
const switchForSystem = function (options) {
    if (process.platform in options) {
        return options[process.platform];
    } else if ('default' in options) {
        return options.default;
    }
    return null;
};


// create menu
// null -> null
const createMenu = function (webviews) {
    webviews = webviews || [];

    const menu = Menu.buildFromTemplate(menuTempl(webviews));
    Menu.setApplicationMenu(menu);
};


const restartNode = function (newType, newNetwork, syncMode, webviews) {
    newNetwork = newNetwork || hotelbyteNode.network;

    log.info('Switch node', newType, newNetwork);

    return hotelbyteNode.restart(newType, newNetwork, syncMode)
        .then(() => {
            Windows.getByType('main').load(global.interfaceAppUrl);

            createMenu(webviews);
            log.info('Node switch successful.');
        })
        .catch((err) => {
            log.error('Error switching node', err);
        });
};

const startMining = (webviews) => {
    hotelbyteNode.send('miner_start', [1])
        .then((ret) => {

            log.info('miner_start', ret.result);

            if (ret.result === null) {
                global.mining = true;
                createMenu(webviews);
            }
        })
        .catch((err) => {
            log.error('miner_start', err);
        });
};

const stopMining = (webviews) => {
    hotelbyteNode.send('miner_stop', [1])
        .then((ret) => {
            log.info('miner_stop', ret);

            if (ret.result === true) {
                global.mining = false;
                createMenu(webviews);
            }
        })
        .catch((err) => {
            log.error('miner_stop', err);
        });
};


// create a menu template
// null -> obj
let menuTempl = function (webviews) {
    const menu = [];
    webviews = webviews || [];

    // APP
    const fileMenu = [];

    if (process.platform === 'darwin') {
        fileMenu.push(
            {
                label: i18n.t('dhi.applicationMenu.app.about', { app: Settings.appName }),
                click() {
                    Windows.createPopup('about');
                }
            },
            {
                label: i18n.t('dhi.applicationMenu.app.checkForUpdates'),
                click() {
                    updateChecker.runVisibly();
                }
            },
            {
                label: i18n.t('dhi.applicationMenu.app.checkForNodeUpdates'),
                click() {
                    // remove skipVersion
                    fs.writeFileSync(
                        path.join(Settings.userDataPath, 'skippedNodeVersion.json'),
                        '' // write no version
                        );

                    // true = will restart after updating and user consent
                    ClientBinaryManager.init(true);
                }
            },
            {
                    type: 'separator',
            },
            {
                label: i18n.t('dhi.applicationMenu.app.services', { app: Settings.appName }),
                role: 'services',
                submenu: [],
            },
            {
                type: 'separator',
            },
            {
                label: i18n.t('dhi.applicationMenu.app.hide', { app: Settings.appName }),
                accelerator: 'Command+H',
                role: 'hide',
            },
            {
                label: i18n.t('dhi.applicationMenu.app.hideOthers', { app: Settings.appName }),
                accelerator: 'Command+Alt+H',
                role: 'hideothers',
            },
            {
                label: i18n.t('dhi.applicationMenu.app.showAll', { app: Settings.appName }),
                role: 'unhide',
            },
            {
                type: 'separator',
            }
        );
    }

    fileMenu.push({
        label: i18n.t('dhi.applicationMenu.app.quit', { app: Settings.appName }),
        accelerator: 'CommandOrControl+Q',
        click() {
            app.quit();
        },
    });

    menu.push({
        label: i18n.t('dhi.applicationMenu.app.label', { app: Settings.appName }),
        submenu: fileMenu,
    });

    let swarmUpload = [];
    if (global.mode !== 'wallet') {
        swarmUpload.push({
            type: 'separator',
        },
        {
            label: i18n.t('dhi.applicationMenu.file.swarmUpload'),
            accelerator: 'Shift+CommandOrControl+U',
            enabled: store.getState().settings.swarmState == SwarmState.Enabled,
            click() {
                const focusedWindow = BrowserWindow.getFocusedWindow();
                const paths = dialog.showOpenDialog(focusedWindow, {
                    properties: ['openFile', 'openDirectory']
                });
                if (paths && paths.length === 1) {
                    const isDir = fs.lstatSync(paths[0]).isDirectory();
                    const defaultPath = path.join(paths[0], 'index.html');
                    const uploadConfig = {
                        path: paths[0],
                        kind: isDir ? 'directory' : 'file',
                        defaultFile: fs.existsSync(defaultPath) ? '/index.html' : null
                    };
                    swarmNode.upload(uploadConfig).then((hash) => {
                        focusedWindow.webContents.executeJavaScript(`
                          Tabs.update('browser', {$set: {
                              url: 'bzz://${hash}',
                              redirect: 'bzz://${hash}'
                          }});
                          LocalStore.set('selectedTab', 'browser');
                          `);
                        swarmLog.info('Hash uploaded:', hash);
                    }).catch(e => swarmLog.error(e));
                }
            }
        });
    }

    menu.push({
        label: i18n.t('dhi.applicationMenu.file.label'),
        submenu: [
            {
                label: i18n.t('dhi.applicationMenu.file.newAccount'),
                accelerator: 'CommandOrControl+N',
                click() {
                    Windows.createPopup('requestAccount');
                },
            },
            {
                label: i18n.t('dhi.applicationMenu.file.importPresale'),
                accelerator: 'CommandOrControl+I',
                enabled: hotelbyteNode.isMainNetwork,
                click() {
                    Windows.createPopup('importAccount');
                },
            },
            {
                type: 'separator',
            },
            {
                label: i18n.t('dhi.applicationMenu.file.backup'),
                submenu: [
                    {
                        label: i18n.t('dhi.applicationMenu.file.backupKeyStore'),
                        click() {
                            let userPath = Settings.userHomePath;

                            // eth
                            if (hotelbyteNode.isEth) {
                                if (process.platform === 'win32') {
                                    userPath = `${Settings.appDataPath}\\Web3\\keys`;
                                } else {
                                    userPath += '/.web3/keys';
                                }

                            // ghbc
                            } else {
                                if (process.platform === 'darwin') {
                                    userPath += '/Library/Hotelbyte/keystore';
                                }

                                if (process.platform === 'freebsd' ||
                                process.platform === 'linux' ||
                                process.platform === 'sunos') {
                                    userPath += '/.ethereum/keystore';
                                }

                                if (process.platform === 'win32') {
                                    userPath = `${Settings.appDataPath}\\Hotelbyte\\keystore`;
                                }
                            }

                            shell.showItemInFolder(userPath);
                        },
                    }, {
                        label: i18n.t('dhi.applicationMenu.file.backupDHI'),
                        click() {
                            shell.openItem(Settings.userDataPath);
                        },
                    },
                ],
            },
            ...swarmUpload
            ]
        });

    // EDIT
    menu.push({
        label: i18n.t('dhi.applicationMenu.edit.label'),
        submenu: [
            {
                label: i18n.t('dhi.applicationMenu.edit.undo'),
                accelerator: 'CommandOrControl+Z',
                role: 'undo',
            },
            {
                label: i18n.t('dhi.applicationMenu.edit.redo'),
                accelerator: 'Shift+CommandOrControl+Z',
                role: 'redo',
            },
            {
                type: 'separator',
            },
            {
                label: i18n.t('dhi.applicationMenu.edit.cut'),
                accelerator: 'CommandOrControl+X',
                role: 'cut',
            },
            {
                label: i18n.t('dhi.applicationMenu.edit.copy'),
                accelerator: 'CommandOrControl+C',
                role: 'copy',
            },
            {
                label: i18n.t('dhi.applicationMenu.edit.paste'),
                accelerator: 'CommandOrControl+V',
                role: 'paste',
            },
            {
                label: i18n.t('dhi.applicationMenu.edit.selectAll'),
                accelerator: 'CommandOrControl+A',
                role: 'selectall',
            },
        ],
    });

    // LANGUAGE (VIEW)
    const switchLang = langCode => (menuItem, browserWindow) => {
        store.dispatch(setLanguage(langCode, browserWindow));
    };

    const currentLanguage = Settings.language;
    const languageMenu = Object.keys(i18n.options.resources)
    .filter(langCode => langCode !== 'dev')
    .map((langCode) => {
        const menuItem = {
            label: i18n.t(`dhi.applicationMenu.view.langCodes.${langCode}`),
            type: 'checkbox',
            checked: (langCode === currentLanguage),
            click: switchLang(langCode),
        };
        return menuItem;
    });

    languageMenu.unshift({
        label: i18n.t('dhi.applicationMenu.view.default'),
        click: switchLang(i18n.getBestMatchedLangCode(app.getLocale())),
    }, {
        type: 'separator',
    });

    // VIEW
    menu.push({
        label: i18n.t('dhi.applicationMenu.view.label'),
        submenu: [
            {
                label: i18n.t('dhi.applicationMenu.view.fullscreen'),
                accelerator: switchForSystem({
                    darwin: 'Command+Control+F',
                    default: 'F11',
                }),
                click() {
                    const mainWindow = Windows.getByType('main');

                    mainWindow.window.setFullScreen(!mainWindow.window.isFullScreen());
                },
            },
            {
                label: i18n.t('dhi.applicationMenu.view.languages'),
                submenu: languageMenu,
            },
        ],
    });


    // DEVELOP
    const devToolsMenu = [];
    let devtToolsSubMenu;
    let curWindow;

    if (Settings.inProductionMode) {
        if (Settings.uiMode === 'dhi') {
            devtToolsSubMenu = [{
                label: i18n.t('dhi.applicationMenu.develop.devToolsDHIUI'),
                accelerator: 'Alt+CommandOrControl+I',
                click() {
                    curWindow = BrowserWindow.getFocusedWindow();
                    if (curWindow) {
                        curWindow.toggleDevTools();
                    }
                },
            }, {
                type: 'separator',
            }];

            // add webviews
            webviews.forEach((webview) => {
                devtToolsSubMenu.push({
                    label: i18n.t('dhi.applicationMenu.develop.devToolsWebview', { webview: webview.name }),
                    click() {
                        Windows.getByType('main').send('uiAction_toggleWebviewDevTool', webview._id);
                    },
                });
            });

        // wallet
        } else {
            devtToolsSubMenu = [{
                label: i18n.t('dhi.applicationMenu.develop.devToolsWalletUI'),
                accelerator: 'Alt+CommandOrControl+I',
                click() {
                    curWindow = BrowserWindow.getFocusedWindow();
                    if (curWindow) {
                        curWindow.toggleDevTools();
                    }
                },
            }];
        }

        devToolsMenu.push({
            label: i18n.t('dhi.applicationMenu.develop.devTools'),
            submenu: devtToolsSubMenu,
        });    

        if (Settings.uiMode === 'dhi') {
            devToolsMenu.push({
                label: i18n.t('dhi.applicationMenu.develop.openRemix'),
                enabled: true,
                click() {
                    Windows.createPopup('remix');
                },
            });
        }

        devToolsMenu.push({
            label: i18n.t('dhi.applicationMenu.develop.runTests'),
            enabled: (Settings.uiMode === 'dhi'),
            click() {
                Windows.getByType('main').send('uiAction_runTests', 'webview');
            },
        });

        devToolsMenu.push({
            label: i18n.t('dhi.applicationMenu.develop.logFiles'),
            click() {
                try {
                    shell.showItemInFolder(path.join(Settings.userDataPath, 'logs', 'all.log'));
                } catch (error) {
                    log.error(error);
                }
            },
        });

    
        // add node switching menu
        devToolsMenu.push({
            type: 'separator',
        });


        // add node switch
        if (process.platform === 'darwin' || process.platform === 'win32') {
            const nodeSubmenu = [];

            const ethClient = ClientBinaryManager.getClient('eth');
            const ghbcClient = ClientBinaryManager.getClient('ghbc');

            if (ghbcClient) {
                nodeSubmenu.push({
                    label: `Ghbc ${ghbcClient.version}`,
                    checked: hotelbyteNode.isOwnNode && hotelbyteNode.isGhbc,
                    enabled: hotelbyteNode.isOwnNode,
                    type: 'checkbox',
                    click() {
                        restartNode('ghbc', null, 'fast', webviews);
                    },
                });
            }

            if (ethClient) {
                nodeSubmenu.push(
                    {
                        label: `Eth ${ethClient.version} (C++)`,
                        checked: hotelbyteNode.isOwnNode && hotelbyteNode.isEth,
                        enabled: hotelbyteNode.isOwnNode,
                        // enabled: false,
                        type: 'checkbox',
                        click() {
                            restartNode('eth');
                        },
                    }
                );
            }

            devToolsMenu.push({
                label: i18n.t('dhi.applicationMenu.develop.hotelbyteNode'),
                submenu: nodeSubmenu,
            });
        }

        // add network switch
        devToolsMenu.push({
            label: i18n.t('dhi.applicationMenu.develop.network'),
            submenu: [
                {
                    label: i18n.t('dhi.applicationMenu.develop.mainNetwork'),
                    accelerator: 'CommandOrControl+Alt+1',
                    checked: hotelbyteNode.isOwnNode && hotelbyteNode.isMainNetwork,
                    enabled: hotelbyteNode.isOwnNode,
                    type: 'checkbox',
                    click() {
                        restartNode(hotelbyteNode.type, 'main');
                    },
                },
                {
                    label: 'Solo network',
                    accelerator: 'CommandOrControl+Alt+4',
                    checked: hotelbyteNode.isOwnNode && hotelbyteNode.isDevNetwork,
                    enabled: hotelbyteNode.isOwnNode,
                    type: 'checkbox',
                    click() {
                        restartNode(hotelbyteNode.type, 'dev');
                    },
                }
            ] });

        // Light mode switch should appear when not in Solo Mode (dev network)
        if (hotelbyteNode.isOwnNode && hotelbyteNode.isGhbc && !hotelbyteNode.isDevNetwork) {
            devToolsMenu.push({
                label: 'Sync with Light client (beta)',
                enabled: true,
                checked: hotelbyteNode.isLightMode,
                type: 'checkbox',
                click() {
                    restartNode('ghbc', null, (hotelbyteNode.isLightMode) ? 'fast' : 'light');
                },
            });
        }

        if (global.mode !== 'wallet') {
            devToolsMenu.push({
                type: 'separator'
            },
            {
                label: i18n.t('dhi.applicationMenu.develop.enableSwarm'),
                enabled: true,
                checked: [SwarmState.Enabling, SwarmState.Enabled].includes(global.store.getState().settings.swarmState),
                type: 'checkbox',
                click() {
                    store.dispatch(toggleSwarm());
                }
            });
        }
    }

    // Enables mining menu
    devToolsMenu.push({
        label: (global.mining) ? i18n.t('dhi.applicationMenu.develop.stopMining') : i18n.t('dhi.applicationMenu.develop.startMining'),
        accelerator: 'CommandOrControl+Shift+M',
        enabled: true,
        click() {
            if (global.mining) {
                stopMining(webviews);
            } else {
                startMining(webviews);
            }
        }
    });

    menu.push({
        label: ((global.mining) ? '⛏ ' : '') + i18n.t('dhi.applicationMenu.develop.label'),
        submenu: devToolsMenu,
    });

    // WINDOW
    menu.push({
        label: i18n.t('dhi.applicationMenu.window.label'),
        role: 'window',
        submenu: [
            {
                label: i18n.t('dhi.applicationMenu.window.minimize'),
                accelerator: 'CommandOrControl+M',
                role: 'minimize',
            },
            {
                label: i18n.t('dhi.applicationMenu.window.close'),
                accelerator: 'CommandOrControl+W',
                role: 'close',
            },
            {
                type: 'separator',
            },
            {
                label: i18n.t('dhi.applicationMenu.window.toFront'),
                role: 'front',
            },
        ],
    });

    // HELP
    const helpMenu = [];

    if (process.platform === 'freebsd' || process.platform === 'linux' ||
            process.platform === 'sunos' || process.platform === 'win32') {
        helpMenu.push(
            {
                label: i18n.t('dhi.applicationMenu.app.about', { app: Settings.appName }),
                click() {
                    Windows.createPopup('about');
                },
            },
            {
                label: i18n.t('dhi.applicationMenu.app.checkForUpdates'),
                click() {
                    updateChecker.runVisibly();
                },
            }
        );
    }
    helpMenu.push({
        label: i18n.t('dhi.applicationMenu.help.dhiWiki'),
        click() {
            shell.openExternal('https://github.com/hotelbyte/distributed-hotel-interface/wiki');
        },
    }, {
        label: i18n.t('dhi.applicationMenu.help.gitter'),
        click() {
            shell.openExternal('https://gitter.im/hotelbyte/DHI');
        },
    }, {
        label: i18n.t('dhi.applicationMenu.help.reportBug'),
        click() {
            shell.openExternal('https://github.com/hotelbyte/distributed-hotel-interface/issues');
        },
    });

    menu.push({
        label: i18n.t('dhi.applicationMenu.help.label'),
        role: 'help',
        submenu: helpMenu,
    });
    return menu;
};


module.exports = createMenu;
