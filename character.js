/* Safed Kauwa — pixel character
   Geometry taken 1:1 from the Figma "character" page, frame 190:516: 100px blocks,
   black body, mint offset outline, teal arms, checker bow on top. Rebuilt as separate SVG parts so
   each one can move.

   Each moving part is two nested groups:
     .p  = the pose for the current state (eases smoothly between states)
     .l  = the looping animation for the current state (bob, wave, walk…)

   Usage:
     <div data-buddy="main"></div>     animated character, window.Buddy controls it
     <div data-buddy="demo"></div>     extra instance (e.g. the states preview)
     <i data-buddy-icon></i>           static tiny version for the nav
     Buddy.set("happy", 1800)          play a state, then return to idle after 1.8s
*/
(function () {
  const K = "#000202"; // black
  const M = "#6edfc9"; // mint
  const T = "#019a98"; // teal
  const W = "#ffffff";

  // shift Figma coordinates so the viewBox starts at 0 0 (keeps transform-origins simple)
  const OX = 600, OY = 470, VW = 1200, VH = 1270;

  const r = (x, y, w, h, c) => `<rect x="${x - OX}" y="${y - OY}" width="${w}" height="${h}" fill="${c}"/>`;
  const part = (name, ox, oy, inner) => {
    const o = `transform-origin:${ox - OX}px ${oy - OY}px`;
    return `<g class="p p-${name}" style="${o}"><g class="l" style="${o}">${inner}</g></g>`;
  };

  // --- parts (back to front, same stacking as the Figma frame) ---
  const armL = r(768, 1182, 100, 300, M) + r(800, 1200, 100, 300, T);
  const glow = r(1080, 775, 300, 100, M) + r(880, 875, 400, 100, M) + r(880, 975, 100, 300, M); // top + left-side outline
  const bow = r(1414, 686, 100, 100, M) + r(1400, 700, 100, 100, K) + r(1514, 786, 100, 100, M) + r(1500, 800, 100, 100, K);
  const legL = r(975, 1374, 100, 200, M) + r(875, 1474, 100, 100, M) + r(1000, 1400, 100, 100, K) + r(900, 1500, 200, 100, K);
  const legR =
    r(1171, 1382, 200, 100, M) + r(1271, 1482, 100, 200, M) + r(1171, 1582, 100, 100, M) +
    r(1200, 1400, 200, 100, K) + r(1300, 1500, 100, 100, K) + r(1200, 1600, 200, 100, K);
  const body = r(1100, 800, 300, 100, K) + r(900, 900, 600, 400, K) + r(900, 1300, 500, 100, K);
  const eyes = r(1000, 1000, 100, 100, M) + r(1200, 1000, 100, 100, M) + r(992, 992, 44, 44, W) + r(1192, 992, 44, 44, W);
  const mouthSmile = r(1124, 1198, 52, 52, M) + r(1176, 1181, 34, 34, M) + r(1090, 1181, 34, 34, M);
  const mouthOpen = r(1090, 1181, 120, 34, M) + r(1110, 1215, 80, 46, M);
  const mouthFlat = r(1095, 1196, 110, 26, M);
  const armR = r(1500, 1200, 100, 300, T) + r(1529, 1232, 100, 300, M);

  const inner =
    part("shadow", 1160, 1711, `<rect x="${880 - OX}" y="${1700 - OY}" width="560" height="22" fill="${K}" opacity=".18"/>`) +
    part(
      "all", 1150, 1700,
      glow +
      part("legL", 1050, 1400, legL) +
      part("legR", 1300, 1400, legR) +
      part("armL", 900, 1210, armL) +
      body +
      part("bow", 1450, 850, bow) +
      part("eyes", 1150, 1050, eyes) +
      `<g class="mouth m-smile">${mouthSmile}</g><g class="mouth m-open">${mouthOpen}</g><g class="mouth m-flat">${mouthFlat}</g>` +
      part("armR", 1500, 1210, armR)
    );

  const svg = (viewBox) =>
    `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="Safed Kauwa character">${inner}</svg>`;

  const STATES = {
    idle:      { label: "Idle",      say: "" },
    wave:      { label: "Wave",      say: "hi!" },
    typing:    { label: "Typing",    say: "<i></i><i></i><i></i>" },
    thinking:  { label: "Thinking",  say: "hmm…" },
    happy:     { label: "Happy",     say: "yay!" },
    oops:      { label: "Oops",      say: "oops!" },
    walking:   { label: "Walking",   say: "sending…" },
    celebrate: { label: "Celebrate", say: "sent!" },
  };

  class Character {
    constructor(el) {
      this.el = el;
      this.base = "idle";
      el.classList.add("buddy");
      el.innerHTML = `<div class="buddy__bubble" aria-hidden="true"></div>${svg(`0 0 ${VW} ${VH}`)}<div class="buddy__fx" aria-hidden="true"></div>`;
      this.bubble = el.querySelector(".buddy__bubble");
      this.fx = el.querySelector(".buddy__fx");
      this.set(el.dataset.state || "idle");
    }

    /** Play a state. With `ms`, fall back to the base state afterwards. */
    set(state, ms) {
      if (!STATES[state]) return;
      clearTimeout(this.timer);
      if (state !== this.state) {
        this.state = state;
        this.el.dataset.state = state;
        const say = STATES[state].say;
        if (say) this.bubble.innerHTML = say;
        this.el.classList.toggle("talking", !!say);
        clearInterval(this.confettiTimer);
        if (state === "celebrate") {
          let bursts = 0;
          this.confetti();
          this.confettiTimer = setInterval(() => (++bursts >= 2 ? clearInterval(this.confettiTimer) : null, this.confetti()), 1600);
        }
      }
      if (ms) this.timer = setTimeout(() => this.set(this.base), ms);
    }

    confetti() {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const colors = [M, T, W, K];
      for (let i = 0; i < 18; i++) {
        const s = document.createElement("span");
        const a = (Math.PI * 2 * i) / 18 + Math.random() * 0.4;
        const d = 30 + Math.random() * 30;
        s.style.setProperty("--dx", `${Math.cos(a) * d}cqw`);
        s.style.setProperty("--dy", `${Math.sin(a) * d - 20}cqw`);
        s.style.setProperty("--rot", `${Math.round(Math.random() * 360)}deg`);
        s.style.background = colors[i % colors.length];
        this.fx.appendChild(s);
        setTimeout(() => s.remove(), 1300);
      }
    }
  }

  // tight crop for the nav icon (no padding for jumps / speech bubble)
  document.querySelectorAll("[data-buddy-icon]").forEach((el) => (el.innerHTML = svg(`${768 - OX} ${686 - OY} 861 1014`)));

  const instances = [...document.querySelectorAll("[data-buddy]")].map((el) => new Character(el));
  const main = instances.find((c) => c.el.dataset.buddy === "main");

  window.BuddyStates = STATES;
  window.Buddies = instances;
  window.Buddy = main || { set() {}, base: "idle" };

  // a little boop when you click the main character
  main?.el.addEventListener("click", () => main.state !== "walking" && main.set("happy", 1600));
})();
