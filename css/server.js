const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", userSchema);

// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  try {
    const { fullname, phone, age, role, password } = req.body;

    if (!fullname || !phone || !age || !role || !password) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullname,
      phone,
      age,
      role,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "Signup successful"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid password"
      });
    }

    res.status(200).json({
      message: "Login successful",
      role: user.role
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});