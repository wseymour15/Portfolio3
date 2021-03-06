var io = require('socket.io').listen(5000);
var i,j;
var b = new Array(8);
var t = 0; 

var mems = new Array(2);
var mv = new Array(2);
var bC = 12;
var rC = 12;
var game;

var curMem;

var memCount = 0;
//array of arrays (2D array)
for(i = 0; i < 8; i++){
    b[i] = new Array(8);
}

for(i=0;i<8;i++){
    for(j=0;j<8;j++){
		var piece = {color:0, king:0, selected:0, posX: j, posY: i};
		if(i < 3 && i != 1 && j % 2 == 0){
			piece.color = 1;
		}
		else if(i < 3 && i == 1 && j % 2 != 0){
			piece.color = 1;
		}
		else if(i > 4 && i != 6 && j % 2 != 0){
			piece.color = 2;
		}
		else if(i > 4 && i == 6 && j % 2 == 0){
			piece.color = 2;
		}
        b[i][j] = piece;
    }
}


//emit the table

io.sockets.on('connection', function(socket) {
	
  socket.on('joinGame', function(content){
	if(memCount < 2){
		console.log("A player joined!");
		mems[memCount] = socket.id;
		console.log(mems[0], mems[1]);
		++memCount;
	}
      if(game == undefined || game.members[1] == undefined){
    console.log("we created a game");
    game = {board: b, turn: 2, members: new Array(2), curMember : mems[0], moves: mv, blackCount: bC, redCount: rC};
    game.members[0] = mems[0];
    game.members[1] = mems[1];
}
  });
	
    socket.on('endGame', function(content){
		game = undefined;
		b = new Array(8);
		for(i = 0; i < 8; i++){
			b[i] = new Array(8);
		}
		mems = new Array(2);
		mv = new Array(2);
		bC = 12;
		rC = 12;
		memCount = 0;
		for(i=0;i<8;i++){
    		for(j=0;j<8;j++){
				var piece = {color:0, king:0, selected:0, posX: j, posY: i};
				if(i < 3 && i != 1 && j % 2 == 0){
					piece.color = 1;
				}
				else if(i < 3 && i == 1 && j % 2 != 0){
					piece.color = 1;
				}
				else if(i > 4 && i != 6 && j % 2 != 0){
					piece.color = 2;
				}
				else if(i > 4 && i == 6 && j % 2 == 0){
					piece.color = 2;
				}
        		b[i][j] = piece;
			}
		}
		io.sockets.emit('server', "Someone Quit");
  	});
	
  socket.on('myEvent', function(content) {
        if(memCount < 2 && mems[0] != socket.id){
		  console.log("A player joined!");
		  mems[memCount] = socket.id;
		  console.log(mems[0], mems[1]);
		  ++memCount;
	   }
      if((mems[1] != undefined) && game == undefined){
        console.log("we created a game");
        game = {board: b, turn: 1, members: new Array(2), curMember : mems[0], moves: mv, blackCount: bC, redCount: rC};
        game.members[0] = mems[0];
        game.members[1] = mems[1];
      }
    console.log(content); 
      if(game != undefined){
        getFirstClick(content, this);
      }
      if(game != undefined && endGame() == 1){
          io.sockets.emit('server', b);
          io.sockets.emit('server', "Black wins");
      }
      else if(game != undefined && endGame() == 2){
          io.sockets.emit('server', b);
          io.sockets.emit('server', "Red wins");
      }
      else{
        io.sockets.emit('server', b);
      }
    //io.to(members[0]).emit('message', 'for your eyes only');
  });
	
});

//Used to move a piece
function swapPiece(){
    game.board[game.moves[0].posY][game.moves[0].posX].selected = 0;
    if(game.moves[1].posY == 7 && game.moves[0].color == 1){
        game.board[game.moves[0].posY][game.moves[0].posX].king = 1;
    }
    else if(game.moves[1].posY == 0 && game.moves[0].color == 2){
        game.board[game.moves[0].posY][game.moves[0].posX].king = 1;
    }
    var tempY =game.board[game.moves[0].posY][game.moves[0].posX].posY;
    var tempX = game.board[game.moves[0].posY][game.moves[0].posX].posX;
    game.board[game.moves[0].posY][game.moves[0].posX].posY = game.moves[1].posY;
	game.board[game.moves[0].posY][game.moves[0].posX].posX = game.moves[1].posX;
    game.board[game.moves[1].posY][game.moves[1].posX].posX = tempX;
    game.board[game.moves[1].posY][game.moves[1].posX].posY = tempY;
    
	var temp1 = game.board[game.moves[0].posY][game.moves[0].posX];
	game.board[game.moves[0].posY][game.moves[0].posX] = game.board[game.moves[1].posY][game.moves[1].posX];
	game.board[game.moves[1].posY][game.moves[1].posX] = temp1;
    if(game.turn == 1){
        game.turn = 2;
        game.curMember = game.members[1];
    }
    else{
        game.turn = 1;
         game.curMember = game.members[0];
    }
	game.moves[0] = undefined;
	game.moves[1] = undefined;
	return;
}

function endGame(){
	if(game.redCount == 0){
        
		//black wins
        return 1;
	}
	else if(game.blackCount == 0){
		//red wins
        return 2;
        
	}
    return 0;
}

    function getFirstClick(piece,socket){
        console.log(game.members[game.turn-1]);
        console.log(game.curMember);
        if(socket.id == game.curMember && piece.color == game.turn ){
            if(game.moves[0] != undefined && game.moves[0] != piece){
                game.board[game.moves[0].posY][game.moves[0].posX].selected = 0;
            }
            game.moves[0] = piece;
            game.board[game.moves[0].posY][game.moves[0].posX].selected = 1;
        }
        else if(socket.id == game.curMember && game.moves[0] != undefined && game.moves[1] == undefined){
			if(kingFirstMoves(piece) == 0){
				getSecondClick(piece);
			}
			//kingFirstMoves(piece);
        }
            return;
    }
    
    function getSecondClick(piece){
        if(game.turn == 1){
            if(piece.color == 0 && game.moves[0].posY + 1 == piece.posY && (game.moves[0].posX - 1 == piece.posX || game.moves[0].posX + 1 == piece.posX)){
                game.moves[1] = piece;
                swapPiece();
            }
            else if(piece.color == 0 && checkJump(piece)==1){
                game.moves[1] = piece;
                swapPiece();
            }
        }
        else{
            if(piece.color == 0 && game.moves[0].posY - 1 == piece.posY && (game.moves[0].posX - 1 == piece.posX || game.moves[0].posX + 1 == piece.posX)){
                game.moves[1] = piece;
                swapPiece();
            }
            else if(piece.color == 0 && checkJump(piece) == 1){
                game.moves[1] = piece;
                swapPiece();
            }
        }
        
        return;
    }
    
    function checkJump(piece){
        first = game.moves[0];
        if(game.turn == 1){
            if(first.posY+2 == piece.posY && first.posX-2 == piece.posX && game.board[first.posY+1][first.posX-1].color == 2){
                game.board[first.posY+1][first.posX-1].color = 0;
                game.redCount--;
                return 1;
            }
            else if (first.posY+2 == piece.posY && first.posX+2 == piece.posX && game.board[first.posY+1][first.posX+1].color == 2){
                game.board[first.posY+1][first.posX+1].color = 0;
                game.redCount--;
                return 1;
            }
        }
        else{
            if(first.posY-2 == piece.posY && first.posX-2 == piece.posX && game.board[first.posY-1][first.posX-1].color == 1){
                game.board[first.posY-1][first.posX-1].color = 0;
                game.blackCount--;
                return 1;
            }
            else if (first.posY-2 == piece.posY && first.posX+2 == piece.posX && game.board[first.posY-1][first.posX+1].color == 1
                    ){
                game.board[first.posY-1][first.posX+1].color = 0;
                game.blackCount--;
                return 1;
            }
        }
        return 0;
    }

function kingFirstMoves(piece){
	var flag = 0;
	if(game.board[game.moves[0].posY][game.moves[0].posX].king == 1){
	if(game.turn == 2){
       if(piece.color == 0 && game.moves[0].posY + 1 == piece.posY && (game.moves[0].posX - 1 == piece.posX || game.moves[0].posX + 1 == piece.posX)){
                game.moves[1] = piece;
                swapPiece();
		   	flag = 1;
            }
            else if(piece.color == 0 && kingJump(piece)==1){
                game.moves[1] = piece;
                swapPiece();
				flag = 1;
            }
        }
        else{
            if(piece.color == 0 && game.moves[0].posY - 1 == piece.posY && (game.moves[0].posX - 1 == piece.posX || game.moves[0].posX + 1 == piece.posX)){
                game.moves[1] = piece;
                swapPiece();
				flag = 1;
            }
            else if(piece.color == 0 && kingJump(piece) == 1){
                game.moves[1] = piece;
                swapPiece();
				flag = 1;
            }
        }
	}
	return flag;
	
}

function kingJump(piece){
		first = game.moves[0];
        if(game.turn == 2){
            if(first.posY+2 == piece.posY && first.posX-2 == piece.posX && game.board[first.posY+1][first.posX-1].color == 1){
                game.board[first.posY+1][first.posX-1].color = 0;
                game.blackCount--;
                return 1;
            }
            else if (first.posY+2 == piece.posY && first.posX+2 == piece.posX && game.board[first.posY+1][first.posX+1].color == 1){
                game.board[first.posY+1][first.posX+1].color = 0;
                game.blackCount--;
                return 1;
            }
        }
        else{
            if(first.posY-2 == piece.posY && first.posX-2 == piece.posX && game.board[first.posY-1][first.posX-1].color == 2){
                game.board[first.posY-1][first.posX-1].color = 0;
                game.redCount--;
                return 1;
            }
            else if (first.posY-2 == piece.posY && first.posX+2 == piece.posX && game.board[first.posY-1][first.posX+1].color == 2
                    ){
                game.board[first.posY-1][first.posX+1].color = 0;
                game.redCount--;
                return 1;
            }
        }
	
        return 0;
		
		
	
}