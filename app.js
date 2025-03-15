const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
let snake = [{ x: 160, y: 160 }];
let direction = "RIGHT";
let food = generateFood();
let score = 0;
let timer = 0;
let gameInterval;
let gamePaused = false;
let foodEaten = false;
let timeElapsed = 0;
let timerInterval;

const timerDisplay = document.createElement('div'); 
timerDisplay.id = 'timer-container';
timerDisplay.style.position = 'absolute';
timerDisplay.style.bottom = '10px';
timerDisplay.style.left = '10px';
timerDisplay.style.fontFamily = "'Press Start 2P', cursive";  
timerDisplay.style.fontSize = '20px';  
timerDisplay.style.color = '#00FF00';  
timerDisplay.style.backgroundColor = '#333';  
timerDisplay.style.padding = '5px 10px';  
timerDisplay.style.borderRadius = '5px'; 
timerDisplay.style.border = '2px solid #00FF00';  
timerDisplay.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.7)';  
timerDisplay.textContent = 'Time: 0s'; 
timerDisplay.id = "timer";
timerDisplay.style.position = "absolute";
timerDisplay.style.bottom = "10px";
timerDisplay.style.left = "10px";
timerDisplay.style.fontFamily = "'Press Start 2P', cursive";
timerDisplay.style.fontSize = "20px";
timerDisplay.style.color = "#00FF00";
timerDisplay.textContent = `Timer: 0s`;  
document.body.appendChild(timerDisplay);


const headImg = new Image();
headImg.src = 'head.png';


const bodyImg = new Image();
bodyImg.src = 'body.png';

const tailImg = new Image();
tailImg.src = 'firsttail.png';

const foodImages = [
  'burger.png', 'cake.png', 'cookie.png', 'hotdog.png', 'icecream.png', 'pizza.png', 'candy.png'
];
let foodIndex = 0;

const foodImg = new Image();
foodImg.src = foodImages[foodIndex];

const eatSound = new Audio('eat-sound.mp3');
const gameOverSound = new Audio('game-over-sound.mp3');
const buttonSound = new Audio('button.mp3');
const welcomeSound = new Audio('welcome.mp3');

window.onload = () => {
    welcomeSound.play();
    document.body.style.animation = 'fadeIn 2s ease-in-out'; 

    document.body.style.animation = 'fadeIn 2s ease-in-out';

    ctx.drawImage(headImg, 160, 160, gridSize, gridSize);

};

const buttons = document.querySelectorAll("button");
buttons.forEach(button => {
    button.style.fontFamily = "'Press Start 2P', cursive";  
});


document.getElementById("pause-btn").style.display = "none";
document.getElementById("start-btn").addEventListener("click", () => {
    startGame();
    buttonSound.play();
});
document.getElementById("pause-btn").addEventListener("click", () => {
    togglePause();
    buttonSound.play();
});
document.getElementById("how-to-play-btn").addEventListener("click", () => {
    showHowToPlayModal();
    buttonSound.play();
});
document.getElementById("close-modal").addEventListener("click", () => {
    closeHowToPlayModal();
    buttonSound.play();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "p" || event.key === "P") {
        togglePause();
        buttonSound.play();
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        changeDirection(event);
    }
});

function startGame() {
    score = 0;
    document.getElementById("score").innerText = `Score: ${score}`;
    snake = [{ x: 160, y: 160 }];
    direction = "RIGHT";
    food = generateFood();
    foodIndex = 0;
    foodImg.src = foodImages[foodIndex];
    gamePaused = false;
    foodEaten = false;

    document.getElementById("start-btn").style.display = "none";
    document.getElementById("pause-btn").style.display = "inline";
    document.getElementById("restart-btn").style.display = "none";

    gameInterval = setInterval(gameLoop, 200);
    startTimer();
}

function togglePause() {
    if (gamePaused) {
        gameInterval = setInterval(gameLoop, 200);
        document.getElementById("pause-btn").innerText = "Pause";
    } else {
        clearInterval(gameInterval);
        document.getElementById("pause-btn").innerText = "Resume";
    }
    gamePaused = !gamePaused;
}

function gameLoop() {
    updateSnakePosition();
    if (checkCollision()) {
        clearInterval(gameInterval);
        gameOverSound.play();
        stopTimer();
        showGameOverPopup();
        return;
    }
    if (checkFoodCollision()) {
        score += 1;
        document.getElementById("score").innerText = `Score: ${score}`;
        food = generateFood();
        foodIndex = (foodIndex + 1) % foodImages.length;
        foodImg.src = foodImages[foodIndex];
        snake.push({});
        foodEaten = true;
        eatSound.play();
    }
    drawGame();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
}

function drawSnake() {
    ctx.drawImage(headImg, snake[0].x, snake[0].y, gridSize, gridSize);
    for (let i = 1; i < snake.length - 1; i++) {
        ctx.drawImage(bodyImg, snake[i].x, snake[i].y, gridSize, gridSize);
    }
    if (snake.length > 1) {
        ctx.drawImage(tailImg, snake[snake.length - 1].x, snake[snake.length - 1].y, gridSize, gridSize);
    }
}

function drawFood() {
    ctx.drawImage(foodImg, food.x, food.y, gridSize, gridSize);
}

function updateSnakePosition() {
    const head = { ...snake[0] };
    if (direction === "RIGHT") head.x += gridSize;
    if (direction === "LEFT") head.x -= gridSize;
    if (direction === "UP") head.y -= gridSize;
    if (direction === "DOWN") head.y += gridSize;
    snake.unshift(head);
    if (!foodEaten) snake.pop();
    else foodEaten = false;
}

function changeDirection(event) {
    if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return true;
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return true;
    }
    return false;
}

function checkFoodCollision() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

function generateFood() {
    const x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    const y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
    return { x, y };
}

function showHowToPlayModal() {
    document.getElementById("how-to-play-modal").style.display = "flex";
}

function closeHowToPlayModal() {
    document.getElementById("how-to-play-modal").style.display = "none";
}

function showGameOverPopup() {
    const modal = document.createElement("div");
    modal.id = "game-over-modal";
    modal.innerHTML = `
        <div id="game-over-message">
            <h2>Game Over!</h2>
            <p>You hit the wall or yourself.</p>
            <button id="close-game-modal">X</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById("close-game-modal").addEventListener("click", () => location.reload());
}

function startTimer() {
    timeElapsed = 0;  
    timerInterval = setInterval(() => {
        timeElapsed++;
        timerDisplay.textContent = `Time: ${timeElapsed}s`;
    }, 1000); 
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    timeElapsed = 0;
    timerDisplay.textContent = `Time: 0s`;
}

function gameOver() {
    stopTimer();
    const gameOverModal = document.getElementById("game-over-modal");
    gameOverModal.style.display = "flex"; 

    gameOverModal.classList.add("glitch-effect");

    setTimeout(() => {
        gameOverModal.classList.remove("glitch-effect");
    }, 3000);
}
