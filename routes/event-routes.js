const express = require("express");
const eventController = require("../controllers/event-Controller");

const router = express.Router();

// homepage route
router.get("/index", (req, res) => {
  res.render("index");
});

// get-post routing for creating event
router.get("/create-event", eventController.getCreateEvent);
router.post("/create-event", eventController.postCreateEvent);

// get-post routing for seeing all events
router.get("/all-events", eventController.allEvents);
router.post("/all-events", eventController.postAllEvents);

// get route for seeing all my events
router.get("/my-events", eventController.eventList);

// get-post route for editing events made by the user
router.get("/events/:id/edit", eventController.editEvent);
router.post("/events/:id/edit", eventController.postEditEvent);

// get-post route for deleting events made by the user
router.get("/events/:id/delete", eventController.getDeleteEvent);
router.post("/events/:id/delete", eventController.deleteEvent);

// get-post route for gathering participants information and removing them
// from events made by the user
router.get("/events/:id/participants", eventController.getParticipants);
router.post("/events/:id/participants/remove", eventController.postParticipants);

// get route for getting events details for an event
router.get("/events/:id", eventController.getEventDetails);

module.exports = router;