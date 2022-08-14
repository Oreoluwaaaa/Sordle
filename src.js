function insert(row, input){
    input.split("").forEach((char, cell) => {
        $(`div.row#${row} > div#${cell}.cell`).text(char.toUpperCase());
    });
    for(let i = input.length; i < 7; i++){
        $(`div.row#${row} > div#${i}.cell`).text("");
    }
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

    let input = ""; 
    let row = 0;
    $(document).keyup(function(event) {
        keypressed = event.originalEvent.key;
        
        if (!/[^a-z$]/.test(keypressed)){
            input += (input.length < 7) ? event.originalEvent.key : "";
            console.log(input);
            insert(row, input);
        }

        else if (keypressed == "Backspace"){
            input = input.substring(0, input.length-1);
            insert(row, input);
        }

        else if (keypressed == "Enter"){
            console.log("pressed enter");
        }

        else{
            console.log("Wrong");
        }
    });
});