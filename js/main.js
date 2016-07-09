const DEBUG = true;

function debug(obj){
    if(DEBUG){
        console.info(obj);
    }
}

debug("Up and Running!");


var game = {
    init: function () {
        // prepare Engine
        this.gameState = {
            newBlock: {
                position: {
                    x: 0,
                    y: 0
                },
                value: "a"
            },
            gameBoard: {
                data: ((width, height) => "0".repeat(width).split("").map(x=>"0".repeat(height).split("")))(20, 10),
                size: {
                    height: 20,
                    width: 10
                }
            }
        };

        this.currentGame = {
            isActive: true,
            score: 0,
            elapsedTime: 0,
            destroyedBlocks: 0 
        };
    },
    advanceOneStep: function () {
        debug("in");
       if(this.willCollide()){
            // position Block
            // calculate Blocks
            // calculate Score
            // new Block
       }
       else{
           // move Block
           this.gameState.newBlock.position.y--;
       }
    },
    willCollide: function () {
        return false;
    },
    render: function(){
        game.advanceOneStep();
        debug(game.gameState.newBlock.position.y);
    }

};

game.init();

setInterval(game.render.bind(game),33);
