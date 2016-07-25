"using strict";
(function(usecanvas){
    const DEBUG = true;
    function debug (obj) {
        if(DEBUG){
            console.info(obj);
        }
    };

    debug("Up and running!");

    const BLOCKVALUES = "abcde".split("");
    const STARTPOINT = {x: 2, y: 0};
    const STARTFRAMESPEED = 400;
    const SPEEDDECREASERATIO = 10;
    const MINFRAMERATE = 40;
    const EMPTHYBLOCK = "0";

    const DOWN = 2;
    const RIGHT = 1;
    const LEFT = 3;

    var gameHelper = {
        createRandomNumberFromZeroTo: function (upto){
            return Math.floor(Math.random()*10000)%upto;
        },
        createRandomBlockValue: function (){
            return BLOCKVALUES[gameHelper.createRandomNumberFromZeroTo(5)];
        },
        initializeMatrix:function (height, width){
            return ((h, w) => EMPTHYBLOCK.repeat(w).split("").map(x=>EMPTHYBLOCK.repeat(h).split("")))(height, width);
        }
    };

    var game = {
        init: function (renderengine) {
            this.gameBoardData = gameHelper.initializeMatrix(10, 5);
            this.renderer = renderengine;
            this.running = false;
            this.initializeCurrentGame();
            this.render();
        },
        initializeCurrentGame: function(){
            this.currentGame = {
                score: 0,
                level: 1
            };
        },
        createNewBlock: function () {
            this.newBlock = {
                position: {x: STARTPOINT.x, y: STARTPOINT.y },
                value: gameHelper.createRandomBlockValue()
            };
            this.setValueOnGameBoard(this.newBlock.position, this.newBlock.value);
        },
        isGameEnded: function(){
            return this.gameBoardData[STARTPOINT.x][STARTPOINT.y] != EMPTHYBLOCK;
        },
        resetGame: function(){ 
            game.running = false;
            game.gameBoardData = gameHelper.initializeMatrix(10, 5);
            game.initializeCurrentGame();
            delete game.newBlock;
            game.render();
        },
        clearValueOnGameBoard: function(position){
            this.setValueOnGameBoard(position, EMPTHYBLOCK);
        },
        setValueOnGameBoard: function(position, value){
            this.gameBoardData[position.x][position.y] = value;
        },
        updateLevel: function(){
            if(this.currentGame.score%5===0){
                this.currentGame.level = this.currentGame.score/5;
            }
        },
        removeBlocks: function() {
            var left = this.newBlock.position.x;
            var right = this.newBlock.position.x;
            var bottom = this.newBlock.position.y;
            var value = this.newBlock.value;
            var explode = false;

            for(var l = left-1 ; l >= 0 ; l--){
                if(this.gameBoardData[l][this.newBlock.position.y] === value){
                    this.clearValueOnGameBoard({x: l, y: this.newBlock.position.y});
                    explode = true;
                    this.currentGame.score++;
                }else{
                    break;
                }
            }

            for(var r = right + 1 ; r < this.gameBoardData.length ; r++){
                if(this.gameBoardData[r][this.newBlock.position.y] === value){
                    this.clearValueOnGameBoard({x: r, y: this.newBlock.position.y});
                    explode = true;
                    this.currentGame.score++;
                }else{
                    break;
                }
            }

            for(var b = bottom + 1 ; b < this.gameBoardData[0].length ; b++){
                if(this.gameBoardData[this.newBlock.position.x][b] === value){
                    this.clearValueOnGameBoard({x: this.newBlock.position.x, y: b});
                    explode = true;
                    this.currentGame.score++;
                }else{
                    break;
                }
            }

            if(explode === true){
                this.clearValueOnGameBoard(this.newBlock.position);
                this.currentGame.score++;
            }
            this.updateLevel();
        }, 
        willCollide: function (direction) {
            var position = this.newBlock.position; 
            var willCollide = false;
            switch (direction) {
                case RIGHT:
                    willCollide =  (position.x + 1 >= this.gameBoardData.length)
                                || (this.gameBoardData[position.x + 1][position.y] != EMPTHYBLOCK);
                    break;
                case DOWN:
                    willCollide =  (position.y >= this.gameBoardData[0].length)
                                || (this.gameBoardData[position.x][position.y +1] != EMPTHYBLOCK);
                    break;
                case LEFT:         
                    willCollide =  (position.x - 1 < 0)
                                || (this.gameBoardData[position.x - 1][position.y] != EMPTHYBLOCK);
                    break;
                default:
                    throw new Error("Not Implemented!");
            }
            return willCollide;
        },
        render: function(){
            window.requestAnimationFrame(function (){
                game.renderer(game.gameBoardData);
            });
        },
        startGameLoop: function(){
            if(!game.running){
                game.running = true;
                if(!game.newBlock){
                    game.createNewBlock();
                }
                game.render();
                game.gameLoop();
            }
        },
        stopGameLoop: function(){
            game.running = false;
        },
        gameLoop: function(){
            if(game.running){
                game.moveDown();
                setTimeout(game.gameLoop, game.getGameLoopSpeed());
            }
        },
        getGameLoopSpeed: function () {
            return Math.max(STARTFRAMESPEED - this.currentGame.level * SPEEDDECREASERATIO, MINFRAMERATE);
        },
        moveDown: function(){
            if(!this.willCollide(DOWN)){
                this.clearValueOnGameBoard(this.newBlock.position);
                this.newBlock.position.y++;
                this.setValueOnGameBoard(this.newBlock.position, this.newBlock.value);
            } else {
                    this.setValueOnGameBoard(this.newBlock.position, this.newBlock.value);
                    this.removeBlocks();

                    if(!this.isGameEnded()){
                        this.createNewBlock();
                    }else{
                        this.running = false;
                    }
            }
            game.render();
        },
        moveLeft: function(){
            if(!this.willCollide(LEFT)){
                this.clearValueOnGameBoard(this.newBlock.position);
                this.newBlock.position.x--;
                this.setValueOnGameBoard(this.newBlock.position, this.newBlock.value);
            }
            game.render();
        },
        moveRight: function(){
            if(!this.willCollide(RIGHT)){
                this.clearValueOnGameBoard(this.newBlock.position);
                this.newBlock.position.x++;
                this.setValueOnGameBoard(this.newBlock.position, this.newBlock.value);
            }
            game.render();
        },
        keyEvent: function(event){
            if(game.running){
                switch (event.keyCode) {
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
                        break;
                    default:
                        break;
                }
            }
        }
    };

    function helperDrawer(arr) {
        var tab = "<table>";

        for(var i = 0; i < arr[0].length;i++){
            var row = "<tr>";
            for(var j=0;j < arr.length; j++){
                row += "<td class='" + ((arr[j][i]) === "0"? "":"block")+ "'>" + (arr[j][i]).replace(/0/gi, "") + "</td>";
            }
            tab += row + "</tr>";
        }
        tab += "</table>";

        document.getElementById("result").innerHTML = tab;
        document.getElementById("scoreBoard").innerHTML = game.currentGame.score;
    }
    
      function testCanvasDrawer(size) {
        
        var blockSize = (size.width-2) / 5;
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");

        canvas.width = size.width;
        canvas.height = size.height;
        
        document.getElementById("result").appendChild(canvas);
         
        return function (arr) {
            context.fillStyle = "white";
            context.fillRect(0,0, size.width, size.height);
            
            for(var i = 0; i < arr[0].length;i++){
                var y = i * blockSize  + 2;
                for(var j=0;j < arr.length; j++){
                    var x = j * blockSize;
                    if((arr[j][i]) !== "0"){
                        context.strokeStyle = "green";
                        context.rect(x+1, y, blockSize, blockSize);
                        context.stroke();
                        context.fillStyle = "green";
                        context.font = "36px Arial";
                        var delta = (blockSize - context.measureText((arr[j][i])).width)/2
                        context.fillText((arr[j][i]).replace(/0/gi, ""), x + delta , y + blockSize - (blockSize/4) );
                    }
                }
            }
            
            context.beginPath();
            context.strokeStyle = "blue";
            context.moveTo(0, 0);
            context.lineTo(0, size.height);
            context.lineTo(size.width, size.height);
            context.lineTo(size.width,0);
            context.stroke();
            
            document.getElementById("scoreBoard").innerHTML = game.currentGame.score;
       };
    }

    document.getElementById("startGameButton").addEventListener("click", game.startGameLoop);
    document.getElementById("stopGameButton").addEventListener("click", game.stopGameLoop);
    document.getElementById("clearGameButton").addEventListener("click", game.resetGame);

    document.body.addEventListener("keydown", game.keyEvent);

	if(usecanvas){
    	game.init(testCanvasDrawer({width:200, height:400}));
	}else{
		game.init(helperDrawer);
	}
    
    
}(true));