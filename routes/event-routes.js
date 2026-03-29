const express = require('express');

const eventController = require('../controllers/event-Controller');

const router = express.Router(); // creates the router object from express

//root home page
router.get("/", eventController.getHome);

//create events and showing all events created
router.get("/create-event", eventController.getCreateEvent);
router.post("/create-event", eventController.postCreateEvent);

//shows all events
router.get("/all-events", eventController.allEvents);

//show all events created by the user
router.get("/my-events", eventController.eventList);

//edit events
router.get("/events/:id/edit", eventController.editEvent);
router.post("/events/:id/edit", eventController.postEditEvent);

//delete event
router.get("/events/:id/delete", eventController.getDeleteEvent);
router.post("/events/:id/delete", eventController.deleteEvent);

//removing participants from an event
router.get('/events/:id/participants', eventController.getParticipants); 
router.post('/events/:id/participants/remove', eventController.postParticipants); 

//getting event details
router.get("/events/:id", eventController.getEventDetails);
// EXPORT
module.exports = router;