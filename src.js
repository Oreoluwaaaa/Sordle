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
    answer = answer.split("");
    let changedIndices = new Set();

    for(let j = 0; j < 7; j++){
        if(input[j] === answer[j]){
            $(`div.row#${row} > div#${j}.cell`).css("background", "green").css("transition", "all 5.0s ease");
            answer[j] = "-";
            changedIndices.add(j);
            correctInput++;
        }
    }
    for(let j = 0; j < 7; j++){    
        if(answer.includes(input[j]) && !(changedIndices.has(j))){
            $(`div.row#${row} > div#${j}.cell`).css("background", "orange").css("transition", "all 5.0s ease");
            changedIndices.add(j);
            answer[answer.indexOf(input[j])] = "-";
        }
    }
    for(let j = 0; j < 7; j++){
        if(!(changedIndices.has(j))){
            $(`div.row#${row} > div#${j}.cell`).css("background", "black").css("transition", "all 5.0s ease");
        }
    }
    return correctInput === 7 ? true: false;
}

async function getRandomWord(){
    let word = "";
    await fetch('./words.txt')
    .then(response => response.text())
    .then(data => {
        data = data.split("\r\n");
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
    console.log(answer)
    let input = ""; 
    let row = 0;
    
    $(document).keyup(async function(event) {
        keypressed = event.originalEvent.key;
        if (!/[^a-z$]/.test(keypressed) && row < 7){
            input += (input.length < 7) ? event.originalEvent.key : "";
            insert(row, input);
        }
        else if (keypressed == "Backspace"){
            input = input.substring(0, input.length-1);
            insert(row, input);
        }
        else if ((keypressed == "Enter") && (input.length === 7)){
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
                            alert(`You're out of tries. The word ${answer}`);
                        }, "1750")
                    }
                }
            }
            else{
                alert("invalid word");
            }
        }
    });
});