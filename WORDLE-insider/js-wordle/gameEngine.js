//Contains logic related to the game engine, 
//such as checking guesses, updating the game state, and determining win/loss conditions.
//Validating Game Inputs and providing feedback to the player.
import { WORDS } from "../data-wordle/regularWords.js";

export const NUMBER_OF_GUESSES = 6;

let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];

export function getGuessesRemaining() {
    return guessesRemaining;
}

export function initGame() {
    guessesRemaining = NUMBER_OF_GUESSES;
    currentGuess = [];
    nextLetter = 0;
    rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function insertLetter(letter) {
    if (nextLetter === 5) return;

    currentGuess.push(letter.toLowerCase());
    nextLetter++;
}

export function deleteLetter() {
    if (nextLetter === 0) return;

    currentGuess.pop();
    nextLetter--;
}

export function checkGuess() {
    let guessString = currentGuess.join("");

    if (guessString.length !== 5) {
        return { status: "short" };
    }

    if (!WORDS.includes(guessString)) {
        return { status: "invalid" };
    }

    let rightGuess = Array.from(rightGuessString);
    let result = [];

    for (let i = 0; i < 5; i++) {
        let letterPosition = rightGuess.indexOf(currentGuess[i]);

        if (letterPosition === -1) {
            result.push("grey");
        } else {
            if (currentGuess[i] === rightGuess[i]) {
                result.push("green");
            } else {
                result.push("yellow");
            }
            rightGuess[letterPosition] = "#";
        }
    }

    if (guessString === rightGuessString) {
        guessesRemaining = 0;
        return { status: "win", result };
    }

    guessesRemaining--;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 0) {
        return { status: "lose", word: rightGuessString, result };
    }

    return { status: "continue", result };
}

export function getCurrentGuess() {
    return currentGuess;
}

export function getNextLetterIndex() {
    return nextLetter;
}