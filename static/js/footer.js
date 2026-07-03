/* =====================================================================
   footer.js  —  Social-icon micro-interactions
   The actual <a> tags are server-rendered in index.html; this module
   just adds a tactile click feedback (a small "pop" animation) so the
   icons feel alive.
   ===================================================================== */

export function initFooter() {
    const icons = document.querySelectorAll(".social");
    icons.forEach((icon) => {
        icon.addEventListener("click", () => {
            // Tiny "pop" - re-trigger the hover-scale via reflow
            icon.style.transform = "translateY(-2px) scale(0.9)";
            setTimeout(() => {
                icon.style.transform = "";
            }, 120);
        });
    });
}
