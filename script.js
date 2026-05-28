const GRID_SIZE = 10;
let currentLevelIndex = 0;
let grid = [];
let startPos = { x: 0, y: 0 };
let endPos = { x: 0, y: 0 };
let currentPos = { x: 0, y: 0 };
let score = 0;
let visited = new Set();
let gameOver = false;
let pendingMove = null;

// DOM 元素
const levelSelect = document.getElementById('level-select');
const gridElement = document.getElementById('grid');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('game-message');
const restartBtn = document.getElementById('restart-btn');
const operatorPopup = document.getElementById('operator-popup');
const opBtns = document.querySelectorAll('.op-btn');
const cancelOpBtn = document.getElementById('cancel-op');
const gridContainer = document.querySelector('.grid-container');

// 初始化关卡选择器
function initLevelSelect() {
    levelSelect.innerHTML = '';
    for (let i = 0; i < LEVELS.length; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `第 ${i + 1} 关`;
        levelSelect.appendChild(option);
    }
    levelSelect.addEventListener('change', (e) => {
        currentLevelIndex = parseInt(e.target.value);
        initGame();
    });
}

function initGame() {
    // 从 levels.js 中加载当前关卡的数据
    const levelData = LEVELS[currentLevelIndex];
    
    // 深拷贝网格数据，防止修改原始关卡数据
    grid = levelData.grid.map(row => [...row]);
    startPos = { ...levelData.startPos };
    endPos = { ...levelData.endPos };
    
    visited.clear();
    gameOver = false;
    pendingMove = null;
    operatorPopup.classList.add('hidden');
    messageElement.classList.add('hidden');
    messageElement.className = 'message hidden';

    // 初始化玩家状态
    currentPos = { ...startPos };
    score = grid[startPos.y][startPos.x];
    visited.add(`${startPos.x},${startPos.y}`);

    updateUI();
}

function handleCellClick(x, y, event) {
    if (gameOver) return;

    // 检查是否为相邻格子
    const isAdjacent = (Math.abs(currentPos.x - x) === 1 && currentPos.y === y) ||
                       (Math.abs(currentPos.y - y) === 1 && currentPos.x === x);
    
    // 如果点击了不合法或已访问过的格子，则隐藏弹窗并返回
    if (!isAdjacent || visited.has(`${x},${y}`)) {
        operatorPopup.classList.add('hidden');
        pendingMove = null;
        return;
    }

    // 记录待移动的位置
    pendingMove = { x, y };
    
    // 获取被点击格子的位置以显示弹窗
    const cellElement = event.currentTarget;
    const rect = cellElement.getBoundingClientRect();
    const containerRect = gridContainer.getBoundingClientRect();
    
    // 计算弹窗在 .grid-container 内部的相对位置
    operatorPopup.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
    operatorPopup.style.top = (rect.top - containerRect.top) + 'px';
    
    operatorPopup.classList.remove('hidden');
}

function executeMove(operator) {
    if (!pendingMove) return;

    const { x, y } = pendingMove;
    const cellValue = grid[y][x];

    // 计算新分数
    let newScore = score;
    switch (operator) {
        case '+':
            newScore += cellValue;
            break;
        case '-':
            newScore -= cellValue;
            break;
        case '*':
            newScore *= cellValue;
            break;
        case '/':
            // 除法保留两位小数，避免出现无限循环小数
            newScore = parseFloat((newScore / cellValue).toFixed(2));
            break;
    }

    // 更新状态
    score = newScore;
    currentPos = { x, y };
    visited.add(`${x},${y}`);
    pendingMove = null;
    operatorPopup.classList.add('hidden');

    // 检查胜利条件
    if (x === endPos.x && y === endPos.y) {
        gameOver = true;
        messageElement.innerHTML = `恭喜到达终点！🎉 你的最终得分是：<strong>${score}</strong>`;
        messageElement.classList.remove('hidden');
        messageElement.classList.add('success');
    }

    updateUI();
}

function updateUI() {
    // 更新分数板
    scoreElement.textContent = score;

    // 渲染网格
    gridElement.innerHTML = '';
    
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            const cellValue = grid[y][x];
            
            cell.classList.add('cell');
            cell.textContent = cellValue > 0 ? `+${cellValue}` : cellValue;
            
            if (cellValue > 0) cell.classList.add('positive');
            if (cellValue < 0) cell.classList.add('negative');

            const isStart = x === startPos.x && y === startPos.y;
            const isEnd = x === endPos.x && y === endPos.y;
            const isCurrent = x === currentPos.x && y === currentPos.y;
            const isVisited = visited.has(`${x},${y}`);

            if (isStart) cell.classList.add('start');
            if (isEnd) cell.classList.add('end');
            if (isVisited && !isCurrent && !isStart && !isEnd) {
                cell.classList.add('visited');
            }
            if (isCurrent) {
                cell.classList.add('current');
            }

            // 高亮可移动的合法格子
            const isAdjacent = (Math.abs(currentPos.x - x) === 1 && currentPos.y === y) ||
                               (Math.abs(currentPos.y - y) === 1 && currentPos.x === x);
            
            if (!gameOver && isAdjacent && !isVisited) {
                cell.classList.add('valid-move');
            }

            if (gameOver || isVisited || !isAdjacent) {
                if (!isCurrent) cell.classList.add('disabled');
            }

            cell.addEventListener('click', (e) => handleCellClick(x, y, e));
            gridElement.appendChild(cell);
        }
    }
}

// 事件监听
restartBtn.addEventListener('click', initGame);

opBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const op = e.target.getAttribute('data-op');
        executeMove(op);
    });
});

cancelOpBtn.addEventListener('click', () => {
    pendingMove = null;
    operatorPopup.classList.add('hidden');
});

// 初始化游戏
initLevelSelect();
initGame();