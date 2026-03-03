# ===============================
# FULL WORKING BACKEND
# Signup + Login + Role
# Using Flask + SQLite
# ===============================

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid
import hashlib
import os

app = Flask(__name__)
CORS(app)

DB_NAME = "users.db"

# ===============================
# DATABASE SETUP
# ===============================

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT UNIQUE,
        age INTEGER,
        role TEXT,
        password TEXT
    )
    """)

    conn.commit()
    conn.close()

init_db()

# ===============================
# PASSWORD HASH FUNCTION
# ===============================

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# ===============================
# SIGNUP API
# ===============================

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    fullname = data.get("fullname")
    phone = data.get("phone")
    age = data.get("age")
    role = data.get("role")
    password = data.get("password")

    if not all([fullname, phone, age, role, password]):
        return jsonify({"error": "All fields required"}), 400

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Check if user exists
    cursor.execute("SELECT * FROM users WHERE phone=?", (phone,))
    existing = cursor.fetchone()

    if existing:
        conn.close()
        return jsonify({"error": "User already exists"}), 400

    user_id = str(uuid.uuid4())
    hashed_password = hash_password(password)

    cursor.execute("""
        INSERT INTO users (id, name, phone, age, role, password)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, fullname, phone, age, role, hashed_password))

    conn.commit()
    conn.close()

    return jsonify({"message": "Signup Successful"}), 201


# ===============================
# LOGIN API
# ===============================

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    phone = data.get("phone")
    password = data.get("password")

    if not phone or not password:
        return jsonify({"error": "Phone and password required"}), 400

    hashed_password = hash_password(password)

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT role FROM users
        WHERE phone=? AND password=?
    """, (phone, hashed_password))

    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid Credentials"}), 401

    role = user[0]

    return jsonify({
        "message": "Login Successful",
        "role": role
    }), 200


# ===============================
# RUN SERVER
# ===============================

if __name__ == "__main__":
    app.run(debug=True, port=5000)