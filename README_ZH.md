# MS-Proxy

[English Version](README.md)

Starfish-Proxy 的修改美化版本，专为美观和使用而设计。为游玩HYPIXEL服务器提供干净的代理体验。

**本项目基于 [Starfish-Proxy](https://github.com/Hexze/Starfish-Proxy) 修改。非常感谢原作者及其团队。**

## 功能特点

- **直接连接**: 启动即用，无需登录。
- **高级插件系统**: 基于 JavaScript 的强大插件 API，可轻松扩展功能。
- **数据包拦截**: 实时查看延迟和网络数据包。
- **网络优化**: 内置注册表和 TCP 优化工具，降低游戏延迟。
- **安全可靠**: 核心安全检查，确保与 Hypixel 等服务器的兼容性。

## 快速开始

### 用户使用

1. 下载最新发布的版本。
2. 运行 `MS-Proxy.exe` (如果是源码运行则执行 `npm start`)。
3. 打开 Minecraft 1.8.9。
4. 连接服务器: `localhost:25565` (或查看控制面板显示的 IP)。
5. 开始游戏！

### 开发者使用

1. 克隆仓库。
2. 安装依赖:
   ```bash
   npm install
   ```
3. 启动代理:
   ```bash
   npm start
   ```
4. 构建可执行文件:
   ```bash
   build.bat
   ```

## 指令说明

所有指令格式为 `/模块 指令 [参数]`。使用 `/proxy help` 查看帮助。

- `/proxy help` - 显示所有代理指令
- `/proxy server` - 列出可用服务器
- `/proxy server <名称|host:port>` - 切换目标服务器
- `/proxy addserver <名称> <host:port>` - 保存服务器配置
- `/proxy removeserver <名称>` - 删除已保存服务器
- `/proxy plugins` - 列出已加载插件

## 插件系统

插件文件位于 `plugins/` 目录中。MS-Proxy 保留了 Starfish-Proxy 强大的插件系统。

### 常用 API

- `api.chat(message)` - 发送聊天信息
- `api.sendActionBar(text)` - 发送 Action Bar 信息
- `api.sendTitle(title, subtitle)` - 发送标题
- `api.playSound(name, volume, pitch)` - 播放音效
- `api.getStats()` - 获取 Ping/PPS/内存数据

*注意：部分原版依赖特定后端逻辑的 API 可能已简化或行为有所不同。*

## 致谢 (Credits)

本项目修改自 **Starfish-Proxy**。我们尊重并感谢原作者的辛勤付出。

*   **原作者**: [Hexze](https://github.com/Hexze)
*   **贡献者**: J0nahG, Desiyn, nilsraccoon

如果您对核心技术感兴趣，请务必关注原项目 [Starfish-Proxy](https://github.com/Hexze/Starfish-Proxy)。

## 免责声明

本软件按“原样”提供，没有任何形式的保证。仅供学习和正当用途使用。
