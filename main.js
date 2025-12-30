const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { getPluginsDir, getPluginConfigDir } = require('./src/utils/paths');
const { exec } = require('child_process');

let mainWindow = null;
let proxyInstance;
let tray = null;
let consoleHooked = false;

// [New] Stats Loop
let statsInterval = null;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false, // Allow CORS for Mojang API
            devTools: false // Security: Disable DevTools
        },
        icon: path.join(__dirname, 'icon.ico')
    });

    mainWindow.setMenu(null); // Security: Remove default menu

    mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    if (tray) return;
    const iconPath = path.join(__dirname, 'icon.ico');
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示主界面 (Show)', click: () => {
                if (mainWindow) mainWindow.show();
            }
        },
        { label: '退出 (Quit)', click: () => app.quit() }
    ]);

    tray.setToolTip('MS Proxy');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (mainWindow) {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
        }
    });
}

function startStatsLoop() {
    if (statsInterval) clearInterval(statsInterval);
    statsInterval = setInterval(() => {
        if (mainWindow && !mainWindow.isDestroyed() && proxyInstance) {
            const stats = proxyInstance.getStats ? proxyInstance.getStats() : { ping: 0, pps: 0, memory: 0 };
            mainWindow.webContents.send('update-stats', stats);
        }
    }, 1000);
}

app.whenReady().then(() => {
    createMainWindow();
    createTray();
    startStatsLoop(); // [New] Start monitoring
    // Auto start proxy
    startProxyBackend();
});

ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.hide();
});

ipcMain.on('restart-app', () => {
    restartProxyService();
});

// [New] Handle Command execution
ipcMain.on('run-proxy-command', (event, command) => {
    if (proxyInstance && proxyInstance.currentPlayer) {
        // Use Packet Processor to simulate client chat
        // This ensures both CommandHandler and Plugin Interceptors (like QuickBW) work correctly
        try {
            const packetSystem = proxyInstance.packetSystem;
            if (packetSystem) {
                const processor = packetSystem.getProcessor();
                processor.processPacket(
                    proxyInstance.currentPlayer,
                    'client',
                    { message: command },
                    { name: 'chat' }
                );
            }
        } catch (e) {
            console.error('Failed to process IPC command:', e);
            mainWindow.webContents.send('console-log', `§cCommand Error: ${e.message}`);
        }
    } else {
        console.log('[System] Cannot run command: No player connected.');
    }
});

ipcMain.handle('run-optimizer', async () => {
    return new Promise((resolve) => {
        let batPath;

        if (app.isPackaged) {
            batPath = path.join(process.resourcesPath, 'MS-PROXY_OPTIMIZATION_TOOL.bat');
        } else {
            batPath = path.join(__dirname, 'MS-PROXY_OPTIMIZATION_TOOL.bat');
        }

        if (!fs.existsSync(batPath)) {
            console.error('[System] Optimizer bat file not found at:', batPath);
            resolve({ success: false, error: 'Batch file not found at: ' + batPath });
            return;
        }

        console.log('[System] Launching optimization tool...');
        const command = `powershell.exe Start-Process "${batPath}" -Verb RunAs`;

        exec(command, (error) => {
            if (error) {
                console.error('[System] Failed to launch optimizer:', error);
                resolve({ success: false, error: error.message });
            } else {
                resolve({ success: true });
            }
        });
    });
});

ipcMain.on('refresh-plugins', () => {
    sendPluginsList();
});

ipcMain.on('ui-ready', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        if (proxyInstance && proxyInstance.config) {
            mainWindow.webContents.send('update-server', proxyInstance.config.targetHost);
        }
        sendPluginsList();
        // Send a default user info
        mainWindow.webContents.send('update-account-info', { username: 'Local User', expiry: 4102444800000 });
    }
});

ipcMain.handle('get-servers-config', async () => {
    if (proxyInstance && proxyInstance.storage) {
        try {
            const freshConfig = proxyInstance.storage.loadConfig();
            proxyInstance.config = freshConfig;
            return freshConfig.servers || {};
        } catch (e) {
            return proxyInstance.config?.servers || {};
        }
    }
    return {};
});

ipcMain.handle('switch-server-target', async (event, target) => {
    if (proxyInstance) {
        try {
            proxyInstance.switchServer(target);
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update-server', proxyInstance.config.targetHost);
            }
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
    return { success: false, error: "Proxy not ready" };
});

ipcMain.handle('get-plugin-config', async (event, pluginName) => {
    if (!proxyInstance || !proxyInstance.pluginAPI) return { error: 'Proxy not ready' };
    const loadedPlugins = proxyInstance.pluginAPI.getLoadedPlugins();
    const plugin = loadedPlugins.find(p => p.name === pluginName);
    if (!plugin) return { error: 'Plugin not loaded' };
    const schema = plugin.metadata.configSchema || [];
    const configPath = path.join(getPluginConfigDir(), `${pluginName}.config.json`);
    let config = {};
    if (fs.existsSync(configPath)) {
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (e) { console.error(`Error reading config for ${pluginName}:`, e); }
    }
    return { schema, config };
});

ipcMain.handle('save-plugin-config', async (event, pluginName, newConfig) => {
    const configPath = path.join(getPluginConfigDir(), `${pluginName}.config.json`);
    const dir = path.dirname(configPath);
    try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

function sendPluginsList() {
    if (!mainWindow || mainWindow.isDestroyed() || !proxyInstance || !proxyInstance.pluginAPI) return;

    const loadedPlugins = proxyInstance.pluginAPI.getLoadedPlugins();
    const loadedPaths = new Set(loadedPlugins.map(p => p.path));

    const uiList = loadedPlugins.map(p => ({
        name: p.name,
        displayName: p.displayName,
        version: p.version,
        description: p.metadata.description,
        isNew: false
    }));

    try {
        const pluginsDir = getPluginsDir();
        if (fs.existsSync(pluginsDir)) {
            const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
            for (const file of files) {
                const fullPath = path.join(pluginsDir, file);
                if (!loadedPaths.has(fullPath)) {
                    uiList.push({
                        name: file,
                        displayName: file,
                        version: 'New',
                        description: 'New plugin detected. Please restart.',
                        isNew: true
                    });
                }
            }
        }
    } catch (e) { console.error('Scan error:', e); }

    mainWindow.webContents.send('update-plugins', uiList);
}

function stopProxyService() {
    console.log('[System] Stopping proxy service...');

    if (proxyInstance) {
        if (typeof proxyInstance.shutdown === 'function') {
            proxyInstance.shutdown();
        } else if (proxyInstance.server) {
            proxyInstance.server.close();
        }
        proxyInstance = null;
    }

    const proxyPath = require.resolve('./src/proxy.js');
    if (require.cache[proxyPath]) {
        delete require.cache[proxyPath];
    }

    Object.keys(require.cache).forEach(id => {
        if (id.includes(path.sep + 'plugins' + path.sep)) {
            delete require.cache[id];
        }
    });
}

function restartProxyService() {
    stopProxyService();
    console.log('[System] Reloading proxy core and plugins...');
    startProxyBackend();

    if (mainWindow) {
        mainWindow.webContents.send('console-log', '§aProxy core & plugins reloaded successfully.');
    }
}

function startProxyBackend() {
    try {
        if (!consoleHooked) {
            const originalLog = console.log;
            console.log = function (...args) {
                originalLog.apply(console, args);
                if (mainWindow && !mainWindow.isDestroyed()) {
                    const message = args.map(a => String(a)).join(' ');
                    mainWindow.webContents.send('console-log', message);
                }
            };
            consoleHooked = true;
        }

        const { proxy } = require('./src/proxy.js');
        proxyInstance = proxy;

        proxy.pluginAPI.on('player_join', (event) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                const playerName = event.player.username || event.player.name || "Unknown";
                mainWindow.webContents.send('update-player', playerName);
            }
        });

        proxy.pluginAPI.on('player_leave', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('reset-player');
            }
        });

        proxy.pluginAPI.on('proxy_ready', () => {
            console.log('[Main] Proxy backend ready, refreshing UI...');
            sendPluginsList();
            if (mainWindow && !mainWindow.isDestroyed() && proxy.config) {
                mainWindow.webContents.send('update-server', proxy.config.targetHost);
            }
        });

    } catch (err) {
        console.error('Failed to start proxy:', err);
        if (mainWindow) {
            mainWindow.webContents.send('console-log', '§cFailed to start proxy: ' + err.message);
        }
    }
}