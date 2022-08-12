$( document ).ready(function() {
    for(i = 0; i < 7; i++){
        $("#table").append("<div class='row'></div>");
    }
    
    var row = $(".row");
    
    row.each((index, element) => {
        for(i = 0; i < 7; i++){
            $(element).append("<div class='column'></div>");
        }    
    });
});