const express = require('express');

const eventController = require('../controllers/event-Controller');

const router = express.Router(); // sub application

router.get("/", eventController.getHome);

router.get("/create-event", eventController.getCreateEvent);
router.post("/create-event", eventController.postCreateEvent);
router.get("/all-events", eventController.allEvents);

router.get("/my-events", eventController.eventList);

//edit events
router.get("/events/:id/edit", eventController.editEvent);
router.post("/events/:id/edit", eventController.postEditEvent);

//delete event
router.get("/events/:id/delete", eventController.getDeleteEvent);
router.post("/events/:id/delete", eventController.deleteEvent);

router.get("/events/:id", eventController.getEventDetails);
// EXPORT
module.exports = router;