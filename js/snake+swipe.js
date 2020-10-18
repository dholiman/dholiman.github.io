window.addEventListener('load', function(){
    var touchsurface = document.getElementById('canvas'),
        startX,
        startY,
        distX,
        distY,
        threshold = 150, //required min distance traveled to be considered swipe
        allowedTime = 250, // maximum time allowed to travel that distance
        elapsedTime,
        startTime
 
    touchsurface.addEventListener('touchstart', function(e){
        touchsurface.innerHTML = ''
        var touchobj = e.changedTouches[0]
        distX, distY = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface
        e.preventDefault()
    }, false)
 
    touchsurface.addEventListener('touchmove', function(e){
        e.preventDefault() // prevent scrolling when inside DIV
    }, false)
 
    touchsurface.addEventListener('touchend', function(e){
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get total dist traveled by finger while in contact with surface horizontal
        distY = touchobj.pageY - startY // get total dist traveled by finger while in contact with surface vertical
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        // check that elapsed time is within specified, horizontal dist traveled >= threshold, and vertical dist traveled <= 100
        var swiperightBol = (elapsedTime <= allowedTime && distX >= threshold && Math.abs(touchobj.pageY - startY) <= 100)
        var swipeleftBol = (elapsedTime <= allowedTime && distX <= -threshold && Math.abs(touchobj.pageY - startY) <= 100)
        
        var swipeupBol = (elapsedTime <= allowedTime && distY <= -threshold && Math.abs(touchobj.pageX - startX) <= 100)
        var swipedownBol = (elapsedTime <= allowedTime && distY >= threshold && Math.abs(touchobj.pageX - startX) <= 100)
        
        if (swipeupBol) {
          changeDirection(87)
        } else if (swipedownBol) {
          changeDirection(83)
        } else if (swipeleftBol) {
          changeDirection(65)
        } else if (swiperightBol) {
          changeDirection(68)
        }
        
        
        e.preventDefault()
    }, false)
 
}, false) // end window.onload