const hostname = "127.0.0.1";
const port = 3000;

Deno.serve({ hostname, port }, (request) => {
    if (request.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(request);
        socket.addEventListener("open", () => {
            console.log("WebSocket-Verbindung hergestellt");
        });
        socket.addEventListener("message", (event) => {
            console.log("Nachricht vom Client:", event.data);
            socket.send("Antwort vom Server");
        });
        socket.addEventListener("close", () => {
            console.log("WebSocket-Verbindung geschlossen");
        });
        return response;
    }
    return new Response("Nicht unterstützte Anfrage", { status: 400 });
});

console.log(`Server läuft unter http://${hostname}:${port}/`);