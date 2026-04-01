const express = require("express");
const eventController = require("../controllers/event-Controller");

const router = express.Router();

router.get("/", eventController.getHome);

router.get("/create-event", eventController.getCreateEvent);
router.post("/create-event", eventController.postCreateEvent);

router.get("/all-events", eventController.allEvents);
router.post("/all-events", eventController.postAllEvents);
router.get("/my-events", eventController.eventList);

router.get("/events/:id/edit", eventController.editEvent);
router.post("/events/:id/edit", eventController.postEditEvent);

router.get("/events/:id/delete", eventController.getDeleteEvent);
router.post("/events/:id/delete", eventController.deleteEvent);

router.get("/events/:id/participants", eventController.getParticipants);
router.post("/events/:id/participants/remove", eventController.postParticipants);

router.get("/events/:id", eventController.getEventDetails);

module.exports = router;