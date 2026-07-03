/* =====================================================================
   bulk.js  —  Bulk generation count selector + cards render
   ===================================================================== */

import { copyText }    from "./copy.js";
import { showToast }   from "./toast.js";

let activeCount = 1;

export function initBulkSelector() {
    const chips = document.querySelectorAll(".bulk__chip");
    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            chips.forEach((c) => c.classList.remove("is-active"));
            chip.classList.add("is-active");
            activeCount = parseInt(chip.dataset.count, 10) || 1;
        });
    });
}

export function getBulkCount() {
    return activeCount;
}

export function renderBulkPasswords(passwords) {
    const grid = document.getElementById("bulkGrid");
    if (!grid) return;
    const cols = passwords.length === 1 ? 1
                : passwords.length === 5 ? 2
                : 3;
    grid.setAttribute("data-cols", String(cols));
    grid.innerHTML = "";

    if (!passwords || passwords.length === 0) {
        grid.innerHTML = '<div class="bulk__empty">No passwords yet.</div>';
        return;
    }

    passwords.forEach((pwd, idx) => {
        const card = document.createElement("div");
        card.className = "bulk__card";
        card.style.animationDelay = `${idx * 0.06}s`;
        card.innerHTML = `
            <span class="bulk__pwd" title="${escapeAttr(pwd)}">${escapeText(pwd)}</span>
            <button class="bulk__copy" aria-label="Copy password">
                <span aria-hidden="true">📋</span>
            </button>
        `;
        card.querySelector(".bulk__copy").addEventListener("click", async () => {
            const ok = await copyText(pwd);
            showToast(ok ? "Password copied" : "Copy failed", ok ? "success" : "error");
        });
        grid.appendChild(card);
    });
}

// Tiny helpers - never trust content injected into innerHTML
function escapeText(s)  { return String(s).replace(/[&<>]/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function escapeAttr(s)  { return escapeText(s).replace(/"/g, "&quot;"); }
