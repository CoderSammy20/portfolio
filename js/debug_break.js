(() => {
  const LEADERBOARD_URL = "https://samtech-access-api.codersammy.workers.dev/leaderboard";

  const stage = document.getElementById("debug-stage");
  const overlay = document.getElementById("debug-overlay");
  const headingEl = document.getElementById("debug-overlay-heading");
  const textEl = document.getElementById("debug-overlay-text");
  const startBtn = document.getElementById("debug-start-btn");
  const nicknameInput = document.getElementById("debug-nickname-input");
  const leaderboardListEl = document.getElementById("debug-leaderboard-list");
  const timeEl = document.getElementById("debug-time");
  const fixedEl = document.getElementById("debug-fixed");

  if (!stage || !overlay || !headingEl || !textEl || !startBtn || !timeEl || !fixedEl) {
    return;
  }

  const ROUND_SECONDS = 20;
  const BUG_LIFETIME_MS = 2400;
  const MIN_DISTANCE = 54;

  // 1: Grün-gelber Käfer, 2: Grüne Raupe, 3: Pink-schwarzer Marienkäfer
  const BUG_SVGS = [
    `<svg viewBox="0 0 36 36" aria-hidden="true">
      <defs>
        <linearGradient id="beetleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#45c486"/>
          <stop offset="100%" stop-color="#e8d474"/>
        </linearGradient>
      </defs>
      <path d="M12 9 L8 5 M24 9 L28 5" stroke="#58c78a" stroke-width="2" stroke-linecap="round"/>
      <path d="M10 15 L5 13 M10 20 L4 20 M10 25 L6 28 M26 15 L31 13 M26 20 L32 20 M26 25 L30 28" stroke="#64c98c" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="18" cy="20" rx="8" ry="9.5" fill="url(#beetleGrad)"/>
      <path d="M14 10.5 Q18 8.5 22 10.5" fill="#329c6b"/>
      <line x1="18" y1="12" x2="18" y2="29.5" stroke="#23493a" stroke-width="1.6"/>
      <circle cx="14.5" cy="18" r="1.3" fill="#b99b2c"/>
      <circle cx="21.5" cy="18" r="1.3" fill="#b99b2c"/>
      <circle cx="14.5" cy="23" r="1.3" fill="#b99b2c"/>
      <circle cx="21.5" cy="23" r="1.3" fill="#b99b2c"/>
    </svg>`,

    `<svg viewBox="0 0 36 36" aria-hidden="true">
      <defs>
        <linearGradient id="wormGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3cd09c"/>
          <stop offset="100%" stop-color="#58b882"/>
        </linearGradient>
      </defs>
      <path d="M10 12 L8 8 M14 12 L15 8" stroke="#4fd19e" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 22 L11 25 M16 23 L15 26 M20 23 L20 26" stroke="#389c78" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 13 C17 13, 18 21, 26 21 C29 21, 29 25, 25 25 C17 25, 16 17, 11 17 C8 17, 8 13, 12 13 Z" fill="url(#wormGrad)"/>
      <circle cx="11" cy="14.5" r="1.3" fill="#122620"/>
    </svg>`,

    `<svg viewBox="0 0 36 36" aria-hidden="true">
      <defs>
        <linearGradient id="ladyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e9386b"/>
          <stop offset="100%" stop-color="#b62657"/>
        </linearGradient>
      </defs>
      <path d="M14 10 L11 7 M22 10 L25 7" stroke="#5b3b56" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M10 16 L6 14 M10 20 L5 20 M10 24 L6 27 M26 16 L30 14 M26 20 L31 20 M26 24 L30 27" stroke="#5b3b56" stroke-width="1.8" stroke-linecap="round"/>
      <ellipse cx="18" cy="20.5" rx="8.2" ry="9" fill="url(#ladyGrad)"/>
      <path d="M13.5 12 Q18 9.5 22.5 12 L21.5 14.5 L14.5 14.5 Z" fill="#2c2433"/>
      <line x1="18" y1="14.5" x2="18" y2="29.5" stroke="#2c2433" stroke-width="1.4"/>
      <circle cx="14.5" cy="18.5" r="1.8" fill="#2c2433"/>
      <circle cx="21.5" cy="18.5" r="1.8" fill="#2c2433"/>
      <circle cx="14.2" cy="24" r="1.6" fill="#2c2433"/>
      <circle cx="21.8" cy="24" r="1.6" fill="#2c2433"/>
    </svg>`,
  ];

  // --- Web Audio: Intense Loop + Squish SFX + Round End ---
  let audioCtx = null;
  let musicTimerId = null;
  let musicStep = 0;

  function ensureAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playSquishSound() {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(520 + Math.random() * 140, now);
    osc.frequency.exponentialRampToValueAtTime(115, now + 0.09);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(340, now + 0.09);
    filter.Q.setValueAtTime(4.2, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  function playRoundEndSound() {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [220, 329.63, 440];

    notes.forEach((freq, idx) => {
      const startAt = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startAt);

      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.linearRampToValueAtTime(0.11, startAt + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      osc.stop(startAt + 0.29);
    });
  }

  function playMusicTick() {
    if (!isPlaying) return;
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bassNotes = [55, 55, 65.41, 55, 73.42, 73.42, 82.41, 73.42];
    const arpNotes = [220, 261.63, 329.63, 440, 329.63, 261.63, 392, 329.63];

    const stepIndex = musicStep % bassNotes.length;
    const isKickBeat = musicStep % 2 === 0;

    if (isKickBeat) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = "sine";
      kickOsc.frequency.setValueAtTime(135, now);
      kickOsc.frequency.exponentialRampToValueAtTime(42, now + 0.11);

      kickGain.gain.setValueAtTime(0.2, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.125);
    }

    const bassOsc = ctx.createOscillator();
    const bassFilter = ctx.createBiquadFilter();
    const bassGain = ctx.createGain();

    bassOsc.type = "sawtooth";
    bassOsc.frequency.setValueAtTime(bassNotes[stepIndex], now);

    bassFilter.type = "lowpass";
    bassFilter.frequency.setValueAtTime(480, now);

    bassGain.gain.setValueAtTime(0.08, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.145);

    const arpOsc = ctx.createOscillator();
    const arpGain = ctx.createGain();
    arpOsc.type = "square";
    arpOsc.frequency.setValueAtTime(arpNotes[musicStep % arpNotes.length], now);

    arpGain.gain.setValueAtTime(0.03, now);
    arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    arpOsc.connect(arpGain);
    arpGain.connect(ctx.destination);
    arpOsc.start(now);
    arpOsc.stop(now + 0.09);

    musicStep += 1;
    if (isPlaying) {
      const intervalMs = timeLeft <= 6 ? 125 : 155;
      musicTimerId = setTimeout(playMusicTick, intervalMs);
    }
  }

  function startIntenseMusic() {
    stopIntenseMusic();
    musicStep = 0;
    playMusicTick();
  }

  function stopIntenseMusic() {
    clearTimeout(musicTimerId);
    musicTimerId = null;
  }

  // --- Leaderboard ---
  let currentPlayerName = "Gast";

  function renderLeaderboard(entries) {
    if (!leaderboardListEl) return;
    leaderboardListEl.innerHTML = "";

    if (!Array.isArray(entries) || entries.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "Noch keine Scores eingetragen.";
      leaderboardListEl.appendChild(emptyItem);
      return;
    }

    entries.slice(0, 10).forEach((entry, index) => {
      const li = document.createElement("li");
      const playerName = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : "Gast";
      const playerScore = Number.isFinite(Number(entry.score)) ? Math.floor(Number(entry.score)) : 0;
      li.textContent = `${playerName} — ${playerScore} Bugs`;
      leaderboardListEl.appendChild(li);
    });
  }

  async function fetchLeaderboard() {
    if (!leaderboardListEl) return;
    try {
      const res = await fetch(LEADERBOARD_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      renderLeaderboard(data);
    } catch (err) {
      leaderboardListEl.innerHTML = "";
      const errItem = document.createElement("li");
      errItem.textContent = "Bestenliste gerade nicht erreichbar.";
      leaderboardListEl.appendChild(errItem);
    }
  }

  async function submitScore(name, score) {
    try {
      const res = await fetch(LEADERBOARD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const updatedTop10 = await res.json();
      renderLeaderboard(updatedTop10);
    } catch (err) {
      // Fehler beim Senden sollen die Endanzeige nicht blockieren
    }
  }

  // --- Game State ---
  let timeLeft = ROUND_SECONDS;
  let fixedCount = 0;
  let isPlaying = false;
  let countdownId = null;
  let spawnId = null;
  let activeTargets = [];

  function renderHud() {
    timeEl.textContent = `${timeLeft}s`;
    fixedEl.textContent = String(fixedCount);
  }

  function clearTargets() {
    activeTargets.forEach((item) => {
      clearTimeout(item.expireId);
      item.el.remove();
    });
    activeTargets = [];
  }

  function clearRoundTimers() {
    clearInterval(countdownId);
    clearInterval(spawnId);
    stopIntenseMusic();
    countdownId = null;
    spawnId = null;
  }

  function isTooClose(x, y) {
    return activeTargets.some((item) => {
      const otherX = parseFloat(item.el.style.left);
      const otherY = parseFloat(item.el.style.top);
      return Math.hypot(otherX - x, otherY - y) < MIN_DISTANCE;
    });
  }

  function spawnBugTarget() {
    if (!isPlaying) return;

    const rect = stage.getBoundingClientRect();
    const padX = 36;
    const padY = 34;

    let x = 0;
    let y = 0;
    let placed = false;

    for (let attempt = 0; attempt < 15; attempt++) {
      const candidateX = padX + Math.random() * Math.max(30, rect.width - padX * 2);
      const candidateY = padY + Math.random() * Math.max(30, rect.height - padY * 2);

      if (!isTooClose(candidateX, candidateY)) {
        x = candidateX;
        y = candidateY;
        placed = true;
        break;
      }
    }

    if (!placed) return;

    const angle = Math.floor(Math.random() * 50 - 25);
    const svgMarkup = BUG_SVGS[Math.floor(Math.random() * BUG_SVGS.length)];

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "debug-target";
    btn.setAttribute("aria-label", "Bug fixen");
    btn.innerHTML = svgMarkup;
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

    const entry = {
      el: btn,
      expireId: setTimeout(() => {
        removeTarget(entry);
      }, BUG_LIFETIME_MS),
    };

    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!isPlaying) return;
      playSquishSound();
      fixedCount += 1;
      renderHud();
      removeTarget(entry);
    });

    stage.appendChild(btn);
    activeTargets.push(entry);
  }

  function removeTarget(entry) {
    clearTimeout(entry.expireId);
    entry.el.remove();
    activeTargets = activeTargets.filter((t) => t !== entry);
  }

  function startRound() {
    const typedName = nicknameInput ? nicknameInput.value.trim().slice(0, 16) : "";
    currentPlayerName = typedName || "Gast";
    if (nicknameInput && typedName) {
      try {
        localStorage.setItem("debug_break_nick", typedName);
      } catch (e) {}
    }

    clearRoundTimers();
    clearTargets();

    timeLeft = ROUND_SECONDS;
    fixedCount = 0;
    isPlaying = true;
    renderHud();
    overlay.classList.add("is-hidden");
    startIntenseMusic();

    spawnBugTarget();
    spawnId = setInterval(spawnBugTarget, 500);

    countdownId = setInterval(() => {
      if (!isPlaying) {
        clearRoundTimers();
        return;
      }

      timeLeft = Math.max(0, timeLeft - 1);
      renderHud();

      if (timeLeft <= 0) {
        finishRound();
      }
    }, 1000);
  }

  function finishRound() {
    if (!isPlaying && timeLeft === 0 && !overlay.classList.contains("is-hidden")) {
      return;
    }

    isPlaying = false;
    timeLeft = 0;
    clearRoundTimers();
    clearTargets();
    renderHud();

    try {
      playRoundEndSound();
    } catch (e) {
      // Audio-Fehler sollen das Rundenende nicht blockieren
    }

    headingEl.innerHTML = `<span>Zeit um! 🎉</span>`;
    textEl.innerHTML = `<span class="debug-accent-num">${currentPlayerName}</span> hat <span class="debug-accent-num">${fixedCount}</span> Bugs gefixt.`;
    startBtn.textContent = "Nochmal spielen";
    overlay.classList.remove("is-hidden");

    submitScore(currentPlayerName, fixedCount);
  }

  if (nicknameInput) {
    try {
      const savedNick = localStorage.getItem("debug_break_nick");
      if (savedNick) nicknameInput.value = savedNick;
    } catch (e) {}
  }

  startBtn.addEventListener("click", startRound);
  fetchLeaderboard();
})();