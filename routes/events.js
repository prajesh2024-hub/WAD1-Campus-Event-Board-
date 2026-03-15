const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// GET /events/create - show create event form
router.get('/create', eventController.getCreateEvent);

// POST /events - handle create event form submission
router.post('/', eventController.postCreateEvent);

module.exports = router;
