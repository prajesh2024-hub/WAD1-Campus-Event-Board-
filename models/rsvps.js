const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { requireLogin } = require("../middleware/authMiddleware");

// RSVP to event
router.post("/events/:id/rsvp", requireLogin, async (req, res) => {
  try {
    const eventId = req.params.id;
    const currentUserId = req.session.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    // cannot RSVP own event
    if (event.createdBy.toString() === currentUserId.toString()) {
      return res.status(400).render("error", {
        message: "You cannot RSVP to your own event."
      });
    }

    // prevent duplicate RSVP
    const alreadyJoined = event.attendees.some(
      (attendeeId) => attendeeId.toString() === currentUserId.toString()
    );

    if (alreadyJoined) {
      return res.status(400).render("error", {
        message: "You have already joined this event."
      });
    }

    // optional capacity check
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).render("error", {
        message: "This event is already full."
      });
    }

    event.attendees.push(currentUserId);
    await event.save();

    res.redirect(`/events/${eventId}`);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to RSVP." });
  }
});

// cancel RSVP
router.post("/events/:id/cancel-rsvp", requireLogin, async (req, res) => {
  try {
    const eventId = req.params.id;
    const currentUserId = req.session.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    event.attendees = event.attendees.filter(
      (attendeeId) => attendeeId.toString() !== currentUserId.toString()
    );

    await event.save();

    res.redirect(`/events/${eventId}`);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to cancel RSVP." });
  }
});

// my RSVPs page
router.get("/my-rsvps", requireLogin, async (req, res) => {
  try {
    const currentUserId = req.session.user._id;

    const joinedEvents = await Event.find({
      attendees: currentUserId
    }).populate("createdBy");

    res.render("my-rsvps", {
      events: joinedEvents,
      currentUser: req.session.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load My RSVPs." });
  }
});

module.exports = router;