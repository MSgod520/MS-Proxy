const path = require('path');

function getBaseDir() {
    // 1. 优先检查是否为 Electron Portable 模式 (单文件运行)
    // 这个环境变量由 electron-builder 注入，指向 exe 文件所在的真实目录 (例如你的桌面或U盘)
    if (process.env.PORTABLE_EXECUTABLE_DIR) {
        return process.env.PORTABLE_EXECUTABLE_DIR;
    }

    // 2. 兼容旧的 pkg 打包逻辑 (如果未来还用的话)
    if (process.pkg) {
        return path.dirname(process.execPath);
    }

    // 3. 开发环境 (npm start)
    // __dirname 是 src/utils，往上两级就是项目根目录
    return path.join(__dirname, '../..');
}

function getPluginsDir() {
    return path.join(getBaseDir(), 'plugins');
}

function getConfigDir() {
    return path.join(getBaseDir(), 'config');
}

function getPluginConfigDir() {
    return path.join(getConfigDir(), 'plugins');
}

function getAuthCacheDir() {
    return path.join(getBaseDir(), 'auth_cache');
}

function getPluginDataDir() {
    return path.join(getBaseDir(), 'data');
}

module.exports = {
    getBaseDir,
    getPluginsDir,
    getConfigDir,
    getPluginConfigDir,
    getAuthCacheDir,
    getPluginDataDir
};