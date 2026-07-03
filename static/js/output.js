/* =====================================================================
   output.js  —  Password display field
   Animates the flip-in when a new password arrives.
   ===================================================================== */

export function renderPassword(field, password) {
    if (!field) return;
    field.value = password;
    field.classList.remove("output__field--empty");
    field.classList.remove("output__field--empty"); // double safety
    // Restart the flip animation by toggling the class via reflow.
    field.style.animation = "none";
    void field.offsetWidth;       // trigger reflow
    field.style.animation = "";   // let CSS rule run again
}
