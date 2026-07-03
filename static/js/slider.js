/* =====================================================================
   slider.js  —  Range input
   Updates the visible value text and the gradient fill behind the
   thumb so the track reflects progress.
   ===================================================================== */

export function initSlider(slider, valueEl) {
    if (!slider || !valueEl) return;

    const update = () => {
        const min = parseInt(slider.min, 10) || 0;
        const max = parseInt(slider.max, 10) || 100;
        const val = parseInt(slider.value, 10);
        const pct = ((val - min) / (max - min)) * 100;
        slider.style.setProperty("--p", `${pct}%`);
        valueEl.textContent = val;
    };

    slider.addEventListener("input", update);
    update();
}
