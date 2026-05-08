// js/editor/ai.js
// ─────────────────────────────────────────────────
// Gebruikt de ingebouwde Anthropic API — geen key nodig!
// Werkt op GitHub Pages zonder server.
// ─────────────────────────────────────────────────

const AI_SYSTEM = `Je bent een vriendelijke game-dev coach die beginners leert hoe ze browser-games maken met HTML Canvas en JavaScript.
Geef korte, praktische antwoorden in het Nederlands. Max 4 zinnen tenzij je code geeft.
Als je code geeft, geef dan altijd één werkend blok vanilla JS + Canvas zonder externe libraries.
Geen uitleg buiten de code tenzij gevraagd.`;

async function askAI(question) {
  const responseEl = document.getElementById("aiResponse");
  responseEl.textContent = "Nadenken...";
  responseEl.className = "ai-response loading";

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: AI_SYSTEM,
        messages: [{ role: "user", content: question }],
      }),
    });

    const data = await res.json();
    const text = data?.content?.[0]?.text ?? "Geen antwoord ontvangen.";
    responseEl.className = "ai-response";
    responseEl.textContent = text;
  } catch (err) {
    responseEl.className = "ai-response";
    responseEl.textContent = "⚠️ AI tijdelijk niet beschikbaar. Probeer het opnieuw.";
    console.error("AI fout:", err);
  }
}

function setupAI() {
  const input   = document.getElementById("aiInput");
  const sendBtn = document.getElementById("aiSendBtn");

  function send() {
    const q = input.value.trim();
    if (!q) return;
    askAI(q);
    input.value = "";
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
}
