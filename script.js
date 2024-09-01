var pubSub = (function() {
    var listeners = {};

    function publish(eventName, data) {
        console.log("publish");
        console.log(eventName);
        if (listeners[eventName]) {
            console.log(eventName);
            listeners[eventName].forEach(function(fn) {
                console.log(fn);
                console.log(data);
                fn(data);
            });
        }
    }

    function subscribe(eventName, fn) {
        console.log("subscribe");
        listeners[eventName] = listeners[eventName] || [];
        listeners[eventName].push(fn);
    }

    function unsubscribe(eventName, fn) {
        var subscriptions = listeners[eventName]
        if (subscriptions) {
            for (let i=0; i<subscriptions.length; ++i) {
                if (subscriptions[i] === fn) {
                    subscriptions.splice(i,1);
                    break;
                }
            }
        }
    }

    return { publish, subscribe, unsubscribe };
})();

var gameboard = (function() {
    var _board = [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']];

    // cache dom
    const $gameboardTemplate =
        document.getElementById('gameboard-template').innerHTML;
    const $gameboard = document.getElementById('gameboard');

    _render();
    pubSub.publish("game-restarted");

    function makeMove(x, y, marker) {
        console.log(_board);
        if (x<0 || y<0 || x>2 || y>2) {
            console.error(`(x,y) must be between (0,0) and (2,2).
                Got (${x}, ${y}) instead`);
            return false;
        }
        if (_board[y][x] !== ' ') {
            console.error(`Can not place on spot (${x},${y}).
                Spot already has a ${_board[y][x]}`)
            return false;
        }
        _board[y][x] = marker;
        _renderOneTile(x, y, marker);
        return true;
    }

    function _render() {
        const rendered = Mustache.render($gameboardTemplate, { ..._board.flat() })
        $gameboard.innerHTML = rendered;
    }

    function _renderOneTile(x, y, marker) {
        console.log($gameboard.children);
        $gameboard.children[x+3*y].textContent = marker;
    }

    function reset() {
        for (let y=0; y<3; ++y) {
            for (let x=0; x<3; ++x) {
                _board[y][x] = ' ';
            }
        }
        pubSub.publish("game-restarted");
    }

    function isWinner(marker) {
        // row
        for (let y=0; y<3; ++y) {
            if (_board[y][0] == marker &&
                _board[y][0] == _board[y][1] &&
                _board[y][1] == _board[y][2]) return true;
        }

        // col
        for (let x=0; x<3; ++x) {
            if (_board[0][x] == marker &&
                _board[0][x] == _board[1][x] &&
                _board[1][x] == _board[2][x]) return true;
        }

        // diag
        if (_board[0][0] == marker &&
            _board[0][0] == _board[1][1] &&
            _board[1][1] == _board[2][2]) return true;

        if (_board[0][2] == marker &&
            _board[0][2] == _board[1][1] &&
            _board[1][1] == _board[2][0]) return true;

        return false;
    }

    return { makeMove, reset, isWinner };
})();

var game = (function() {
    let player1Turn = true;
    let gameOver = false;
    let movesMade = 0;

    let player1 = {
        marker: 'O',
        makeMove: function(x,y) {
            _makeMove(x,y,this.marker);
        }
    }

    let player2 = {
        marker: 'X',
        makeMove: function(x,y) {
            _makeMove(x,y,this.marker);
        }
    }

    var tiles = document.querySelectorAll('.tile');
    for(let i=0; i<tiles.length; i++){
        console.log(tiles[i]);
        tiles[i].onclick = function() {
            console.log('onclick');
            makeMove(i%3, Math.floor(i/3));
            console.log('onclick2');
        };
    }

    function makeMove(x,y) {
        console.log(x,y);
        if (player1Turn) player1.makeMove(x,y);
        else player2.makeMove(x,y);
    }

    function _makeMove(x, y, marker) {
        if (gameOver) {
            console.error(`The game is over`)
            return;
        }

        if (gameboard.makeMove(x,y,marker)) {
            ++movesMade;

            if (isWinner(marker)) {
                let winner = player1Turn? 'Player 1' : 'Player 2';
                pubSub.publish("game-over", `Game over. ${winner} won!`);
                gameOver = true;
                return;
            }

            if (movesMade === 9) {
                console.log(`Game over! It's a tie.`);
                pubSub.publish("game-over", `Game over! It's a tie.`);
                gameOver = true;
                return;
            }

            player1Turn = !player1Turn;
            pubSub.publish("turn-played",
                player1Turn? "Player 1" : "Player 2");
        }
    }

    function reset() {
        gameboard.reset()
        player1Turn = true;
        gameOver = false;
        movesMade = 0;
    }

    function isWinner(marker) {
        return gameboard.isWinner(marker)
    }

    return { makeMove, reset };
})();


var message = (function() {
    // cache dom
    const $turnMessageTemplate =
        document.getElementById('turn-message-template').innerHTML;
    const $gameMessageTemplate =
        document.getElementById('game-message-template').innerHTML;
    const $message = document.getElementById('message');

    _renderTurnMessage();
    pubSub.subscribe("turn-played", _renderTurnMessage);
    pubSub.subscribe("game-restarted", _renderTurnMessage);
    function _renderTurnMessage(playerName) {
        console.log("rendering....");
        if (!playerName) playerName = "Player 1";
        const rendered = Mustache.render($turnMessageTemplate,
            { playerName })
        $message.innerHTML = rendered;
    }

    pubSub.subscribe("game-over", _renderGameMessage);
    function _renderGameMessage(message) {
        const rendered = Mustache.render($gameMessageTemplate,
            { message });
        $message.innerHTML = rendered;
    }

})();
