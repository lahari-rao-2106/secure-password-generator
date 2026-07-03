from flask import Flask, render_template, request, jsonify
import random
import string
import os

app = Flask(__name__)

HISTORY_FILE = "static/passwords/history.txt"


def password_strength(length):
    if length < 8:
        return "Weak"
    elif length < 12:
        return "Medium"
    else:
        return "Strong"


def generate_password(length, upper, lower, numbers, symbols):
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
        pools.append("!@#$%^&*()_+-=[]{}<>?")
        password.append(random.choice("!@#$%^&*()_+-=[]{}<>?"))

    if not pools:
        return None

    all_chars = "".join(pools)

    while len(password) < length:
        password.append(random.choice(all_chars))

    random.shuffle(password)

    return "".join(password)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():

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

    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)

    with open(HISTORY_FILE, "a") as f:
        f.write(password + "\n")

    return jsonify({
        "password": password,
        "strength": strength
    })


if __name__ == "__main__":
    app.run(debug=True)