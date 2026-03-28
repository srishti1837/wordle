//Main file of Wordle that runs first.
//Runs when the page loads, decides which game mode to run, and initializes the game. 
//Also connects UI buttons to game logic. Imports other modules as well.
//Do not write game Logics here or score/leaderboard calculations.
console.log("main JS loaded");
import {
    initGame,
    insertLetter,
    deleteLetter,
    checkGuess,
    getCurrentGuess,
    getGuessesRemaining,
    getNextLetterIndex,
    NUMBER_OF_GUESSES
} from "./gameEngine.js";

initGame();
initBoard();

function initBoard() {
    console.log("Initializing board...");
    let board = document.getElementById("game-board");
    console.log("Board element:", board);

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";

        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            row.appendChild(box);
        }

        board.appendChild(row);
    }
}

document.addEventListener("keyup", (e) => {
    if (getGuessesRemaining() === 0) return;

    let pressedKey = String(e.key);

    if (pressedKey === "Backspace") {
        handleDelete();
        return;
    }

    if (pressedKey === "Enter") {
        handleSubmit();
        return;
    }

    let found = pressedKey.match(/[a-z]/gi);
    if (!found || found.length > 1) return;

    handleInsert(pressedKey);
});

function handleInsert(letter) {
    let row = document.getElementsByClassName("letter-row")[6 - getGuessesRemaining()];
    let box = row.children[getNextLetterIndex()];

    if (!box) return;

    box.textContent = letter;
    box.classList.add("filled-box");

    insertLetter(letter);
}

function handleDelete() {
    let row = document.getElementsByClassName("letter-row")[6 - getGuessesRemaining()];
    let box = row.children[getNextLetterIndex() - 1];

    if (!box) return;

    box.textContent = "";
    box.classList.remove("filled-box");

    deleteLetter();
}

function handleSubmit() {
    let response = checkGuess();

    if (response.status === "short") {
        toastr.error("Not enough letters!");
        return;
    }

    if (response.status === "invalid") {
        toastr.error("Word not in list!");
        return;
    }

    let row = document.getElementsByClassName("letter-row")[6 - getGuessesRemaining() - 1];

    response.result.forEach((color, i) => {
    let box = row.children[i];
    let letter = box.textContent;

    let delay = 250 * i;

    setTimeout(() => {
        box.classList.add("animate__animated", "animate__flipInX");
        box.style.backgroundColor = color;
        shadeKeyboard(letter, color);

        box.addEventListener("animationend", () => {
            box.classList.remove("animate__animated", "animate__flipInX");
        }, { once: true });

    }, delay);
});

    if (response.status === "win") {
        toastr.success("You guessed right!");
    }

    if (response.status === "lose") {
        toastr.error("Game over!");
        toastr.info(`The word was: ${response.word}`);
    }
}

function shadeKeyboard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent.toLowerCase() === letter.toLowerCase()) {

            let oldColor = elem.style.backgroundColor;

            if (oldColor === "green") return;
            if (oldColor === "yellow" && color !== "green") return;

            elem.style.backgroundColor = color;
            break;
        }
    }
}