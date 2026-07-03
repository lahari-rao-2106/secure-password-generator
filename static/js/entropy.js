/* =====================================================================
   entropy.js  —  Animated entropy readout
   Counts up from 0 → target on every render. Quality label uses the
   standard shannon-entropy thresholds.
   ===================================================================== */

function qualityFor(bits) {
    if (bits < 40)  return { label: "Low",       text: "Low Security"      };
    if (bits < 60)  return { label: "Medium",    text: "Decent Security"   };
    if (bits < 80)  return { label: "High",      text: "Strong Security"   };
    return            { label: "Excellent", text: "Excellent Security" };
}

function animateNumber(el, target, duration = 600) {
    const start  = parseFloat(el.dataset.value || "0");
    const startT = performance.now();

    function tick(now) {
        const t      = Math.min(1, (now - startT) / duration);
        const eased = 1 - Math.pow(1 - t, 3);  // easeOutCubic
        const value = start + (target - start) * eased;
        el.textContent = Number.isInteger(target) ? Math.round(value) : value.toFixed(2);
        if (t < 1) requestAnimationFrame(tick);
        else el.dataset.value = String(target);
    }
    requestAnimationFrame(tick);
}

export function renderEntropy(valueEl, qualityEl, bits) {
    if (!valueEl || !qualityEl) return;
    const q = qualityFor(bits);
    animateNumber(valueEl, bits, 700);
    qualityEl.textContent = q.text;
    qualityEl.setAttribute("data-level", q.label);
}
