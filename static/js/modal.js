/* =====================================================================
   modal.js  —  Feature-card modal controller
   ---------------------------------------------------------------------
   Wires up the five .rail__feature buttons to a single glassmorphism
   modal. The modal body is populated by cloning a <template> that
   matches the clicked card's data-feature id, so the content is
   100% controlled by the server template (XSS-safe).

   Responsibilities:
   - Open on card click (or Enter/Space, since the triggers are buttons).
   - Close on Escape, overlay click, or the close button.
   - Prev/Next chevrons cycle through features (wraps).
   - Trap focus inside the modal while open (focus-trap.js).
   - Restore focus to the trigger that opened the modal on close.
   - Set aria-expanded on the active trigger + aria-hidden on the modal.

   This module is intentionally framework-free; it talks to the DOM
   directly and exports a single init function.
   ===================================================================== */

import { trapFocus, releaseFocus } from "./focus-trap.js";

const FEATURE_ORDER = ["secure", "entropy", "copy", "history", "multi"];

let _overlay = null;
let _dialog  = null;
let _body    = null;
let _dots    = null;
let _close   = null;
let _prev    = null;
let _next    = null;
let _triggers = null;
let _templates = {};
let _currentTrigger = null;
let _currentFeature = null;
let _isOpen = false;

function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function indexOfFeature(id) {
    const i = FEATURE_ORDER.indexOf(id);
    return i === -1 ? 0 : i;
}

function setActiveFeature(id, { focusClose = true } = {}) {
    const tpl = _templates[id];
    if (!tpl) return;

    _currentFeature = id;
    _body.innerHTML = "";
    _body.appendChild(tpl.content.cloneNode(true));

    // Refresh the dot strip
    if (_dots) {
        _dots.innerHTML = "";
        FEATURE_ORDER.forEach((fid) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "modal__dot" + (fid === id ? " is-active" : "");
            dot.setAttribute("role", "tab");
            dot.setAttribute("aria-label", `Go to ${fid}`);
            dot.setAttribute("aria-selected", fid === id ? "true" : "false");
            dot.addEventListener("click", () => {
                setActiveFeature(fid);
            });
            _dots.appendChild(dot);
        });
    }

    // Move focus to the close button so keyboard users land on a known control
    if (focusClose && _close) {
        // Defer so the freshly-cloned content is in the DOM before trapFocus scans
        requestAnimationFrame(() => {
            trapFocus(_dialog);
            _close.focus();
        });
    }
}

function open(featureId, triggerEl) {
    if (_isOpen) return;
    _isOpen = true;
    _currentTrigger = triggerEl || null;

    if (_currentTrigger) {
        _currentTrigger.setAttribute("aria-expanded", "true");
    }
    _overlay.setAttribute("aria-hidden", "false");
    _overlay.classList.add("is-open");
    document.body.classList.add("modal-open");

    setActiveFeature(featureId, { focusClose: true });
}

function close() {
    if (!_isOpen) return;
    _isOpen = false;

    _overlay.classList.remove("is-open");
    _overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    releaseFocus();

    if (_currentTrigger) {
        _currentTrigger.setAttribute("aria-expanded", "false");
        try { _currentTrigger.focus(); } catch (_) { /* element may be gone */ }
        _currentTrigger = null;
    }
    _currentFeature = null;
    _body.innerHTML = "";
}

function step(delta) {
    if (!_currentFeature) return;
    const i = indexOfFeature(_currentFeature);
    const next = FEATURE_ORDER[(i + delta + FEATURE_ORDER.length) % FEATURE_ORDER.length];
    setActiveFeature(next);
}

function onKeydown(event) {
    if (!_isOpen) return;
    if (event.key === "Escape") {
        event.preventDefault();
        close();
    } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
    } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
    }
}

function onOverlayClick(event) {
    // Close only when the click is on the overlay itself, not the dialog
    if (event.target === _overlay) {
        close();
    }
}

export function initFeatureModal() {
    _overlay   = document.getElementById("featureModal");
    if (!_overlay) return;
    _dialog    = $(".modal", _overlay);
    _body      = $("[data-modal-body]", _overlay);
    _dots      = $("[data-modal-dots]", _overlay);
    _close     = $("[data-modal-close]", _overlay);
    _prev      = $("[data-modal-prev]", _overlay);
    _next      = $("[data-modal-next]", _overlay);
    _triggers  = $$(".rail__feature[data-feature]");

    // Cache the five templates once. The browser only parses the
    // contents when the template is first cloned, so this is cheap.
    $$('template[data-feature-template]').forEach((tpl) => {
        _templates[tpl.getAttribute("data-feature-template")] = tpl;
    });

    if (!_dialog || !_body || !_close) return;

    // Bind triggers
    _triggers.forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-feature") || FEATURE_ORDER[0];
            open(id, btn);
        });
    });

    // Close paths
    _close.addEventListener("click", close);
    _overlay.addEventListener("click", onOverlayClick);

    // Prev / Next
    if (_prev) _prev.addEventListener("click", () => step(-1));
    if (_next) _next.addEventListener("click", () => step(1));

    // Global keydown (Escape + arrow keys for cycling features)
    document.addEventListener("keydown", onKeydown);
}
