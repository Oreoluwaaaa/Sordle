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
            $(`div.row#${row} > div#${j}.cell`).css("background", "green");
            correctInput++;
        }
        else if(answer.includes(input[j])){
            $(`div.row#${row} > div#${j}.cell`).css("background", "yellow");
        }
        else{
            $(`div.row#${row} > div#${j}.cell`).css("background", "black");
        }
    }
    return correctInput === 7 ? true: false;
}

$( document ).ready(function() {
    for(i = 0; i < 7; i++){
        $("#table").append(`<div class='row' id=${i}></div>`);
    }
    
    $(".row").each((index, element) => {
        for(i = 0; i < 7; i++){
            $(element).append(`<div class='cell' id=${i}></div>`);
        }    
    });
    let answer = "prayers";
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