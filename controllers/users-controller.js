const User = require('./../model/user-model');
const Event = require('./../model/events-model');
const bcrypt = require('bcrypt');

function registerGet(req, res) {
    res.render('register');
}

async function registerPost(req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
        const newUser = {
            username,
            email,
            phone: req.body.phone,
            password: hashedPassword,
            role: req.body.role
        };

        // error handling for existing username
        if (await User.findByUsername(username)) {
            console.log("User already in use, redirecting to register");
            return res.send(`The username: ${username} is not available. Please try again with a different username. <br>
                <a href='/register'> Register </a>`)
        };

        // error handling for existing email
        if (await User.findByEmail(email)) {
            console.log("Email already in use, redirecting to register");
            return res.send(`The email address: ${email} is in use. Please try again with a different email address. <br>
                    <a href='/register'> Register </a>`);

        };

        await User.createAccount(newUser);
        console.log('new usr created')
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.redirect('/register');
    }
};

function loginGet(req, res) {
    res.render('login');
}

async function loginPost(req, res) {
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

        req.session.save(() => {
            res.redirect('/index');
        });

    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
};

async function profile(req, res) {

    const passedUser = await User.findByUsername(req.session.user.username);

    if (req.session.user.role == "student") {
        console.log("User is student, rendering profile.")
        res.render('profile', { user: passedUser })
    };

    if (req.session.user.role == "admin") {
        console.log("User is admin, rendering admin-profile.")
        res.render('admin-profile', { user: passedUser });
    }

};

async function getEditInfo(req, res) {

    const userdetails = await User.findByUsername(req.session.user.username);
    res.render('edit-info', { user: userdetails })
};

async function postEditInfo(req, res) {
    const userId = req.session.user.id //filter

    const newUsername = req.body.username;
    const newEmail = req.body.email;
    const newPhone = req.body.phone;

    let updateDocument = { $set: {} }

    try {

        let updateDocument = { $set: {} };

        if (newUsername && newUsername.trim() !== "") {
            updateDocument.$set.username = newUsername;
            req.session.user.username = newUsername;
        }

        if (newEmail && newEmail.trim() !== "") {
            updateDocument.$set.email = newEmail;
            req.session.user.email = newEmail;
        }

        if (newPhone && newPhone.trim() !== "") {
            updateDocument.$set.phone = newPhone;
            req.session.user.phone = newPhone;
        }

        if (Object.keys(updateDocument.$set).length === 0) {
            return res.send(`No changes provided. <br> <a href="/profile">Profile</a>`);
        }

        const result = await User.editParticulars({ _id: userId }, updateDocument);

        console.log('Particulars updated.');
        res.send('Your particulars have been successfully edited. <br> <a href="/profile">Profile</a>');
    }
    catch (error) {
        console.log(`Error: ${error} Please try again.`)
    }

};

async function getDeleteAcc(req, res) {
    const delUserId = req.session.user.id
    res.render('delete-acc', { delUserId })
};


async function postDeleteAcc(req, res) {
    const delUserId = req.body.delUserId;
    // function to delete all events created by user
    const delAllEvents = async function (userId) {
        const allUserEvents = await Event.retrieveFromUser(userId);
        try {
            for (const oneEvent of allUserEvents) {
                await Event.deleteEvent(oneEvent._id);
            }
            console.log("All this user's events have been deleted.")
        }
        catch (error) {
            console.error("Error deleting events:", err);
        }
    };

    try {
        // if user acc being deleted is their own, session gets destroyed. else, redirected to profile
        if (delUserId === req.session.user.id) {
            await delAllEvents(delUserId);
            await User.deleteAccount(delUserId)
            console.log("Your account has been successfully deleted.")
            req.session.destroy(() => {
                res.redirect('/profile');
            })

        } else {
            await delAllEvents(delUserId);
            await User.deleteAccount(delUserId)
            console.log("Admin: The account has been successfully deleted.")
            res.redirect('/profile');

        }
    } catch (error) {
        console.log('Your attempt was unsuccessful, please try again.')
        return res.send(`Your attempt was unsuccessful, please try again. <br>
                <a href='/profile'> Profile </a>`)
    }
};

async function getDeleteUserAcc(req, res) {
    // render ejs file where you can search by username, only accessible by admin acc, then j implement the same delete acc funct 
    if (req.session.user.role == 'admin') {
        res.render('admin-user-delete')
    }
    else {
        return res.send(`You do not have authorization to view this page. <br> 
            <a href='/index'> Home </a>`)
    }
};

async function postDeleteUserAcc(req, res) {
    const adminPassword = req.body.adminPassword;
    const delUser = await User.findByUsername(req.body.delUsername);
    const adminUser = await User.findByUsername(req.session.user.username);
    if (!delUser || delUser == null) {
        res.send(`Please enter valid username <br> 
           <a href='/delete-user'> Return </a> `)
     };

    const match = await bcrypt.compare(adminPassword, adminUser.password);
    if (match) {
        res.render('delete-acc-admin', { delUsername: delUser.username, delUserId: delUser.id })
    } else {
        res.send(`Password mismatch, please try again <br> 
           <a href='/delete-user'> Return </a> `)
    }
    
};


async function getPasswordAuth(req, res) {
    res.render('password-auth')
}

async function postPasswordAuth(req, res) {
    const passedEmail = req.body.email;
    const passedPhone = req.body.phone;

    try {
        passedUser = await User.findByEmail(passedEmail);

        if (passedUser.phone == passedPhone) {
            req.session.user = {
                email: passedEmail
            }
            res.render('update-password')
        } else {
            return res.send(`Your entry did not match our records, please try again. <br>
                 <a href='/reset-password'> Reset </a>`)
        }

    } catch (error) {
        console.log(`Error: ${error}. Please try again.`)
        return res.send(`Error: ${error}. Please try again. <br>
                 <a href='/reset-password'> Reset </a>`)
    }
};



async function resetPassword(req, res) {
    const email = req.session.user.email;
    const password1 = req.body.password1;
    const password2 = req.body.password2;
    let updateDocument = { $set: {} };

    try {
        if (password1 === password2) {
            updateDocument.$set.password = await bcrypt.hash(password1, 10);
            const result = await User.editParticulars({ email: email }, updateDocument);

            console.log(`${password1} Password has been updated.`)
            req.session.destroy
            res.send(`Your password has been updated. <br> 
            <a href='/login'> Login </a>`)
        } else {
            console.log('Password mismatch')
            req.session.destroy
            return res.send(`Passwords do not match, please try again. <br>
                <a href='/reset-password'> Reset </a>`)
        }
    } catch (error) {
        console.log(`Error: ${error}.`)
        req.session.destroy
        return res.send(`Error: ${error}. Please try again.<br>
                <a href='/reset-password'> Reset </a>`)
    }
};

function logout(req, res) {
    req.session.destroy(() => {
        res.redirect('/login');
    })
}

module.exports = {
    registerGet,
    registerPost,
    loginGet,
    loginPost,
    profile,
    getEditInfo,
    postEditInfo,
    getDeleteAcc,
    postDeleteAcc,
    getDeleteUserAcc,
    postDeleteUserAcc,
    getPasswordAuth,
    postPasswordAuth,
    resetPassword,
    logout,
};
