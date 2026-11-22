const MAINTANCEMODE_ACTIV = true;

if (MAINTANCEMODE_ACTIV) {
  document.addEventListener("DOMContentLoaded", () => {
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
        </div>
        <div class="maintenance-footer">
          <a href="impressum/">Impressum</a>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  });
}