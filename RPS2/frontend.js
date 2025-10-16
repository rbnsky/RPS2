"use strict";
// frontend.ts
// Spielzustand im Frontend
let state = {
    sessionId: null,
    currentItem: null,
    score: 0,
    answered: 0,
    total: 10
};
// DOM-Elemente holen
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
// Funktion, um den richtigen Screen anzuzeigen
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}
function updateScore() {
    const scoreText = `${state.score} / ${state.answered} / ${state.total}`;
    elements.scoreDisplay.textContent = scoreText;
    elements.answerScoreDisplay.textContent = scoreText;
}
function displayQuestion() {
    if (!state.currentItem)
        return;
    elements.itemName.textContent = state.currentItem.name;
    updateScore();
    showScreen('question');
}
// Event Listeners
elements.startBtn.addEventListener('click', async () => {
    const response = await fetch('/api/start-game');
    const data = await response.json();
    state.sessionId = data.sessionId;
    state.currentItem = data.item;
    state.score = data.score;
    state.answered = data.answered;
    state.total = data.total;
    displayQuestion();
});
elements.choiceBtns.forEach(button => {
    button.addEventListener('click', async (e) => {
        const choice = e.target.dataset.choice;
        if (!choice || !state.currentItem)
            return;
        const response = await fetch('/api/submit-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: state.sessionId,
                itemId: state.currentItem.id,
                choice: choice
            })
        });
        const data = await response.json();
        state.score = data.score;
        state.answered = data.answered;
        state.currentItem = data.nextItem; // Nächstes Item für den "Next" Button speichern
        updateScore();
        elements.answerResult.textContent = data.correct ? 'correct' : 'nuh uh';
        elements.answerMessage.textContent = data.message;
        showScreen('answer');
    });
});
elements.nextBtn.addEventListener('click', () => {
    if (state.currentItem) {
        displayQuestion();
    }
    else {
        // Spiel ist zu Ende
        elements.finalScore.textContent = `${state.score} / ${state.total}`;
        let message = '';
        if (state.score <= 3)
            message = "Damn. You're really bad at this.";
        else if (state.score <= 7)
            message = "I guess you did ok.";
        else if (state.score <= 9)
            message = "Not bad, but probably mostly luck.";
        else
            message = "Cheater! How many times did you resubmit your answers?!";
        elements.endMessage.textContent = message;
        showScreen('end');
    }
});
elements.tryAgainBtn.addEventListener('click', () => {
    // Einfachste Methode: Seite neu laden
    window.location.reload();
});
// Initialen Screen anzeigen
showScreen('start');
//# sourceMappingURL=frontend.js.map