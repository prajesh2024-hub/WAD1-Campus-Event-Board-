const Events = require("../models/events-model");

// GET /
async function getHome(req, res) {
  try {
    const events = await Events.find()
      .populate("createdBy")
      .sort({ date: 1 })
      .limit(3);

    res.render("index", {
      events,
      currentUser: req.session && req.session.user ? req.session.user : null
    });
  } catch (error) {
    console.error("getHome error:", error);
    res.status(500).send(error.message);
  }
}

// GET /events/:id
async function getEventDetails(req, res) {
  try {
    const event = await Events.findById(req.params.id)
      .populate("createdBy")
      .populate("attendees");

    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    const attendeeCount = event.attendees.length;

    let hasJoined = false;
    let isOwner = false;

    if (req.session && req.session.user) {
      const currentUserId = req.session.user._id.toString();

      isOwner = event.createdBy._id.toString() === currentUserId;
      hasJoined = event.attendees.some(
        attendee => attendee._id.toString() === currentUserId
      );
    }

    res.render("event-details", {
      event,
      attendeeCount,
      hasJoined,
      isOwner,
      currentUser: req.session && req.session.user ? req.session.user : null
    });
  } catch (error) {
    console.error("getEventDetails error:", error);
    res.status(500).send(error.message);
  }
}

// GET /create-event
async function getCreateEvent(req, res) {
  try {
    res.render("create-event", {
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      category: "",
      maxAttendees: "",
      clicked: false,
      error: []
    });
  } catch (error) {
    console.error("getCreateEvent error:", error);
    res.status(500).send("Failed to load create event page.");
  }
}

// POST /create-event
async function postCreateEvent(req, res) {
  try {
    let title = req.body.title;
    let description = req.body.description;
    let date = req.body.date;
    let time = req.body.time;
    let venue = req.body.venue;
    let category = req.body.category;
    let maxAttendees = req.body.maxAttendees || 50;

    const newEvent = new Events({
      title,
      description,
      date,
      time,
      venue,
      category,
      maxAttendees,
      createdBy: req.session && req.session.user ? req.session.user._id : null,
      attendees: []
    });

    await newEvent.save();
    res.redirect("/");
  } catch (error) {
    console.error("postCreateEvent error:", error);
    res.status(500).send(error.message);
  }
}

// GET /my-events
async function eventList(req, res) {
  try {
    const eventslist = await Events.retrieveAll();

    res.render("my-events", {
      eventslist,
      currentUser: req.session && req.session.user ? req.session.user : null
    });
  } catch (error) {
    console.error("eventList error:", error);
    res.send("Error reading database");
  }
}

// GET /edit-events
async function editEvent(req, res) {
  try {
    res.render("edit-event", {
      currentUser: req.session && req.session.user ? req.session.user : null
    });
  } catch (error) {
    console.error("editEvent error:", error);
    res.send("Error reading database");
  }
}

module.exports = {
  getHome,
  getEventDetails,
  getCreateEvent,
  postCreateEvent,
  eventList,
  editEvent
};