// js/feed.js — Slide data + DOM builder

const GAMES = [
  {
    id: 1,
    title: "Dodge Blitz",
    author: "xX_lena_Xx",
    desc: "Ontwijkt de vallende blokken zolang mogelijk. ↔️ Muis of pijltjes.",
    tags: ["arcade", "survival"],
    likes: 2341,
    color: "#4488ff",
    bg: "slide-bg-1",
    type: "dodge",
  },
  {
    id: 2,
    title: "Snake 2.0",
    author: "code_noah",
    desc: "Klassieke snake maar met toenemende snelheid. WASD of pijltjes.",
    tags: ["klassiek", "snake"],
    likes: 5892,
    color: "#7fff6e",
    bg: "slide-bg-3",
    type: "snake",
  },
  {
    id: 3,
    title: "Gravity Flip",
    author: "juliette.dev",
    desc: "Druk spatie of klik om zwaartekracht om te keren. Raak niets!",
    tags: ["platformer", "moeilijk"],
    likes: 1204,
    color: "#ff6eb4",
    bg: "slide-bg-2",
    type: "gravity",
  },
  {
    id: 4,
    title: "Pong Wars",
    author: "retro_remi",
    desc: "Jij vs AI in de ultieme pong battle. Gebruik je muis of vinger!",
    tags: ["retro", "pong"],
    likes: 987,
    color: "#ffb86e",
    bg: "slide-bg-4",
    type: "pong",
  },
  {
    id: 5,
    title: "Click Chaos",
    author: "meme.games",
    desc: "Klik zoveel mogelijk cirkels in 10 seconden. Hoe snel ben jij? 🖱️",
    tags: ["clicker", "snel"],
    likes: 4412,
    color: "#c084fc",
    bg: "slide-bg-5",
    type: "clicker",
  },
];

// Tracks liked games (in-memory — replace with localStorage or backend for persistence)
const likedGames = new Set();

// Active game loop cleanup functions
const gameCleanups = new Map();

function buildFeed() {
  const container = document.getElementById("slidesContainer");

  GAMES.forEach((game) => {
    const slide = document.createElement("div");
    slide.className = `slide ${game.bg}`;
    slide.dataset.gameId = game.id;

    slide.innerHTML = `
      <div class="game-header">
        <div class="game-meta">
          <div class="avatar" style="background:${game.color}22;color:${game.color};">
            ${game.author[0].toUpperCase()}
          </div>
          <div class="game-info">
            <div class="game-title">${game.title}</div>
            <div class="game-author">@${game.author}</div>
          </div>
        </div>
        <div class="game-desc">${game.desc}</div>
      </div>

      <div class="game-area" id="area-${game.id}">
        <canvas id="canvas-${game.id}"></canvas>
      </div>

      <div class="action-bar">
        <div class="game-tags">
          ${game.tags.map((t) => `<span class="tag">#${t}</span>`).join("")}
        </div>
        <button class="action-btn" id="likeBtn-${game.id}" aria-label="Like">
          <i class="ti ti-heart"></i>
          <span class="action-count" id="likeCount-${game.id}">${game.likes.toLocaleString()}</span>
        </button>
        <button class="action-btn" data-share="${game.id}" aria-label="Deel">
          <i class="ti ti-share"></i>
          <span>deel</span>
        </button>
        <button class="code-peek-btn" data-peek="${game.id}">&lt;/&gt; code</button>
      </div>
    `;

    container.appendChild(slide);
  });

  // CTA slide — jouw game hier
  const cta = document.createElement("div");
  cta.className = "slide slide-bg-5";
  cta.innerHTML = `
    <div class="cta-slide">
      <div class="emoji">🎮</div>
      <h2>Jouw game hier?</h2>
      <p>Maak je eigen game en post hem in de feed. Anderen kunnen liken, spelen en jouw code bekijken!</p>
      <button id="ctaMakeBtn">✏️ Start jouw game</button>
    </div>
  `;
  container.appendChild(cta);
}

function initGame(game) {
  const canvas = document.getElementById(`canvas-${game.id}`);
  const area = document.getElementById(`area-${game.id}`);
  if (!canvas || !area) return;

  canvas.width = area.clientWidth || 400;
  canvas.height = area.clientHeight || 280;
  const ctx = canvas.getContext("2d");

  // Cleanup previous loop if any
  if (gameCleanups.has(game.id)) {
    gameCleanups.get(game.id)();
    gameCleanups.delete(game.id);
  }

  const initializers = {
    dodge:   () => initDodge(canvas, ctx),
    snake:   () => initSnake(canvas, ctx),
    gravity: () => initGravity(canvas, ctx),
    pong:    () => initPong(canvas, ctx),
    clicker: () => initClicker(canvas, ctx),
  };

  if (initializers[game.type]) {
    const cleanup = initializers[game.type]();
    if (typeof cleanup === "function") gameCleanups.set(game.id, cleanup);
  }
}

function toggleLike(id) {
  const game = GAMES.find((g) => g.id === id);
  if (!game) return;

  const btn   = document.getElementById(`likeBtn-${id}`);
  const count = document.getElementById(`likeCount-${id}`);
  const icon  = btn.querySelector("i");

  if (likedGames.has(id)) {
    likedGames.delete(id);
    game.likes--;
    btn.classList.remove("liked");
    icon.className = "ti ti-heart";
  } else {
    likedGames.add(id);
    game.likes++;
    btn.classList.add("liked");
    icon.className = "ti ti-heart-filled";
  }

  count.textContent = game.likes.toLocaleString();
}
