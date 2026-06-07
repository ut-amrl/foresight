function fallbackCopyTextToClipboard(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.top = "-9999px";
  document.body.appendChild(ta);
  ta.select();

  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}

async function copyBibtex() {
  const el = document.getElementById("bibtexBlock");
  const btn = document.getElementById("copyBibtexBtn");
  const text = el ? el.innerText.trim() : "";

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopyTextToClipboard(text);
    }

    const icon = btn.querySelector("i");
    const oldClass = icon.className;
    icon.className = "fas fa-check";
    setTimeout(() => (icon.className = oldClass), 900);
  } catch (e) {
    console.error("Copy failed:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("copyBibtexBtn");
  if (btn) btn.addEventListener("click", copyBibtex);
});
