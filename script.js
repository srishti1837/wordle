import { WORDS } from "./WORDLE-insider/data-wordle/regularWords.js";
import { DAILY_WORDS } from "./WORDLE-insider/data-wordle/dailyWords.js"; 
import { VALID_GUESSES } from "./WORDLE-insider/data-wordle/words.js"; // THE NEW BIG LIBRARY

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let currentWordsList = DAILY_WORDS; // Set default to match 'active' state in HTML
let rightGuessString = "";

// --- GAME MODE LOGIC ---

/**
 * Selects the target word based on the active mode.
 * Daily mode uses a date-based index so all players get the same word.
 */
function selectTargetWord() {
    const isDaily = document.getElementById("daily-mode").classList.contains("active");
    
    if (isDaily) {
        // Daily Logic: Index based on the current day of the year
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        rightGuessString = DAILY_WORDS[dayOfYear % DAILY_WORDS.length];
    } else {
        // Regular Logic: Random word from the main list
        rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
    }
    console.log("Target Word:", rightGuessString);
}

/**
 * Handles switching between game modes.
 */
function switchMode(mode) {
    const dailyBtn = document.getElementById("daily-mode");
    const regularBtn = document.getElementById("regular-mode");

    if (mode === "daily") {
        dailyBtn.classList.add("active");
        regularBtn.classList.remove("active");
        currentWordsList = DAILY_WORDS;
    } else {
        regularBtn.classList.add("active");
        dailyBtn.classList.remove("active");
        currentWordsList = WORDS;
    }
    
    resetGame();
}

/**
 * Clears the board and resets game state.
 * This prevents the "disappearing boxes" issue by wiping existing HTML first.
 */
function resetGame() {
    guessesRemaining = NUMBER_OF_GUESSES;
    currentGuess = [];
    nextLetter = 0;
    
    // Clear Board UI completely
    document.getElementById("game-board").innerHTML = "";
    
    // Reset virtual keyboard colors
    const keys = document.getElementsByClassName("keyboard-button");
    for (const key of keys) {
        key.style.backgroundColor = "";
    }

    selectTargetWord();
    initBoard();
}

// --- CORE GAME FUNCTIONS ---

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}

function checkGuess() {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let guessString = currentGuess.join("").toLowerCase();
    let rightGuess = Array.from(rightGuessString.toLowerCase());

    // 1. Length Check
    if (guessString.length != 5) {
        toastr.error("Not enough letters!");
        return; 
    }

    // 2. Gibberish vs. Valid Word Validation
    // Check if the word exists in ANY of our libraries
    const isRealWord = VALID_GUESSES.includes(guessString) || 
                        DAILY_WORDS.includes(guessString) || 
                        WORDS.includes(guessString);

    if (!isRealWord) {
        // GIBBERISH: e.g., "qwert"
        toastr.warning("Not in word list!");
        animateCSS(row, 'shakeX'); // Row shakes, but no attempt is lost
        return; // EXIT: User stays on the same line
    }

    // 3. Shading Logic (If we reach here, it's a valid attempt)
    for (let i = 0; i < 5; i++) {
        let box = row.children[i];
        let letter = currentGuess[i];
        let letterColor = '';

        // Match Logic
        if (guessString[i] === rightGuessString[i]) {
            letterColor = '#4A7C59'; // Dark Green
            rightGuess[i] = "#"; 
        } else if (rightGuess.includes(letter)) {
            letterColor = '#B8922A'; // Mustard Yellow
            rightGuess[rightGuess.indexOf(letter)] = "#"; 
        } else {
            letterColor = '#787c7e'; // Grey
        }

        // Apply visual updates with a staggered delay
        setTimeout(() => {
            animateCSS(box, 'flipInX');
            box.style.backgroundColor = letterColor;
            box.style.borderColor = letterColor;
            box.style.color = "white"; // Ensures text is readable
            shadeKeyBoard(letter, letterColor);
        }, 250 * i);
    }

    // 4. Win/Loss and Turn Management
    if (guessString === rightGuessString) {
        // Success
        setTimeout(() => {
            toastr.success("Excellent! You found the word.");
        }, 1500); // Wait for the last tile to flip
        guessesRemaining = 0;
    } else {
        // Valid but wrong word: Turn is officially used
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            setTimeout(() => {
                toastr.error("Out of turns!");
                toastr.info(`The word was: ${rightGuessString.toUpperCase()}`);
            }, 1500);
        }
    }
}
function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, "pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}

const animateCSS = (element, animation, prefix = 'animate__') =>
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});

// --- EVENT LISTENERS ---

document.addEventListener("keyup", (e) => {
    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/^[a-z]$/i) // Fixed regex for single letters
    if (!found) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent
    if (key === "Del") {
        key = "Backspace"
    } 
    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

// Game Mode Button Listeners
document.getElementById("daily-mode").addEventListener("click", () => switchMode("daily"));
document.getElementById("regular-mode").addEventListener("click", () => switchMode("regular"));

// Modal Logic for "How to Play"
const modal = document.getElementById("how-to-modal");
const btn = document.getElementById("how-to-btn");
const span = document.querySelector(".close-btn");

btn.onclick = () => modal.classList.remove("hidden");
span.onclick = () => modal.classList.add("hidden");
window.onclick = (event) => {
    if (event.target == modal) {
        modal.classList.add("hidden");
    }
}

// Initial Game Setup
selectTargetWord();
initBoard();