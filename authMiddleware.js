// not sure why this is here CHECK LATER
// function requireLogin(req, res, next) {
//     if (!req.session.user) {
//       return res.redirect("/login");
//     }
//     next();
//   }
  
//   module.exports = { requireLogin };

// const bcrypt = require('bcrypt');
const User = require('../models/user-model');

exports.isLoggedIn = (req, res, next) => {
    if (!req.session.email) {
        console.log("User not logged in, redirecting to login");
        return res.redirect('/login');
        //return res.status(401).render('login', { error: "Please log in first!" });
    }
    next();
}

exports.isExistingUser = async (req, res, next) => {
     const email= req.body.email || "";
            
    try {
        let existingUser = await User.findByEmail(email);
        if (existingUser) {
            console.log("Email already in use, redirecting to register");
            return res.redirect('/register');
             //return res.status(401).render('register', { error: "Email already in use!" });
        }

    } catch (error) {
        console.log("Error" + error);
        console.error(error)
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if (!req.session.email) {
        console.log("User not logged in, redirecting to login");
        return res.redirect('/account/login?error=Please log in first!');
        //return res.status(401).render('login', { error: "Please log in first!" });

    }
    if (req.session.role !== "admin") {
        console.log("Not an admin user, redirecting to home");
        return res.redirect('/');
    }
    next();
}
