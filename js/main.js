const DEBUG = true;

function debug(obj){
    if(DEBUG){
        console.info(obj);
    }
}

var gameId = 0;

document.getElementById("startGameButton").addEventListener("click", startGame);
document.getElementById("stopGameButton").addEventListener("click", stopGame);
document.getElementById("clearGameButton").addEventListener("click", clearGame);

function startGame(){
    game.running = true;
    setTimeout(game.startGameLoop, STARTFRAMESPEED);
}

function stopGame(){
    game.running = false;
}

function clearGame(){
    game.clearWholeGameBoard();
}

debug("Up and Running!");


const BLOCKVALUES = "abcde".split("");

function createRandomNumberFromZeroTo(upto){
    return Math.floor(Math.random()*10000)%upto;
}

function createRandomBlockValue(){
    return BLOCKVALUES[createRandomNumberFromZeroTo(5)];
}

function initializeMatrix(height, width){
    return ((h, w) => "0".repeat(w).split("").map(x=>"0".repeat(h).split("")))(height, width);
}



const STARTPOINT = {x: 2, y:0};
const STARTFRAMESPEED = 900;

var game = {
    init: function (renderengine) {
        // prepare Engine
        this.gameState = {
            gameBoard: {
                data: initializeMatrix(10, 5)
            },
            renderer:renderengine
        };

        this.currentGame = {
            isActive: true,
            score: 0,
            level: 0
        };

        this.createNewBlock();
    },
    createNewBlock: function () {
        var newPosition = {x:STARTPOINT.x, y:STARTPOINT.y};
         this.gameState.newBlock = {
            position: newPosition,
            value: createRandomBlockValue()
        };
        this.setNewBlockOnGameBoard(newPosition);
    },
    isGameEnded: function(position){
        debug("isGameEnded " +  (this.gameState.gameBoard.data[position.x][position.y] != "0"));
        return this.gameState.gameBoard.data[position.x][position.y] != "0";
    },
    clearWholeGameBoard: function(){
        delete this.gameState.gameBoard.data; 
        this.gameState.gameBoard.data = initializeMatrix(10, 5);
    },
    clearValueOnGameBoard: function(position){
        this.setValueOnGameBoard(position, "0");
    },
    setValueOnGameBoard: function(position, value){
        this.gameState.gameBoard.data[position.x][position.y] = value;
    },
    setNewBlockOnGameBoard: function(position){
        this.setValueOnGameBoard(position, this.gameState.newBlock.value);
    },
    updateLevel: function(){
        if(this.currentGame.score%10===0){
            this.currentGame.level = this.currentGame.score/10;
        }
    },
    calculateBlock: function() {
        var left = this.gameState.newBlock.position.x;
        var right = this.gameState.newBlock.position.x;
        var bottom = this.gameState.newBlock.position.y;
        var value = this.gameState.newBlock.value;
        var explode = false;

        for(var l = left-1 ; l >= 0 ; l--){
            if(this.gameState.gameBoard.data[l][this.gameState.newBlock.position.y] === value){
                 this.clearValueOnGameBoard({x: l, y: this.gameState.newBlock.position.y});
                 explode = true;
                 this.currentGame.score++;
            }else{
                break;
            }
        }

         for(var r = right + 1 ; r < this.gameState.gameBoard.data.length ; r++){
            if(this.gameState.gameBoard.data[r][this.gameState.newBlock.position.y] === value){
                this.clearValueOnGameBoard({x: r, y: this.gameState.newBlock.position.y});
                explode = true;
                this.currentGame.score++;
            }else{
                break;
            }
        }

        for(var b = bottom + 1 ; b < this.gameState.gameBoard.data[0].length ; b++){
            if(this.gameState.gameBoard.data[this.gameState.newBlock.position.x][b] === value){
                 this.clearValueOnGameBoard({x: this.gameState.newBlock.position.x, y: b});
                 explode = true;
                 this.currentGame.score++;
            }else{
                break;
            }
        }

        if(explode === true){
            this.clearValueOnGameBoard(this.gameState.newBlock.position);
            this.currentGame.score++;
            debug("BOOM");
        }
        this.updateLevel();
    }, 
    willCollide: function (direction) {
        var position = this.gameState.newBlock.position; 
        
        switch (direction) {
            case 1:
                if(this.gameState.newBlock.position.x + 1 > 4){
                    return true;
                }
                return this.gameState.gameBoard.data[position.x + 1][position.y] != "0";
                break;
            case 2:
                if (this.gameState.newBlock.position.y >= this.gameState.gameBoard.data[0].length){
                    return true;
                }
                return (this.gameState.gameBoard.data[position.x][position.y +1] != "0");
                break;
            case 3:         
                if(this.gameState.newBlock.position.x - 1 < 0){
                    return true;
                }
                return this.gameState.gameBoard.data[position.x - 1][position.y] != "0";
                break;
            default:
                throw new Error("Not Implemented!");
                break;
        }


    },
    render: function(){
        window.requestAnimationFrame(function (){
            game.gameState.renderer(game.gameState.gameBoard.data);
        });
    },
    startGameLoop: function(){
        if(game.running){
            game.moveDown();
            setTimeout(game.startGameLoop, STARTFRAMESPEED - game.currentGame.level*100);
        }
    },
    moveDown: function(){
        if(!this.willCollide(2)){
            this.clearValueOnGameBoard(this.gameState.newBlock.position);
            this.gameState.newBlock.position.y++;
            this.setNewBlockOnGameBoard(this.gameState.newBlock.position);
       } else {
            // calculate Score

             this.setValueOnGameBoard(this.gameState.newBlock.position, this.gameState.newBlock.value);

             this.calculateBlock();

            if(!this.isGameEnded(STARTPOINT)){
                this.createNewBlock();
            }else{
                debug("DONE");
                this.running = false;
            }
       }
       game.render();
    },
    moveLeft: function(){
        if(!this.willCollide(3)){
            this.clearValueOnGameBoard(this.gameState.newBlock.position);
            this.gameState.newBlock.position.x--;
            this.setNewBlockOnGameBoard(this.gameState.newBlock.position);
        }
        game.render();
    },
    moveRight: function(){
        if(!this.willCollide(1)){
            this.clearValueOnGameBoard(this.gameState.newBlock.position);
            this.gameState.newBlock.position.x++;
            this.setNewBlockOnGameBoard(this.gameState.newBlock.position);
        }
        game.render();
    },
    keyEvent: function(e){
        debug(e.keyCode);
       switch (e.keyCode) {
           case 37:
           case 65:
               game.moveLeft();
               break;
            case 39:
            case 68:
               game.moveRight();
               break;
            case 40:
            case 83:
                game.moveDown();
           default:
               break;
       }
    }

};

function helperDrawer(arr) {
    var tab = "<table>";

    for(var i = 0; i < 10;i++){
        var row = "<tr>";
        for(var j=0;j < 5; j++){
            row += "<td class='" + ((arr[j][i]) === "0"? "":"block")+ "'>" + (arr[j][i]).replace(/0/gi, "&nbsp;") + "</td>";
        }
        tab += row + "</tr>";
    }
    tab += "</table>";

    document.getElementById("result").innerHTML = tab;
    document.getElementById("scoreBoard").innerHTML = game.currentGame.score;
}

game.init(helperDrawer);

window.addEventListener("keydown", game.keyEvent);

var testMe = 0;
var start = (new Date).getTime();
function it(){
    console.info(arguments);
    console.info((new Date).getTime()-start);
    if(testMe===0){
        window.requestAnimationFrame(it);
    }
    testMe++;
}


window.requestAnimationFrame(it);

