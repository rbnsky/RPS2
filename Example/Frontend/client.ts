async function requestTextWithGET(url: string): Promise<string> {
    const response = await fetch(url);
    const text = await response.text();
    return text;
}

// Typing of DOM elements
const answer = document.getElementById('answer') as HTMLDivElement;
const button = document.getElementById('button') as HTMLButtonElement;
const searchItem = document.getElementById('searchItem') as HTMLInputElement;

button.addEventListener('click', getAndAttachText);

async function getAndAttachText(event: MouseEvent): Promise<void> {
    if (!searchItem || !answer) return;

    const text = document.createElement('p');
    text.textContent = await requestTextWithGET(
        'http://localhost:3000/search?item=' + encodeURIComponent(searchItem.value)
    );
    answer.appendChild(text);
}