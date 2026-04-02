
const express = require('express');
const router = express.Router();
const usersController = require('./../controllers/users-controller');
const authMiddleware = require('./../middleware/authMiddleware');

// get-post routing for registration
router.get('/register', usersController.registerGet);
router.post('/register', usersController.registerPost);

// get-post routing for login
router.get('/login', usersController.loginGet);
router.post('/login', usersController.loginPost);

// get routing to render profile
router.get('/profile', authMiddleware.isLoggedIn, usersController.profile);

// get-post routing to edit user info
router.get('/edit-info', authMiddleware.isLoggedIn, usersController.getEditInfo);
router.post('/edit-info', authMiddleware.isLoggedIn, usersController.postEditInfo);

// get-post routing for user to delete own account
router.get('/delete-acc', authMiddleware.isLoggedIn, usersController.getDeleteAcc);
router.post('/delete-acc', authMiddleware.isLoggedIn, usersController.postDeleteAcc);

// get-post routing for admin user to delete other accounts
router.get('/delete-user', authMiddleware.isLoggedIn, usersController.getDeleteUserAcc);
router.post('/delete-user', authMiddleware.isLoggedIn, usersController.postDeleteUserAcc);
router.post('/admin-delete-user', authMiddleware.isLoggedIn, authMiddleware.isAdminUser, usersController.postDeleteAcc);

// get-post routing for password reset/forgot password feature
router.get('/reset-password', usersController.getPasswordAuth);
router.post('/reset-password', usersController.postPasswordAuth);
router.post('/update-password', usersController.resetPassword);

router.get('/logout', authMiddleware.isLoggedIn, usersController.logout);

module.exports = router;
