var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var shortid = require('shortid');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set('port', 80);
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(80, function() {
  console.log('Starting server on port 80');
});
setInterval(function() {
}, 1000);
var players = {};
var shots = {};
io.on('connection', function(socket) {
	console.log('server player id: ' + socket.id);
  socket.on('new player', function(name) {
    players[socket.id] = {
      x: 400,
      y: 300,
      uName : name,
      id : socket.id,
      r : 18

    };
  });
  socket.on('increase size', function() {
    players[socket.id].r += 2;
  });
  socket.on('shot fired', function(xG,yG,sX,sY,owner){
  	shotId = shortid.generate();
  	var moveX = xG - sX;
  	var moveY = yG - sY;
  	if(moveX/moveY < 1 && moveX/moveY > -1){
  		var sVelX = Math.abs((moveX/moveY)*5);
  		var sVelY = 5;
  	}
  	else{
  		var sVelY = Math.abs((moveY/moveX)*5);
  		var sVelX = 5;
  	}
  	if(moveX < 1){
  		sVelX = -sVelX;
  	}
  	if(moveY < 1){
  		sVelY = -sVelY;
  	}
  	shots[shotId] = {
  		id : shotId,
  		shotX : sX,
  		shotY : sY,
  		xS : sVelX,
  		yS : sVelY,
  		cr : owner
  	};
  	console.log(shots[shotId].id);
  });

  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
  });

  socket.on('disconnect', function() {
    	delete players[socket.id];
  });
});
setInterval(function() {
  io.sockets.emit('state', players);
  io.sockets.emit('shotLoc', shots);
  io.sockets.emit('sendPlayers', players);
  for(var scan in shots){
  	shots[scan].shotX += shots[scan].xS;
  	shots[scan].shotY += shots[scan].yS;
  	for(var id in players){
  		if(shots[scan].shotX > (players[id].x - players[id].r) && shots[scan].shotX < (players[id].x + players[id].r) && shots[scan].shotY > (players[id].y - players[id].r) && shots[scan].shotY < (players[id].y + players[id].r) && players[id].id != shots[scan].cr){
  			players[id].r -= 2;
  			var hit = true;
  			break;
  		}
  		else{
  			var hit = false;
  		}
  	}
  	if(shots[scan].shotX > 800 || shots[scan].shotY > 600 || shots[scan].shotX < 0 || shots[scan].shotY < 0 || hit){
  		delete shots[scan];
  }
  }
}, 1000 / 60);
