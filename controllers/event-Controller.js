//Get Service Model
const Events = require("./../model/events-model");
const WishlistCollection = require("../model/wishlist-model");

// GET /create-event
async function getCreateEvent(req, res) {
  try {
    //renders an empty form for the ejs
    res.render("create-event", {
      title: "",
      description: "",
      dateFrom: "",
      dateTo: "",
      time: "",
      venue: "",
      category: "",
      maxAttendees: "",
      duration: "",
      organizer: req.session.user.username || "",
      clicked: false,
      error: [],
      currentUser: req.session.user,
    });
    //standard error catch
  } catch (error) {
    console.error("getCreateEvent error:", error);
    res
      .status(500)
      .render("error", { message: "Failed to load create event page." });
  }
}

// POST /create-event
// Receives the form submission and creates a new event in the database
async function postCreateEvent(req, res) {
  // gathers all info of the user inputs
  const title = req.body.title;
  const description = req.body.description;
  const dateFrom = req.body.dateFrom;
  const dateTo = req.body.dateTo;
  const time = req.body.time;
  const venue = req.body.venue;
  const category = req.body.category;
  const maxAttendees = req.body.maxAttendees || 50;
  const duration = req.body.duration;
  const organizer = req.body.organizer;
  // create an empty list to collect validation errors
  const error = [];
  //set clicked as true
  const clicked = true;

  if (isNaN(maxAttendees) || maxAttendees < 1) {
    error.push("Max attendees must be a positive number.");
    // renders the form with their previous answers
    return res.render("create-event", {
      title,
      description,
      dateFrom,
      dateTo,
      time,
      venue,
      category,
      maxAttendees,
      duration,
      organizer,
      clicked,
      error,
      currentUser: req.session.user,
    });
  }

  if (new Date(dateFrom) > new Date(dateTo)) {
    error.push("Error adding event: dateFrom cannot be later than dateTo.");
    // renders the form with their previous answers
    return res.render("create-event", {
      title,
      description,
      dateFrom,
      dateTo,
      time,
      venue,
      category,
      maxAttendees,
      duration,
      organizer,
      clicked,
      error,
      currentUser: req.session.user,
    });}

  if (isNaN(duration) || duration < 1) {
    error.push("Duration must be a positive number.");
    // renders the form with their previous answers
    return res.render("create-event", {
      title,
      description,
      dateFrom,
      dateTo,
      time,
      venue,
      category,
      maxAttendees,
      duration,
      organizer,
      clicked,
      error,
      currentUser: req.session.user,
    });}

  try {
    //check if event exists, returns true or false
    const result = await Events.eventExists(
      title,
      dateFrom,
      dateTo,
      time,
      venue,
      category,
      duration,
    );

    if (result) {
      //push error message to the list
      error.push("Error adding event: a duplicate event already exists.");
      // renders the form with their previous answers for the users to change the event to avoid duplicates
      return res.render("create-event", {
        title,
        description,
        dateFrom,
        dateTo,
        time,
        venue,
        category,
        maxAttendees,
        duration,
        organizer,
        clicked,
        error,
        currentUser: req.session.user,
      });
    }

    // adds the new event, and also stores the creators ID and username
    // to know who created it and also loads up all events created by that particular user
    await Events.addEvent(
      title,
      description,
      dateFrom,
      dateTo,
      time,
      venue,
      category,
      maxAttendees,
      duration,
      organizer,
      req.session.user.id,
      req.session.user.username,
    );

    res.redirect("/my-events");
    //standard catch for error
  } catch (err) {
    console.error("postCreateEvent error:", err);
    res.status(500).render("error", { message: "Error creating event." });
  }
}

// GET /all-events

async function allEvents(req, res) {
  try {
    const userRole = req.session.user.role;
    const currentUserId = req.session.user.id.toString();
    const eventsList = await Events.retrieveAll();

    // userwishlist
    const userWishlist = await WishlistCollection.findOne({
      userId: currentUserId,
    });
    const wishlistMap = {};
    if (userWishlist) {
      userWishlist.items.forEach((item) => {
        wishlistMap[item.event.toString()] = true;
      });
    }
    // the form is for the search part
    res.render("all-events", {
      eventsList,
      search: "",
      category: "",
      dateFrom: "",
      dateTo: "",
      userRole,
      wishlistMap,
      currentUser: req.session.user,
    });
  } catch (error) {
    console.error("allEvents error:", error);
    res.status(500).render("error", { message: "Error reading database." });
  }
}

// POST /all-events
async function postAllEvents(req, res) {
  try {
    const userRole = req.session.user.role;
    const currentUserId = req.session.user.id.toString();
    const search = req.body.search;
    const category = req.body.category;
    const dateFrom = req.body.dateFrom;
    const dateTo = req.body.dateTo;

    // Get filtered events from the model
    const eventsList = await Events.retrieveFiltered(
      search,
      category,
      dateFrom,
      dateTo,
    );

    const userWishlist = await WishlistCollection.findOne({
      userId: currentUserId,
    });
    const wishlistMap = {};
    if (userWishlist) {
      userWishlist.items.forEach((item) => {
        wishlistMap[item.event.toString()] = true;
      });
    }

    res.render("all-events", {
      eventsList,
      search: search || "",
      category: category || "",
      dateFrom: dateFrom || "",
      dateTo: dateTo || "",
      userRole,
      wishlistMap,
      currentUser: req.session.user,
    });
  } catch (error) {
    console.error("postAllEvents error:", error);
    res.status(500).render("error", { message: "Error reading database." });
  }
}

// GET /my-events
async function eventList(req, res) {
  try {
    const eventsList = await Events.retrieveFromUser(req.session.user.id);

    res.render("my-events", {
      eventsList,
      currentUser: req.session.user,
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
      .populate("waitlist");
    // checks if event even exists if not return error
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    // Backend Checks for error handling
    const attendeeCount = event.attendees.length;
    let hasJoined = false;
    let isOwner = false;

    //checks as per individual event to see if the user is the owner of the event
    if (req.session && req.session.user) {
      const currentUserId = req.session.user.id.toString();
      if (event.createdBy && event.createdBy.id.toString() === currentUserId) {
        isOwner = true;
      }
      // loops through the attendees list to check if the current user has already joined the event
      // hasJoined controls which buttons are shown in the view (join vs cancel)
      for (let attendee of event.attendees) {
        if (attendee.id.toString() === currentUserId) {
          hasJoined = true;
          break;
        }
      }
    }

    // Checks if user is inside the waitlist
    let isWaitlisted = false;

    for (let waitlisted of event.waitlist){
      if (waitlisted._id.toString() === req.session.user.id.toString()) {
        isWaitlisted = true;
      }
    }


    // Fetch host's other past events that have at least one review
    let hostPastReviews = [];
    if (event.createdBy) {
      // Step 1 - Get all events by the same host
      const hostEvents = await Events.find({
        createdBy: event.createdBy.id,
      }).select("title endDate reviews");

      // Step 2 - Filter in JavaScript
      const now = new Date();

      for (let i = 0; i < hostEvents.length; i++) {
        let hostEvent = hostEvents[i];

        // Skip the current event we're already viewing
        let isDifferentEvent = hostEvent.id.toString() !== event.id.toString();

        // Check if the event has already ended
        let isInThePast = new Date(hostEvent.endDate) < now;

        // Check if the event has at least one review
        let hasReviews = hostEvent.reviews.length > 0;

        if (isDifferentEvent && isInThePast && hasReviews) {
          hostPastReviews.push(hostEvent);
        }
      }
    }
    res.render("event-details", {
      event,
      attendeeCount,
      hasJoined,
      isOwner,
      isWaitlisted,
      hostPastReviews,
      currentUser: req.session && req.session.user ? req.session.user : null,
    });
  } catch (error) {
    console.error("getEventDetails error:", error);
    res
      .status(500)
      .render("error", { message: "Failed to load event details." });
  }
}

// GET /events/:id/edit
async function editEvent(req, res) {
  try {
    let clicked = false;
    let error = [];
    let currentUser = req.session.user;
    const event = await Events.findById(req.params.id);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }
    res.render("edit-event", {
      event,
      clicked,
      error,
      currentUser,
    });
  } catch (error) {
    console.error("editEvent error:", error);
    res.status(500).render("error", { message: "Error reading database." });
  }
}

// POST /events/:id/edit
async function postEditEvent(req, res) {
  const id = req.params.id;
  const title = req.body.title;
  const description = req.body.description;
  const dateFrom = req.body.dateFrom;
  const dateTo = req.body.dateTo;
  const time = req.body.time;
  const venue = req.body.venue;
  const category = req.body.category;
  const maxAttendees = req.body.maxAttendees;
  const duration = req.body.duration;

  try {
    const existing = await Events.findById(id);

    if (!existing) {
      return res.status(404).render("error", { message: "Event not found." });
    }
    // checks if there is any changes made at all for each of the field
    // if there is changes it would return false
    // if there is no changes it would return true
    // .toISOString().split("T")[0] converts it to "2026-04-03" from 2026-04-03T00:00:00.000Z
    // dateFrom on the other hand comes from req.body.dateFrom which is already in a YYYY-MM-DD string 
    const noChanges =
      existing.title === title &&
      existing.description === description &&
      existing.startDate.toISOString().split("T")[0] === dateFrom &&
      existing.endDate.toISOString().split("T")[0] === dateTo &&
      existing.time === time &&
      existing.venue === venue &&
      existing.category === category &&
      String(existing.maxAttendees) === String(maxAttendees) &&
      String(existing.duration) === String(duration);

    if (noChanges) {
      return res.render("edit-event", {
        event: existing,
        clicked: true,
        error: ["No changes were made."],
        currentUser: req.session.user,
      });
    }
    // validates that the start date is not later than the end date
    // requires new date to change from string to Date form
    if (new Date(dateFrom) > new Date(dateTo)) {
      return res.render("edit-event", {
        event: existing,
        clicked: true,
        error: ["Error: start date cannot be later than end date."],
        currentUser: req.session.user,
      });
    }

    await Events.updateEvents(
      id,
      title,
      description,
      dateFrom,
      dateTo,
      time,
      venue,
      category,
      maxAttendees,
      duration,
    );

    res.redirect("/my-events");
  } catch (error) {
    console.error("postEditEvent error:", error);
    res.status(500).render("error", { message: "Error updating database." });
  }
}

// GET /events/:id/delete
// session is needed for the navbar to show who logged and what to display
async function getDeleteEvent(req, res) {
  const id = req.params.id;
  try {
    const event = await Events.findById(id);

    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    res.render("delete-event", {
      event,
      currentUser: req.session.user,
    });
  } catch (error) {
    console.error("getDeleteEvent error:", error);
    res.status(500).render("error", { message: "Error loading delete page." });
  }
}

// POST /events/:id/delete
async function deleteEvent(req, res) {
  const id = req.params.id;
  try {
    await Events.deleteEvent(id);
    res.redirect("/my-events");
  } catch (error) {
    console.error("deleteEvent error:", error);
    res.status(500).render("error", { message: "Error deleting event." });
  }
}

// GET /events/:id/participants
// currentUser is passed to the view for the navbar
async function getParticipants(req, res) {
  const id = req.params.id;
  try {
    const event = await Events.findById(id).populate("attendees");
    if (!event) {                         
        return res.status(404).render("error", {
    message: "Event not found." });  
    }        
    const participants = event.attendees;                      
    res.render("my-participants", {
      participants,
      event,
      currentUser: req.session.user,
    });
  } catch (error) {
    console.error("getParticipants error:", error);
    res.status(500).render("error", { message: "Error loading participants." });
  }
}

// POST /events/:id/participants/remove
async function postParticipants(req, res) {
  const id = req.params.id;
  const userId = req.body.userId;
  try {
    const event = await Events.findById(id);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }
    const updatedAttendees = [];
    for (let attendee of event.attendees) {
      if (attendee.toString() !== userId.toString()) {
        updatedAttendees.push(attendee);
      }
    }
    event.attendees = updatedAttendees;
    await event.save();
    res.redirect(`/events/${id}/participants`);
  } catch (error) {
    console.error("postParticipants error:", error);
    res.status(500).render("error", { message: "Error removing participant." });
  }
}

module.exports = {
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
  postParticipants,
};
