/* =====================================================================
   generate.js  —  Wires the Generate button
   - If bulk count is 1, calls /generate (existing endpoint)
   - If bulk count is 5 or 10, calls /generate-multiple (new endpoint)
   - Adds ripple effect on click + loading state
   ===================================================================== */

import { postJSON } from "./api.js";
import { getBulkCount } from "./bulk.js";

function attachRipple(btn, event) {
    const rect  = btn.getBoundingClientRect();
    const size  = Math.max(rect.width, rect.height);
    const x     = event.clientX - rect.left - size / 2;
    const y     = event.clientY - rect.top  - size / 2;
    const span  = document.createElement("span");
    span.className = "btn__ripple";
    span.style.width  = `${size}px`;
    span.style.height = `${size}px`;
    span.style.left   = `${x}px`;
    span.style.top    = `${y}px`;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 650);
}

export function bindGenerate({ btn, readOptions, onResult, onBulkResult, onError }) {
    if (!btn) return;

    btn.addEventListener("click", async (event) => {
        attachRipple(btn, event);

        // Loading state
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="btn__spinner" aria-hidden="true"></span> Generating…';

        try {
            const options = readOptions();
            const count   = getBulkCount();

            if (count === 1) {
                const res = await postJSON("/generate", options);
                if (!res.ok) { onError(res.error); return; }
                onResult({ ...res.data, passwords: [res.data.password] });
            } else {
                const res = await postJSON("/generate-multiple", { ...options, count });
                if (!res.ok) { onError(res.error); return; }
                onBulkResult(res.data);
            }
        } finally {
            btn.disabled = false;
            btn.innerHTML = original;
        }
    });
}