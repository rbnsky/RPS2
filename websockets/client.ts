const socket = new WebSocket("ws://127.0.0.1:3000");

socket.addEventListener("open", () => {
    console.log("WebSocket-Verbindung hergestellt");
    socket.send("Nachricht vom Client");
});

socket.addEventListener("message", (event) => {
    console.log("Nachricht vom Server:", event.data);
});

socket.addEventListener("close", () => {
    console.log("WebSocket-Verbindung geschlossen");
});