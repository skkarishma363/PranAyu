const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();

const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

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

// ================= AI CHAT =================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.json({
        reply: "Please describe your symptoms."
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are PranAyu, a home remedies assistant.

For every user symptom:
- Give simple natural home remedies.
- Use simple English.
- Give 4 to 6 bullet points.
- Do not prescribe strong medicines.
- Do not diagnose disease.
- Mention when to consult a doctor.
- For emergency symptoms, ask user to seek medical help immediately.
`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.log("CHAT ERROR:", error.message);

    res.status(500).json({
      reply: "AI is not connected. Check OPENAI_API_KEY in .env and restart server."
    });
  }
});
// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});