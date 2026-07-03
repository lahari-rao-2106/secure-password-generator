/* =====================================================================
   background.js  —  Animated gradient + glow blobs + particles + locks
   The page already has the .bg-* layers in HTML; we only inject the
   floating particles / lock icons and (optionally) tweak the layers.
   ===================================================================== */

const PARTICLE_COUNT = 28;
const LOCK_COUNT     = 4;

export function initBackground() {
    const particlesEl = document.getElementById("bg-particles");
    if (!particlesEl) return;

    particlesEl.innerHTML = "";

    // Plain particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement("span");
        p.className = "particle";
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDuration = `${10 + Math.random() * 14}s`;
        p.style.animationDelay = `${-Math.random() * 18}s`;
        p.style.opacity = (0.3 + Math.random() * 0.6).toFixed(2);
        p.style.setProperty("--dx", `${(Math.random() - 0.5) * 200}px`);
        p.style.setProperty("--dy", `${-300 - Math.random() * 300}px`);
        p.style.transform = `scale(${0.6 + Math.random() * 1.2})`;
        particlesEl.appendChild(p);
    }

    // Floating lock icons
    for (let i = 0; i < LOCK_COUNT; i++) {
        const lock = document.createElement("span");
        lock.className = "particle particle--lock";
        lock.textContent = "🔒";
        lock.style.left = `${Math.random() * 100}%`;
        lock.style.animationDuration = `${18 + Math.random() * 10}s`;
        lock.style.animationDelay = `${-Math.random() * 25}s`;
        lock.style.setProperty("--dx", `${(Math.random() - 0.5) * 250}px`);
        lock.style.setProperty("--dy", `${-400 - Math.random() * 300}px`);
        particlesEl.appendChild(lock);
    }
}
