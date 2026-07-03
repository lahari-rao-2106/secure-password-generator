/* =====================================================================
   strength.js  —  Strength label + animated progress bar
   ===================================================================== */

const LEVEL_WIDTH = {
    Weak:   30,
    Medium: 65,
    Strong: 100,
};

export function renderStrength(labelEl, fillEl, level) {
    if (!labelEl || !fillEl) return;

    labelEl.textContent = level;
    labelEl.setAttribute("data-level", level);

    const width = LEVEL_WIDTH[level] ?? 0;
    fillEl.setAttribute("data-level", level);
    fillEl.style.setProperty("--strength-width", `${width}%`);
    // Reset the CSS animation so it runs from 0 → target each time
    fillEl.style.animation = "none";
    void fillEl.offsetWidth;
    fillEl.style.animation = "";
}
