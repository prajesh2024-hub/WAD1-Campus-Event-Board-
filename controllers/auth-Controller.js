const User = require("../model/user");

// GET /register
async function getRegister(req, res) {
  res.render("register", { errors: [] });
}

// POST /register
async function postRegister(req, res) {
  try {
    const { name, email, password } = req.body;

    const errors = [];

    if (!name || name.trim() === "") errors.push("Name is missing.");
    if (!email || email.trim() === "") errors.push("Email is missing.");
    if (!password || password.trim() === "") errors.push("Password is missing.");

    if (errors.length > 0) {
      return res.render("register", { errors });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      errors.push("Email is already in use.");
      return res.render("register", { errors });
    }

    const user = new User({ name, email, password });
    await user.save();

    req.session.user = { _id: user._id, name: user.name, email: user.email };
    res.redirect("/");
  } catch (err) {
    console.error("postRegister error:", err);
    res.render("register", { errors: ["Registration failed. Please try again."] });
  }
}

// GET /login
async function getLogin(req, res) {
  res.render("login", { errors: [] });
}

// POST /login
async function postLogin(req, res) {
  try {
    const { email, password } = req.body;

    const errors = [];

    if (!email || email.trim() === "") errors.push("Email is missing.");
    if (!password || password.trim() === "") errors.push("Password is missing.");

    if (errors.length > 0) {
      return res.render("login", { errors });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      errors.push("Invalid email or password.");
      return res.render("login", { errors });
    }

    req.session.user = { _id: user._id, name: user.name, email: user.email };
    res.redirect("/");
  } catch (err) {
    console.error("postLogin error:", err);
    res.render("login", { errors: ["Login failed. Please try again."] });
  }
}

// GET /logout
function getLogout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  getLogout
};
