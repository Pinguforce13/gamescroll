// js/editor/steps.js — Stap-voor-stap leer-content

const LEARN_STEPS = [
  {
    label: "🎨 Stap 1: Canvas instellen",
    code: `// Stap 1: Canvas instellen
// De canvas is jouw speelveld — alles teken je hier op.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 300;

// Achtergrond zwart maken
ctx.fillStyle = '#0a0a0f';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Tekst tekenen
ctx.fillStyle = '#7fff6e';
ctx.font = '20px monospace';
ctx.textAlign = 'center';
ctx.fillText('Canvas werkt! 🎮', canvas.width / 2, canvas.height / 2);`,
  },
  {
    label: "🟢 Stap 2: Speler tekenen",
    code: `// Stap 2: Speler toevoegen
// We tekenen een cirkel als speler.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 300;

const player = {
  x: 200,      // horizontale positie
  y: 250,      // verticale positie
  radius: 18,  // grootte
  color: '#7fff6e'
};

function draw() {
  // Achtergrond opnieuw tekenen (wist vorige frame)
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Speler tekenen
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#888';
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Volgende stap: beweging toevoegen!', 10, 20);
}

draw();`,
  },
  {
    label: "⌨️ Stap 3: Beweging toevoegen",
    code: `// Stap 3: Speler bewegen met pijltjestoetsen
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 300;

const player = { x: 200, y: 250, radius: 18, speed: 5 };
const keys = {};

// Bijhouden welke toetsen ingedrukt zijn
window.addEventListener('keydown', e => { keys[e.key] = true; e.preventDefault(); });
window.addEventListener('keyup',   e => { keys[e.key] = false; });

function update() {
  if (keys['ArrowLeft']  && player.x > player.radius)                    player.x -= player.speed;
  if (keys['ArrowRight'] && player.x < canvas.width  - player.radius)    player.x += player.speed;
  if (keys['ArrowUp']    && player.y > player.radius)                    player.y -= player.speed;
  if (keys['ArrowDown']  && player.y < canvas.height - player.radius)    player.y += player.speed;
}

function draw() {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#7fff6e';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#888';
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Gebruik de pijltjestoetsen!', 10, 20);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();`,
  },
  {
    label: "💥 Stap 4: Vijanden & botsingen",
    code: `// Stap 4: Vallende vijanden + botsingsdetectie + score
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 300;

const player = { x: 200, y: 270, radius: 14, speed: 5 };
const enemies = [];
const keys = {};
let score = 0;
let alive = true;

window.addEventListener('keydown', e => { keys[e.key] = true; e.preventDefault(); });
window.addEventListener('keyup',   e => { keys[e.key] = false; });

// Elke 900ms een nieuwe vijand
setInterval(() => {
  if (!alive) return;
  enemies.push({
    x: Math.random() * (canvas.width - 20) + 10,
    y: -15,
    radius: 10,
    speed: 2 + score / 150
  });
}, 900);

function checkCollision(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy) < a.radius + b.radius;
}

function update() {
  if (!alive) return;
  score++;

  if (keys['ArrowLeft']  && player.x > player.radius)                 player.x -= player.speed;
  if (keys['ArrowRight'] && player.x < canvas.width - player.radius)  player.x += player.speed;

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed;
    if (enemies[i].y > canvas.height + 20) { enemies.splice(i, 1); continue; }
    if (checkCollision(player, enemies[i])) { alive = false; break; }
  }
}

function draw() {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!alive) {
    ctx.fillStyle = '#ff6eb4';
    ctx.font = 'bold 26px Syne, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 15);
    ctx.fillStyle = '#333';
    ctx.fillRect(canvas.width / 2 - 45, canvas.height / 2 + 30, 90, 28);
    ctx.fillStyle = '#7fff6e';
    ctx.font = '12px Syne, sans-serif';
    ctx.fillText('Klik — opnieuw', canvas.width / 2, canvas.height / 2 + 49);
    return;
  }

  enemies.forEach(e => {
    ctx.fillStyle = '#ff6eb4';
    ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
  });

  ctx.fillStyle = '#7fff6e';
  ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = '12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 8, 18);
}

canvas.addEventListener('click', () => {
  if (!alive) {
    alive = true; score = 0;
    player.x = canvas.width / 2;
    enemies.length = 0;
  }
});

function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();`,
  },
  {
    label: "🚀 Stap 5: Publiceer je game!",
    code: `// 🎉 Jouw game is klaar om te posten!
//
// Wat je nog kan toevoegen om het cooler te maken:
//
// 🎵 Geluid met AudioContext:
//   const ctx = new AudioContext();
//   // maak oscillator voor biep-geluiden
//
// 💾 Highscore opslaan:
//   localStorage.setItem('highscore', score);
//   const best = localStorage.getItem('highscore') ?? 0;
//
// 🌈 Levels met moeilijkheidsgraad:
//   const level = Math.floor(score / 500) + 1;
//   const speed = 2 + level * 0.5;
//
// ✨ Particle-explosie bij botsing:
//   particles.push({ x, y, vx: random, vy: random, life: 30 });
//
// Druk nu op "📤 Post" om je game in de feed te zetten!`,
  },
];

function buildSteps() {
  const container = document.getElementById("aiSteps");
  container.innerHTML = "";

  LEARN_STEPS.forEach((step, i) => {
    const btn = document.createElement("button");
    btn.className = "ai-step";
    btn.textContent = step.label;
    btn.addEventListener("click", () => loadStep(i));
    container.appendChild(btn);
  });
}

function loadStep(idx) {
  document.getElementById("codeArea").value = LEARN_STEPS[idx].code;

  // Markeer actieve stap
  document.querySelectorAll(".ai-step").forEach((el, i) =>
    el.classList.toggle("active", i === idx)
  );

  showToast(`Stap ${idx + 1} geladen! 📖`);
}
