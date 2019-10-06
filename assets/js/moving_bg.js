var bg = [80, 20, 155]
var bg2 = [35, 5, 92]
var bgDone = [60, 30, 100]
var bg2Done = [50, 25, 10]

var time = 4000

function switchRGB(){
  var placeholder = bg2
  bg2 = bg
  bg = placeholder

  placeholder = bg2Done
  bg2Done = bgDone
  bgDone = placeholder
}

function calculateRGB(start, target, step, steps){
  return [
    start[0]+((parseFloat(target[0] - start[0]) / steps) * step),
    start[1]+((parseFloat(target[1] - start[1]) / steps) * step),
    start[2]+((parseFloat(target[2] - start[2]) / steps) * step)
  ]
}

function setRGB(rgb, rgb2){
  var backgroundColor = "linear-gradient(65deg, rgb("+rgb.join(", ")+"), rgb("+rgb2.join(", ")+")) repeat scroll 0% 0%"
  $(".moving-bg")[0].style.background = backgroundColor
  $(".moving-bg")[1].style.background = backgroundColor
}

function cycle(){
  var i = 0
  var interval = setInterval(function(){
    
    var newRGB = calculateRGB(bg, bg2, i, 400)
    var newRGB2 = calculateRGB(bgDone, bg2Done, i, 400)
    
    setRGB(newRGB, newRGB2)
    
    if(i == 400){
      clearInterval(interval)
      switchRGB()
      cycle()
    } else {
      i++
    }
  }, 10)
}

cycle()