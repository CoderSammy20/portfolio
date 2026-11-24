const MAINTENANCE_MODE_ACTIVE = true;
const WORKER_URL = "https://samtech-access-api.codersammy.workers.dev";

if (MAINTENANCE_MODE_ACTIVE) {
  document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("samtech_unlocked") === "true") {
      return;
    }

    document.body.style.overflow = "hidden";

    const overlay = document.createElement("div");
    overlay.id = "maintenance-overlay";
    overlay.innerHTML = `
      <div class="maintenance-box">
        <div class="maintenance-header">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="maintenance-title">~/sam-tech — status</span>
        </div>
        <div class="maintenance-body">
          <p class="m-code">// 503 · MAINTENANCE_MODE</p>
          <h1>Es werden zurzeit <span>Wartungsarbeiten</span> durchgeführt.</h1>
          <p class="m-text">
            Ich schraube gerade an neuen Features und Updates für <strong>Sam Tech</strong>. 
            Schau gerne gleich noch einmal vorbei!
          </p>
          <p class="m-prompt"><span class="prompt">$</span> system_update --in-progress <span class="cursor">▌</span></p>
          <form id="access-form" class="m-access">
            <input 
              type="text" 
              id="access-code-input" 
              placeholder="Zugangscode eingeben..." 
              autocomplete="off" 
              required 
            />
            <button type="submit" id="access-submit-btn">Freischalten</button>
          </form>
          <p id="access-feedback" class="m-feedback"></p>
        </div>
        <div class="maintenance-footer">
          <a href="impressum/">Impressum</a>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const accessForm = document.getElementById("access-form");
    const codeInput = document.getElementById("access-code-input");
    const feedback = document.getElementById("access-feedback");
    const submitBtn = document.getElementById("access-submit-btn");

    codeInput.addEventListener("input", () => {
      feedback.textContent = "";
    });


    accessForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = codeInput.value.trim();
      if (!code) return;

      submitBtn.disabled = true;
      feedback.textContent = "Code wird geprüft...";

      try {
        const response = await fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          sessionStorage.setItem("samtech_unlocked", "true");
          document.body.style.overflow = "";
          overlay.remove();
        } else {
          feedback.textContent = data.error || "Ungültiger Zugangscode.";
          submitBtn.disabled = false;
        }
      } catch (error) {
        feedback.textContent = "Verbindung zum Server fehlgeschlagen.";
        submitBtn.disabled = false;
      }
    });
  });
}