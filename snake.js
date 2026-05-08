// js/games/snake.js

function initSnake(canvas, ctx) {
  const W = canvas.width, H = canvas.height;
  const CELL = Math.max(12, Math.floor(Math.min(W, H) / 22));
  const cols  = Math.floor(W / CELL);
  const rows  = Math.floor(H / CELL);

  let snake   = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  let dir     = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food    = randomFood();
  let score   = 0, alive = true, last = 0;
  let animId;

  const DIR_MAP = {
    ArrowUp:    { x: 0,  y: -1 },
    ArrowDown:  { x: 0,  y:  1 },
    ArrowLeft:  { x: -1, y:  0 },
    ArrowRight: { x: 1,  y:  0 },
    w: { x: 0,  y: -1 },
    s: { x: 0,  y:  1 },
    a: { x: -1, y:  0 },
    d: { x: 1,  y:  0 },
  };

  function onKey(e) {
    const d = DIR_MAP[e.key];
    if (d && !(d.x === -dir.x && d.y === -dir.y)) nextDir = d;
  }
  document.addEventListener("keydown", onKey);

  function randomFood() {
    return {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
  }

  canvas.addEventListener("click", () => {
    if (!alive) {
      snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
      dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
      food = randomFood(); score = 0; alive = true;
    }
  });

  function loop(ts) {
    animId = requestAnimationFrame(loop);
    ctx.fillStyle = "#04140a";
    ctx.fillRect(0, 0, W, H);

    if (!alive) {
      ctx.fillStyle = "#7fff6e";
      ctx.font = `bold ${Math.min(W / 9, 24)}px Syne, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Game Over!", W / 2, H / 2 - 18);
      ctx.fillStyle = "#888";
      ctx.font = `${Math.min(W / 14, 13)}px monospace`;
      ctx.fillText("Score: " + score, W / 2, H / 2 + 10);
      ctx.fillStyle = "#1a3a1a";
      ctx.fillRect(W / 2 - 48, H / 2 + 24, 96, 28);
      ctx.fillStyle = "#7fff6e";
      ctx.font = `11px Syne, sans-serif`;
      ctx.fillText("Klik — opnieuw", W / 2, H / 2 + 43);
      return;
    }

    const interval = Math.max(80, 130 - score * 2);
    if (ts - last > interval) {
      last = ts;
      dir  = nextDir;

      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      // Muren
      if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) { alive = false; return; }
      // Zichzelf
      if (snake.some((s) => s.x === head.x && s.y === head.y))           { alive = false; return; }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score++;
        food = randomFood();
      } else {
        snake.pop();
      }
    }

    // Teken snake
    snake.forEach((s, i) => {
      const t = i / snake.length;
      ctx.fillStyle = i === 0
        ? "#a0ff80"
        : `hsl(130, ${80 - t * 20}%, ${55 - t * 15}%)`;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });

    // Voedsel
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.arc(
      food.x * CELL + CELL / 2,
      food.y * CELL + CELL / 2,
      CELL / 2 - 1, 0, Math.PI * 2
    );
    ctx.fill();

    // HUD
    ctx.fillStyle = "#5a5";
    ctx.font = `${Math.min(W / 20, 11)}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText("score: " + score, 5, 15);
    ctx.fillStyle = "#333";
    ctx.font = `${Math.min(W / 24, 10)}px monospace`;
    ctx.fillText("WASD of pijltjes", 5, H - 5);
  }

  requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(animId);
    document.removeEventListener("keydown", onKey);
  };
}
