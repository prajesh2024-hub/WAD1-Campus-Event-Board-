const Events = require('./../model/events-model');

// GET /
async function getHome(req, res) {
  //tries to fect all the events 
  try {
    const events = await Events.retrieveAll().limit(3);

    res.render("index", {
      events,
      currentUser: req.session && req.session.user ? req.session.user : null
    });
  } catch (error) {
    console.error("getHome error:", error);
    res.status(500).send(error.message);
  }
}

// create events
async function getCreateEvent(req, res) {
  //check if there is a session going on and if there's a user tied to it.
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    res.render("create-event", {
      title: "",
      description: "",
      dateFrom: "",
      dateTo: "",
      time: "",
      venue: "",
      category: "",
      maxAttendees: "",
      organizer: "",
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
  const title = req.body.title;
  const description = req.body.description;
  const dateFrom = req.body.dateFrom;
  const dateTo = req.body.dateTo;
  const time = req.body.time;
  const venue = req.body.venue;
  const category = req.body.category;
  const maxAttendees = req.body.maxAttendees || 50;
  const organizer = req.body.organizer;
  const error = [];
  const clicked = true;

  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const result = await Events.eventExists(title, description, dateFrom, dateTo, time, venue, category, maxAttendees, organizer);
    if (result) {
      error.push("Error adding event: a duplicate event already exists.");
      res.render("create-event", { title, description, dateFrom, dateTo, time, venue, category, maxAttendees, organizer, clicked, error });
    } else {
      await Events.addEvent(
        title, description, dateFrom, dateTo, time, venue, category, maxAttendees, organizer,
        req.session.user.id,
        req.session.user.username
      );
      res.render("create-event", { title: '', description: '', dateFrom: '', dateTo: '', time: '', venue: '', category: '', maxAttendees: '', organizer: '', clicked, error });
    }
  } catch (err) {
    console.error("postCreateEvent error:", err);
    res.send("Error reading database");
  }
}

// GET /all-events
async function allEvents(req, res) {
  try {
    const { search, category, dateFrom, dateTo } = req.query;
    let eventslist;

    if (search || category || dateFrom || dateTo) {
      eventslist = await Events.retrieveFiltered(search, category, dateFrom, dateTo);
    } else {
      eventslist = await Events.retrieveAll();
    }

    res.render("all-events", { eventslist, search, category, dateFrom, dateTo });
  } catch (error) {
    console.error("allEvents error:", error);
    res.send("Error reading database");
  }
}

// GET /my-events
async function eventList(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const eventslist = await Events.find({ createdBy: req.session.user.id })
      .populate("attendees")
      .populate("createdBy")
      .populate("waitlist")
      .sort({ startDate: 1 });

    res.render("my-events", {
      eventslist,
      currentUser: req.session.user
    });

  } catch (error) {
    console.error("eventList error:", error);
    res.send("Error reading database");
  }
}

// GET /events/:id
async function getEventDetails(req, res) {
  try {
    const event = await Events.findById(req.params.id)
      .populate("createdBy")
      .populate("attendees")
      .populate("waitlist")
    // checks if event even exists if not return error
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    const attendeeCount = event.attendees.length;

    let hasJoined = false;
    let isOwner = false;

    if (req.session && req.session.user) {
      const currentUserId = req.session.user.id.toString();

      isOwner = event.createdBy ? event.createdBy.toString() === currentUserId : false;
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

// GET /events/:id/edit
async function editEvent(req, res) {
  try {
    const event = await Events.findById(req.params.id);

    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    res.render("edit-event", {
      event,
      clicked: false,
      error: [],
      currentUser: req.session && req.session.user ? req.session.user : null
    });
  } catch (error) {
    console.error("editEvent error:", error);
    res.send("Error reading database");
  }
}

// POST /events/:id/edit
async function postEditEvent(req, res) {
  const id = req.params.id;
  const title = req.body.title;
  const description = req.body.description;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const time = req.body.time;
  const venue = req.body.venue;
  const category = req.body.category;
  const maxAttendees = req.body.maxAttendees;

  try {
    const existing = await Events.findById(id);

    //check if the event itself exist if it doesn't exist meaning 
    //that it edits an empty event then ti sends out an error
    if (!existing) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    // check every field to see if anything actually changed
    const noChanges =
      existing.title === title &&
      existing.description === description &&
    // since startDate format is under 2026-03-26T00:00:00.000Z, so we need
    //  to make it into a string first then splitting under T
      existing.startDate.toISOString().split('T')[0] === startDate &&
      existing.endDate.toISOString().split('T')[0] === endDate &&
      existing.time === time &&
      existing.venue === venue &&
      existing.category === category &&
      String(existing.maxAttendees) === String(maxAttendees);

    if (noChanges) {
      return res.render("edit-event", {
        event: existing,
        clicked: true,
        error: ["No changes were made."],
        currentUser: req.session && req.session.user ? req.session.user : null
      });
    }

    // otherwise save the update
    const result = await Events.updateevents(id, title, description, startDate, endDate, time, venue, category, maxAttendees);
    console.log(result);
    res.redirect('/my-events');
  } catch (error) {
    console.error("postEditEvent error:", error);
    res.send("Error updating database");
  }
}

// GET /events/:id/delete
async function getDeleteEvent(req, res) {
  const id = req.params.id;
  try {
    const event = await Events.findById(id);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }
    res.render("delete-event", { event });
  } catch (error) {
    console.error("getDeleteEvent error:", error);
    res.send("Error loading delete page");
  }
}

// POST /events/:id/delete
async function deleteEvent(req, res) {
  const id = req.params.id;
  try {
    await Events.deleteEvent(id);
    console.log("Event deleted:", id);
    res.redirect("/my-events");
  } catch (error) {
    console.error("deleteEvent error:", error);
    res.send("Error deleting event");
  }
}

module.exports = {
  getHome,
  getEventDetails,
  getCreateEvent,
  postCreateEvent,
  allEvents,
  eventList,
  editEvent,
  postEditEvent,
  getDeleteEvent,
  deleteEvent
};
