"""
SecurePass Pro - Flask backend.

The original / and /generate routes are preserved exactly so the existing
UI continues to work. Three new endpoints have been added to support the
new UI features (multi-generation, history list, history download) without
breaking anything that already exists.
"""
from flask import Flask, render_template, request, jsonify, send_file
import random
import string
import os
import math

app = Flask(__name__)

# History file is rolling - we trim to the last N entries on every write so it
# never grows without bound on a long-running server.
HISTORY_FILE = "static/passwords/history.txt"
HISTORY_LIMIT = 200  # Max lines kept on disk; UI only ever reads the last 5.


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


def _append_history(passwords):
    """Append a list of passwords to history and trim to HISTORY_LIMIT lines."""
    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        for p in passwords:
            f.write(p + "\n")

    # Trim so the file never grows forever on a long-lived server.
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
        if len(lines) > HISTORY_LIMIT:
            with open(HISTORY_FILE, "w", encoding="utf-8") as f:
                f.writelines(lines[-HISTORY_LIMIT:])
    except FileNotFoundError:
        pass


def _read_history(limit=5):
    """Return the last `limit` passwords, most recent first."""
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            lines = [l.strip() for l in f.readlines() if l.strip()]
        return list(reversed(lines[-limit:]))
    except FileNotFoundError:
        return []


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

    _append_history([password])

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

    _append_history(passwords)

    return jsonify({
        "passwords": passwords,
        "entropy": entropy,
        "strength": strength,
    })


@app.route("/history")
def history():
    """Return the most recent N passwords (default 5), most recent first."""
    limit = int(request.args.get("limit", 5))
    return jsonify({"history": _read_history(limit)})


@app.route("/history/download")
def history_download():
    """Send the rolling history file as a downloadable text file."""
    if not os.path.exists(HISTORY_FILE):
        # Ensure the file exists so the download is always a valid (possibly empty) file.
        os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
        open(HISTORY_FILE, "w", encoding="utf-8").close()
    return send_file(
        HISTORY_FILE,
        as_attachment=True,
        download_name="password_history.txt",
    )


if __name__ == "__main__":
    app.run(debug=True)
