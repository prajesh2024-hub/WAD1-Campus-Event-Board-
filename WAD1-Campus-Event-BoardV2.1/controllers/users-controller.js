const User = require('./../model/user-model');

const bcrypt = require('bcrypt');

exports.gethome = (req, res) => res.redirect('events');

exports.registerGet = (req, res) => {
    res.render('register');
}

exports.registerPost = async (req, res) => {

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
        const newUser = {
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone, 
            password: hashedPassword,
            role: req.body.role
        };
        await User.createAccount(newUser);
        console.log('new usr created')
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.redirect('/register');
    }
}

exports.loginGet = (req, res) => {
    res.render('login');
}

exports.loginPost = async (req, res) => {
    try {
        const user = await User.findByEmail(req.body.email);
        
        if (!user) {
            console.log("User not found");
            return res.redirect('/login');
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            console.log("Password mismatch");
            return res.redirect('/login');
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role
        }

        // if (user.role === "admin") {
        //     return res.redirect('/admin-profile');
        // }

        res.redirect('/profile');

    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
}

exports.profile = async (req, res) => {
    if (!req.session.user || !req.session.user.username) {
        console.log("User not logged in, redirecting to /login");
        return res.redirect('/login');
    }
    const passedUser = await User.findByUsername(req.session.user.username);
    res.render('profile', { user: passedUser });
}

exports.adminProfile = (req, res) => {
    if (!req.session.user) {
        console.log("User not logged in, redirecting to /login");
        return res.redirect('/login');
    }
    if (req.session.user.role !== "admin") {
        console.log("Not an admin user, redirecting to /profile");
        return res.redirect('/profile');
    }
    // res.render('admin-profile', { user: req.session.user });
}

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
}
