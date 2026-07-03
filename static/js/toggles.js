/* =====================================================================
   toggles.js  —  Wrapper logic for the option toggles
   Currently no extra behaviour, but having a module gives us a single
   place to add validation (e.g. "at least one toggle must be on").
   ===================================================================== */

const TOGGLE_IDS = ["uppercase", "lowercase", "numbers", "symbols"];

export function initToggles() {
    // Prevent the user from un-checking the last active toggle - it
    // would brick the generator with "Select at least one character type".
    TOGGLE_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("change", () => {
            const anyOn = TOGGLE_IDS.some((other) => other !== id &&
                document.getElementById(other)?.checked);
            if (!anyOn && !el.checked) {
                el.checked = true; // re-check
                showToast("At least one character type must be selected.", "error");
            }
        });
    });
}

// Local toast reference (avoids circular import with main.js)
function showToast(msg, type) {
    window.__toast?.(msg, type);
}
