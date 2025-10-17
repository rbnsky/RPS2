// server.ts 
// Importiert notwendige Deno-Module für den Webserver.
import { serve } from "https://deno.land/std@0.194.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.194.0/http/file_server.ts";
// Importiert die Datenbank-Funktionen aus unserer neuen Datei.
import { setupDatabase, loadGameItems, GameItem } from "./database.ts";

// --- TypeScript Interfaces ---
// Diese Interfaces definieren die "Form" unserer Datenobjekte.
// Das hilft, Fehler zu vermeiden und den Code lesbarer zu machen.

// Definiert die Struktur für eine einzelne Antwortmöglichkeit (z.B. "rock").
interface Choice {
    correct: boolean;
    message: string;
}

// Definiert die Struktur für eine laufende Spielsitzung eines Benutzers.
interface GameSession {
    items: GameItem[];      // Eine Liste der zufällig angeordneten Spiel-Items für diese Runde.
    currentIndex: number;   // Der Index des aktuellen Items in der Liste.
    score: number;          // Die aktuelle Punktzahl des Spielers.
    answered: number;       // Die Anzahl der bereits beantworteten Fragen.
    total: number;          // Die Gesamtzahl der Fragen in dieser Runde.
}


// --- Datenbank-Initialisierung ---
// Richtet die SQLite-Datenbank ein und lädt die Spieldaten beim Serverstart.
const db = setupDatabase();
const gameItems = loadGameItems(db);


// --- Spiel-Logik ---

// Speichert alle aktiven Spielsitzungen. Die Map verwendet eine Session-ID als Schlüssel.
const gameSessions = new Map<string, GameSession>();

// Eine Hilfsfunktion, um die Elemente eines Arrays zufällig zu mischen.
// Dies sorgt dafür, dass die Reihenfolge der Fragen in jeder Spielrunde anders ist.
function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}


// --- Server-Hauptfunktion ---
// Diese Funktion wird für jede ankommende Anfrage an den Server ausgeführt.
serve(async (req) => {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS-Header, um Anfragen von anderen Domains zu erlauben (wichtig für die lokale Entwicklung).
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Behandelt CORS Preflight-Anfragen, die der Browser vor dem eigentlichen POST sendet.
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    // --- API-Routen ---

    // Route: /api/start-game
    // Startet eine neue Spielsitzung.
    if (path === "/api/start-game") {
        const sessionId = crypto.randomUUID(); // Erzeugt eine einzigartige ID für die Session.
        const shuffledItems = shuffle([...gameItems]); // Mischt die Fragen für diese Runde.
        const session: GameSession = {
            items: shuffledItems,
            currentIndex: 0,
            score: 0,
            answered: 0,
            total: shuffledItems.length
        };
        gameSessions.set(sessionId, session); // Speichert die neue Session.

        // Sendet die Session-ID und die erste Frage an das Frontend.
        return new Response(JSON.stringify({
            sessionId,
            item: { id: session.items[0].id, name: session.items[0].name },
            score: session.score,
            answered: session.answered,
            total: session.total
        }), {
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            }
        });
    }

    // Route: /api/submit-answer
    // Verarbeitet die Antwort eines Spielers auf eine Frage.
    if (path === "/api/submit-answer" && req.method === "POST") {
        try {
            const data = await req.json(); // Liest die JSON-Daten aus der Anfrage (sessionId, itemId, choice).
            const session = gameSessions.get(data.sessionId);

            // Fehlerbehandlung, falls die Session nicht gefunden wird.
            if (!session) {
                return new Response(JSON.stringify({ error: "Session not found" }), {
                    status: 404,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            // Holt das aktuelle Item und die vom Spieler gewählte Antwort.
            const currentItem = session.items[session.currentIndex];
            const choice = currentItem.choices[data.choice];
            const correct = choice.correct;

            // Aktualisiert den Spielstand.
            session.score += correct ? 1 : 0;
            session.answered += 1;
            session.currentIndex += 1;

            // Ermittelt das nächste Item oder null, wenn das Spiel vorbei ist.
            const nextItem = session.currentIndex < session.items.length
                ? session.items[session.currentIndex]
                : null;

            // Sendet das Ergebnis und das nächste Item an das Frontend.
            return new Response(JSON.stringify({
                correct,
                message: choice.message,
                score: session.score,
                answered: session.answered,
                nextItem: nextItem ? { id: nextItem.id, name: nextItem.name } : null
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        } catch (error) {
            // Fehlerbehandlung für ungültige Anfragen.
            return new Response(JSON.stringify({ error: "Invalid request" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }
    }

    // --- Statischer Datei-Server ---
    // Wenn keine API-Route passt, wird versucht, eine statische Datei auszuliefern (index.html, style.css, etc.).
    return serveDir(req, {
        fsRoot: ".",
        urlRoot: "",
        showDirListing: true,
        enableCors: true,
    });
});

console.log("Server running at http://localhost:8000");