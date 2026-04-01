const Events = require("./../model/events-model");

// GET /
async function getHome(req, res) {
  try {
    const events = await Events.retrieveAll().limit(3);

    res.render("index", {
      events,
      currentUser: req.session && req.session.user ? req.session.user : null
    });
  } catch (error) {
    console.error("getHome error:", error);
  }
}

// GET /create-event
async function getCreateEvent(req, res) {
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
      organizer: req.session.user.username || "",
      clicked: false,
      error: [],
      currentUser: req.session.user
    });
  } catch (error) {
    console.error("getCreateEvent error:", error);
    res.status(500).render("error", { message: "Failed to load create event page." });
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

    const result = await Events.eventExists(
      title,
      description,
      dateFrom,
      dateTo,
      time,
      venue,
      category,
      maxAttendees,
      organizer
    );

    if (result) {
      error.push("Error adding event: a duplicate event already exists.");
      return res.render("create-event", {
        title,
        description,
        dateFrom,
        dateTo,
        time,
        venue,
        category,
        maxAttendees,
        organizer,
        clicked,
        error,
        currentUser: req.session.user
      });
    }

    await Events.addEvent(
      title,
      description,
      dateFrom,
      dateTo,
      time,
      venue,
      category,
      maxAttendees,
      organizer,
      req.session.user._id,
      req.session.user.username
    );

    res.redirect("/my-events");
  } catch (err) {
    console.error("postCreateEvent error:", err);
    res.status(500).render("error", { message: "Error creating event." });
  }
}

// GET /all-events
async function allEvents(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const userRole = req.session.user.role;
    const eventslist = await Events.retrieveAll();

    res.render("all-events", {
      eventslist,
      search: "",
      category: "",
      dateFrom: "",
      dateTo: "",
      userRole,
      currentUser: req.session.user
    });
  } catch (error) {
    console.error("allEvents error:", error);
    res.status(500).render("error", { message: "Error reading database." });
  }
}

// POST /all-events
async function postAllEvents(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const userRole = req.session.user.role;
    const { search, category, dateFrom, dateTo } = req.body;
    let eventslist;

    if (search || category || dateFrom || dateTo) {
      eventslist = await Events.retrieveFiltered(search, category, dateFrom, dateTo);
    } else {
      eventslist = await Events.retrieveAll();
    }

    res.render("all-events", {
      eventslist,
      search: search || "",
      category: category || "",
      dateFrom: dateFrom || "",
      dateTo: dateTo || "",
      userRole,
      currentUser: req.session.user
    });
  } catch (error) {
    console.error("postAllEvents error:", error);
    res.status(500).render("error", { message: "Error reading database." });
  }
}

// GET /my-events
async function eventList(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const eventslist = await Events.find({ createdBy: req.session.user._id })
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
    res.status(500).render("error", { message: "Error reading database." });
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

      if (event.createdBy && event.createdBy.id.toString() === currentUserId) {
        isOwner = true;
      }

      for (const attendee of event.attendees) {
        if (attendee._id.toString() === currentUserId) {
          hasJoined = true;
          break;
        }
      }
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
    res.status(500).render("error", { message: "Failed to load event details." });
  }
}

// GET /events/:id/edit
async function editEvent(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const event = await Events.findById(req.params.id);

    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    res.render("edit-event", {
      event,
      clicked: false,
      error: [],
      currentUser: req.session.user
    });
  } catch (error) {
    console.error("editEvent error:", error);
    res.status(500).render("error", { message: "Error reading database." });
  }
}

// POST /events/:id/edit
async function postEditEvent(req, res) {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }

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

    if (!existing) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    const noChanges =
      existing.title === title &&
      existing.description === description &&
      existing.startDate.toISOString().split("T")[0] === startDate &&
      existing.endDate.toISOString().split("T")[0] === endDate &&
      existing.time === time &&
      existing.venue === venue &&
      existing.category === category &&
      String(existing.maxAttendees) === String(maxAttendees);

    if (noChanges) {
      return res.render("edit-event", {
        event: existing,
        clicked: true,
        error: ["No changes were made."],
        currentUser: req.session.user
      });
    }

    await Events.updateevents(
      id,
      title,
      description,
      startDate,
      endDate,
      time,
      venue,
      category,
      maxAttendees
    );

    res.redirect("/my-events");
  } catch (error) {
    console.error("postEditEvent error:", error);
    res.status(500).render("error", { message: "Error updating database." });
  }
}

// GET /events/:id/delete
async function getDeleteEvent(req, res) {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }

  const id = req.params.id;
  try {
    const event = await Events.findById(id);

    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    res.render("delete-event", {
      event,
      currentUser: req.session.user
    });
  } catch (error) {
    console.error("getDeleteEvent error:", error);
    res.status(500).render("error", { message: "Error loading delete page." });
  }
}

// POST /events/:id/delete
async function deleteEvent(req, res) {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }

  const id = req.params.id;
  try {
    await Events.deleteEvent(id);
    res.redirect("/all-events");
  } catch (error) {
    console.error("deleteEvent error:", error);
    res.status(500).render("error", { message: "Error deleting event." });
  }
}

// GET /events/:id/participants
async function getParticipants(req, res) {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  const id = req.params.id;
  try {
    const event = await Events.findById(id).populate("attendees");
    const participants = event.attendees;
    res.render("my-participants", {
      participants,
      event,
      currentUser: req.session.user
    });
  } catch (error) {
    console.error("getParticipants error:", error);
    res.status(500).render("error", { message: "Error loading participants." });
  }
}

// POST /events/:id/participants/remove
async function postParticipants(req, res) {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  const id = req.params.id;
  const userId = req.body.userId;
  try {
    const event = await Events.findById(id);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }
    event.attendees = event.attendees.filter(
      attendeeId => attendeeId.toString() !== userId.toString()
    );
    await event.save();
    res.redirect(`/events/${id}/participants`);
  } catch (error) {
    console.error("postParticipants error:", error);
    res.status(500).render("error", { message: "Error removing participant." });
  }
}

module.exports = {
  getHome,
  getCreateEvent,
  postCreateEvent,
  allEvents,
  postAllEvents,
  eventList,
  getEventDetails,
  editEvent,
  postEditEvent,
  getDeleteEvent,
  deleteEvent,
  getParticipants,
  postParticipants
};