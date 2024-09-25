//function to check if the word is a word i.e. in the dictionary
async function inDictionary(word) {
    let inDict = false;
    try {
        const response = await $.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        inDict = response && response.length > 0; // confirm valid response from api
    } catch (error) {
        console.error(`Error fetching word from dictionary API: ${error}`);
    }
    return inDict;
}

//function to insert in the user input
function insert(row, input) {
    input.split("").forEach((char, cell) => {
        $(`div.row#${row} > div#${cell}.cell`)
            .text(char.toUpperCase())
            .addClass("pop"); // pop animation
    });
    for (let i = input.length; i < 7; i++) {
        $(`div.row#${row} > div#${i}.cell`).text("");
    }
}

//check input function to know path forward for the game
function checkInput(input, answer, row) {
    let correctInput = 0;
    answer = answer.split("");
    let changedIndices = new Set();

    const green = "#005e00";  // green for correct position
    const yellow = "#ffce00"; // yellow for wrong position
    const gray = "#444444";   // gray for not in word
    

    // check for correct letters in the correct position
    for (let j = 0; j < 7; j++) {
        if (input[j] === answer[j]) {
            $(`div.row#${row} > div#${j}.cell`).css("background-color", green).css("transition", "all 0.5s ease");
            answer[j] = "-"; // marking this letter as changed
            changedIndices.add(j);
            correctInput++;
        }
    }

    // check for correct letters in the wrong position
    for (let j = 0; j < 7; j++) {
        if (answer.includes(input[j]) && !changedIndices.has(j)) {
            $(`div.row#${row} > div#${j}.cell`).css("background-color", yellow).css("transition", "all 0.5s ease");
            changedIndices.add(j);
            answer[answer.indexOf(input[j])] = "-"; // marking this letter as changed
        }
    }

    // mark remaining letters as not in the word
    for (let j = 0; j < 7; j++) {
        if (!changedIndices.has(j)) {
            $(`div.row#${row} > div#${j}.cell`).css("background-color", gray).css("transition", "all 0.5s ease");
        }
    }
    
    return correctInput === 7; // return true if all letters are correct
}

//get a random word from the api if it fails 
async function getRandomWord() {
    let word = "";
    try {
        const response = await fetch('https://random-word-api.herokuapp.com/word?number=1&length=7');
        const data = await response.json();
        word = data[0];
    } 
    catch (error) {
        console.error("Error fetching word from random word API, falling back to words.txt");
        await fetch('./words.txt')
            .then(response => response.text())
            .then(data => {
                const words = data.split(", ");
                word = words[Math.floor(Math.random() * words.length)];
            });
    }
    return word.toLowerCase();
}

$(document).ready(async function () {
    // create the game grid
    for (let i = 0; i < 7; i++) {
        $("#table").append(`<div class='row' id=${i}></div>`);
    }

    $(".row").each((index, element) => {
        for (let i = 0; i < 7; i++) {
            $(element).append(`<div class='cell' id=${i}></div>`);
        }
    });

    let answer = await getRandomWord(); //get the random word
    let input = "";
    let row = 0;

    //when you actually play the game
    async function playGame(keypressed) {
        if (row >= 7) return;  // prevent further input if the game is over

        // handle letter input
        if (/^[a-z]$/i.test(keypressed) && input.length < 7) {
            input += keypressed.toLowerCase();
            insert(row, input);
        } 
        // handle backspace
        else if (keypressed === "Backspace" || keypressed === "{bksp}") {
            input = input.substring(0, input.length - 1);
            insert(row, input);
        } 
        // handle enter
        else if (keypressed === "Enter" && input.length === 7) {
            if (await inDictionary(input)) {
                if (checkInput(input, answer, row)) {
                    setTimeout(() => alert("Congratulations! Reload for a new challenge."), 1750);
                    row = 8;  // prevent further inputs
                } else {
                    row++;
                    input = "";
                    if (row === 7) {
                        setTimeout(() => {
                            alert(`You're out of tries.`);
                            revealAnswer(answer); // reveal the answer
                        }, 1750);
                    }
                }
            } else {
                shakeDisplay(); // shake display for invalid word
            }
        } else if (input.length < 7) {
            shakeDisplay(); // shake display for invalid input length
        }
    }

    //shake display function
    function shakeDisplay() {
        $("#table").addClass("shake");
        setTimeout(() => {
            $("#table").removeClass("shake");
        }, 500);
    }

    //reveal answer function
    function revealAnswer(answer) {
        const red = "#dd0000";
        for (let j = 0; j < 7; j++) {
            insert(6, " ".repeat(j+1));
            $(`div.row#6 > div#${j}.cell`).css("background-color", red).css("transition", "all 0.5s ease");
        }
        insert(6, answer);
    }

    //pressing the key
    $(document).keyup(async event => {
        const keypressed = event.originalEvent.key;
        await playGame(keypressed);
    });

    // create keyboard rows
    let row1 = "QWERTYUIOP";
    let row2 = "ASDFGHJKL";
    let row3 = " ZXCVBNM "; //space before and after for backspace and enter

    let keyboardRows = [row1.split(""), row2.split(""), row3.split("")];
    for (let i = 0; i < keyboardRows.length; i++) {
        $(".simpleKeyboard").append(`<div class='keyboardRow' id=kb${i}></div>`);
    }

    // adding buttons for the keyboard
    for (let i = 0; i < keyboardRows.length; i++) {
        for (let j = 0; j < keyboardRows[i].length; j++) {
            if (keyboardRows[i][j] === " ") {
                // Skip adding a button for the space character
                continue;
            }
            $(`#kb${i}.keyboardRow`).append(`<button class='keyboardButton' id="kb${i}${j}">${keyboardRows[i][j]}</button>`);
        }
    }

    // adjusting the size of the backspace and enter buttons
    $("#kb2").append("<button class='keyboardButton' id='bkspBtn' style='width: 1.5em;'>Del</button>");
    $("#kb2").append("<button class='keyboardButton' id='enterBtn' style='width: 1.5em;'>Enter</button>");

    // place backspace to the left of Z
    $("#bkspBtn").insertBefore($("#kb2 button:first-child")); // Move Backspace before 'Z'

    // set enter button position to the right of M
   $("#enterBtn").insertAfter($("#kb2 button:last-child")); // Move Enter after 'M'

    // adjusting button widths to 1.5 times the width of regular buttons
    $(".keyboardButton").css("width", "2.5em"); 
    $("#bkspBtn").css("width", "3.75em"); 
    $("#enterBtn").css("width", "3.75em"); 

    // click event for keyboard buttons
    $(".keyboardButton").click(async function () {
        const key = $(this).html().toLowerCase();
        await playGame(key);
    });

    // click events for enter and backspace buttons
    $("#enterBtn").click(async function () {
        await playGame("Enter");
    });
    $("#bkspBtn").click(async function () {
        await playGame("Backspace");
    });
});
