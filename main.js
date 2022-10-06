const ANSWER_LENGTH = 5;
const ROUNDS = 6;
const letters = document.querySelectorAll(".scoreboard-letter");
const k = document.querySelectorAll(".my-Key");
const loadingDiv = document.querySelector(".info-bar");
const k_idx = {
  "q": [0, true],
  "w": [1, true],
  "e": [2, true],
  "r": [3, true],
  "t": [4, true],
  "y": [5, true],
  "u": [6, true],
  "i": [7, true],
  "o": [8, true],
  "p": [9, true],
  "a": [10, true],
  "s": [11, true],
  "d": [12, true],
  "f": [13, true],
  "g": [14, true],
  "h": [15, true],
  "j": [16, true],
  "k": [17, true],
  "l": [18, true],
  "z": [19, true],
  "x": [20, true],
  "c": [21, true],
  "v": [22, true],
  "b": [23, true],
  "n": [24, true],
  "m": [25, true],
};

async function init() {
  // the state for the app
  let currentRow = 0;
  let currentGuess = "";
  let done = false;
  let isLoading = true;

  // get the word of the day
  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const { word: wordRes } = await res.json();
  const word = wordRes.toUpperCase();
  const wordParts = word.split("");
  isLoading = false;
  setLoading(isLoading);

  // user adds a letter to the current guess
  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      current = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText =
      letter;
  }

  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      return;
    }

    // check the API to see if it's a valid word
    isLoading = true;
    setLoading(isLoading);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });
    const { validWord } = await res.json();
    isLoading = false;
    setLoading(isLoading);

    // not valid, mark the word as invalid and return
    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);
    let allRight = true;

    // first pass just finds correct letters so we can mark those as
    // correct first
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // mark as correct
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
        if (k_idx[guessParts[i].toLowerCase()][1]) {
          k[k_idx[guessParts[i].toLowerCase()][0]].classList.add("correct");
          k_idx[guessParts[i].toLowerCase()][1] = false;
        }
        map[guessParts[i]]--;
      }
    }

    // second pass finds close and wrong letters
    // we use the map to make sure we mark the correct amount of
    // close letters
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // do nothing
      } else if (map[guessParts[i]] && map[guessParts[i]] > 0) {
        // mark as close
        allRight = false;
        letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
        if (k_idx[guessParts[i].toLowerCase()][1]) {
          k[k_idx[guessParts[i].toLowerCase()][0]].classList.add("close");
          k_idx[guessParts[i].toLowerCase()][1] = false;
        }
        map[guessParts[i]]--;
      } else {
        // wrong
        allRight = false;
        letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
        if (k_idx[guessParts[i].toLowerCase()][1]) {
          k[k_idx[guessParts[i].toLowerCase()][0]].classList.add("wrong");
          k_idx[guessParts[i].toLowerCase()][1] = false;
        }
      }
    }

    currentRow++;
    currentGuess = "";
    if (allRight) {
      // win
      alert("you win");
      document.querySelector(".brand").classList.add("winner");
      done = true;
    } else if (currentRow === ROUNDS) {
      // lose
      alert(`you lose, the word was ${word}`);
      done = true;
    }
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = "";
  }

  // let the user know that their guess wasn't a real word
  function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

      // long enough for the browser to repaint without the "invalid class" so we can then add it again
      setTimeout(
        () => letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid"),
        10
      );
    }
  }

  // listening for event keys and routing to the right function
  // we listen on keydown so we can catch Enter and Backspace
  document.addEventListener("keydown", function handleKeyPress(event) {
    if (done || isLoading) {
      return;
    }

    const action = event.key;

    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    }
  });
  document.querySelector(".keyboard").addEventListener("click", function handleClicks(event) {
    if (done || isLoading) {
      return;
    }
      if (event.path[0].type == "button") {
      if (event.path[0].innerText === "RETURN") {
        commit();
      } else if (event.path[0].innerText === "ESC") {
        backspace();
      } else if (isLetter(event.path[0].innerText)) {
        addLetter(event.path[0].innerText);
      }
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

// show the loading spinner when needed
function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    if (obj[array[i]]) {
      obj[array[i]]++;
    } else {
      obj[array[i]] = 1;
    }
  }
  return obj;
}

init();