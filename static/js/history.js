/* =====================================================================
   history.js  —  In-memory session-only password history
   ---------------------------------------------------------------------
   Passwords live in a plain JS array. Module scope means the array is
   re-created on every full page load (refresh, navigation, reopening
   the tab) — so a refresh clears all history. Nothing is written to
   localStorage, sessionStorage, IndexedDB, cookies, or the server.

   Behavior:
   - addToHistory(pwd)  → push to the front, dedupe, cap at MAX_HISTORY.
   - getHistory()       → defensive copy for the Download button.
   - clearHistory()     → wipe and re-render (kept for completeness).
   - refreshHistory()   → render the in-memory array.
   - The expand/collapse toggle (#expandHistoryBtn) is still bound in
     initHistory so the existing UI contract is unchanged.
   ===================================================================== */

import { copyText }  from "./copy.js";
import { showToast } from "./toast.js";

const MAX_HISTORY = 10;
let _history = []; // newest first

function collectEls() {
    const list   = document.getElementById("historyList");
    const expand = document.getElementById("expandHistoryBtn");
    if (!list || !expand) return null;
    return { list, expand };
}

/* Wire the expand/collapse button once on init. */
export function initHistory() {
    const els = collectEls();
    if (!els) return;

    els.expand.addEventListener("click", () => {
        const collapsed = els.list.getAttribute("data-collapsed") !== "false";
        els.list.setAttribute("data-collapsed", String(!collapsed));
        els.expand.setAttribute("aria-expanded", String(!collapsed));

        const label = els.expand.querySelector("[data-label]");
        const icon  = els.expand.querySelector("[data-icon]");
        if (label) label.textContent = collapsed ? "View less" : "View more";
        if (icon)  icon.textContent  = collapsed ? "▴" : "▾";
    });
}

/* Public: push a password to the front, dedupe, cap, then re-render. */
export function addToHistory(pwd) {
    if (!pwd) return;
    _history = [pwd, ..._history.filter((p) => p !== pwd)].slice(0, MAX_HISTORY);
    refreshHistory();
}

/* Public: defensive copy of the current history. */
export function getHistory() {
    return _history.slice();
}

/* Public: wipe history (kept for parity with the original API). */
export function clearHistory() {
    _history = [];
    refreshHistory();
}

/* Render the in-memory array into the existing .history__list markup. */
export function refreshHistory() {
    const els = collectEls();
    if (!els) return;

    const list  = els.list;
    const count = document.getElementById("historyCount");

    if (count) {
        count.textContent = String(_history.length);
        count.style.display = _history.length === 0 ? "none" : "";
    }

    if (_history.length === 0) {
        list.innerHTML = '<li class="history__empty">No history yet — generate your first password.</li>';
        return;
    }

    list.innerHTML = "";
    _history.forEach((pwd, idx) => {
        const li = document.createElement("li");
        li.className = "history__item";
        li.style.animationDelay = `${idx * 0.04}s`;
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
