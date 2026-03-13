let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameOver = false;
let mode = 'pvp'; // Default mode: Player vs Player

// Get references to the HTML elements
const boardElement = document.getElementById('board');
const resetButton = document.getElementById('reset');
const modeSelector = document.getElementById('mode');
const messageElement = document.getElementById('message');

// Add event listeners
modeSelector.addEventListener('change', (event) => {
    mode = event.target.value;
    resetGame();
});
resetButton.addEventListener('click', resetGame);

// Render the board on the page
function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, index) => {
        const box = document.createElement('div');
        box.classList.add('box');
        box.textContent = cell;
        box.addEventListener('click', () => handleMove(index));
        boardElement.appendChild(box);
    });
}

// Handle player's move
function handleMove(index) {
    if (board[index] === '' && !gameOver) {
        board[index] = currentPlayer;
        renderBoard();
        checkWinner();
        switchPlayer();
        if (mode === 'pvc' && currentPlayer === 'O' && !gameOver) {
            setTimeout(computerMove, 500); // Delay for computer move
        }
    }
}

// Switch the current player
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

// Check if there's a winner or a draw
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameOver = true;
            messageElement.textContent = `Player ${board[a]} wins!`;
            startCountdown(); // Start countdown before resetting
            return;
        }
    }

    if (board.every(cell => cell !== '')) {
        gameOver = true;
        messageElement.textContent = 'It\'s a draw!';
        startCountdown(); // Start countdown before resetting
    }
}

// Countdown logic
function startCountdown() {
    let countdown = 3; // Countdown from 3 seconds
    const interval = setInterval(() => {
        messageElement.textContent = `Restarting game in ${countdown}`;
        countdown--;

        if (countdown < 0) {
            clearInterval(interval); // Stop the countdown
            resetGame(); // Reset the game after the countdown
        }
    }, 1000); // Update every 1 second
}

// Improved bot move (weakened AI to allow player to win 65% of the time because my friend Corvus was crying)
function computerMove() {
    // Bot should sometimes make random moves
    if (Math.random() < 0.65) {
        // 65% chance: Make a suboptimal random move
        const availableMoves = board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        board[randomMove] = 'O';
    } else {
        // 35% chance: Block or win
        const winningMove = findBestMove('O');
        if (winningMove !== -1) {
            board[winningMove] = 'O';
        } else {
            // Block human from winning
            const blockingMove = findBestMove('X');
            if (blockingMove !== -1) {
                board[blockingMove] = 'O';
            } else {
                // Otherwise, make a random move if no blocking or winning move
                const availableMoves = board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
                const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                board[randomMove] = 'O';
            }
        }
    }

    renderBoard();
    checkWinner();
    switchPlayer();
}

// Find the best move for the bot (for both winning and blocking)
function findBestMove(player) {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        const cells = [board[a], board[b], board[c]];

        if (cells.filter(cell => cell === player).length === 2 && cells.includes('')) {
            return combination[cells.indexOf('')]; // Block or win
        }
    }

    return -1; // No winning or blocking move
}

// Reset the game
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameOver = false;
    messageElement.textContent = '';
    renderBoard();
}

// Initial render
renderBoard();
