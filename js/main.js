const DEBUG = true;

function debug(obj){
    if(DEBUG){
        console.info(obj);
    }
}

debug("Up and Running!");


var game = {
    init:function(){
        this.gameElement = document.getElementById("gameBoard");
        
       /* var scoreBox = document.createElement("div");
        scoreBox.className = "score-board";
        var timerBox = document.createElement("div");
        timerBox.className = "timer-display";*/
        var gameBox = document.createElement("div");
        gameBox.className = "game-box";

        //this.gameElement.appendChild(scoreBox);
        //this.gameElement.appendChild(timerBox);
        this.gameElement.appendChild(gameBox);

        if(!this.currentBlock)
        {
            this.currentBlock = document.createElement("div");
            this.currentBlock.className = "game-block";
            this.currentBlock.setAttribute("style","top:-20px");
            gameBox.appendChild(this.currentBlock);
        }
                
    },
    render:function()
    {
        
        this.move();
    },
    move: function()
    {
        var speed = 5;
        if(this.currentBlock){
            if(parseInt(this.currentBlock.style.top)+speed < 401-40)
            this.currentBlock.style.top = (parseInt(this.currentBlock.style.top)+speed) + "px" ;
        }
    }


};

game.init();
