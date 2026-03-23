const express = require('express');

const eventController = require('../controllers/event-Controller');

const router = express.Router(); // sub application

router.get("/", eventController.getHome);

router.get("/create-event", eventController.getCreateEvent);
router.post("/create-event", eventController.postCreateEvent);
router.get("/all-events", eventController.allEvents);

router.get("/my-events", eventController.eventList);
router.get("/edit-events", eventController.editEvent);

router.get("/events/:id", eventController.getEventDetails);
// EXPORT
module.exports = router;