const User = require('./../model/user-model');

const bcrypt = require('bcrypt');

exports.registerGet = (req, res) => {
    res.render('register');
};

exports.registerPost = async (req, res) => {
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

exports.loginGet = (req, res) => {
    res.render('login');
};

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
            _id: user._id,
            username: user.username,
            role: user.role
        }

        res.redirect('/profile');

    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
};

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

};

exports.getEditInfo = async (req, res) => {

    const userdetails = await User.findByUsername(req.session.user.username);
    res.render('edit-info', { user: userdetails })
};

exports.postEditInfo = async (req, res) => {
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

exports.deleteAcc = async (req, res) => {
    res.render('delete-acc')
};


exports.postDeleteAcc = async (req, res) => {
    const userId = req.session.user.id;

    if (await User.deleteAccount(userId)) {
        console.log("Your account has been successfully deleted.")
        req.session.destroy(() => {
            res.redirect('/register');
        })
    }
    else {
        console.log('Your attempt was unsuccessful, please try again.')
        return res.send(`Your attempt was unsuccessful, please try again. <br>
                <a href='/profile'> Profile </a>`)
    }
};

exports.passwordAuth = async (req, res) => {
    res.render('password-auth')
};

exports.postPasswordAuth = async (req, res) => {
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

exports.resetPassword = async (req, res) => {
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

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    })
};
