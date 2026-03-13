let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameOver = false;
let mode = 'pvp';
let scores = { X: 0, O: 0 };
let countdownInterval = null;

// Get references to the HTML elements
const boardElement = document.getElementById('board');
const resetButton = document.getElementById('reset');
const modeSelector = document.getElementById('mode');
const messageElement = document.getElementById('message');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const turnIndicator = document.getElementById('turn-indicator');

// Add event listeners
modeSelector.addEventListener('change', (event) => {
    mode = event.target.value;
    scores = { X: 0, O: 0 };
    updateScoreboard();
    resetGame();
});

resetButton.addEventListener('click', () => {
    resetGame();
});

// Render the board on the page
function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, index) => {
        const box = document.createElement('div');
        box.classList.add('box');
        if (cell === 'X') box.classList.add('x-color');
        if (cell === 'O') box.classList.add('o-color');
        
        // Use a span for the pop-in animation
        const span = document.createElement('span');
        span.textContent = cell;
        box.appendChild(span);

        box.addEventListener('click', () => handleMove(index));
        boardElement.appendChild(box);
    });
}

// Handle player's move
function handleMove(index) {
    if (board[index] === '' && !gameOver) {
        // Prevent move if it's computer's turn
        if (mode === 'pvc' && currentPlayer === 'O') return;

        executeMove(index, currentPlayer);

        if (!gameOver) {
            if (mode === 'pvc' && currentPlayer === 'O') {
                setTimeout(computerMove, 600);
            }
        }
    }
}

function executeMove(index, player) {
    board[index] = player;
    renderBoard();
    if (checkWinner()) return;
    
    switchPlayer();
    updateTurnIndicator();
}

// Switch the current player
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function updateTurnIndicator() {
    if (gameOver) return;
    turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
    turnIndicator.className = currentPlayer === 'X' ? 'x-color' : 'o-color';
}

function updateScoreboard() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
}

// Check if there's a winner or a draw
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameOver = true;
            scores[board[a]]++;
            updateScoreboard();
            messageElement.textContent = `Player ${board[a]} Wins!`;
            highlightWinner(combination);
            startCountdown();
            return true;
        }
    }

    if (board.every(cell => cell !== '')) {
        gameOver = true;
        messageElement.textContent = "It's a Draw!";
        startCountdown();
        return true;
    }
    return false;
}

function highlightWinner(combination) {
    const boxes = document.querySelectorAll('.box');
    combination.forEach(index => {
        boxes[index].classList.add('winner');
    });
}

// Countdown logic
function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    let countdown = 3;
    messageElement.textContent += ` (Restarting in ${countdown}...)`;
    
    countdownInterval = setInterval(() => {
        countdown--;
        const baseMsg = gameOver && board.every(c => c !== '') && !document.querySelector('.winner') 
            ? "It's a Draw!" 
            : `Player ${board.find(c => c !== '')} Wins!`; // Simple check for winner msg
            
        // Regather actual message from DOM if needed or just use state
        const winner = document.querySelector('.winner');
        const status = winner ? `Player ${board[Array.from(document.querySelectorAll('.box')).indexOf(winner)]} Wins!` : "It's a Draw!";
        
        messageElement.textContent = `${status} (Restarting in ${countdown}...)`;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            resetGame();
        }
    }, 1000);
}

// Bot logic
function computerMove() {
    if (gameOver) return;

    let moveIndex = -1;
    
    // Win or Block logic (35% of the time play optimally, 65% random)
    if (Math.random() > 0.65) {
        moveIndex = findBestMove('O'); // Try to win
        if (moveIndex === -1) moveIndex = findBestMove('X'); // Try to block
    }

    if (moveIndex === -1) {
        const availableMoves = board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
        moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    if (moveIndex !== -1) {
        executeMove(moveIndex, 'O');
    }
}

function findBestMove(player) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        const cells = [board[a], board[b], board[c]];
        if (cells.filter(cell => cell === player).length === 2 && cells.includes('')) {
            return combination[cells.indexOf('')];
        }
    }
    return -1;
}

// Reset the game
function resetGame() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameOver = false;
    messageElement.textContent = '';
    renderBoard();
    updateTurnIndicator();
}

// Initial setup
updateTurnIndicator();
renderBoard();

