import { Database } from "jsr:@db/sqlite";

// Definiert die Struktur eines GameItems, wie es aus der Datenbank kommt
export interface GameItem {
    id: string;
    name: string;
    choices: {
        [key: string]: {
            correct: boolean;
            message: string;
        };
    };
}

// Initialisiert die Datenbank und lädt die Spieldaten
export function setupDatabase(): Database {
    const database = new Database("game.db");

    // Erstellt die Tabellen
    // Items speichert die Hauptobjekte des Spiels.
    database.prepare(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL
        )
    `).run();

    // Choices speichert die Antwortmöglichkeiten für jedes Item.
    // 'item_id' ist ein Fremdschlüssel, der auf die 'items'-Tabelle verweist.
    database.prepare(`
        CREATE TABLE IF NOT EXISTS choices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT NOT NULL,
            choice_name TEXT NOT NULL,
            correct INTEGER NOT NULL,
            message TEXT NOT NULL,
            FOREIGN KEY (item_id) REFERENCES items (item_id)
        )
    `).run();
    const itemCount = database.prepare("SELECT COUNT(*) FROM items").get();
    //const itemCount = rows.length > 1 ? rows.length : 0;
    console.log(JSON.stringify(itemCount))
    if (itemCount === 0) {
    seedDatabase(database);
    }
    return database;
}

// Füllt die Datenbank mit den ursprünglichen Spieldaten
function seedDatabase(database: Database) {
    const initialItems = [
        { id: 'computer', name: 'gaming computer', choices: { rock: { correct: false, message: "You throw the rock at the computer.\nIt has a little dent, but nothing else happens." }, paper: { correct: true, message: "You place the sheet of paper in front of the computer's fans.\nIt goes up into flames shortly afterwards." }, scissors: { correct: false, message: "You try to cut the power supply's cable.\nYou suffer an electric shock and collapse." } } },
        { id: 'water', name: 'glass of water', choices: { rock: { correct: false, message: "You throw the rock into the glass of water.\nYour pants get wet." }, paper: { correct: true, message: "You fold the paper into a boat and place it on the water.\nThe seas are yours, captain." }, scissors: { correct: false, message: "You try cutting the water.\nSuprisingly, this doesnt work." } } },
        { id: 'matej', name: 'matej', choices: { rock: { correct: true, message: "You throw a rock at Matej's head.\nHe collapses on the floor, unable to play a card.\nYou win the Magic the Gathering tournament." }, paper: { correct: false, message: "You play an empty sheet of paper.\nThat is not a valid Magic the Gathering Card.\nYou lose the tournament." }, scissors: { correct: false, message: "You cut Matej's commander in half.\nThis is against official Magic the Gathering rules.\nYour punishment is certain death." } } },
        { id: 'vampire', name: 'a vampire', choices: { rock: { correct: false, message: "You throw the rock at the vampire.\nIn retaliation, the vampire bites open your carotid artery." }, paper: { correct: false, message: "You hand the vampire a sheet of paper.\nHe makes a cool origami bat.\nThen, he sucks the blood from your body until it is dry." }, scissors: { correct: true, message: "You open the scissors, forming a crucifix.\nThe vampire crumbles into dust." } } },
        { id: 'tourist', name: 'angry french tourist', choices: { rock: { correct: false, message: "You throw the rock at the tourist.\nThey start yelling words at you you don't understand." }, paper: { correct: true, message: "You wave the white sheet of paper like a flag.\nThe french tourist recognizes this gesture and leaves you be." }, scissors: { correct: false, message: "You try cutting their baguette in half.\nIt is only decorative, 7 months old and hard as rocks.\nYour scissors break." } } },
        { id: 'nokia', name: 'old nokia phone', choices: { rock: { correct: false, message: "You strike the Nokia with a rock.\nThe rock shatters." }, paper: { correct: true, message: "You wrap the nokia in paper, hiding it.\nIt becomes forgotten for eternity." }, scissors: { correct: false, message: "You try cutting the Nokia.\nYou lose all your fingers, but the nokia is unharmed." } } },
        { id: 'dragon', name: 'ender dragon', choices: { rock: { correct: false, message: "You place a cobblestone.\nThe Ender Dragon knocks you into the void." }, paper: { correct: false, message: "You hit the Ender Dragon with the piece of paper.\nIt does 1 HP Damage.\nThe Ender Dragon has 199 HP left." }, scissors: { correct: true, message: "You shear sheep to craft some beds.\nUsing the bed speedrun strategy, you defeat the ender dragon in world record pace." } } },
        { id: 'adhd', name: 'adhd', choices: { rock: { correct: true, message: "You pull out a rock from your pocket.\nPetting it calms you." }, paper: { correct: false, message: "You stare at a blank piece of paper.\nYour ADHD gets infinitely worse." }, scissors: { correct: false, message: "Out of boredom, you cut off one of your fingers.\nYou are certainly not bored anymore." } } },
        { id: 'router', name: 'offline internet router', choices: { rock: { correct: false, message: "You smash the router with a router.\nIt still doesn't work." }, paper: { correct: false, message: "You write a physical support ticket and send it to your provider via mail.\nThey never answer." }, scissors: { correct: true, message: "You use the tipp of the scissors to press the tiny, recessed restart button on your router.\nShortly after, the internet is back." } } },
        { id: 'date', name: 'first date', choices: { rock: { correct: true, message: "You place a rock on the table and start talking to it instead.\nIt makes for better conversation." }, paper: { correct: false, message: "You use the paper as a napkin and hang it over your torso to not get it dirty.\nYou look like a baby." }, scissors: { correct: false, message: "You pull out the scissors and start chasing your date like a slasher movie villain.\nYou are admitted to a psychiatric clinic the same day." } } },
    ];

    console.log("Seeding database...");
    for (const item of initialItems) {
        database.prepare("INSERT INTO items (item_id, name) VALUES (?, ?)").run(item.id, item.name);
        for (const choiceName in item.choices) {
            const choice = item.choices[choiceName];
            database.prepare(
                "INSERT INTO choices (item_id, choice_name, correct, message) VALUES (?, ?, ?, ?)").run(item.id, choiceName, choice.correct ? 1 : 0, choice.message);
        }
    }
    console.log("Database seeded successfully.");
}

// Lädt alle Spiel-Items und ihre zugehörigen Antwortmöglichkeiten aus der Datenbank
export function loadGameItems(database: Database): GameItem[] {
    const items: { [id: string]: GameItem } = {};

    // Lädt zuerst alle Items
    const itemRows = database.prepare("SELECT item_id, name FROM items").all();
    console.log(itemRows);
    for (const {id, name} of itemRows) {
        items[id] = { id, name, choices: {} };
    }

    // Lädt dann alle Choices und fügt sie den entsprechenden Items hinzu
    const choiceRows = database.prepare("SELECT item_id, choice_name, correct, message FROM choices").all();
    for (const {itemId, choiceName, correct, message} of choiceRows) {
        if (items[itemId]) {
            items[itemId].choices[choiceName] = {
                correct: correct === 1,
                message: message
            };
        }
    }

    return Object.values(items);
}