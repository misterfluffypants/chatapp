A modern real-time chat application with WebSocket support and optional video calling using WebRTC. Built with **Node.js**, **Express**, and vanilla **JavaScript**.  

![ChatApp Demo](assets/demo.gif)  

---

## Features

- Real-time messaging in rooms  
- Dynamic user list updates when users join or leave  
- Simple video call functionality (WebRTC)  
- Fully responsive design for desktop and mobile  
- Easy setup and lightweight  

---

## Demo

> To see ChatApp in action, run locally (instructions below) or view demo GIF above.

---

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/misterfluffypants/chatapp.git
cd chatapp
```

2. **Install dependencies**

```bash
npm install
```

## Running the App

1. **Start the server**

```bash
node server.js
```

> Server runs on http://localhost:3000 by default.

2. **Open in browser**

- PC: http://localhost:3000
- Mobile (same Wi-Fi): http://<your-pc-ip>:3000
- Join a room
- Enter your name and room name.
- Click Join to enter the chat.

---

## Usage

- Send messages — all participants in the room will see them instantly.
- User list updates automatically as users join or leave.
- Click Call to start a video call (WebRTC) and Hangup to end it.
- Works on both desktop and mobile browsers.

---

## Troubleshooting

1. **Mobile cannot connect**

   * Ensure your phone and PC are on the **same network**.
   * Open the app using your PC’s **local IP**, not `localhost`.

2. **Video not working**

   * Ensure the browser allows **camera and microphone** access.
   * Some browsers may require HTTPS for WebRTC; local testing via HTTP works for most.

3. **WebSocket errors**

   * Verify that `app.js` uses the dynamic host:

     ```js
     ws = new WebSocket(`ws://${window.location.host}`);
     ```
   * Avoid hardcoding `localhost` if accessing from other devices.

---

## Technologies

* Node.js
* Express.js
* WebSocket (`ws`)
* Vanilla JavaScript, HTML, CSS
* WebRTC (video calls)
* Responsive design with CSS Flexbox

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push branch: `git push origin feature/your-feature`
5. Open a pull request

---
