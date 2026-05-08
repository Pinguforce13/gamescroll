// js/games/gravity.js

function initGravity(canvas, ctx) {
  const W = canvas.width, H = canvas.height;
  const SPEED = 3;

  let player  = { x: 70, y: H / 2, vy: 0, r: 14, flipped: false };
  let pipes   = [
    { x: W,       gap: randGap() },
    { x: W + 220, gap: randGap() },
  ];
  let score = 0, alive = true;
  let animId;

  const GAP    = Math.min(H * 0.38, 120);
  const PIPE_W = 22;

  function randGap() {
    return GAP / 2 + Math.random() * (H - GAP * 2 - 40) + 20;
  }

  function flip() {
    if (!alive) return;
    player.flipped = !player.flipped;
    player.vy = 0;
  }

  function onKey(e)   { if (e.code === "Space") { e.preventDefault(); flip(); } }
  function onClick()  { if (!alive) { resetGame(); } else flip(); }

  document.addEventListener("keydown", onKey);
  canvas.addEventListener("click",     onClick);

  function resetGame() {
    player = { x: 70, y: H / 2, vy: 0, r: 14, flipped: false };
    pipes  = [
      { x: W,       gap: randGap() },
      { x: W + 220, gap: randGap() },
    ];
    score = 0; alive = true;
  }

  function loop() {
    animId = requestAnimationFrame(loop);
    ctx.fillStyle = "#150a2e";
    ctx.fillRect(0, 0, W, H);

    if (!alive) {
      ctx.fillStyle = "#ff6eb4";
      ctx.font = `bold ${Math.min(W / 9, 24)}px Syne, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Geraakt!", W / 2, H / 2 - 18);
      ctx.fillStyle = "#888";
      ctx.font = `13px monospace`;
      ctx.fillText("Score: " + score, W / 2, H / 2 + 10);
      ctx.fillStyle = "#2a0a2a";
      ctx.fillRect(W / 2 - 50, H / 2 + 24, 100, 28);
      ctx.fillStyle = "#ff6eb4";
      ctx.font = `11px Syne, sans-serif`;
      ctx.fillText("Klik — opnieuw", W / 2, H / 2 + 43);
      return;
    }

    // Physics
    const gravity = player.flipped ? -0.32 : 0.32;
    player.vy += gravity;
    player.vy  = Math.max(-8, Math.min(8, player.vy));
    player.y  += player.vy;

    if (player.y - player.r < 0 || player.y + player.r > H) alive = false;

    // Pipes
    pipes.forEach((pipe) => {
      pipe.x -= SPEED;

      if (pipe.x < -PIPE_W - 10) {
        pipe.x   = W + 150 + Math.random() * 100;
        pipe.gap  = randGap();
        score++;
      }

      const topH = pipe.gap - GAP / 2;
      const botY = pipe.gap + GAP / 2;

      ctx.fillStyle = "#ff6eb4";
      ctx.fillRect(pipe.x, 0,     PIPE_W, topH);
      ctx.fillRect(pipe.x, botY,  PIPE_W, H - botY);

      // Collision
      if (
        player.x + player.r > pipe.x &&
        player.x - player.r < pipe.x + PIPE_W &&
        (player.y - player.r < topH || player.y + player.r > botY)
      ) {
        alive = false;
      }
    });

    // Player
    ctx.fillStyle = player.flipped ? "#c084fc" : "#ff6eb4";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();

    // Pijltje richting zwaartekracht
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    const d = player.flipped ? -1 : 1;
    ctx.moveTo(player.x - 6, player.y - d * 4);
    ctx.lineTo(player.x + 6, player.y - d * 4);
    ctx.lineTo(player.x,     player.y + d * 6);
    ctx.fill();

    // HUD
    ctx.fillStyle = "#aaa";
    ctx.font = `${Math.min(W / 20, 11)}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText("score: " + score, 6, 16);
    ctx.fillStyle = "#444";
    ctx.font = `${Math.min(W / 24, 10)}px monospace`;
    ctx.fillText("spatie of klik = flip", 6, H - 6);
  }

  requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(animId);
    document.removeEventListener("keydown", onKey);
    canvas.removeEventListener("click",     onClick);
  };
}
