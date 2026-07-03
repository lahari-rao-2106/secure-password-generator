/* =====================================================================
   history.js  —  Fetch + render the last N passwords
   Uses the /history endpoint (new). Each row has a copy button.
   ===================================================================== */

import { getJSON }    from "./api.js";
import { copyText }   from "./copy.js";
import { showToast }  from "./toast.js";

const MAX_ITEMS = 5;

export async function refreshHistory() {
    const list = document.getElementById("historyList");
    if (!list) return;
    const { ok, data } = await getJSON(`/history?limit=${MAX_ITEMS}`);
    if (!ok) return;

    const history = data.history || [];
    if (history.length === 0) {
        list.innerHTML = '<li class="history__empty">No history yet — generate your first password.</li>';
        return;
    }

    list.innerHTML = "";
    history.forEach((pwd, idx) => {
        const li = document.createElement("li");
        li.className = "history__item";
        li.style.animationDelay = `${idx * 0.05}s`;
        li.innerHTML = `
            <span class="history__pwd" title="${escapeAttr(pwd)}">${escapeText(pwd)}</span>
            <button class="history__btn-copy" aria-label="Copy password">
                <span aria-hidden="true">📋</span>
            </button>
        `;
        li.querySelector(".history__btn-copy").addEventListener("click", async () => {
            const ok = await copyText(pwd);
            showToast(ok ? "Password copied" : "Copy failed", ok ? "success" : "error");
        });
        list.appendChild(li);
    });
}

function escapeText(s) { return String(s).replace(/[&<>]/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function escapeAttr(s) { return escapeText(s).replace(/"/g, "&quot;"); }
