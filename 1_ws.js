//---------------------------------------------------------------
// The purpose is to introduce you to websockets
// This is a SERVER that is SEPARATE from the http server.
//
// Your webpage (in this case the index.html in this directory)
// will be SERVED by the http server. THEN, it will connect to the 
// websocket server. Then - they will talk to each other!
//
// Note that in regular http - the server cannot initiate a conversation
// Here, the websocket server sends a message to the client browser.
//
// This example has THREE parts
// 1) The http server code (which is same as what we did earlier)
// 2) This code - this is the web socket server
// It prints what it got from client. It also sends a message to the
// client after every 1 second.
// 3) The html or client code. Note how it connects to the websocket
// and how it sends and receives messages
//
// To RUN THIS EXAMPLE
// First, run node httpServer.js on one terminal
// Next, run node 1_ws.js on another terminal
// Next, type localhost:4000/index.html on some browser
//
//---------------------------------------------------------------
var io = require('socket.io').listen(5000);
var i,j;
var board = new Array(8);
var members = new Array(2);
var memCount = 0;
//array of arrays (2D array)
for(i = 0; i<8; i++){
    board[i] = new Array(8);
}
var count = 0;
//need double for loop to fill each position with a checker piece object
for(i=0;i<8;i++){
    for(j=0;j<8;j++){
		
		var piece = {color:0, king:0};
		if(i < 3 && j%2 == 0){
			piece.color = 1;
		}
		else if(i > 4 && j%2 != 0){
			piece.color = 2;
		}
        board[i][j] = piece;
        count++;
    }
}

//emit the table

io.sockets.on('connection', function(socket) {
	
  socket.on('joinGame', function(content){
	if(memCount < 2){
		console.log("A player joined!");
		members[memCount] = socket.id;
		console.log(socket.id);
		console.log(members[0], members[1]);
		++memCount;
	}		
  });
	
  socket.on('myEvent', function(content) {
    console.log(content); 
    io.sockets.emit('server', "This is the server: got your message");
          io.sockets.emit('server', board);
    io.to(members[0]).emit('message', 'for your eyes only');
  });
	
});
