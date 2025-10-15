const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const os = require("os");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const rooms = new Map();

function sendJSON(ws, obj) {
    try { ws.send(JSON.stringify(obj)); } catch (e) {}
}

function broadcastUserList(roomMap) {
    const users = Array.from(roomMap.keys());
    for (const client of roomMap.values()) {
        if (client.readyState === client.OPEN) {
            sendJSON(client, { type: "userlist", users });
        }
    }
}

wss.on("connection", (ws) => {
    let currentRoom = null;
    let userName = null;

    ws.on("message", (raw) => {
        let data;
        try { data = JSON.parse(raw); } catch (e) { return; }

        if (data.type === "join") {
            currentRoom = data.room || "default";
            userName = data.name || "Anonymous";

            if (!rooms.has(currentRoom)) rooms.set(currentRoom, new Map());
            const roomMap = rooms.get(currentRoom);

            if (roomMap.has(userName)) {
                sendJSON(ws, { type: "error", message: "Name already taken in this room" });
                return;
            }

            roomMap.set(userName, ws);

            broadcastUserList(roomMap);
            for (const [name, client] of roomMap.entries()) {
                if (client !== ws && client.readyState === client.OPEN) {
                    sendJSON(client, { type: "user-joined", name: userName });
                }
            }

            sendJSON(ws, { type: "joined", room: currentRoom });
            return;
        }

        // Chat
        if (data.type === "chat" && currentRoom && data.text && data.text.trim() !== "") {
            const roomMap = rooms.get(currentRoom);
            for (const client of roomMap.values()) {
                if (client.readyState === client.OPEN) {
                    sendJSON(client, {
                        type: "chat",
                        text: data.text,
                        name: userName,
                        ts: Date.now()
                    });
                }
            }
            return;
        }

        // WebRTC signaling
        if (currentRoom && ["offer", "answer", "ice", "call", "hangup"].includes(data.type)) {
            const roomMap = rooms.get(currentRoom);
            for (const [name, client] of roomMap.entries()) {
                if (client !== ws && client.readyState === client.OPEN) {
                    sendJSON(client, data);
                }
            }
            return;
        }
    });

    ws.on("close", () => {
        if (currentRoom && rooms.has(currentRoom)) {
            const roomMap = rooms.get(currentRoom);
            roomMap.delete(userName);

            broadcastUserList(roomMap);
            for (const [name, client] of roomMap.entries()) {
                if (client.readyState === client.OPEN) {
                    sendJSON(client, { type: "user-left", name: userName });
                }
            }

            if (roomMap.size === 0) rooms.delete(currentRoom);
        }
    });
});

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) return iface.address;
        }
    }
    return "localhost";
}

server.listen(PORT, () => {
    const ip = getLocalIp();
    console.log(`HTTP + WS server started.`);
    console.log(`Open locally: http://localhost:${PORT}`);
    console.log(`Open from LAN: http://${ip}:${PORT}`);
});
