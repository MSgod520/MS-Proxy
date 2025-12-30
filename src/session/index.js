const mc = require('minecraft-protocol');
const { exec } = require('child_process');
const path = require('path');
const GameState = require('./game-state');
const { PacketSystem } = require('../packets');
const { getCryptoManager } = require('../utils/crypto');

class PlayerSession {
    constructor(proxy, client) {
        this.proxy = proxy;
        this.client = client; // Client Connection
        this.targetClient = null; // Target Server Connection

        if (!proxy.packetSystem) {
            proxy.packetSystem = new PacketSystem();
            proxy.packetSystem.initialize();
        }

        this.packetProcessor = proxy.packetSystem.getProcessor();

        this.storageUsername = client.username;
        this.username = this.storageUsername;

        this.uuid = client.uuid;
        this.gameState = new GameState();
        this.connected = false;
        this.forceReauth = proxy.currentPlayer?.forceReauth || false;
        this.tickInterval = null;
        this.inAuthWorld = false;

        this.remoteLatency = 0;

        // Limbo State Properties
        this.inLimbo = false;
        this.reconnectTimer = null;
        this.limboKeepAliveTimer = null;

        // Bind client error handling to prevent ECONNABORTED crash
        this.client.on('error', (err) => this.handleClientError(err));
        this.client.on('end', () => this.handleClientDisconnect());

        this.connect();
    }

    connect() {
        console.log(`Connecting ${this.storageUsername} to ${this.proxy.config.targetHost}...`);

        this.safeEncrypt(false);

        const authOptions = {
            host: this.proxy.config.targetHost,
            port: this.proxy.config.targetPort || 25565,
            username: this.storageUsername,
            version: '1.8.9',
            auth: 'microsoft',
            hideErrors: false,
            profilesFolder: path.join(this.proxy.getBaseDir(), 'auth_cache', this.storageUsername),
            forceRefresh: this.forceReauth || false
        };

        if (!this.connected && !this.inAuthWorld && !this.inLimbo) {
            authOptions.onMsaCode = (data) => {
                this.handleMicrosoftAuth(data);
            };
        }

        // Clean up previous target client if exists
        if (this.targetClient) {
            this.targetClient.removeAllListeners();
            try { this.targetClient.end(); } catch (e) { }
        }

        this.targetClient = mc.createClient(authOptions);

        // Listen to target server events
        this.targetClient.on('player_info', (packet) => this.handlePlayerInfo(packet));
        this.targetClient.on('success', (packet) => this.handleSuccess(packet));
        this.targetClient.on('login', (packet) => this.handleLogin(packet));
        this.targetClient.on('error', (err) => this.handleTargetError(err));
        this.targetClient.on('end', () => this.handleTargetDisconnect());
    }

    // Safe encryption call to prevent cryptoManager errors
    safeEncrypt(isSave) {
        try {
            const cryptoManager = getCryptoManager();
            if (cryptoManager && typeof cryptoManager.processAuthFolder === 'function') {
                cryptoManager.processAuthFolder(this.storageUsername, isSave);
            }
        } catch (e) {
            // Silent failure, avoid console spam
        }
    }

    handlePlayerInfo(packet) {
        try {
            if (packet.action === 0 || packet.action === 2) {
                const myUuid = this.targetClient?.uuid;
                if (packet.data && Array.isArray(packet.data) && myUuid) {
                    const record = packet.data.find(p => p.UUID === myUuid);
                    if (record && record.ping !== undefined) {
                        this.remoteLatency = record.ping;
                    }
                }
            }
        } catch (e) { }
    }

    handleSuccess(packet) {
        if (this.targetClient.username && this.targetClient.username !== this.username) {
            console.log(`[Session] ID Updated: ${this.username} -> ${this.targetClient.username}`);
            this.username = this.targetClient.username;
            this.uuid = this.targetClient.uuid;
        } else {
            console.log(`[Session] Logged in as ${this.username}`);
        }
        this.safeEncrypt(true);
    }

    handleMicrosoftAuth(msaData) {
        console.log(`${this.username} requires Microsoft authentication`);

        // 如果在 Limbo 中，只发送链接，不尝试创建世界（因为已经在世界里了）
        if (this.inLimbo) {
            this.proxy.sendMessage(this.client, "§cMicrosoft Authentication Required!");
            this.proxy.sendMessage(this.client, `§eLink: §b${msaData.verification_uri}?otc=${msaData.user_code}`);
            return;
        }

        this.createAuthWorld();

        const url = `${msaData.verification_uri}?otc=${msaData.user_code}`;
        const headerMessages = [
            '§6========================================',
            '       §6M§eS§r-§bP§3roxy §e- Authentication',
            '§6========================================',
            '§eMicrosoft Auth Required!',
            '§7Check browser or click link below:'
        ];
        this.proxy.sendMessage(this.client, headerMessages.join('\n'));

        const clickableUrl = {
            text: url,
            color: 'aqua',
            underlined: true,
            clickEvent: { action: 'open_url', value: url },
            hoverEvent: { action: 'show_text', value: '§eClick to open' }
        };

        this.writeClient('chat', {
            message: JSON.stringify(clickableUrl),
            position: 0
        });

        const cmd = process.platform === 'darwin' ? `open "${url}"`
            : process.platform === 'win32' ? `start "" "${url}"`
                : `xdg-open "${url}"`;

        try { exec(cmd); } catch (e) { }
    }

    createAuthWorld() {
        if (!this.client || this.client.state !== mc.states.PLAY) return;
        this.inAuthWorld = true;
        this.writeClient('login', {
            entityId: 1,
            gameMode: 1,
            dimension: 0,
            difficulty: 0,
            maxPlayers: 1,
            levelType: 'flat',
            reducedDebugInfo: false
        });
        this.writeClient('position', { x: 0.5, y: 100, z: 0.5, yaw: 0, pitch: 0, flags: 0 });
    }

    handleLogin(packet) {
        // Handle Reconnection from Limbo
        if (this.inLimbo) {
            console.log(`[Limbo] ${this.username} reconnected successfully!`);
            this.inLimbo = false;
            this.inAuthWorld = false; // 清除之前的临时世界标记

            if (this.reconnectTimer) clearInterval(this.reconnectTimer);
            if (this.limboKeepAliveTimer) clearInterval(this.limboKeepAliveTimer);
            this.reconnectTimer = null;
            this.limboKeepAliveTimer = null;

            this.proxy.sendMessage(this.client, "§a§lReconnected to server!");

            // Send Respawn packet to refresh world
            this.writeClient('respawn', {
                dimension: packet.dimension,
                difficulty: packet.difficulty,
                gamemode: packet.gameMode,
                levelType: packet.levelType
            });

            this.connected = true;
            this.gameState.reset();
            this.gameState.loginPacket = packet;
            this.setupPacketForwarding();

            this.safeEncrypt(true);
            return;
        }

        if (this.forceReauth) {
            this.disconnect('§aRe-authentication successful! Please reconnect.');
            this.forceReauth = false;
            if (this.proxy.currentPlayer) this.proxy.currentPlayer.forceReauth = false;
            this.safeEncrypt(true);
            return;
        }

        if (this.inAuthWorld) {
            this.inAuthWorld = false;
            this.disconnect('§aAuthentication successful! Please reconnect.');
            this.safeEncrypt(true);
            return;
        }

        if (!this.connected) {
            console.log(`${this.username} successfully connected to ${this.proxy.config.targetHost}`);
            this.safeEncrypt(true);
        }

        this.connected = true;
        this.gameState.reset();
        this.gameState.loginPacket = packet;

        this.writeClient('login', packet);

        this.proxy.pluginAPI.emit('player_join', {
            player: this._createCurrentPlayerObject()
        });

        this.setupPacketForwarding();
    }

    // --- 错误处理核心 ---

    // 1. 玩家端 (Client) 错误/断开 -> 彻底结束会话
    handleClientError(err) {
        // 忽略 ECONNABORTED，因为这意味着玩家已经走了
        if (err.code === 'ECONNABORTED' || !this.client.writable) return;
        console.error(`Client Error (${this.username}):`, err.message);
    }

    handleClientDisconnect() {
        console.log(`[Session] Player ${this.username} disconnected.`);
        this.cleanup(); // 玩家走了，直接清理，不进 Limbo
    }

    // 2. 服务器端 (Target) 错误/断开 -> 尝试进 Limbo
    handleTargetError(err) {
        console.error(`Target Error (${this.proxy.config.targetHost}):`, err.message);

        if (this.inLimbo) {
            // 如果已经在 Limbo 里重试失败，只在 Action Bar 显示
            const msg = JSON.stringify({ text: `§cRetry failed: ${err.message}`, color: "red" });
            this.writeClient('chat', { message: msg, position: 2, sender: '0' });
            return;
        }

        if (!this.connected) {
            // [Modified] 初始连接失败 -> 先让玩家进游戏，然后进 Limbo 自动重连
            this.createAuthWorld();
            // 提示消息由 enterLimbo 处理，这里只把 error 传进去
            this.enterLimbo(`Connection failed: ${err.message}`);
        } else {
            // 连接中途断开
            this.enterLimbo(`Target error: ${err.message}`);
        }
    }

    handleTargetDisconnect() {
        if (!this.connected) {
            // 还没连上就断了
            return;
        }

        // 只有当玩家还在且不在 Limbo 时，才进 Limbo
        if (!this.inLimbo && this.client && this.client.state === mc.states.PLAY) {
            console.log(`[Session] Connection to server lost. Sending ${this.username} to Limbo.`);
            this.enterLimbo("Server closed connection");
        }
    }

    // --- Limbo 逻辑 ---

    enterLimbo(reason) {
        if (this.inLimbo) return;
        // 再次检查玩家是否还活着，如果玩家已经断开，直接清理
        if (!this.client || !this.client.writable || this.client.state !== mc.states.PLAY) {
            this.cleanup();
            return;
        }

        this.inLimbo = true;
        this.connected = false;

        // 清理后端连接
        if (this.targetClient) {
            this.targetClient.removeAllListeners();
            try { this.targetClient.end(); } catch (e) { }
            this.targetClient = null;
        }

        // 格式化消息，如果已经有颜色代码则不加红
        const displayReason = reason.startsWith('§') ? reason : ('§c' + reason);
        this.proxy.sendMessage(this.client, displayReason);
        this.proxy.sendMessage(this.client, `§7Entering Limbo (Auto-reconnect active)...`);

        // Send to Limbo World (End Dimension ID: 1)
        this.writeClient('respawn', {
            dimension: 1,
            difficulty: 0,
            gamemode: 1, // Creative
            levelType: 'flat'
        });

        this.writeClient('position', { x: 0.5, y: 100, z: 0.5, yaw: 0, pitch: 0, flags: 0 });

        this.setupLimboKeepAlive();
        this.startAutoReconnect();
    }

    setupLimboKeepAlive() {
        this.client.removeAllListeners('packet');

        // Handle local commands
        this.client.on('packet', (data, meta) => {
            if (meta.name === 'chat' && data.message.startsWith('/')) {
                this.proxy.commandHandler.handleCommand(data.message, this.client);
            }
        });

        if (this.limboKeepAliveTimer) clearInterval(this.limboKeepAliveTimer);
        this.limboKeepAliveTimer = setInterval(() => {
            if (this.client.state === mc.states.PLAY) {
                this.writeClient('keep_alive', {
                    keepAliveId: Math.floor(Math.random() * 1000000)
                });
            } else {
                clearInterval(this.limboKeepAliveTimer);
            }
        }, 5000);
    }

    startAutoReconnect() {
        if (this.reconnectTimer) clearInterval(this.reconnectTimer);

        let attempts = 0;

        // Initial attempt
        attempts++;
        this.attemptReconnect(attempts);

        // Interval attempt (every 5 seconds)
        this.reconnectTimer = setInterval(() => {
            if (!this.connected && this.inLimbo) {
                attempts++;
                this.attemptReconnect(attempts);
            }
        }, 5000);
    }

    attemptReconnect(attempt) {
        if (this.targetClient) return; // Wait for previous attempt

        // 检查玩家连接是否还在
        if (!this.client || !this.client.writable) {
            this.cleanup();
            return;
        }

        const msg = JSON.stringify({ text: `§eAuto-reconnecting... (Attempt #${attempt})`, color: "yellow" });
        this.writeClient('chat', { message: msg, position: 2, sender: '0' });

        this.connect();
    }

    setupPacketForwarding() {
        this.client.removeAllListeners('packet');
        if (this.targetClient) this.targetClient.removeAllListeners('packet');

        this.client.on('packet', (data, meta) => {
            this.proxy.totalPackets++;
            this.packetProcessor.processPacket(this, 'client', data, meta);
        });

        if (this.targetClient) {
            this.targetClient.on('packet', (data, meta) => {
                this.proxy.totalPackets++;
                this.packetProcessor.processPacket(this, 'server', data, meta);
            });
        }

        if (this.tickInterval) clearInterval(this.tickInterval);
        this.tickInterval = setInterval(() => {
            if (this.connected && this.proxy.currentPlayer === this) {
                this.proxy.pluginAPI.emit('tick', {});
            }
        }, 50);
    }

    _createCurrentPlayerObject() {
        return {
            uuid: this.uuid,
            name: this.username,
            displayName: this.username,
            isCurrentPlayer: true
        };
    }

    // 封装 write 方法，防止写入已关闭的 socket 导致崩溃
    writeClient(name, params) {
        if (this.client && this.client.state === mc.states.PLAY && this.client.socket && this.client.socket.writable) {
            try {
                this.client.write(name, params);
            } catch (e) {
                // 忽略写入错误，反正连接已经有问题了
            }
        }
    }

    disconnect(reason = 'Disconnected') {
        this.cleanup();

        if (this.client && this.client.state === mc.states.PLAY) {
            try {
                if (typeof reason === 'string') {
                    if (reason.trim().startsWith('{')) {
                        this.client.end(reason);
                    } else {
                        this.client.end({ text: reason });
                    }
                } else {
                    this.client.end(reason);
                }
            } catch (e) { }
        }
        if (this.targetClient) {
            try { this.targetClient.end(); } catch (e) { }
        }
    }

    cleanup() {
        if (this.tickInterval) clearInterval(this.tickInterval);
        if (this.reconnectTimer) clearInterval(this.reconnectTimer);
        if (this.limboKeepAliveTimer) clearInterval(this.limboKeepAliveTimer);

        if (this.connected) {
            this.proxy.pluginAPI.emit('player_leave', {
                player: this._createCurrentPlayerObject()
            });
        }

        this.connected = false;
        this.inLimbo = false;
        this.proxy.clearSession();
    }
}

module.exports = { PlayerSession };