// server.ts 
import { serve } from "https://deno.land/std@0.194.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.194.0/http/file_server.ts";

// typescript interfaces
interface Choice {
    correct: boolean;
    message: string;
}

interface GameItem {
    id: string;
    name: string;
    choices: {
        [key: string]: Choice;
    };
}

interface GameSession {
    items: GameItem[];
    currentIndex: number;
    score: number;
    answered: number;
    total: number;
}

// game content
const gameItems: GameItem[] = [
    { id: 'computer', name: 'computer', choices: { rock: { correct: false, message:"You throw the rock at the computer.\nIt has a little dent, but nothing else happens."}, paper: { correct: true, message:"You place the sheet of paper in front of the computer's fans.\nIt goes up into flames shortly afterwards."}, scissors: { correct: false, message:"You try to cut the power supply's cable.\nYou suffer an electric shock and collapse."} } },
    { id: 'water', name: 'glass of water', choices: { rock: { correct: false, message:"You throw the rock into the glass of water.\nYour pants get wet."}, paper: { correct: true, message:"You fold the paper into a boat and place it on the water.\nThe seas are yours, captain."}, scissors: { correct: false, message:"You try cutting the water.\nSuprisingly, this doesnt work."} } },
    { id: 'matej', name: 'matej', choices: { rock: { correct: true, message:"You throw a rock at Matej's head.\nHe collapses on the floor, unable to play a card.\nYou win the Magic the Gathering tournament."}, paper: { correct: false, message:"You play an empty sheet of paper.\nThat is not a valid Magic the Gathering Card.\nYou lose the tournament."}, scissors: { correct: false, message:"You cut Matej's commander in half.\nThis is against official Magic the Gathering rules.\nYour punishment is certain death."} } },
    { id: 'vampire', name: 'a vampire', choices: { rock: { correct: false, message:"You throw the rock at the vampire.\nIn retaliation, the vampire bites open your carotid artery."}, paper: { correct: false, message:"You hand the vampire a sheet of paper.\nHe makes a cool origami bat.\nThen, he sucks the blood from your body until it is dry."}, scissors: { correct: true, message: "You open the scissors, forming a crucifix.\nThe vampire crumbles into dust." } } },
    { id: 'tourist', name: 'angry french tourist', choices: { rock: { correct: false, message:"You throw the rock at the tourist.\nThey start yelling words at you you don't understand."}, paper: { correct: true, message:"You wave the white sheet of paper like a flag.\nThe french tourist recognizes this gesture and leaves you be."}, scissors: { correct: false, message: "You try cutting their baguette in half.\nIt is only decorative, 7 months old and hard as rocks.\nYour scissors break."} } },
    { id: 'nokia', name: 'old nokia phone', choices: { rock: { correct: false, message:"You strike the Nokia with a rock.\nThe rock shatters."}, paper: { correct: true, message:"You wrap the nokia in paper, hiding it.\nIt becomes forgotten for eternity." }, scissors: { correct: false, message:"You try cutting the Nokia.\nYou lose all your fingers, but the nokia is unharmed."} } },
    { id: 'dragon', name: 'ender dragon', choices: { rock: { correct: false, message:"You place a cobblestone.\nThe Ender Dragon knocks you into the void."}, paper: { correct: false, message:"You hit the Ender Dragon with the piece of paper.\nIt does 1 HP Damage.\nThe Ender Dragon has 199 HP left."}, scissors: { correct: true, message: "You shear sheep to craft some beds.\nUsing the bed speedrun strategy, you defeat the ender dragon in world record pace."} } },
    { id: 'adhd', name: 'adhd', choices: { rock: { correct: true, message:"You pull out a rock from your pocket.\nPetting it calms you."}, paper: { correct: false, message:"You stare at a blank piece of paper.\nYour ADHD gets infinitely worse." }, scissors: { correct: false, message:"Out of boredom, you cut off one of your fingers.\nYou are certainly not bored anymore."} } },
    { id: 'router', name: 'offline internet router', choices: { rock: { correct: false, message:"You smash the router with a router.\nIt still doesn't work."}, paper: { correct: false, message:"You write a physical support ticket and send it to your provider via mail.\nThey never answer."}, scissors: { correct: true, message: "You use the tipp of the scissors to press the tiny, recessed restart button on your router.\nShortly after, the internet is back."} } },
    { id: 'date', name: 'first date', choices: { rock: { correct: true, message:"You place a rock on the table and start talking to it instead.\nIt makes for better conversation."}, paper: { correct: false, message:"You use the paper as a napkin and hang it over your torso to not get it dirty.\nYou look like a baby."}, scissors: { correct: false, message:"You pull out the scissors and start chasing your date like a slasher movie villain.\nYou are admitted to a psychiatric clinic the same day."} } },
];

const gameSessions = new Map<string, GameSession>();

function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

serve(async (req) => {
    const url = new URL(req.url);
    const path = url.pathname;

    // Add CORS headers to all responses
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (path === "/api/start-game") {
        const sessionId = crypto.randomUUID();
        const shuffledItems = shuffle([...gameItems]);
        const session: GameSession = {
            items: shuffledItems,
            currentIndex: 0,
            score: 0,
            answered: 0,
            total: shuffledItems.length
        };
        gameSessions.set(sessionId, session);

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

    if (path === "/api/submit-answer" && req.method === "POST") {
        try {
            const data = await req.json();
            const session = gameSessions.get(data.sessionId);

            if (!session) {
                return new Response(JSON.stringify({ error: "Session not found" }), {
                    status: 404,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json"
                    }
                });
            }

            const currentItem = session.items[session.currentIndex];
            const choice = currentItem.choices[data.choice];
            const correct = choice.correct;

            session.score += correct ? 1 : 0;
            session.answered += 1;
            session.currentIndex += 1;

            const nextItem = session.currentIndex < session.items.length
                ? session.items[session.currentIndex]
                : null;

            return new Response(JSON.stringify({
                correct,
                message: choice.message,
                score: session.score,
                answered: session.answered,
                nextItem: nextItem ? { id: nextItem.id, name: nextItem.name } : null
            }), {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: "Invalid request" }), {
                status: 400,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            });
        }
    }

    // Serve static files from current directory
    return serveDir(req, {
        fsRoot: ".",
        urlRoot: "",
        showDirListing: true,
        enableCors: true,
    });
});

console.log("Server running at http://localhost:8000");