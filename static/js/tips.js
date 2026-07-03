/* =====================================================================
   tips.js  —  Rotating security tips
   Cycles the .tips__text span's content every 5 seconds.
   ===================================================================== */

const TIPS = [
    "Never reuse passwords across different accounts.",
    "Use a password manager to store unique credentials safely.",
    "Avoid birthdays, names, and dictionary words in passwords.",
    "Enable two-factor authentication wherever possible.",
    "Long passphrases are stronger than short complex strings.",
    "Change passwords immediately if a service is breached.",
    "Don't share passwords over chat or email.",
];

export function initTips() {
    const wrap = document.querySelector(".tips__text");
    if (!wrap) return;
    let i = 0;
    wrap.textContent = TIPS[0];

    setInterval(() => {
        i = (i + 1) % TIPS.length;
        // Re-trigger the CSS animation by swapping content with a reflow
        wrap.style.animation = "none";
        wrap.textContent = TIPS[i];
        void wrap.offsetWidth;
        wrap.style.animation = "";
    }, 5000);
}
