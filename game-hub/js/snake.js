document.addEventListener("DOMContentLoaded", () => {

  // ===== CONSTANTS =====
  const TILE = 20;
  const GRID = 25;
  const SPEED = 100;

  // Colors (Google Snake–style)
  const BG_LIGHT = "#a7d948";
  const BG_DARK  = "#8ecc39";
  const SNAKE_COLOR = "#4caf50";
  const FOOD_RED = "#e53935";
  const FOOD_DARK = "#c62828";

  // ===== CANVAS =====
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = TILE * GRID;
  canvas.height = TILE * GRID;

  // ===== STATE =====
  let snake;
  let direction;
  let nextDirection;
  let food;
  let alive;
  let loop;

  let score = 0;
  let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;

  // ===== INPUT (ARROWS + WASD) =====
  document.addEventListener("keydown", e => {
    if (!alive && (e.key === " " || e.code === "Space")) startGame();

    switch (e.key.toLowerCase()) {
      case "arrowup":
      case "w":
        if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
        break;
      case "arrowdown":
      case "s":
        if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
        break;
      case "arrowleft":
      case "a":
        if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
        break;
      case "arrowright":
      case "d":
        if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
        break;
    }
  });

  // ===== START GAME =====
  function startGame() {
    clearInterval(loop);

    snake = [
      { x: 12, y: 12 },
      { x: 11, y: 12 },
      { x: 10, y: 12 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    food = spawnFood();
    alive = true;

    loop = setInterval(update, SPEED);
    draw();
  }

  // ===== UPDATE =====
  function update() {
    if (!alive) return;
    if (score == 67) {
      alert("Congratulations! The code is mason da best!");
    }

    direction = nextDirection;

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    // wall collision
    if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) {
      endGame();
      return;
    }

    // self collision
    for (let s of snake) {
      if (s.x === head.x && s.y === head.y) {
        endGame();
        return;
      }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      food = spawnFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function endGame() {
    alive = false;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
    }
    draw();
  }

  // ===== DRAW =====
  function draw() {
    drawBackground();
    drawApple();
    drawSnake();
    drawScore();

    if (!alive) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#fff";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 10);

      ctx.font = "16px Arial";
      ctx.fillText("Press Space to Restart", canvas.width / 2, canvas.height / 2 + 18);
    }
  }

  // ===== BACKGROUND =====
  function drawBackground() {
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? BG_LIGHT : BG_DARK;
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
  }

  // ===== SCORE UI =====
  function drawScore() {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, canvas.width, 28);

    ctx.fillStyle = "#fff";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 8, 19);

    ctx.textAlign = "right";
    ctx.fillText(`High: ${highScore}`, canvas.width - 8, 19);
  }

  // ===== SNAKE =====
  function drawSnake() {
    snake.forEach((seg, i) => {
      const px = seg.x * TILE;
      const py = seg.y * TILE;

      ctx.fillStyle = SNAKE_COLOR;

      if (i === 0) {
        ctx.beginPath();
        ctx.arc(px + TILE / 2, py + TILE / 2, TILE / 2, 0, Math.PI * 2);
        ctx.fill();
        drawEyes(px, py);
      } else {
        ctx.fillRect(px, py, TILE, TILE);
      }
    });
  }

  function drawEyes(px, py) {
    const eyeOffset = 5;
    const eyeRadius = 2;
    let ex = 0, ey = 0;

    if (direction.x === 1) ex = 4;
    if (direction.x === -1) ex = -4;
    if (direction.y === 1) ey = 4;
    if (direction.y === -1) ey = -4;

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(px + TILE / 2 + ex, py + TILE / 2 - eyeOffset + ey, eyeRadius, 0, Math.PI * 2);
    ctx.arc(px + TILE / 2 + ex, py + TILE / 2 + eyeOffset + ey, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===== APPLE (EMOJI STYLE) =====
  function drawApple() {
    const cx = food.x * TILE + TILE / 2;
    const cy = food.y * TILE + TILE / 2;

    ctx.fillStyle = FOOD_RED;
    ctx.beginPath();
    ctx.arc(cx, cy, TILE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = FOOD_DARK;
    ctx.beginPath();
    ctx.arc(cx + 3, cy + 3, TILE / 2 - 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#5d4037";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - TILE / 2 + 2);
    ctx.lineTo(cx, cy - TILE / 2 - 4);
    ctx.stroke();

    ctx.fillStyle = "#2e7d32";
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - TILE / 2 - 2, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===== FOOD (FIXED: NEVER SPAWNS ON SNAKE) =====
  function spawnFood() {
    let position;
    let onSnake;

    do {
      position = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID)
      };

      onSnake = snake.some(seg => seg.x === position.x && seg.y === position.y);
    } while (onSnake);

    return position;
  }

  startGame();
});
