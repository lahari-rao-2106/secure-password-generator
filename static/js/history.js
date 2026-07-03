/* =====================================================================
   history.js  —  Fetch + render the recent passwords
   Uses the /history endpoint. Each row has a copy button.

   Behavior:
   - Fetches up to MAX_ITEMS (10) most recent passwords.
   - Renders them all into the list, but the list is *collapsed* by
     default (CSS hides items past the third via data-collapsed="true").
   - The "View more" / "View less" button (wired in initHistory) flips
     the data-collapsed attribute, which expands or collapses the list.
   - The count badge in the header is updated to reflect the total.
   ===================================================================== */

import { getJSON }    from "./api.js";
import { copyText }   from "./copy.js";
import { showToast }  from "./toast.js";

const MAX_ITEMS = 10;   // we fetch up to 10; show 3 by default.

/* Bind the expand/collapse button once on init. It is a stateful toggle
   that only makes sense as long as the list exists, so we cache the
   elements here. */
let _els = null;

function collectEls() {
    if (_els) return _els;
    const list   = document.getElementById("historyList");
    const expand = document.getElementById("expandHistoryBtn");
    if (!list || !expand) return null;
    _els = { list, expand };
    return _els;
}

/* Wire the expand/collapse button + restore its label. */
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

export async function refreshHistory() {
    const list  = document.getElementById("historyList");
    const count = document.getElementById("historyCount");
    if (!list) return;

    const { ok, data } = await getJSON(`/history?limit=${MAX_ITEMS}`);
    if (!ok) return;

    const history = data.history || [];

    // Update the count badge (or hide it when there are 0 items).
    if (count) {
        count.textContent = String(history.length);
        if (history.length === 0) {
            count.style.display = "none";
        } else {
            count.style.display = "";
        }
    }

    if (history.length === 0) {
        list.innerHTML = '<li class="history__empty">No history yet — generate your first password.</li>';
        return;
    }

    list.innerHTML = "";
    history.forEach((pwd, idx) => {
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
