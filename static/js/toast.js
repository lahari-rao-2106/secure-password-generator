/* =====================================================================
   toast.js  —  Top-right toast stack
   Auto-dismisses after `duration` ms. Falls back to console if no DOM.
   Exposes window.__toast for circular-free use by toggles.js.
   ===================================================================== */

const DEFAULT_DURATION = 3000;

function ensureStack() {
    let stack = document.querySelector(".toast-stack");
    if (!stack) {
        stack = document.createElement("div");
        stack.className = "toast-stack";
        stack.setAttribute("role", "status");
        stack.setAttribute("aria-live", "polite");
        document.body.appendChild(stack);
    }
    return stack;
}

const ICONS = {
    success: "✓",
    error:   "✕",
    info:    "ℹ",
};

export function showToast(message, type = "info", duration = DEFAULT_DURATION) {
    const stack = ensureStack();
    const el    = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.innerHTML = `
        <span class="toast__icon" aria-hidden="true">${ICONS[type] || "•"}</span>
        <span class="toast__msg"></span>
    `;
    el.querySelector(".toast__msg").textContent = message;
    stack.appendChild(el);

    const remove = () => {
        el.classList.add("is-leaving");
        setTimeout(() => el.remove(), 350);
    };

    el.addEventListener("click", remove);
    setTimeout(remove, duration);
}

// Expose a window-level helper for modules that can't import us
// (e.g. toggles.js, to avoid a circular dependency with main.js).
window.__toast = showToast;
