const User = require('../model/user-model');

exports.isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        console.log("User not logged in, redirecting to login");
        return res.redirect('/login');
    }
    next();
}

exports.isAdminUser = async (req, res, next) => {
    if (req.session.user.role === 'admin') {
        next();
    } else {
         res.render(`You do not have authorization to view this page. <br> 
            <a href='/'> Home </a>`)
    }
};