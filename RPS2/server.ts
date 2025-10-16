// server.ts
import { serve } from "https://deno.land/std@0.194.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.194.0/http/file_server.ts";

// Spieldaten direkt aus deinem Markdown-File übernommen
const gameItems = [
    { id: 'computer', name: 'computer', choices: { rock: { correct: false, message: "You throw the rock at the computer. It has a little dent, but nothing else happens." }, paper: { correct: true, message: "You place the sheet of paper in front of the computer's fans. It goes up into flames shortly afterwards." }, scissors: { correct: false, message: "You try to cut the power supply's cable. You suffer an electric shock and collapse." } } },
    { id: 'water', name: 'glass of water', choices: { rock: { correct: false, message: "You throw the rock into the glass of water. Your pants get wet." }, paper: { correct: true, message: "You fold the paper into a boat and place it on the water. The seas are yours, captain." }, scissors: { correct: false, message: "You try cutting the water. Suprisingly, this doesnt work." } } },
    { id: 'matej', name: 'matej', choices: { rock: { correct: true, message: "You throw a rock at Matej's head. He collapses on the floor, unable to play a card. You win the Magic the Gathering tournament." }, paper: { correct: false, message: "You play an empty sheet of paper. That is not a valid Magic the Gathering Card. You lose the tournament." }, scissors: { correct: false, message: "You cut Matej's commander in half. This is against official Magic the Gathering rules. Your punishment is certain death." } } },
    { id: 'vampire', name: 'a vampire', choices: { rock: { correct: false, message: "You throw the rock at the vampire. In retaliation, the vampire bites open your carotid artery." }, paper: { correct: false, message: "You hand the vampire a sheet of paper. He makes a cool origami bat. Then, he sucks the blood from your body until its dry." }, scissors: { correct: true, message: "You open the scissors, forming a crucifix. The vampire crumbles into dust." } } },
    { id: 'tourist', name: 'angry french tourist', choices: { rock: { correct: false, message: "You throw the rock at the Frenchman. He starts yelling words at you you don't understand." }, paper: { correct: true, message: "You wave the white sheet of paper like a flag. The French tourist understands this gesture and leaves you be." }, scissors: { correct: false, message: "You try cutting their baguette in half. It is only decorative, 7 months old and hard as rocks. Your scissors break." } } },
    { id: 'nokia', name: 'old nokia phone', choices: { rock: { correct: false, message: "You strike the Nokia with a rock. The rock shatters." }, paper: { correct: true, message: "You warp the nokia in paper, hiding it. It becomes forgotten for eternity." }, scissors: { correct: false, message: "You lose all your fingers, but the nokia is unharmed." } } },
    { id: 'dragon', name: 'ender dragon', choices: { rock: { correct: false, message: "You place a cobblestone. The Ender Dragon knocks you into the void." }, paper: { correct: false, message: "You hit the Ender Dragon with the paper. It does 1 HP Damage. The Ender Dragon has 199 HP left." }, scissors: { correct: true, message: "You shear sheep to craft some beds. Using the bed speedrun strategy, you kill the ender dragon in world record pace." } } },
    { id: 'adhd', name: 'adhd', choices: { rock: { correct: true, message: "You pull out a rock from your pocket. Petting it calms you." }, paper: { correct: false, message: "You stare at a blank piece of paper. Your ADHD gets infinitely worse." }, scissors: { correct: false, message: "Out of boredom, you cut off one of your fingers. You are certainly not bored anymore." } } },
    { id: 'router', name: 'offline internet router', choices: { rock: { correct: false, message: "You smash the router with a router. It still doesn't work." }, paper: { correct: false, message: "You write a physical support ticket and send it to your provider via mail. They never answer." }, scissors: { correct: true, message: "You use the tipp of the scissors to press the tiny, recessed \"restart\" button on your router. Shortly after, the internet is back." } } },
    { id: 'date', name: 'first date', choices: { rock: { correct: true, message: "You place a rock on the table and start talking to it instead. It makes for better conversation." }, paper: { correct: false, message: "You use the paper as a napkin and hang it over your torso to not get it dirty. You look like a baby." }, scissors: { correct: false, message: "You pull out scissors and start chasing your date like a slasher movie villain. You are admitted to a psychiatric clinic the same day." } } },
];

// Diese Map speichert den Spielstand für jeden Spieler (identifiziert durch eine Session-ID)
const gameSessions = new Map();

function shuffle(array: any[]) {
    return array.sort(() => Math.random() - 0.5);
}

serve(async (req) => {
    const url = new URL(req.url);
    const path = url.pathname;

    // API-Endpunkt: Spiel starten
    if (path === "/api/start-game") {
        const sessionId = crypto.randomUUID();
        const shuffledItems = shuffle([...gameItems]);
        const session = {
            items: shuffledItems,
            currentIndex: 0,
            score: 0,
            answered: 0,
            total: shuffledItems.length
        };
        gameSessions.set(sessionId, session);

        return new Response(JSON.stringify({
            sessionId: sessionId,
            item: { id: session.items[0].id, name: session.items[0].name },
            score: session.score,
            answered: session.answered,
            total: session.total
        }), { headers: { "Content-Type": "application/json" } });
    }

    // API-Endpunkt: Antwort übermitteln
    if (path === "/api/submit-answer" && req.method === "POST") {
        const { sessionId, itemId, choice } = await req.json();
        const session = gameSessions.get(sessionId);

        if (!session) {
            return new Response("Session not found", { status: 404 });
        }

        const currentItem = session.items[session.currentIndex];
        if (currentItem.id !== itemId) {
            return new Response("Item ID mismatch", { status: 400 });
        }

        const result = currentItem.choices[choice as 'rock' | 'paper' | 'scissors'];
        session.answered++;
        if (result.correct) {
            session.score++;
        }

        const response = {
            correct: result.correct,
            message: result.message,
            score: session.score,
            answered: session.answered,
            total: session.total,
            nextItem: null as any
        };

        session.currentIndex++;
        if (session.currentIndex < session.total) {
            const nextItem = session.items[session.currentIndex];
            response.nextItem = { id: nextItem.id, name: nextItem.name };
        } else {
            // Spielende
            gameSessions.delete(sessionId);
        }

        return new Response(JSON.stringify(response), { headers: { "Content-Type": "application/json" } });
    }

    // Statische Dateien aus dem "public" Ordner ausliefern
    return serveDir(req, {
        fsRoot: "public",
        urlRoot: "",
        showDirListing: true,
        enableCors: true,
    });
});