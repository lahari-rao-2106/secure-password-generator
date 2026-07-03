/* =====================================================================
   focus-trap.js  —  Reusable focus trap for modal/overlay components
   ---------------------------------------------------------------------
   Usage:
     import { trapFocus, releaseFocus } from "./focus-trap.js";

     const previouslyFocused = document.activeElement;
     trapFocus(modalEl);     // cycles Tab / Shift+Tab inside modalEl
     ...
     releaseFocus();         // restores focus to previouslyFocused
   ===================================================================== */

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "area[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "iframe",
    "object",
    "embed",
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable='true']",
].join(",");

let _activeContainer = null;
let _prevFocus = null;
let _keyHandler = null;

function getFocusable(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter((el) => el.offsetParent !== null || el === document.activeElement);
}

function handleKeydown(event) {
    if (!_activeContainer) return;
    if (event.key !== "Tab") return;

    const focusables = getFocusable(_activeContainer);
    if (focusables.length === 0) {
        event.preventDefault();
        return;
    }

    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    const active = document.activeElement;

    // If focus has somehow escaped the container, snap it back in.
    if (!_activeContainer.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
    }

    if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
    }
}

export function trapFocus(container) {
    if (!container) return;
    if (_activeContainer) releaseFocus();

    _activeContainer = container;
    _prevFocus = document.activeElement;
    _keyHandler = handleKeydown;
    document.addEventListener("keydown", _keyHandler, true);

    // Move focus to the first focusable element inside the container
    // (caller should ensure a sensible initial focus target exists).
    const focusables = getFocusable(container);
    if (focusables.length > 0) {
        focusables[0].focus();
    } else {
        container.setAttribute("tabindex", "-1");
        container.focus();
    }
}

export function releaseFocus() {
    if (_keyHandler) {
        document.removeEventListener("keydown", _keyHandler, true);
        _keyHandler = null;
    }
    _activeContainer = null;

    if (_prevFocus && typeof _prevFocus.focus === "function") {
        _prevFocus.focus();
    }
    _prevFocus = null;
}
