/* =====================================================================
   copy.js  —  Clipboard helper with fallback
   Returns true on success. Uses the modern Clipboard API when
   available; falls back to a hidden <textarea> + execCommand for
   older browsers or non-secure contexts.
   ===================================================================== */

export async function copyText(text) {
    if (!text) return false;
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (_) {
        // fall through to fallback
    }

    // Legacy fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity  = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    document.body.removeChild(ta);
    return ok;
}
