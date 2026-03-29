
const express = require('express');
const router = express.Router();
const usersController = require('./../controllers/users-controller');
const authMiddleware = require('./../middleware/authMiddleware');

router.get('/', usersController.gethome);

router.get('/register', usersController.registerGet);

router.post('/register', usersController.registerPost);

router.get('/login', usersController.loginGet);

router.post('/login', usersController.loginPost);

router.get('/profile', usersController.profile);


// to possibly add later if necessary

// router.get('/profile',authMiddleware.isLoggedIn, usersController.profile);
// router.get('/admin-profile',authMiddleware.isAdmin, usersController.adminProfile);

router.get('/logout', usersController.logout);

module.exports = router;
