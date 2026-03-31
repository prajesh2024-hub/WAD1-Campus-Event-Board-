const User = require('../model/user-model');

exports.isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        console.log("User not logged in, redirecting to login");
        return res.redirect('/login');
    }
    next();
}

exports.isExistingUser = async (req, res, next) => {
     const email= req.body.user.email || "";
            
    try {
        let existingUser = await User.findByEmail(email);
        if (existingUser) {
            console.log("Email already in use, redirecting to register");
            return res.send(`Email addres: ${email} already exists. Please try again with a different email address. <br>
                <a href='/register'> Register </a>`);
        }

    } catch (error) {
        console.log("Error" + error);
        console.error(error)
    }
    next();
};
