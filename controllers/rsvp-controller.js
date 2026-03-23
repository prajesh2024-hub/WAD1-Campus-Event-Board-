const Event = require("../models/events-model");

// POST /events/:id/rsvp
async function joinEvent(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const eventId = req.params.id;
    const currentUserId = req.session.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    if (event.createdBy && event.createdBy.toString() === currentUserId.toString()) {
      return res.status(400).render("error", {
        message: "You cannot RSVP to your own event."
      });
    }

    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).render("error", {
        message: "This event is already full."
      });
    }

    const alreadyJoined = event.attendees.some(
      attendeeId => attendeeId.toString() === currentUserId.toString()
    );

    if (alreadyJoined) {
      return res.status(400).render("error", {
        message: "You have already joined this event."
      });
    }

    event.attendees.push(currentUserId);
    await event.save();

    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("joinEvent error:", error);
    res.status(500).send(error.message);
  }
}

// POST /events/:id/cancel-rsvp
async function cancelRSVP(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const eventId = req.params.id;
    const currentUserId = req.session.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    event.attendees = event.attendees.filter(
      attendeeId => attendeeId.toString() !== currentUserId.toString()
    );

    await event.save();

    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("cancelRSVP error:", error);
    res.status(500).send(error.message);
  }
}

// GET /my-rsvps
async function getMyRSVPs(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const currentUserId = req.session.user._id;

    const events = await Event.find({
      attendees: currentUserId
    })
      .populate("createdBy")
      .populate("attendees")
      .sort({ startDate: 1 });

    res.render("my-rsvps", {
      events,
      currentUser: req.session.user
    });
  } catch (error) {
    console.error("getMyRSVPs error:", error);
    res.status(500).send(error.message);
  }
}

module.exports = {
  joinEvent,
  cancelRSVP,
  getMyRSVPs
};