"use strict";

const config = require("./config.cjs");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "users.json");

class MultiChatExtension {
    constructor() {
        this.name = "MultiChatExtension";
        this.version = "8.1";
        this.priorPacketHandlers = { clientHandler: this };
        this.activeClients = new Map();
        
        this.userData = {};
        this.loadData();
        console.log("[Caxarok.ru] MultiChat: Система уведомлений о перемещениях готова.");
    }

    loadData() {
        if (fs.existsSync(usersPath)) {
            try {
                this.userData = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
            } catch (e) { this.userData = {}; }
        }
    }

    saveData() {
        fs.writeFileSync(usersPath, JSON.stringify(this.userData, null, 2));
    }

    broadcast(msg) {
        this.activeClients.forEach((target) => {
            if (target.socket && target.socket.writable && typeof target.sendChatMessage === 'function') {
                target.sendChatMessage(msg);
            }
        });
    }

    // Вызывается, когда соединение с КОНКРЕТНЫМ сервером установлено
    serverConnectionEstablished(client, server) {
        if (config.joinLeaveMessages && client.player) {
            const serverName = server.name || "unknown";
            const serverPrefix = config.servers[serverName] || `[${serverName}]`;
            const playerName = client.player.name || "Player";
            
            this.broadcast(`[c/00FF00:→] ${serverPrefix} [c/FFFFFF:Игрок] [c/00FF00:${playerName}] [c/FFFFFF:зашел на сервер.]`);
        }
    }

    // Вызывается ПЕРЕД тем как игрок покинет текущий сервер (для перехода или выхода)
    serverDisconnect(client, server) {
        if (config.joinLeaveMessages && client.player) {
            const serverName = server.name || "unknown";
            const serverPrefix = config.servers[serverName] || `[${serverName}]`;
            const playerName = client.player.name || "Player";
            
            this.broadcast(`[c/FF0000:←] ${serverPrefix} [c/FFFFFF:Игрок] [c/00FF00:${playerName}] [c/FFFFFF:покинул сервер.]`);
        }
    }

    // Вызывается при полном выходе игрока из прокси
    clientDisconnect(client) {
        this.activeClients.delete(client.ID);
    }

    handlePacket(client, packet) {
        if (!config.enabled) return false;

        if (packet.packetType === 13 && client && client.ID !== undefined) {
            this.activeClients.set(client.ID, client);
        }

        let message = null;
        if (packet.packetType === 25) {
            message = packet.data.toString('utf-8', 5).trim();
        } else if (packet.packetType === 82) {
            let rawStr = packet.data.toString('utf-8');
            if (rawStr.includes("Say")) {
                let parts = rawStr.split("Say");
                if (parts.length > 1) message = parts[1];
            }
        }

        if (message) {
            message = message.replace(/^[\x00-\x20]+/, "").trim();
            const playerName = client.player ? client.player.name : "Player";
            const serverKey = (client.server && client.server.name) ? client.server.name : "lobby";

            if (message.startsWith("/")) {
                const args = message.split(/\s+/);
                const cmd = args[0].toLowerCase();
                const password = args[1] || "";

                if (config.authCommands.includes(cmd) && password.length >= 4) {
                    if (!this.userData[playerName]) this.userData[playerName] = {};
                    if (this.userData[playerName][serverKey] !== "player") {
                        this.userData[playerName][serverKey] = "player";
                        this.saveData();
                    }
                }
                return false; 
            }

            try {
                const serverPrefix = config.servers[serverKey] || `[${serverKey}]`;
                let playerPrefix;
                
                if (config.prefixes && config.prefixes[playerName]) {
                    playerPrefix = config.prefixes[playerName];
                } else {
                    this.loadData();
                    const userRanks = this.userData[playerName] || {};
                    const rankName = userRanks[serverKey] || "guest";
                    playerPrefix = config.groups[rankName] || config.groups.guest;
                }

                const outMsg = `${serverPrefix} ${playerPrefix} [c/${config.nameColor}:${playerName}]: [c/${config.chatColor}:${message}]`;
                this.broadcast(outMsg);
                return true; 
            } catch (e) {
                console.log("[MultiChat Error]: " + e.message);
            }
        }
        return false;
    }
}

module.exports = { default: MultiChatExtension };