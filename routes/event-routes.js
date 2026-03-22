const express = require('express');

const eventController = require('../controllers/event-Controller');

const router = express.Router(); // sub application

// Define a GET route to display the list of books
router.get("/", eventController.getHome);
router.get("/index.html", eventController.getHome);

router.get("/create-event", eventController.getCreateEvent);
router.post("/create-event", eventController.postCreateEvent);

router.get("/my-events", eventController.eventList);
router.get("/edit-events", eventController.editEvent);

router.get("/events/:id", eventController.getEventDetails);
// EXPORT
module.exports = router;