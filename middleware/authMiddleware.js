const User = require('../model/user-model');

exports.isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        console.log("User not logged in, redirecting to login");
        return res.redirect('/login');
        //return res.status(401).render('login', { error: "Please log in first!" });
    }
    next();
}

// exports.isExistingUser = async (req, res, next) => {
//      const email= req.body.email || "";
            
//     try {
//         let existingUser = await User.findByEmail(email);
//         if (existingUser) {
//             console.log("Email already in use, redirecting to register");
//             return res.send(`Email addres: ${email} already exists. Please try again with a different email address. <br>
//                 <a href='/register'> Register </a>`);
//              //return res.status(401).render('register', { error: "Email already in use!" });
//         }

//     } catch (error) {
//         console.log("Error" + error);
//         console.error(error)
//     }
//     next();
// };

// exports.isAdmin = (req, res, next) => {
//     // if (!req.session.user.username) {
//     //     console.log("User not logged in, redirecting to login");
//     //     return res.redirect('/login?error=Please log in first!');
//     //     //return res.status(401).render('login', { error: "Please log in first!" });

//     // }
//     if (req.session.user.role !== "admin") {
//         console.log("Not an admin user, redirecting to student profile");
//         return res.redirect('/profile');
//     }
//     next();
// }
