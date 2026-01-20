const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverElement = document.getElementById('game-over');
const restartButton = document.getElementById('restart');
const easyButton = document.getElementById('easy');
const mediumButton = document.getElementById('medium');
const hardButton = document.getElementById('hard');
const startButton = document.getElementById('start');
const countdownElement = document.getElementById('countdown');

const birdImg = new Image();
birdImg.src = 'tejas.jpg';

const difficulties = {
    easy: { pipeSpeed: 1.5, gap: 200, gravity: 0.4, jump: -10 },
    medium: { pipeSpeed: 2, gap: 150, gravity: 0.6, jump: -12 },
    hard: { pipeSpeed: 2.5, gap: 100, gravity: 0.8, jump: -14 }
};

let currentDifficulty = 'medium';

let bird = {
    x: 50,
    y: 300,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: difficulties[currentDifficulty].gravity,
    jump: difficulties[currentDifficulty].jump
};

let pipes = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('flappyBirdHighScore')) || 0;
let gameRunning = false;  // Changed to false initially

highScoreElement.textContent = `High Score: ${highScore}`;

function setDifficulty(mode) {
    currentDifficulty = mode;
    bird.gravity = difficulties[mode].gravity;
    bird.jump = difficulties[mode].jump;
    // Remove active class from all buttons
    document.querySelectorAll('#modes button').forEach(btn => btn.classList.remove('active'));
    // Add active to current
    document.getElementById(mode).classList.add('active');
    restart();
}

easyButton.addEventListener('click', () => setDifficulty('easy'));
mediumButton.addEventListener('click', () => setDifficulty('medium'));
hardButton.addEventListener('click', () => setDifficulty('hard'));

startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    countdownElement.style.display = 'block';
    let count = 5;
    countdownElement.textContent = count;
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownElement.textContent = count;
        } else {
            clearInterval(interval);
            countdownElement.style.display = 'none';
            restartButton.style.display = 'block';
            gameRunning = true;
            gameLoop();
        }
    }, 1000);
});

function drawBird() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, Math.min(bird.width, bird.height) / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    ctx.restore();
}

function drawPipes() {
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipe.width, pipe.bottomHeight);
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
}

function updatePipes() {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        let topHeight = Math.random() * (canvas.height - difficulties[currentDifficulty].gap - 100) + 50;
        let bottomHeight = canvas.height - topHeight - difficulties[currentDifficulty].gap;
        pipes.push({
            x: canvas.width,
            width: 50,
            topHeight: topHeight,
            bottomHeight: bottomHeight,
            passed: false
        });
    }

    pipes.forEach(pipe => {
        pipe.x -= difficulties[currentDifficulty].pipeSpeed;
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = `Score: ${score}`;
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

function checkCollision() {
    // Ground and ceiling
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        return true;
    }

    // Pipes
    for (let pipe of pipes) {
        if (bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.topHeight || bird.y + bird.height > canvas.height - pipe.bottomHeight)) {
            return true;
        }
    }

    return false;
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBird();
    updatePipes();

    if (checkCollision()) {
        gameRunning = false;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyBirdHighScore', highScore);
            highScoreElement.textContent = `High Score: ${highScore}`;
        }
        gameOverElement.style.display = 'block';
        return;
    }

    drawPipes();
    drawBird();

    requestAnimationFrame(gameLoop);
}

function jump() {
    if (gameRunning) {
        bird.velocity = bird.jump;
    }
}

function restart() {
    bird.y = 300;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameRunning = true;
    gameOverElement.style.display = 'none';
    gameLoop();
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

canvas.addEventListener('click', jump);

restartButton.addEventListener('click', restart);

// Start the game when image is loaded
birdImg.onload = () => {
    // Game starts when start button is clicked
};