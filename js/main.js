const DEBUG = true;

function debug(obj){
    if(DEBUG){
        console.info(obj);
    }
}

var gameId = 0;

document.getElementById("startGameButton").addEventListener("click", startGame);
document.getElementById("stopGameButton").addEventListener("click", stopGame);

function startGame(){
    gameId = setInterval(game.render.bind(game),100);
}

function stopGame(){
    clearInterval(gameId);
}

debug("Up and Running!");


const BLOCKVALUES = "abcde".split("");

function createRandomNumberFromZeroTo(upto){
    return Math.floor(Math.random()*10000)%upto;
}

function createRandomBlockValue(){
    return BLOCKVALUES[createRandomNumberFromZeroTo(5)];
}

const STARTPOINT = {x: 4, y:0};

var game = {
    init: function () {
        // prepare Engine
        this.gameState = {
            gameBoard: {
                data: ((height, width) => "0".repeat(width).split("").map(x=>"0".repeat(height).split("")))(15, 9),
                size: {
                    height: 15,
                    width: 9
                }
            }
        };

        this.currentGame = {
            isActive: true,
            score: 0,
            elapsedTime: 0,
            destroyedBlocks: 0 
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
    clearValueOnGameBoard: function(position){
        this.setValueOnGameBoard(position, "0");
    },
    setValueOnGameBoard: function(position, value){
        this.gameState.gameBoard.data[position.x][position.y] = value;
    },
    setNewBlockOnGameBoard: function(position){
        this.setValueOnGameBoard(position, this.gameState.newBlock.value);
    },
    advanceOneStep: function () {
       if(this.willCollide(2)){
            // calculate Score

             this.setValueOnGameBoard(this.gameState.newBlock.position, this.gameState.newBlock.value);

             this.calculateBlock();

            if(!this.isGameEnded(STARTPOINT)){
                this.createNewBlock();
            }else{
                debug("DONE");
                clearInterval(1);
            }
       }
       else{
            this.moveDown();
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

         for(var r = right + 1 ; r < this.gameState.gameBoard.size.width ; r++){
            if(this.gameState.gameBoard.data[r][this.gameState.newBlock.position.y] === value){
                this.clearValueOnGameBoard({x: r, y: this.gameState.newBlock.position.y});
                explode = true;
                this.currentGame.score++;
            }else{
                break;
            }
        }

        for(var b = bottom + 1 ; b < this.gameState.gameBoard.size.height ; b++){
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

    }, 
    willCollide: function (direction) {
        var position = this.gameState.newBlock.position; 
        
        switch (direction) {
            case 1:
                if(this.gameState.newBlock.position.x + 1 > 8){
                    return true;
                }
                return this.gameState.gameBoard.data[position.x + 1][position.y] != "0";
                break;
            case 2:
                if (this.gameState.newBlock.position.y >= this.gameState.gameBoard.size.height){
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
        game.advanceOneStep();
        helperDrawer(this.gameState.gameBoard.data);
        debug("Score: " + this.currentGame.score);
    },
    moveDown: function(){
        if(!this.willCollide(2)){
            this.clearValueOnGameBoard(this.gameState.newBlock.position);
            this.gameState.newBlock.position.y++;
            this.setNewBlockOnGameBoard(this.gameState.newBlock.position);
       }
    },
    moveLeft: function(){
        if(!this.willCollide(3)){
            this.clearValueOnGameBoard(this.gameState.newBlock.position);
            this.gameState.newBlock.position.x--;
            this.setNewBlockOnGameBoard(this.gameState.newBlock.position);
        }
    },
    moveRight: function(){
        if(!this.willCollide(1)){
            this.clearValueOnGameBoard(this.gameState.newBlock.position);
            this.gameState.newBlock.position.x++;
            this.setNewBlockOnGameBoard(this.gameState.newBlock.position);
        }
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

    for(var i = 0; i < 15;i++){
        var row = "<tr>";
        for(var j=0;j < 9; j++){
            row += "<td class='" + ((arr[j][i]) === "0"? "":"block")+ "'>" + (arr[j][i]).replace(/0/gi, "&nbsp;") + "</td>";
        }
        tab += row + "</tr>";
    }
    tab += "</table>";

    document.getElementById("result").innerHTML = tab;
}

game.init();

//setInterval(game.render.bind(game),33);

window.addEventListener("keydown", game.keyEvent);