/* =====================================================================
   api.js  —  Thin wrapper over fetch
   Centralised so the rest of the app never calls fetch directly.
   Returns { ok, data, error } so callers can branch cleanly.
   ===================================================================== */

export async function postJSON(url, payload) {
    try {
        const response = await fetch(url, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return {
                ok: false,
                error: data.error || `Request failed (${response.status})`,
            };
        }
        return { ok: true, data };
    } catch (err) {
        return { ok: false, error: "Network error - please try again." };
    }
}

export async function getJSON(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return { ok: response.ok, data };
    } catch (err) {
        return { ok: false, data: {} };
    }
}
