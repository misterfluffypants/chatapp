// ELEMENTS
const joinOverlay = document.getElementById('joinOverlay');
const nameInput = document.getElementById('nameInput');
const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');

const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

const chatList = document.getElementById('chatList');
const roomTitle = document.getElementById('roomTitle');
const statusText = document.getElementById('statusText');
const userCountEl = document.getElementById('userCount');

const videoPanel = document.getElementById('videoPanel');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const callInfo = document.getElementById('callInfo');

const callBtn = document.getElementById('callBtn');
const hangBtn = document.getElementById('hangBtn');
const leaveBtn = document.getElementById('leaveBtn');

let ws;
let myName;
let room;

// JOIN ROOM
joinBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const roomName = roomInput.value.trim();
    if (!name || !roomName) {
        alert('Enter your name and room!');
        return;
    }

    myName = name;
    room = roomName;
    roomTitle.textContent = room;

    joinOverlay.style.display = 'none';
    connectWebSocket();
});

// WEBSOCKET CONNECTION
async function connectWebSocket() {
    let serverIP = "localhost";
    try {
        const res = await fetch("/server-ip");
        const data = await res.json();
        serverIP = data.ip || "localhost";
    } catch (err) {
        console.warn("Could not fetch server IP, using localhost:", err);
    }

    ws = new WebSocket(`ws://${window.location.host}/ws/${room}`);

    ws.onopen = () => {
        statusText.textContent = "Connected";
        ws.send(JSON.stringify({ type: "join", name: myName, room }));
    };

    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        switch (data.type) {
            case "chat":
                addMessage(data.name, data.text);
                break;
            case "userlist":
                updateUserList(data.users);
                break;
            case "user-joined":
                addSystemMessage(`${data.name} joined the room`);
                break;
            case "user-left":
                addSystemMessage(`${data.name} left the room`);
                break;
            case "error":
                alert(data.message);
                joinOverlay.style.display = "flex";
                break;
        }
    };

    ws.onclose = () => {
        statusText.textContent = "Disconnected";
    };
    ws.onerror = () => (statusText.textContent = "Error");
}

// SEND MESSAGE
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({ type: "chat", text }));
    messageInput.value = "";
}

// DISPLAY MESSAGES
function addMessage(name, text) {
    const msg = document.createElement("div");
    msg.classList.add("msg");
    if (name === myName) msg.classList.add("me");

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.textContent = `${name}: ${text}`;

    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addSystemMessage(text) {
    const msg = document.createElement("div");
    msg.classList.add("msg", "system");

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.style.background = "#555";
    bubble.textContent = text;

    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// UPDATE USER LIST
function updateUserList(users) {
    chatList.innerHTML = "";
    userCountEl.textContent = users.length;
    users.forEach((u) => {
        const item = document.createElement("div");
        item.classList.add("chat-item");

        const avatar = document.createElement("div");
        avatar.classList.add("avatar");
        avatar.textContent = u[0].toUpperCase();

        const meta = document.createElement("div");
        meta.classList.add("meta");
        const nameEl = document.createElement("div");
        nameEl.classList.add("name");
        nameEl.textContent = u;

        meta.appendChild(nameEl);
        item.appendChild(avatar);
        item.appendChild(meta);
        chatList.appendChild(item);
    });
}

// LEAVE ROOM
leaveBtn.addEventListener("click", () => {
    if (ws) ws.close();
    joinOverlay.style.display = "flex";
    messagesEl.innerHTML = "";
    chatList.innerHTML = "";
    userCountEl.textContent = "0";
});

// CALL BUTTONS (WebRTC placeholder)
callBtn.addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = stream;
        videoPanel.style.display = "flex";
        callInfo.textContent = "In call";
    } catch (err) {
        alert("Cannot access camera/microphone");
        console.error(err);
    }
});

hangBtn.addEventListener("click", () => {
    if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach((track) => track.stop());
        localVideo.srcObject = null;
    }
    videoPanel.style.display = "none";
    callInfo.textContent = "Not in call";
});
