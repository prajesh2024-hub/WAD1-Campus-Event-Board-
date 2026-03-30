const User = require('./../model/user-model');

const bcrypt = require('bcrypt');

exports.gethome = (req, res) => res.redirect('events');

exports.registerGet = (req, res) => {
    res.render('register');
}

exports.registerPost = async (req, res) => {
    const username = req.body.username;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
        const newUser = {
            username,
            email: req.body.email,
            phone: req.body.phone,
            password: hashedPassword,
            role: req.body.role
        };

        // error handling for existing username
        if (await User.findByUsername(username)) {
            return res.send(`Username ${username} already exists. Please try again with a different username. <br>
                <a href='/register'> Register </a>`)
        }
        // error handling for existing email is implemented as middleware

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
            return res.send(`User: ${req.body.email} does not exist. Please register before trying again. <br>
                <a href='/register'> Register </a>`)
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            console.log("Password mismatch");
            return res.send(`Password mismatch. Please try again. <br>
                <a href='/login'> Login </a>`)
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role
        }

        res.redirect('/profile');

    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
}

exports.profile = async (req, res) => {

    const passedUser = await User.findByUsername(req.session.user.username);

    if (req.session.user.role == "student") {
        console.log("User is student, rendering profile.")
        res.render('profile', { user: passedUser })
    };

    if (req.session.user.role == "admin") {
        console.log("User is admin, rendering admin-profile.")
        res.render('admin-profile', { user: passedUser });
    }

}

// exports.adminProfile = async (req, res) => {
//     // if (!req.session.user) {
//     //     console.log("User not logged in, redirecting to /login");
//     //     return res.redirect('/login');
//     // };
//     if (req.session.user.role !== "admin") {
//         console.log("Not an admin user, redirecting to /profile");
//         return res.redirect('/profile');
//     }
//     const passedUser = await User.findByUsername(req.session.user.username);
//     res.render('admin-profile', { user: passedUser });
// }

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
}
