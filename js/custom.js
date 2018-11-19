//put all the images you load into this array
var images = ['../img/previews/coldbrew-preview.jpg', '../img/previews/kcr-poster.jpg', '../img/previews/record-preview.jpg', '../img/previews/card-preview.jpg', '../img/previews/journal-preview.jpg', '../img/previews/infographic-preview.jpg', '../img/previews/tiny-book-preview.jpg', '../img/previews/dance-poster-preview.jpg', '../img/previews/type-specimen-preview.jpg', '../img/colored/colored-coldbrew-preview.jpg', '../img/colored/colored-kcr-poster-preview.jpg', '../img/colored/colored-record-preview.jpg', '../img/colored/colored-card-preview.jpg', '../img/colored/colored-journal-preview.jpg', '../img/colored/colored-infographic-preview.jpg', '../img/colored/colored-tiny-book-preview.jpg', '../img/colored/colored-dance-poster-preview.jpg', '../img/colored/colored-type-specimen-preview.jpg'] //add more

images.forEach(function(src, idx) {
var i = new Image()
i.src = src;
})// your custom javascript goes here

