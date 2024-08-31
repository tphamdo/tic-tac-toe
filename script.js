var gameboard = (function() {
    let board = [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']];

    function makeMove(x, y, marker) {
        if (x<0 || y<0 || x>2 || y>2) {
            console.error(`(x,y) must be between (0,0) and (2,2). Got (${x}, ${y}) instead`);
            return false;
        }
        if (board[y][x] !== ' ') {
            console.error(`Can not place on spot (${x},${y}). Spot already has a ${board[x][y]}`)
            return false;
        }
        board[y][x] = marker;
        console.log(board);
        return true;
    }

    function reset() {
        for (let y=0; y<3; ++y) {
            for (let x=0; x<3; ++x) {
                board[y][x] = ' ';
            }
        }
    }

    function isWinner(marker) {
        // row
        for (let y=0; y<3; ++y) {
            if (board[y][0] == marker &&
                board[y][0] == board[y][1] &&
                board[y][1] == board[y][2]) return true;
        }
        
        // col
        for (let x=0; x<3; ++x) {
            if (board[0][x] == marker &&
                board[0][x] == board[1][x] &&
                board[1][x] == board[2][x]) return true;
        }

        // diag
        if (board[0][0] == marker &&
            board[0][0] == board[1][1] &&
            board[1][1] == board[2][2]) return true;

        if (board[0][2] == marker &&
            board[0][2] == board[1][1] &&
            board[1][1] == board[2][0]) return true;

        return false;
    }

    return { makeMove, reset, isWinner };
})();

var game = (function() {
    let player1Turn = true;
    let gameOver = false;
   
    function makeMove(x, y, marker) {
        if (gameOver) {
            console.error(`The game is over`)
            return;
        }

        if (player1Turn && marker != 'O' || !player1Turn && marker != 'X') {
            console.error(`It's Player${player1Turn? '1' : '2'}'s turn`)
            return;
        }

        if (gameboard.makeMove(x,y,marker)) {
            if (isWinner(marker)) {
                console.log(`Game over! Player${player1Turn? '1' : '2'} won!`);
                return;
            }

            player1Turn = !player1Turn;
        }
    }

    function reset() {
        gameboard.reset()
        player1Turn = true;
        gameOver = false;
    }

    function isWinner(marker) {
        let winner = false;
        if (gameboard.isWinner(marker)) {
            winner = true;
            gameOver = true;
        }

        return winner;
    }

    return { makeMove, reset };
})();

var player1 = {
    marker: 'O',
    makeMove: function(x,y) {
        game.makeMove(x,y,this.marker);
    }
}

var player2 = {
    marker: 'X',
    makeMove: function(x,y) {
        game.makeMove(x,y,this.marker);
    }
}
