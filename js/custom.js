//put all the images you load into this array
var images = ['../img/previews/coldbrew-preview.jpg', '../img/previews/kcr-poster.jpg', '../img/previews/record-preview.jpg', '../img/previews/card-preview.jpg', '../img/previews/journal-preview.jpg', '../img/previews/infographic-preview.jpg', '../img/previews/tiny-book-preview.jpg', '../img/previews/dance-poster-preview.jpg', '../img/previews/type-specimen-preview.jpg', '../img/colored/colored-coldbrew-preview.jpg', '../img/colored/colored-kcr-poster-preview.jpg', '../img/colored/colored-record-preview.jpg', '../img/colored/colored-card-preview.jpg', '../img/colored/colored-journal-preview.jpg', '../img/colored/colored-infographic-preview.jpg', '../img/colored/colored-tiny-book-preview.jpg', '../img/colored/colored-dance-poster-preview.jpg', '../img/colored/colored-type-specimen-preview.jpg'] //add more

images.forEach(function(src, idx) {
var i = new Image()
i.src = src;
});

var newPos = $("#slides").position();
console.log(position);

if (screen.width < 1024){
    $(".left").click(function() {
        $("#slides").animate({
            "marginLeft" : "+=20.01vw"
        });
    });

    $(".right").click(function() {
        $("#slides").animate({
            "marginLeft" : "-=20.01vw"
        });
    });
};
if (screen.width > 1024){
    $(".left").click(function() {
        $("#slides").animate({
            "marginLeft" : "+=213.33"
        });
    });

    $(".right").click(function() {
        $("#slides").animate({
            "marginLeft" : "-=213.33"
        });
    });
};


var position = $("#slides").position().left;
console.log(position);

$("#slides img").click(function(){
    var source = $(this).attr("src");
    $("#current img").attr("src", source);
});

