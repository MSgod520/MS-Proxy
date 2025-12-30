# MS-Proxy

[中文文档](README_ZH.md)

A modified and beautified version of Starfish-Proxy, designed for aesthetics and usability. It provides a clean proxy experience for playing on Hypixel servers.

**Based on [Starfish-Proxy](https://github.com/Hexze/Starfish-Proxy). Huge thanks to the original developers.**

## Features

- **Direct Connect**: Launch and play immediately.
- **Advanced Plugin System**: Powerful JS-based plugin API for extending functionality.
- **Packet Interception**: Real-time viewing of latency and network packets.
- **Network Optimization**: Built-in tools to optimize registry and TCP settings for lower ping.
- **Secure**: Core safety checks to ensure compatibility with Hypixel and other servers.

## Quick Start

### For Users

1. Download the latest release.
2. Run `MS-Proxy.exe` (or `npm start` if running from source).
3. Open Minecraft 1.8.9.
4. Connect to server: `localhost:25565` (or check the IP in the dashboard).
5. Enjoy!

### For Developers

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the proxy:
   ```bash
   npm start
   ```
4. Build the executable:
   ```bash
   build.bat
   ```

## Commands

All commands use the format `/module command [args]`. Use `/proxy help` to get started.

- `/proxy help` - Show all proxy commands
- `/proxy server` - List available servers
- `/proxy server <name|host:port>` - Switch server target
- `/proxy addserver <name> <host:port>` - Save a server
- `/proxy removeserver <name>` - Remove saved server
- `/proxy plugins` - List loaded plugins

## Plugins

Plugins are placed in the `plugins/` directory. MS-Proxy retains the advanced plugin system from Starfish-Proxy.

### Helper API

- `api.chat(message)`
- `api.sendActionBar(text)`
- `api.sendTitle(title, subtitle)`
- `api.playSound(name, volume, pitch)`
- `api.getStats()` - Get Ping/PPS/Memory stats

*Note: Some account-related APIs from the original Starfish-Proxy (like Party Info dependent on specific backend logic) may function differently or be simplified.*

## Credits & Acknowledgements

This project is a modified version of **Starfish-Proxy**. We respect and appreciate the work of the original authors.

*   **Original Creator**: [Hexze](https://github.com/Hexze)
*   **Contributors**: J0nahG, Desiyn, nilsraccoon

If you like the core technology, please check out the original [Starfish-Proxy](https://github.com/Hexze/Starfish-Proxy) project.

## Disclaimer

This software is provided "as is", without warranty of any kind. It is intended for educational and legitimate use only.
