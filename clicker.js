// js/games/clicker.js

function initClicker(canvas, ctx) {
  const W = canvas.width, H = canvas.height;
  let circles  = [];
  let score    = 0;
  let timeLeft = 10;
  let started  = false;
  let done     = false;
  let lastTick = 0, lastCircle = 0;
  let animId;

  function spawnCircle(ts) {
    const r = 18 + Math.random() * 22;
    circles.push({
      x:    r + Math.random() * (W - r * 2),
      y:    r + Math.random() * (H - r * 2 - 30),
      r,
      born: ts,
      life: 1.4,
    });
  }

  function onClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top)  * (H / rect.height);

    if (!started && !done) { started = true; return; }

    if (done) {
      score = 0; timeLeft = 10; started = true; done = false; circles = [];
      return;
    }

    for (let i = circles.length - 1; i >= 0; i--) {
      if (Math.hypot(mx - circles[i].x, my - circles[i].y) < circles[i].r) {
        circles.splice(i, 1);
        score++;
        break;
      }
    }
  }

  function onTouch(e) {
    e.preventDefault();
    onClick({
      clientX: e.changedTouches[0].clientX,
      clientY: e.changedTouches[0].clientY,
    });
  }

  canvas.addEventListener("click",     onClick);
  canvas.addEventListener("touchend",  onTouch, { passive: false });

  function loop(ts) {
    animId = requestAnimationFrame(loop);
    ctx.fillStyle = "#0f0a1e";
    ctx.fillRect(0, 0, W, H);

    if (!started && !done) {
      ctx.fillStyle = "#c084fc";
      ctx.font = `bold ${Math.min(W / 7, 28)}px Syne, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Click Chaos", W / 2, H / 2 - 20);
      ctx.fillStyle = "#888";
      ctx.font = `13px monospace`;
      ctx.fillText("Klik om te starten", W / 2, H / 2 + 15);
      return;
    }

    // Timer tick
    if (!done && ts - lastTick > 1000) {
      timeLeft--;
      lastTick = ts;
      if (timeLeft <= 0) { done = true; timeLeft = 0; }
    }

    // Spawn circles
    const interval = Math.max(250, 420 - score * 8);
    if (!done && ts - lastCircle > interval) {
      spawnCircle(ts);
      lastCircle = ts;
    }

    // Remove expired circles
    circles = circles.filter((c) => (ts - c.born) / 1000 < c.life);

    // Draw circles
    circles.forEach((c) => {
      const age   = (ts - c.born) / 1000;
      const alpha = Math.max(0, 1 - age / c.life);

      ctx.globalAlpha = alpha;
      ctx.fillStyle   = "#c084fc";
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.floor(c.r * 0.85)}px Syne, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("+1", c.x, c.y + c.r * 0.35);
      ctx.globalAlpha = 1;
    });

    // HUD
    ctx.fillStyle = "#c084fc";
    ctx.font = `bold ${Math.min(W / 8, 22)}px Space Mono, monospace`;
    ctx.textAlign = "left";
    ctx.fillText(score, 10, 26);

    ctx.textAlign = "right";
    if (!done) {
      ctx.fillStyle = timeLeft <= 3 ? "#ff4444" : "#aaa";
      ctx.font = `bold ${Math.min(W / 8, 22)}px Space Mono, monospace`;
      ctx.fillText(timeLeft + "s", W - 8, 26);
    }

    if (done) {
      ctx.fillStyle = "rgba(15,10,30,0.7)";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#c084fc";
      ctx.font = `bold ${Math.min(W / 7, 26)}px Syne, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Score: " + score, W / 2, H / 2 - 14);

      ctx.fillStyle = "#888";
      ctx.font = `12px monospace`;
      ctx.fillText("Klik om opnieuw te spelen", W / 2, H / 2 + 16);
    }
  }

  requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(animId);
    canvas.removeEventListener("click",    onClick);
    canvas.removeEventListener("touchend", onTouch);
  };
}
