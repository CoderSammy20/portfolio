const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("c-status");
const CONTACT_ENDPOINT = "https://formspree.io/f/xkjrkvqq"; // anpassen falls anderer Pfad/Dienst

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const nameInput = document.getElementById("c-name");
    const emailInput = document.getElementById("c-email");
    const messageInput = document.getElementById("c-message");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const message = messageInput ? messageInput.value.trim() : "";

    if (!name || !email || !message) {
      if (contactStatus) {
        contactStatus.textContent = "Bitte alle Felder ausfüllen.";
      }
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (contactStatus) {
      contactStatus.textContent = "Nachricht wird gesendet...";
    }

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Senden fehlgeschlagen");
      }

      contactForm.reset();
      if (contactStatus) {
        contactStatus.textContent = "Nachricht gesendet – danke dir!";
      }
    } catch (error) {
      if (contactStatus) {
        contactStatus.textContent =
          error instanceof Error && error.message
            ? error.message
            : "Senden fehlgeschlagen – bitte später erneut versuchen.";
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}