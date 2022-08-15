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
    correctInput = 0;
    for(let j = 0; j < 7; j++){
        if(input[j] === answer[j]){
            $(`div.row#${row} > div#${j}.cell`).css("background", "green").css("transition", "all 5.0s ease");
            correctInput++;
        }
        else if(answer.includes(input[j])){
            $(`div.row#${row} > div#${j}.cell`).css("background", "orange").css("transition", "all 5.0s ease");
        }
        else{
            $(`div.row#${row} > div#${j}.cell`).css("background", "black").css("transition", "all 5.0s ease");
        }
    }
    return correctInput === 7 ? true: false;
}

async function getRandomWord(){
    let word = "";
    try {
        await $.get(`https://random-word-api.herokuapp.com/word?length=7`, function(data) {
            word = data[0];
        });
    }
    catch(error){
        console.log("error in fetching word");
    }
    return word;
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
    $(document).keyup(function(event) {
        keypressed = event.originalEvent.key;
        console.log(keypressed)
        if (!/[^a-z$]/.test(keypressed) && row < 7){
            input += (input.length < 7) ? event.originalEvent.key : "";
            console.log(input);
            insert(row, input);
        }
        else if (keypressed == "Backspace"){
            input = input.substring(0, input.length-1);
            insert(row, input);
        }
        else if ((keypressed == "Enter") && (input.length === 7)){
            inDictionary(input).then(result => {
                if(result){
                    checkInput(input, answer, row);
                    row++;
                    input =  "";    
                }
            })
        }
    });
});