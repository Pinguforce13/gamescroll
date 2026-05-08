// js/games/dodge.js

function initDodge(canvas, ctx) {
  const W = canvas.width, H = canvas.height;
  const player = { x: W / 2, y: H - 40, w: 32, h: 14 };
  const enemies = [];
  const keys = {};
  let score = 0, alive = true, lastEnemy = 0;
  let animId;

  function onKey(e) { keys[e.key] = e.type === "keydown"; }
  document.addEventListener("keydown", onKey);
  document.addEventListener("keyup",   onKey);

  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    player.x = (e.clientX - r.left) * (W / r.width) - player.w / 2;
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    player.x = (e.touches[0].clientX - r.left) * (W / r.width) - player.w / 2;
  }, { passive: false });

  canvas.addEventListener("click", () => {
    if (!alive) {
      alive = true; score = 0;
      player.x = W / 2 - player.w / 2;
      enemies.length = 0;
    }
  });

  function loop(ts) {
    animId = requestAnimationFrame(loop);
    ctx.fillStyle = "#07071a";
    ctx.fillRect(0, 0, W, H);

    if (!alive) {
      ctx.fillStyle = "#ff6eb4";
      ctx.font = `bold ${Math.min(W / 10, 24)}px Syne, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Game Over!", W / 2, H / 2 - 18);
      ctx.fillStyle = "#888";
      ctx.font = `${Math.min(W / 14, 14)}px monospace`;
      ctx.fillText("Score: " + score, W / 2, H / 2 + 10);
      ctx.fillStyle = "#1a1a3a";
      ctx.fillRect(W / 2 - 48, H / 2 + 24, 96, 30);
      ctx.fillStyle = "#4488ff";
      ctx.font = `${Math.min(W / 16, 12)}px Syne, sans-serif`;
      ctx.fillText("Klik — opnieuw", W / 2, H / 2 + 44);
      return;
    }

    if (keys["ArrowLeft"]  || keys["a"]) player.x = Math.max(0, player.x - 5);
    if (keys["ArrowRight"] || keys["d"]) player.x = Math.min(W - player.w, player.x + 5);
    player.x = Math.max(0, Math.min(W - player.w, player.x));

    if (ts - lastEnemy > Math.max(400, 900 - score / 3)) {
      enemies.push({
        x: Math.random() * (W - 36) + 4,
        y: -20,
        w: 28 + Math.random() * 32,
        h: 12,
        speed: 2 + score / 250,
      });
      lastEnemy = ts;
    }

    score++;

    for (let i = enemies.length - 1; i >= 0; i--) {
      const en = enemies[i];
      en.y += en.speed;
      if (en.y > H + 20) { enemies.splice(i, 1); continue; }

      ctx.fillStyle = "#4488ff";
      ctx.fillRect(en.x, en.y, en.w, en.h);

      if (
        en.y + en.h > player.y &&
        en.y < player.y + player.h &&
        en.x + en.w > player.x &&
        en.x < player.x + player.w
      ) {
        alive = false;
      }
    }

    ctx.fillStyle = "#7fff6e";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = "#aaa";
    ctx.font = `${Math.min(W / 20, 11)}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText("score: " + score, 6, 16);
    ctx.fillStyle = "#444";
    ctx.font = `${Math.min(W / 24, 10)}px monospace`;
    ctx.fillText("muis of ← →", 6, H - 6);
  }

  requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(animId);
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keyup",   onKey);
  };
}
