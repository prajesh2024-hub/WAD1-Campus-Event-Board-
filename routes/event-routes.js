const express = require('express');

const eventController = require('./../controllers/event-Controller');

const router = express.Router(); // sub application

// Define a GET route to display the list of books
router.get("/create-event", eventController.getCreateEvent);
router.post("/create-event", eventController.postCreateEvent);

// EXPORT
module.exports = router;