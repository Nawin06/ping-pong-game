const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game Settings
const PADDLE_WIDTH = 12, PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PLAYER_X = 30;
const AI_X = canvas.width - 30 - PADDLE_WIDTH;
const PADDLE_SPEED = 6; // For AI
const BALL_SPEED = 6;

// Game State
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
let playerScore = 0, aiScore = 0;

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT/2;
  // Clamp within canvas
  playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

function drawRect(x, y, w, h, color='#fff') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color='#fff') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2, false);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  for(let i = 0; i < canvas.height; i += 40) {
    drawRect(canvas.width/2 - 1, i, 2, 24, '#666');
  }
}

function drawScore() {
  ctx.font = '32px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(playerScore, canvas.width/2 - 80, 50);
  ctx.fillText(aiScore, canvas.width/2 + 80, 50);
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

function collision(paddleX, paddleY) {
  // AABB - Circle collision
  let testX = ballX;
  let testY = ballY;

  if (ballX < paddleX) testX = paddleX;
  else if (ballX > paddleX + PADDLE_WIDTH) testX = paddleX + PADDLE_WIDTH;
  if (ballY < paddleY) testY = paddleY;
  else if (ballY > paddleY + PADDLE_HEIGHT) testY = paddleY + PADDLE_HEIGHT;

  let distX = ballX - testX;
  let distY = ballY - testY;
  return (distX * distX + distY * distY) <= (BALL_RADIUS * BALL_RADIUS);
}

function update() {
  // Ball movement
  ballX += ballVelX;
  ballY += ballVelY;

  // Top/bottom wall
  if (ballY < BALL_RADIUS) {
    ballY = BALL_RADIUS;
    ballVelY = -ballVelY;
  }
  if (ballY > canvas.height - BALL_RADIUS) {
    ballY = canvas.height - BALL_RADIUS;
    ballVelY = -ballVelY;
  }

  // Player paddle collision
  if (collision(PLAYER_X, playerY)) {
    ballX = PLAYER_X + PADDLE_WIDTH + BALL_RADIUS;
    ballVelX = -ballVelX;
    // Add some spin
    let diff = (ballY - (playerY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
    ballVelY = BALL_SPEED * diff;
  }

  // AI paddle movement (simple: follow the ball with some limit)
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  if (aiCenter < ballY - 20) aiY += PADDLE_SPEED;
  else if (aiCenter > ballY + 20) aiY -= PADDLE_SPEED;
  // Clamp
  aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));

  // AI paddle collision
  if (collision(AI_X, aiY)) {
    ballX = AI_X - BALL_RADIUS;
    ballVelX = -ballVelX;
    // Add some spin
    let diff = (ballY - (aiY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
    ballVelY = BALL_SPEED * diff;
  }

  // Score
  if (ballX < 0) {
    aiScore++;
    resetBall();
  }
  if (ballX > canvas.width) {
    playerScore++;
    resetBall();
  }
}

function render() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Net
  drawNet();
  // Paddles
  drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#0ef');
  drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, '#f60');
  // Ball
  drawCircle(ballX, ballY, BALL_RADIUS, '#fff');
  // Score
  drawScore();
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
