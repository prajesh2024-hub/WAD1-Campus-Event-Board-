const express = require("express");
const router = express.Router();
const User = require("../models/user");

// GET /register
router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// POST /register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.render("register", { error: "Email already in use." });
    }

    const user = new User({ name, email, password });
    await user.save();

    req.session.user = { _id: user._id, name: user.name, email: user.email };
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("register", { error: "Registration failed. Please try again." });
  }
});

// GET /login
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.render("login", { error: "Invalid email or password." });
    }

    req.session.user = { _id: user._id, name: user.name, email: user.email };
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("login", { error: "Login failed. Please try again." });
  }
});

// GET /logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
