// js/app.js — Hoofdcontroller: events, tabs, editor, live preview

// ── INIT ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  buildFeed();        // feed.js
  buildSteps();       // editor/steps.js
  setupAI();          // editor/ai.js
  setupObserver();
  setupEvents();
  loadStep(0);        // laad eerste leer-stap standaard in editor
});

// ── TAB NAVIGATIE ────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll(".nav-tab").forEach((el) =>
    el.classList.toggle("active", el.dataset.tab === tab)
  );

  const editorPanel = document.getElementById("editorPanel");
  const feed        = document.getElementById("feed");

  if (tab === "feed") {
    editorPanel.hidden = true;
    feed.classList.remove("split");
  } else {
    editorPanel.hidden = false;
    feed.classList.add("split");

    if (tab === "make") {
      document.getElementById("codeArea").value = LEARN_STEPS[LEARN_STEPS.length - 1].code;
      showToast("Editor geopend — schrijf jouw game! ✏️");
    } else if (tab === "learn") {
      loadStep(0);
      showToast("Klik een stap om te beginnen leren! 📚");
    }
  }
}

function closeEditor() {
  switchTab("feed");
}

// ── EVENT BINDING ────────────────────────────────────────────
function setupEvents() {
  // Nav tabs
  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Sluit editor
  document.getElementById("closeEditor").addEventListener("click", closeEditor);

  // Run code → live preview
  document.getElementById("runBtn").addEventListener("click", runCode);

  // Post game
  document.getElementById("postBtn").addEventListener("click", postGame);

  // Sluit preview
  document.getElementById("closePreview").addEventListener("click", () => {
    document.getElementById("previewPanel").hidden = true;
  });

  // Event-delegatie voor feed-acties (like, deel, code-peek, CTA)
  document.getElementById("slidesContainer").addEventListener("click", (e) => {
    const likeBtn  = e.target.closest("[id^='likeBtn-']");
    const shareBtn = e.target.closest("[data-share]");
    const peekBtn  = e.target.closest("[data-peek]");
    const ctaBtn   = e.target.closest("#ctaMakeBtn");

    if (likeBtn)  toggleLike(parseInt(likeBtn.id.replace("likeBtn-", "")));
    if (shareBtn) { navigator.clipboard?.writeText(location.href); showToast("Link gekopieerd! 🔗"); }
    if (peekBtn)  peekCode(parseInt(peekBtn.dataset.peek));
    if (ctaBtn)   switchTab("make");
  });
}

// ── GAME OBSERVER (scroll-snap aware) ───────────────────────
function setupObserver() {
  const activeIds = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = parseInt(entry.target.dataset.gameId);
        if (!id) return;
        const game = GAMES.find((g) => g.id === id);
        if (!game) return;

        if (entry.isIntersecting && !activeIds.has(id)) {
          activeIds.add(id);
          // Klein delay zodat de canvas zijn finale grootte heeft
          setTimeout(() => initGame(game), 120);
        } else if (!entry.isIntersecting && activeIds.has(id)) {
          activeIds.delete(id);
          if (gameCleanups.has(id)) {
            gameCleanups.get(id)();
            gameCleanups.delete(id);
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  // Observe zodra slides gebouwd zijn
  setTimeout(() => {
    document.querySelectorAll(".slide[data-game-id]").forEach((s) =>
      observer.observe(s)
    );
  }, 100);
}

// ── LIVE PREVIEW ─────────────────────────────────────────────
function runCode() {
  const code = document.getElementById("codeArea").value.trim();
  if (!code) { showToast("Schrijf eerst wat code! 😅"); return; }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0a0a0f; display:flex; align-items:center; justify-content:center; height:100vh; overflow:hidden; }
  canvas { max-width:100%; max-height:100%; }
</style>
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script>
    const canvas = document.getElementById('gameCanvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ${code}
  <\/script>
</body>
</html>`;

  const frame = document.getElementById("previewFrame");
  frame.srcdoc = html;
  document.getElementById("previewPanel").hidden = false;

  showToast("Live preview gestart! ▶");
}

// ── POST GAME ────────────────────────────────────────────────
function postGame() {
  const code = document.getElementById("codeArea").value.trim();
  if (code.length < 30) { showToast("Schrijf eerst je game! 😅"); return; }

  // In een echte app: POST naar je backend/database
  // Voor nu: voeg toe aan de feed als demo
  const demoGame = {
    id: Date.now(),
    title: "Mijn game",
    author: "jij",
    desc: "Zelfgemaakte game!",
    tags: ["eigen", "nieuw"],
    likes: 0,
    color: "#7fff6e",
    bg: "slide-bg-1",
    type: null,        // null = custom code
    customCode: code,
  };

  GAMES.unshift(demoGame);
  showToast("🎉 Game gepost! Scroll naar boven om hem te zien.");
  closeEditor();
}

// ── CODE PEEK ────────────────────────────────────────────────
const GAME_CODE_PREVIEWS = {
  1: `// Dodge Blitz — kern-logica
const player = { x: W/2, y: H-40, w: 30, h: 16 };
const enemies = [];

// Nieuwe vijand elke 900ms
setInterval(() => {
  enemies.push({
    x: Math.random() * (W - 30),
    y: -20, w: 30, h: 12,
    speed: 2 + score / 200
  });
}, 900);

// Botsing controleren
if (enemy.y + enemy.h > player.y &&
    enemy.x + enemy.w > player.x &&
    enemy.x < player.x + player.w) {
  alive = false; // Game over!
}`,

  2: `// Snake 2.0 — bewegingslogica
const snake = [{ x: 5, y: 5 }];
let dir = { x: 1, y: 0 };

// Elke 130ms de snake verplaatsen
function tick() {
  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  // Voeg hoofd toe
  snake.unshift(head);

  // Eten? Groei! Anders, verwijder staart
  if (atFood(head)) { score++; spawnFood(); }
  else              { snake.pop(); }
}`,

  3: `// Gravity Flip — zwaartekracht omdraaien
let flipped = false;

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    flipped = !flipped;
    player.vy = 0; // reset snelheid bij flip
  }
});

// Elke frame
const gravity = flipped ? -0.3 : 0.3;
player.vy += gravity;
player.y  += player.vy;

// Grenzen bewaken
if (player.y < 0 || player.y > H) alive = false;`,

  4: `// Pong Wars — AI-paddle + bal-physics
const ball = { x: W/2, y: H/2, vx: 3, vy: 2 };

// AI-paddle volgt de bal (met vertraging)
ai.y += (ball.y - ai.y - ph/2) * 0.06;

// Bal stuitert van speler-paddle
if (ball.x <= pw + 10 && inPaddle(player, ball)) {
  ball.vx = Math.abs(ball.vx) + 0.15; // sneller bij elke raking
  ball.vy += (ball.y - player.y - ph/2) * 0.05;
}`,

  5: `// Click Chaos — klik-detectie
function spawnCircle() {
  circles.push({
    x:    Math.random() * W,
    y:    Math.random() * H,
    r:    18 + Math.random() * 22,
    born: performance.now(),
    life: 1.5  // seconden zichtbaar
  });
}

// Raken? Punt erbij
canvas.addEventListener('click', e => {
  const mx = e.offsetX, my = e.offsetY;
  circles.forEach((c, i) => {
    if (Math.hypot(mx - c.x, my - c.y) < c.r) {
      circles.splice(i, 1); score++;
    }
  });
});`,
};

function peekCode(id) {
  const code = GAME_CODE_PREVIEWS[id];
  if (!code) { showToast("Geen code beschikbaar"); return; }

  document.getElementById("codeArea").value = code;
  switchTab("make");
  showToast("Code geladen! Bekijk hoe het werkt 👀");
}

// ── TOAST ────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}
