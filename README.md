# MS-Proxy

[中文文档 (Chinese Version)](README_ZH.md)

A modified, beautified version of Starfish-Proxy, designed for aesthetics and ease of use. Provides a clean proxy experience for playing on HYPIXEL servers.

**This project is based on [Starfish-Proxy](https://github.com/Hexze/Starfish-Proxy). A huge thanks to the original author and their team.**

## Features

- **Direct Connection**: Ready to use upon startup, no login required.
- **Advanced Plugin System**: Powerful JavaScript-based Plugin API for easy functionality extension.
- **Packet Interception**: View latency and network packets in real-time.
- **Network Optimization**: Built-in registry and TCP optimization tools to reduce game latency.
- **Safe & Reliable**: Core security checks ensuring compatibility with servers like Hypixel.

## Quick Start

### For Users

1.  Download the latest release.
2.  Run `MS-Proxy.exe` (or `npm start` if running from source).
3.  Open Minecraft 1.8.9.
4.  Connect to the server: `localhost:25565`.
5.  Enjoy the game!

### For Developers

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the proxy:
    ```bash
    npm start
    ```
4.  Build executable:
    ```bash
    build.bat OR npm run dist
    ```

> [!NOTE]
> There are no rats in this code. all obfuscated content is for personal interest and can be directly deleted.
>
> ![Big Rat](https://bigrat.monster/media/bigrat.jpg)

## Commands

All commands follow the format `/module command [args]`. Use `/proxy help` to view help.

- `/proxy help` - Show all proxy commands
- `/proxy server` - List available servers
- `/proxy server <name|host:port>` - Switch target server
- `/proxy addserver <name> <host:port>` - Save server configuration
- `/proxy removeserver <name>` - Remove a saved server
- `/proxy plugins` - List loaded plugins

## Plugin System

Plugins are located in the `plugins/` directory. MS-Proxy retains the powerful plugin system from Starfish-Proxy.

### Common APIs

- `api.chat(message)` - Send chat message
- `api.sendActionBar(text)` - Send Action Bar message
- `api.sendTitle(title, subtitle)` - Send title
- `api.playSound(name, volume, pitch)` - Play sound effect
- `api.getStats()` - Get Ping/PPS/Memory stats

*Note: Some APIs relying on specific backend logic may be simplified or behave differently.*

## Credits

This project is modified from **Starfish-Proxy**. We respect and appreciate the hard work of the original authors.

*   **Original Author**: [Hexze](https://github.com/Hexze)
*   **Contributors**: Only me

If you are interested in the core technology, be sure to follow the original project [Starfish-Proxy](https://github.com/Hexze/Starfish-Proxy).

## Network Security Note

For regions with high latency to Hypixel (200ms+) like China, there have been reports of bans due to network fluctuations. MS-Proxy has adjusted its packet loss strategy: **If excessive packet loss is detected, the proxy will drop the connection instead of sending dropped packets.**

-   **Pros**: Avoids false positives by anti-cheat systems due to sending bursts of delayed packets.
-   **Cons**: If your network environment is very poor, this will cause the connection to drop immediately rather than just lag. In this case, **please do not force the use of this proxy**, as it cannot provide a reasonable gaming experience in extremely poor network conditions.

## Disclaimer

This program is a personal project, **non-profit**, intended for learning and legitimate use only.
Secondary modification and distribution are allowed, but **explicit credit to the original Starfish-Proxy development team must be included** in distributed or modified versions.
The software is provided "AS IS", without warranty of any kind.

联系我 Discord：http://discordapp.com/users/msgod520
