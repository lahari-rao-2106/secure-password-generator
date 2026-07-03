"""
SecurePass Pro - Flask backend.

Password generation logic is unchanged. Passwords are NEVER written to
disk: history lives only in the browser's JavaScript memory (see
static/js/history.js) so a refresh or tab close clears it. The
generator routes below return the password to the client and forget it.
"""
from flask import Flask, render_template, request, jsonify
import random
import string
import math

app = Flask(__name__)


def password_strength(length):
    """Return human-readable strength label from password length."""
    if length < 8:
        return "Weak"
    elif length < 12:
        return "Medium"
    else:
        return "Strong"


def calculate_pool_size(upper, lower, numbers, symbols):
    """Total number of possible characters in the chosen alphabet."""
    pool = 0
    if upper:
        pool += len(string.ascii_uppercase)
    if lower:
        pool += len(string.ascii_lowercase)
    if numbers:
        pool += len(string.digits)
    if symbols:
        pool += len("!@#$%^&*()_+-=[]{}<>?")
    return pool


def calculate_entropy(length, upper, lower, numbers, symbols):
    """Shannon-style entropy in bits: L * log2(pool)."""
    pool = calculate_pool_size(upper, lower, numbers, symbols)
    if pool <= 0 or length <= 0:
        return 0
    return round(length * math.log2(pool), 2)


def generate_password(length, upper, lower, numbers, symbols):
    """Generate a single password honouring the at-least-one-per-type rule."""
    pools = []
    password = []

    if upper:
        pools.append(string.ascii_uppercase)
        password.append(random.choice(string.ascii_uppercase))

    if lower:
        pools.append(string.ascii_lowercase)
        password.append(random.choice(string.ascii_lowercase))

    if numbers:
        pools.append(string.digits)
        password.append(random.choice(string.digits))

    if symbols:
        sym_pool = "!@#$%^&*()_+-=[]{}<>?"
        pools.append(sym_pool)
        password.append(random.choice(sym_pool))

    if not pools:
        return None

    all_chars = "".join(pools)

    while len(password) < length:
        password.append(random.choice(all_chars))

    random.shuffle(password)
    return "".join(password)


# ------------------------------------------------------------------ routes

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    """Single-password endpoint - existing behaviour, plus entropy in the response."""
    data = request.json

    length = int(data["length"])
    if length <= 0:
        return jsonify({"error": "Password length must be greater than 0"})

    password = generate_password(
        length,
        data["uppercase"],
        data["lowercase"],
        data["numbers"],
        data["symbols"],
    )
    if password is None:
        return jsonify({"error": "Select at least one character type."})

    strength = password_strength(length)
    entropy = calculate_entropy(
        length,
        data["uppercase"],
        data["lowercase"],
        data["numbers"],
        data["symbols"],
    )

    return jsonify({
        "password": password,
        "strength": strength,
        "entropy": entropy,
    })


@app.route("/generate-multiple", methods=["POST"])
def generate_multiple():
    """Generate 1, 5, or 10 passwords in a single call (for the bulk UI)."""
    data = request.json
    count = int(data.get("count", 1))
    if count not in (1, 5, 10):
        return jsonify({"error": "Count must be 1, 5, or 10."})

    length = int(data["length"])
    if length <= 0:
        return jsonify({"error": "Password length must be greater than 0"})

    upper = data["uppercase"]
    lower = data["lowercase"]
    numbers = data["numbers"]
    symbols = data["symbols"]

    if not (upper or lower or numbers or symbols):
        return jsonify({"error": "Select at least one character type."})

    passwords = [
        generate_password(length, upper, lower, numbers, symbols)
        for _ in range(count)
    ]
    entropy = calculate_entropy(length, upper, lower, numbers, symbols)
    strength = password_strength(length)

    return jsonify({
        "passwords": passwords,
        "entropy": entropy,
        "strength": strength,
    })


if __name__ == "__main__":
    app.run(debug=True)
