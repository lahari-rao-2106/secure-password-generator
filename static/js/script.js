const slider = document.getElementById("length");
const lengthValue = document.getElementById("lengthValue");

const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");

const passwordField = document.getElementById("password");
const strength = document.getElementById("strength");

// Update slider value
slider.oninput = () => {
    lengthValue.innerText = slider.value;
};

// Generate Password
generateBtn.onclick = async () => {

    const response = await fetch("/generate", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            length: slider.value,

            uppercase: document.getElementById("uppercase").checked,

            lowercase: document.getElementById("lowercase").checked,

            numbers: document.getElementById("numbers").checked,

            symbols: document.getElementById("symbols").checked

        })

    });

    const data = await response.json();

    if(data.error){

        alert(data.error);

        return;

    }

    passwordField.value = data.password;

    strength.innerHTML = "Password Strength : <b>" + data.strength + "</b>";

};

// Copy Password

copyBtn.onclick = () => {

    if(passwordField.value===""){

        alert("Generate a password first!");

        return;

    }

    navigator.clipboard.writeText(passwordField.value);

    copyBtn.innerHTML="✅ Copied";

    setTimeout(()=>{

        copyBtn.innerHTML="📋 Copy";

    },1500);

};