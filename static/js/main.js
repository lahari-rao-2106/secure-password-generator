/* =====================================================================
   main.js  —  Entry point
   Wires up the page: imports CSS via <link>, initialises all modules,
   and dispatches the generate action when the user clicks the button.
   No bundler, no framework - just plain ES modules.
   ===================================================================== */

import { initBackground }       from "./background.js";
import { initSlider }           from "./slider.js";
import { initToggles }          from "./toggles.js";
import { initBulkSelector }     from "./bulk.js";
import { renderStrength }       from "./strength.js";
import { renderEntropy }        from "./entropy.js";
import { renderBulkPasswords }  from "./bulk.js";
import { renderPassword }       from "./output.js";
import { refreshHistory,
         initHistory,
         addToHistory,
         getHistory }           from "./history.js";
import { copyText }             from "./copy.js";
import { showToast }            from "./toast.js";
import { initTips }             from "./tips.js";
import { bindGenerate }         from "./generate.js";
import { initFooter }           from "./footer.js";
import { initFeatureModal }     from "./modal.js";

// ---------- Element handles ----------
const els = {
    length:        document.getElementById("length"),
    lengthValue:   document.getElementById("lengthValue"),
    upper:         document.getElementById("uppercase"),
    lower:         document.getElementById("lowercase"),
    numbers:       document.getElementById("numbers"),
    symbols:       document.getElementById("symbols"),
    generateBtn:   document.getElementById("generateBtn"),
    copyBtn:       document.getElementById("copyBtn"),
    toggleView:    document.getElementById("toggleView"),
    passwordField: document.getElementById("password"),
    downloadBtn:   document.getElementById("downloadBtn"),
    strengthLabel: document.getElementById("strengthLabel"),
    strengthFill:  document.getElementById("strengthFill"),
    entropyValue:  document.getElementById("entropyValue"),
    entropyQuality:document.getElementById("entropyQuality"),
};

// ---------- Read form state once, share with modules that need it ----------
function readOptions() {
    return {
        length:    parseInt(els.length.value, 10),
        uppercase: els.upper.checked,
        lowercase: els.lower.checked,
        numbers:   els.numbers.checked,
        symbols:   els.symbols.checked,
    };
}

// ---------- Init ----------
function init() {
    initBackground();
    initSlider(els.length, els.lengthValue);
    initToggles();
    initBulkSelector();
    initHistory();
    initTips();
    initFooter();
    initFeatureModal();
    refreshHistory();

    // Show/hide password eye
    els.toggleView.addEventListener("click", () => {
        const isHidden = els.passwordField.type === "password";
        els.passwordField.type = isHidden ? "text" : "password";
        els.toggleView.setAttribute("aria-pressed", String(isHidden));
        els.toggleView.setAttribute("aria-label",
            isHidden ? "Hide password" : "Show password");
    });

    // Copy button
    els.copyBtn.addEventListener("click", async () => {
        if (!els.passwordField.value) {
            showToast("Generate a password first!", "error");
            return;
        }
        const ok = await copyText(els.passwordField.value);
        if (ok) {
            els.copyBtn.classList.add("is-copied");
            els.copyBtn.innerHTML =
                '<span aria-hidden="true">✓</span> Copied';
            showToast("Password copied to clipboard", "success");
            setTimeout(() => {
                els.copyBtn.classList.remove("is-copied");
                els.copyBtn.innerHTML =
                    '<span aria-hidden="true">📋</span> Copy';
            }, 1500);
        } else {
            showToast("Couldn't copy to clipboard", "error");
        }
    });

    // Download history — built entirely client-side from the in-memory
    // session array. Nothing is fetched from the server.
    els.downloadBtn.addEventListener("click", () => {
        const items = getHistory();
        if (items.length === 0) {
            showToast("No history to download yet", "info");
            return;
        }
        const blob = new Blob([items.join("\n") + "\n"], { type: "text/plain" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url;
        a.download = "password_history.txt";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast("Downloaded your session history", "success");
    });

    // Main generate flow
    bindGenerate({
        btn: els.generateBtn,
        readOptions,
        onResult: (data) => {
            renderPassword(els.passwordField, data.password);
            renderStrength(els.strengthLabel, els.strengthFill, data.strength);
            renderEntropy(els.entropyValue, els.entropyQuality, data.entropy);
            addToHistory(data.password);
            refreshHistory();
        },
        onBulkResult: (data) => {
            renderPassword(els.passwordField, data.passwords[0]);
            renderStrength(els.strengthLabel, els.strengthFill, data.strength);
            renderEntropy(els.entropyValue, els.entropyQuality, data.entropy);
            renderBulkPasswords(data.passwords);
            data.passwords.forEach(addToHistory);
            refreshHistory();
        },
        onError: (msg) => showToast(msg, "error"),
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
