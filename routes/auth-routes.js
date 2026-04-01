
const express = require('express');
const router = express.Router();
const usersController = require('./../controllers/users-controller');
const authMiddleware = require('./../middleware/authMiddleware');

router.get('/', usersController.gethome);

router.get('/register', usersController.registerGet);

router.post('/register', usersController.registerPost);

router.get('/login', usersController.loginGet);

router.post('/login', usersController.loginPost);

router.get('/profile', authMiddleware.isLoggedIn, usersController.profile);

// router.get('/admin-profile', usersController.adminProfile);

router.get('/edit-info', authMiddleware.isLoggedIn, usersController.getEditInfo);

router.post('/edit-info', authMiddleware.isLoggedIn, usersController.postEditInfo);

router.get('/delete-acc', authMiddleware.isLoggedIn, usersController.deleteAcc);

router.post('/delete-acc', authMiddleware.isLoggedIn, usersController.postDeleteAcc);

router.get('/reset-password', usersController.passwordAuth);

router.post('/reset-password', usersController.postPasswordAuth);

router.post('/update-password', usersController.resetPassword);

router.get('/logout', authMiddleware.isLoggedIn, usersController.logout);

module.exports = router;
