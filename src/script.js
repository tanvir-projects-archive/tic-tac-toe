let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameOver = false;
let mode = 'pvp';
let difficulty = 'medium';
let scores = { X: 0, O: 0 };
let countdownInterval = null;

// Get references to the HTML elements
const boardElement = document.getElementById('board');
const resetButton = document.getElementById('reset');

// Mode Dropdown
const dropdown = document.getElementById('mode-dropdown');
const dropdownSelected = dropdown.querySelector('.dropdown-selected');
const dropdownOptions = dropdown.querySelectorAll('.dropdown-option');
const selectedText = document.getElementById('selected-text');

// Difficulty Dropdown
const difficultyDropdown = document.getElementById('difficulty-dropdown');
const difficultySelected = difficultyDropdown.querySelector('.dropdown-selected');
const difficultyOptions = difficultyDropdown.querySelectorAll('.dropdown-option');
const difficultySelectedText = document.getElementById('difficulty-selected-text');

const messageElement = document.getElementById('message');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const turnIndicator = document.getElementById('turn-indicator');

// ── Mode Dropdown ──────────────────────────────────────────────────────────────
dropdownSelected.addEventListener('click', () => {
    dropdown.classList.toggle('open');
});

dropdownOptions.forEach(option => {
    option.addEventListener('click', () => {
        const newValue = option.getAttribute('data-value');
        const newText = option.textContent.trim();

        selectedText.textContent = newText;
        dropdownOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        dropdown.classList.remove('open');

        // Show/hide difficulty selector
        if (newValue === 'pvc') {
            difficultyDropdown.classList.remove('difficulty-hidden');
        } else {
            difficultyDropdown.classList.add('difficulty-hidden');
        }

        if (mode !== newValue) {
            mode = newValue;
            scores = { X: 0, O: 0 };
            updateScoreboard();
            resetGame();
        }
    });
});

// ── Difficulty Dropdown ────────────────────────────────────────────────────────
difficultySelected.addEventListener('click', () => {
    difficultyDropdown.classList.toggle('open');
});

difficultyOptions.forEach(option => {
    option.addEventListener('click', () => {
        const newValue = option.getAttribute('data-value');
        const newText = option.textContent.trim();

        difficultySelectedText.textContent = newText;
        difficultyOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        difficultyDropdown.classList.remove('open');

        if (difficulty !== newValue) {
            difficulty = newValue;
            scores = { X: 0, O: 0 };
            updateScoreboard();
            resetGame();
        }
    });
});

// Close dropdowns on outside click
window.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
    if (!difficultyDropdown.contains(e.target)) difficultyDropdown.classList.remove('open');
});

resetButton.addEventListener('click', () => {
    if ('vibrate' in navigator) navigator.vibrate(50);
    resetGame();
});

// ── Board Rendering ────────────────────────────────────────────────────────────
function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, index) => {
        const box = document.createElement('div');
        box.classList.add('box');
        if (cell === 'X') box.classList.add('x-color');
        if (cell === 'O') box.classList.add('o-color');

        const span = document.createElement('span');
        span.textContent = cell;
        box.appendChild(span);

        box.addEventListener('click', () => handleMove(index));
        boardElement.appendChild(box);
    });
}

// ── Move Handling ──────────────────────────────────────────────────────────────
function handleMove(index) {
    if (board[index] === '' && !gameOver) {
        if (mode === 'pvc' && currentPlayer === 'O') return;

        executeMove(index, currentPlayer);

        if (!gameOver && mode === 'pvc' && currentPlayer === 'O') {
            setTimeout(computerMove, 500);
        }
    }
}

function executeMove(index, player) {
    board[index] = player;
    renderBoard();

    if ('vibrate' in navigator) navigator.vibrate(50);

    if (checkWinner()) {
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        return;
    }

    switchPlayer();
    updateTurnIndicator();
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function updateTurnIndicator() {
    if (gameOver) return;
    if (mode === 'pvc' && currentPlayer === 'O') {
        turnIndicator.textContent = `Computer's Turn`;
        turnIndicator.className = 'o-color';
    } else {
        turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
        turnIndicator.className = currentPlayer === 'X' ? 'x-color' : 'o-color';
    }
}

function updateScoreboard() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
}

// ── Win Detection ──────────────────────────────────────────────────────────────
const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function checkWinner() {
    for (const combo of WIN_COMBOS) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameOver = true;
            scores[board[a]]++;
            updateScoreboard();
            messageElement.textContent = mode === 'pvc' && board[a] === 'O'
                ? `Computer Wins!`
                : `Player ${board[a]} Wins!`;
            highlightWinner(combo);
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
    const winningLine = document.getElementById('winning-line');
    const boardEl = document.getElementById('board');

    combination.forEach(index => boxes[index].classList.add('winner'));

    if (!winningLine || !boardEl) return;

    const boardContainerRect = document.querySelector('.board-container').getBoundingClientRect();
    const box1Rect = boxes[combination[0]].getBoundingClientRect();
    const box3Rect = boxes[combination[2]].getBoundingClientRect();

    const x1 = box1Rect.left + box1Rect.width / 2 - boardContainerRect.left;
    const y1 = box1Rect.top + box1Rect.height / 2 - boardContainerRect.top;
    const x3 = box3Rect.left + box3Rect.width / 2 - boardContainerRect.left;
    const y3 = box3Rect.top + box3Rect.height / 2 - boardContainerRect.top;

    const dx = x3 - x1;
    const dy = y3 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    winningLine.classList.remove('draw-line');
    void winningLine.offsetWidth;

    winningLine.style.width = `0px`;
    winningLine.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;
    winningLine.style.setProperty('--line-width', `${distance}px`);
    winningLine.classList.add('draw-line');
}

// ── Countdown ──────────────────────────────────────────────────────────────────
function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    let countdown = 3;
    const baseMsg = messageElement.textContent;
    messageElement.textContent = `${baseMsg} (Restarting in ${countdown}...)`;

    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            resetGame();
        } else {
            messageElement.textContent = `${baseMsg} (Restarting in ${countdown}...)`;
        }
    }, 1000);
}

// ── AI: Computer Move ──────────────────────────────────────────────────────────
function computerMove() {
    if (gameOver) return;

    let moveIndex = -1;

    if (difficulty === 'easy') {
        moveIndex = randomMove();
    } else if (difficulty === 'medium') {
        moveIndex = mediumMove();
    } else {
        // Hard — Minimax (unbeatable)
        moveIndex = minimaxBestMove();
    }

    if (moveIndex !== -1) executeMove(moveIndex, 'O');
}

/** Easy: pick a random empty cell */
function randomMove() {
    const available = board.map((c, i) => c === '' ? i : -1).filter(i => i !== -1);
    return available.length ? available[Math.floor(Math.random() * available.length)] : -1;
}

/** Medium: win if possible, block if needed, otherwise random */
function mediumMove() {
    // 1. Try to win
    let move = findImmediateWin('O');
    if (move !== -1) return move;
    // 2. Block player
    move = findImmediateWin('X');
    if (move !== -1) return move;
    // 3. Random
    return randomMove();
}

function findImmediateWin(player) {
    for (const [a, b, c] of WIN_COMBOS) {
        const cells = [board[a], board[b], board[c]];
        if (cells.filter(cell => cell === player).length === 2 && cells.includes('')) {
            const emptyIdx = [a, b, c][cells.indexOf('')];
            return emptyIdx;
        }
    }
    return -1;
}

/** Hard: full Minimax algorithm — O is always maximising */
function minimaxBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            const score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function minimax(b, depth, isMaximising) {
    const winner = getWinner(b);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (b.every(c => c !== '')) return 0; // draw

    if (isMaximising) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (b[i] === '') {
                b[i] = 'O';
                best = Math.max(best, minimax(b, depth + 1, false));
                b[i] = '';
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (b[i] === '') {
                b[i] = 'X';
                best = Math.min(best, minimax(b, depth + 1, true));
                b[i] = '';
            }
        }
        return best;
    }
}

function getWinner(b) {
    for (const [a, w, c] of WIN_COMBOS) {
        if (b[a] && b[a] === b[w] && b[a] === b[c]) return b[a];
    }
    return null;
}

// ── Reset ──────────────────────────────────────────────────────────────────────
function resetGame() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameOver = false;
    messageElement.textContent = '';

    const winningLine = document.getElementById('winning-line');
    if (winningLine) winningLine.classList.remove('draw-line');

    renderBoard();
    updateTurnIndicator();
}

// ── Init ───────────────────────────────────────────────────────────────────────
updateTurnIndicator();
renderBoard();
