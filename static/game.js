var socket = io();
var clientId;
var insX;
var insY;
var xNowi;
var yNowi;

socket.on('message', function(data) {
  console.log(data);
});
socket.on('name', function(data) {
  // data is a parameter containing whatever data was sent
});
socket.on('connect', function(){
	cId = socket.id;
	console.log('client id: ' + cId);
});
var userName = prompt("enter a username");
var tick = 0;
var tickSize = 0;
var movement = {
  up: false,
  down: false,
  left: false,
  right: false
}
document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});
//var mousex = event.clientX;
//var mousey = event.clientY; 
socket.emit('new player', userName);
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);
//----------------viewport----------------------

//----------------------------------------------
var wW = window.innerWidth;
var wH = window.innerHeight;
var cW = wW*(3/4);
var cH = wH*(3/4);
var xCoe = cW/800;
var yCoe = cH/600;
var avgCoe = (xCoe + yCoe)/2;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.canvas.width = 800*xCoe;
ctx.canvas.height = 600*yCoe;
socket.on('state', function(players) {
  ctx.clearRect(0, 0, 800*xCoe, 600*yCoe);
console.log('tick');
	tick++;
  for (var id in players) {
  	ctx.fillStyle = 'green';
    var player = players[id];
    var radius = player.r;
    if(radius > 1){
    ctx.beginPath();
    ctx.arc(player.x*xCoe, player.y*yCoe, radius*avgCoe, 0, 2 * Math.PI);
    ctx.fill(); 
    ctx.fillStyle = 'white';
    ctx.font="10px Verdana";
    ctx.fillText(player.uName,player.x*xCoe - 16,player.y*yCoe - 3);
    ctx.fillText(radius,player.x*xCoe - 8,player.y*yCoe + 8);
    ctx.closePath();
    if(player.id == cId){
    	xNowi = player.x;
  		yNowi  = player.y;
  	}

    }


  }


});
socket.on('shotLoc', function(shots) {
	for(var scan in shots){
		ctx.beginPath();
  	ctx.arc(shots[scan].shotX*xCoe, shots[scan].shotY*yCoe, 10*avgCoe, 0, 2 * Math.PI); 
  	ctx.stroke();
  	ctx.fill();
  }
  ctx.closePath();
});
socket.on('sendPlayers', function(players) {

});
document.addEventListener('mousedown', function(event) {
	getCursorPosition(canvas,event);

});
function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    insX = x/xCoe;
    insY = y/yCoe;
    console.log("x: " + insX + " y: " + insY);

    if(tick > 5){
    socket.emit('shot fired', insX, insY, xNowi, yNowi, cId);
    tick = 0;
	}	
}




