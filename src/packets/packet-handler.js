const mc = require('minecraft-protocol');
const fs = require('fs');
const path = require('path');

const chatDefinitions = require('./definitions/chat');
const entityDefinitions = require('./definitions/entity');
const inventoryDefinitions = require('./definitions/inventory');
const miscDefinitions = require('./definitions/misc');
const missingDefinitions = require('./definitions/missing');
const movementDefinitions = require('./definitions/movement');
const playerDefinitions = require('./definitions/player');
const worldDefinitions = require('./definitions/world');

class PacketHandler {
    constructor() {
        this.definitions = new Map();
        this.definitions.set('client', new Map());
        this.definitions.set('server', new Map());

        this.safePackets = new Map();
        this.safePackets.set('client', new Set());
        this.safePackets.set('server', new Set());

        this.loaded = false;
    }

    initialize() {
        if (this.loaded) return;

        const definitionModules = [
            chatDefinitions,
            entityDefinitions,
            inventoryDefinitions,
            miscDefinitions,
            missingDefinitions,
            movementDefinitions,
            playerDefinitions,
            worldDefinitions
        ];

        for (const definitions of definitionModules) {
            this.loadDefinitions(definitions);
        }

        this.loaded = true;
        console.log(`Loaded ${this.definitions.get('client').size} client packets, ${this.definitions.get('server').size} server packets`);
    }

    loadDefinitions(definitions) {
        for (const direction of ['client', 'server']) {
            if (!definitions[direction]) continue;

            for (const [packetName, definition] of Object.entries(definitions[direction])) {
                const packet = {
                    name: packetName,
                    safe: definition.safe || false,
                    updatesState: definition.updatesState || false,
                    eventMapping: definition.eventMapping || null
                };

                this.definitions.get(direction).set(packetName, packet);

                if (packet.safe) {
                    this.safePackets.get(direction).add(packetName);
                }
            }
        }
    }

    async processPacket(session, direction, data, meta) {
        if (!this.loaded) this.initialize();

        const definition = this.definitions.get(direction)?.get(meta.name);
        const isSafe = this.safePackets.get(direction)?.has(meta.name) || false;

        // 1. 处理命令
        if (direction === 'client' && meta.name === 'chat' && data.message.startsWith('/')) {
            const handled = session.proxy.commandHandler.handleCommand(data.message, session.client);
            if (handled) return;
        }

        let shouldForward = true;
        let finalData = data;

        // [安全修复] 移动数据包限流 (Anti-Timer / Anti-Burst)
        // 防止网络波动导致瞬间发送大量移动包而被 Hypixel 误封
        if (direction === 'client' && ['flying', 'position', 'position_look', 'look'].includes(meta.name)) {
            if (!this.checkPacketRate(session)) {
                // 丢弃多余的包，这会导致玩家回弹（安全），而不是发送超速数据包（不安全）
                return;
            }
        }

        // 2. 插件拦截器处理
        if (isSafe && session.proxy.pluginAPI.events.hasPacketInterceptors(direction, meta.name)) {
            const result = await this.handleInterceptors(session, direction, data, meta, isSafe);
            shouldForward = !result.cancelled;
            finalData = result.data;
        }

        // 3. 转发数据包
        if (shouldForward) {
            this.forwardPacket(session, direction, meta.name, finalData);
        }

        // 4. 更新内部游戏状态
        if (definition?.updatesState) {
            try {
                session.gameState.updateFromPacket(meta, data, direction === 'server');
            } catch (error) {
                console.error(`Error updating game state for ${direction} packet ${meta.name}:`, error.message);
                if (process.env.DEBUG) {
                    console.error(error.stack);
                }
            }
        }

        // 5. 触发事件供插件使用
        if (definition?.eventMapping && session.connected && session.proxy.currentPlayer === session) {
            setImmediate(() => {
                try {
                    this.emitPacketEvent(session, definition.eventMapping, data);
                } catch (error) {
                    console.error(`Error emitting event ${definition.eventMapping.name} for packet ${meta.name}:`, error.message);
                    console.error('Packet data:', JSON.stringify(data, null, 2));
                    console.error(error.stack);
                }
            });
        }
    }

    // [新增] 令牌桶限流算法
    checkPacketRate(session) {
        // 初始化限流器状态
        if (!session.moveLimiter) {
            session.moveLimiter = {
                tokens: 8, // 初始允许的突发包数量 (Burst Allowance)
                lastCheck: Date.now(),
                maxTokens: 12, // 令牌桶上限 (最大允许的瞬间延迟补偿)
                rate: 0.022 // 填充速率: 22包/秒 (Minecraft 标准是20，给予10%宽容度)
            };
        }

        const now = Date.now();
        const limiter = session.moveLimiter;

        // 计算自上次检查以来生成了多少新令牌
        const timePassed = now - limiter.lastCheck;
        const newTokens = timePassed * limiter.rate;

        // 更新令牌数，但不能超过上限
        limiter.tokens = Math.min(limiter.maxTokens, limiter.tokens + newTokens);
        limiter.lastCheck = now;

        // 检查是否有足够的令牌发送此包
        if (limiter.tokens >= 1) {
            limiter.tokens -= 1;
            return true; // 允许发送
        } else {
            // 令牌不足，说明发包速度过快（网络波动或作弊），丢弃此包
            return false;
        }
    }

    forwardPacket(session, direction, packetName, data) {
        const target = direction === 'client' ? session.targetClient : session.client;

        if (target?.state === mc.states.PLAY) {
            try {
                target.write(packetName, data);
            } catch (error) {
                console.error(`Error forwarding ${direction} packet ${packetName}:`, error.message);
            }
        }
    }

    async handleInterceptors(session, direction, data, meta, canModify) {
        const event = {
            data: { ...data },
            meta: { ...meta },
            cancelled: false,
            modified: false,
            modifiedData: null
        };

        if (canModify) {
            event.modify = (newData) => {
                event.modified = true;
                event.modifiedData = newData;
            };

            event.cancel = () => {
                event.cancelled = true;
            };
        }

        const interceptors = session.proxy.pluginAPI.events.getPacketInterceptors(direction, meta.name);
        for (const handler of interceptors) {
            try {
                await handler(event);
            } catch (error) {
                console.error(`Error in ${direction} packet interceptor for ${meta.name}:`, error.message);
            }
        }

        return {
            cancelled: event.cancelled,
            data: event.modified ? event.modifiedData : event.data
        };
    }

    emitPacketEvent(session, eventMapping, data) {
        try {
            let eventData = null;

            if (eventMapping.extractor) {
                eventData = eventMapping.extractor(data, session);
                if (eventData === null) return;
            } else {
                eventData = data;
            }

            session.proxy.pluginAPI.emit(eventMapping.name, eventData);
        } catch (error) {
            console.error(`Error emitting event ${eventMapping.name}:`, error.message);
        }
    }

    isSafePacket(direction, packetName) {
        if (!this.loaded) this.initialize();
        return this.safePackets.get(direction)?.has(packetName) || false;
    }
}

module.exports = PacketHandler;