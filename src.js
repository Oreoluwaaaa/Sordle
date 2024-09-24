function insert(row, input){
    input.split("").forEach((char, cell) => {
        $(`div.row#${row} > div#${cell}.cell`).text(char.toUpperCase());
    });
    for(let i = input.length; i < 7; i++){
        $(`div.row#${row} > div#${i}.cell`).text("");
    }
}

async function inDictionary(word){
    let inDict = false;
    try {
        await $.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, function(data) {
            inDict = true;
        });
    }
    catch(error){
        inDict = false;
    }
    return inDict;
}

function checkInput(input, answer, row){
    let correctInput = 0;
    answer = answer.split("");
    let changedIndices = new Set();

    let green = "rgb(0, 128, 0)";
    let orange = "rgb(255, 165, 0)";
    let black = "rgb(0, 0, 0)";

    for(let j = 0; j < 7; j++){
        if(input[j] === answer[j]){
            $(`div.row#${row} > div#${j}.cell`).css("background-color", green).css("transition", "all 5.0s ease");

            $(`.${input[j].toUpperCase()}`).css("background-color", green).css("transition", "all 5.0s ease");

            answer[j] = "-";
            changedIndices.add(j);
            correctInput++;
        }
    }
    for(let j = 0; j < 7; j++){    
        if(answer.includes(input[j]) && !(changedIndices.has(j))){
            $(`div.row#${row} > div#${j}.cell`).css("background-color", orange).css("transition", "all 5.0s ease");

            let button = $(`.${input[j].toUpperCase()}`);

            if(button.css("background-color") != green){
                button.css("background-color", orange).css("transition", "all 5.0s ease");
            }

            changedIndices.add(j);
            answer[answer.indexOf(input[j])] = "-";
        }
    }
    for(let j = 0; j < 7; j++){
        if(!(changedIndices.has(j))){
            $(`div.row#${row} > div#${j}.cell`).css("background-color", black).css("transition", "all 5.0s ease");

            let button = $(`.${input[j].toUpperCase()}`);
            
            if((button.css("background-color") != orange) || (button.css("background-color") != green )){   
                button.css("background-color", black).css("transition", "all 5.0s ease");
            }
        }
    }
    return correctInput === 7 ? true: false;
}

async function getRandomWord(){
    let word = "";
    await fetch('./words.txt')
    .then(response => response.text())
    .then(data => {
        data = data.split(", ");
        let random = Math.floor(Math.random() * data.length);
        word = data[random];
    });
    return word.toLowerCase();
}

$(document).ready(async function() {
    for(i = 0; i < 7; i++){
        $("#table").append(`<div class='row' id=${i}></div>`);
    }
    
    $(".row").each((index, element) => {
        for(i = 0; i < 7; i++){
            $(element).append(`<div class='cell' id=${i}></div>`);
        }    
    });

    let answer = await getRandomWord();
    let input = "";
    let row = 0;
    
    async function playGame(keypressed) {
        if (!/[^a-z$]/.test(keypressed) && row < 7 && keypressed.length === 1){
            input += (input.length < 7) ? keypressed : "";
            insert(row, input);
        }
        else if (keypressed == "Backspace" || keypressed == "{bksp}" || keypressed == "bksp"){
            input = input.substring(0, input.length-1);
            insert(row, input);
        }
        else if ((keypressed == "Enter" || keypressed == "enter"|| keypressed == "{enter}") && (input.length === 7)){
            if (await inDictionary(input)){
                if (checkInput(input, answer, row)){
                    setTimeout(() => {
                        alert("Congratulations! Reload for new challenge.");
                    }, "1750")
                    row = 8
                }
                else{
                    row++;
                    input =  "";
                    if (row === 7){
                        setTimeout(() => {
                            alert(`You're out of tries. The word is ${answer.toUpperCase()}\nReload for new challenge.`);
                        }, "1750")
                    }
                }
            }
            else{
                alert("invalid word");
            }
        }
    };

    $(document).keyup(async event => {
        keypressed = event.originalEvent.key;
        await playGame(keypressed);
    });

    //keyboard
    let row1 = "QWERTYUIOP";
    let row2 = "ASDFGHJKL";
    let row3 = " ZXCVBNM ";

    let keybordRows = [row1.split(""), row2.split(""), row3.split("")];
    for(i = 0; i < keybordRows.length; i++){
        $(".simpleKeyboard").append(`<div class='keyboardRow' id=kb${i}></div>`);
    }

    for(i = 0; i < keybordRows.length; i++){
        for(j = 0; j < keybordRows[i].length; j++){
            $(`#kb${i}.keyboardRow`).append(`<button class='keyboardButton ${keybordRows[i][j]}' id="kb${i}${j}">${keybordRows[i][j]}</button>`);
        }
    }
    $("#kb20").text("Enter");
    $("#kb28").text("Bksp"); 
    
    $(".keyboardButton").click(async function() {
        await playGame($(this).html().toLowerCase());
    });
});