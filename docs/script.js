"use strict";

// --- Spieldaten (ehemals server.ts) ---
const gameItems = [
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

// --- Shuffle-Funktion (ehemals server.ts) ---
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// --- Frontend-Logik ---

// Spielzustand
let state = {
    items: [],
    currentIndex: 0,
    score: 0,
    answered: 0,
    total: 0
};

// DOM-Elemente
const screens = {
    start: document.getElementById('start-screen'),
    question: document.getElementById('question-screen'),
    answer: document.getElementById('answer-screen'),
    end: document.getElementById('end-screen'),
};
const elements = {
    startBtn: document.getElementById('start-btn'),
    scoreDisplay: document.getElementById('score-display'),
    itemName: document.getElementById('item-name'),
    choiceBtns: document.querySelectorAll('.choice-btn'),
    answerScoreDisplay: document.getElementById('answer-score-display'),
    answerResult: document.getElementById('answer-result'),
    answerMessage: document.getElementById('answer-message'),
    nextBtn: document.getElementById('next-btn'),
    finalScore: document.getElementById('final-score'),
    endMessage: document.getElementById('end-message'),
    tryAgainBtn: document.getElementById('try-again-btn'),
};

// Funktion, um Screens zu wechseln
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

// Funktion, um den Punktestand zu aktualisieren
function updateScore() {
    const scoreText = `${state.score} / ${state.answered} / ${state.total}`;
    elements.scoreDisplay.textContent = scoreText;
    elements.answerScoreDisplay.textContent = scoreText;
}

// Funktion, um die nächste Frage anzuzeigen
function displayQuestion() {
    const currentItem = state.items[state.currentIndex];
    if (!currentItem) return;
    elements.itemName.textContent = currentItem.name;
    updateScore();
    showScreen('question');
}

// Event Listeners
elements.startBtn.addEventListener('click', () => {
    state.items = shuffle(gameItems);
    state.currentIndex = 0;
    state.score = 0;
    state.answered = 0;
    state.total = state.items.length;
    displayQuestion();
});

elements.choiceBtns.forEach(button => {
    button.addEventListener('click', (e) => {
        const choice = e.target.dataset.choice;
        const currentItem = state.items[state.currentIndex];

        if (!choice || !currentItem) return;

        const choiceData = currentItem.choices[choice];
        const isCorrect = choiceData.correct;

        if (isCorrect) {
            state.score++;
        }
        state.answered++;

        updateScore();
        elements.answerResult.textContent = isCorrect ? 'correct' : 'nuh uh';
        elements.answerMessage.textContent = choiceData.message;

        showScreen('answer');
    });
});

elements.nextBtn.addEventListener('click', () => {
    state.currentIndex++;
    const hasNextItem = state.currentIndex < state.items.length;

    if (hasNextItem) {
        displayQuestion();
    } else {
        // Spiel ist zu Ende
        elements.finalScore.textContent = `${state.score} / ${state.total}`;
        let message = '';
        if (state.score <= 3) message = "Wow! You're really bad at this.";
        else if (state.score <= 7) message = "I guess you did ok.";
        else if (state.score <= 9) message = "Not bad, but probably mostly luck.";
        else message = "Only a true loser would memorize every single answer.";
        elements.endMessage.textContent = message;
        showScreen('end');
    }
});

elements.tryAgainBtn.addEventListener('click', () => {
    window.location.reload();
});

// Initialen Screen anzeigen
showScreen('start');