const Events = require('./../model/events-model');

// get home route
async function getHome(req, res) {
  //tries to fecth all the events and limit them to only 3
  //put currentUser as the value for the current user, and checks
  //if there is both a session and a user, if both of either does not exist then it
  //then it sets current user as null
  //has the standard catch feature
  try {
    const events = await Events.retrieveAll().limit(3);
    res.render("index", {events,
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
  //if none then redirect to login
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }
    // renders an empty form for the ejs
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
    // standard error catch
  } catch (error) {
    console.error("getCreateEvent error:", error);
    res.status(500).send("Failed to load create event page.");
  }
}

// postint the result
async function postCreateEvent(req, res) {
  // gathers all info the user inputs
  const title = req.body.title;
  const description = req.body.description;
  const dateFrom = req.body.dateFrom;
  const dateTo = req.body.dateTo;
  const time = req.body.time;
  const venue = req.body.venue;
  const category = req.body.category;
  const maxAttendees = req.body.maxAttendees || 50;
  const organizer = req.body.organizer;
  // create an empty list to store errors
  const error = [];
  // set clicked as true
  const clicked = true;

  try {
    //check if there is a session going on and if there's a user tied to it.
    //if none then redirect to login
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }
    //check if event exists, returns true or false
    const result = await Events.eventExists(title, description, dateFrom, dateTo, time, venue, category, maxAttendees, organizer);
    // if event exist is true then it would output the error
    // else would add the event
    if (result) {
      //push error message to the list
      error.push("Error adding event: a duplicate event already exists.");
      // renders the form with their previous answers for the users to change the event to avoid duplicates
      res.render("create-event", { title, description, dateFrom, dateTo, time, venue, category, maxAttendees, organizer, clicked, error });
    } else {
      // adds the new event, and also stores the creators ID and username
      // to know who created it and also loads up all events created by that particular user
      await Events.addEvent(
        title, description, dateFrom, dateTo, time, venue, category, maxAttendees, organizer,
        req.session.user.id,
        req.session.user.username
      );
      //renders an empty form with the value clicked as true and error being empty
      res.render("create-event", { title: '', description: '', dateFrom: '', dateTo: '', time: '', venue: '', category: '', maxAttendees: '', organizer: '', clicked, error });
    }
  //standard catch for error
  } catch (err) {
    console.error("postCreateEvent error:", err);
    res.send("Error reading database");
  }
}

// GET /all-events Yit Fong pls explain
async function allEvents(req, res) {
  try {
    //check if there is a session going on and if there's a user tied to it.
    //if none then redirect to login
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }
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
    //check if there is a session going on and if there's a user tied to it.
    //if none then redirect to login
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }
    // first use the find function to find all event that is created by the current
    // user id and puts the in a post
    const eventslist = await Events.find({ createdBy: req.session.user.id })
    //populting the attendess so that it's not only object 
    // id but all the information from them as well
      .populate("attendees")
    //sort it based on relevance
      .sort({ startDate: 1 });

    // user name is passed to show the username in the navbar only
    res.render("my-events", {
      eventslist,
      currentUser: req.session.user
    });
  //standard error catch
  } catch (error) {
    console.error("eventList error:", error);
    res.send("Error reading database");
  }
}

// GET /events/:id
async function getEventDetails(req, res) {
  try {
    // find the event details based on the event id from the param
    // populate the attenedees details as well
    const event = await Events.findById(req.params.id)
      .populate("attendees");
    // checks if event even exists if not return error
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }
    // checks how many attendees are there
    const attendeeCount = event.attendees.length;

    // sets hasjoined and is onwer as false first
    let hasJoined = false;
    let isOwner = false;
    // checks first if user event exist, if exist
    // changes the user.id into a string first since
    // they are stored as a special object type
    if (req.session && req.session.user) {
      const currentUserId = req.session.user.id.toString();
      // checks if logged-in user is the event creator.
      if (event.createdBy && event.createdBy.toString() === currentUserId) {
        isOwner = true; }
      // loops through attendees, if it finds a match sets hasJoined to true and stops
      for (const attendee of event.attendees) {
        if (attendee._id.toString() === currentUserId) {
          hasJoined = true;
          break;
        }
      }
    }
    //renders the result
    res.render("event-details", {
      event,
      attendeeCount,
      hasJoined,
      isOwner,
      currentUser: req.session && req.session.user ? req.session.user : null
    });
  // standard error catch 
  } catch (error) {
    console.error("getEventDetails error:", error);
    res.status(500).send(error.message);
  }
}

// GET /events/:id/edit
async function editEvent(req, res) {
  // checks if user exists if not then send it to /login
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }
  // find event details through event id in the param 
  // does not need populate since participants details is not needed
    const event = await Events.findById(req.params.id);

  // if there's no event then sent out an error message
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }
  // then it renders the event and sets 
  // clicked as false with error as an empty list
  // and current user as for the navbar
    res.render("edit-event", {
      event,
      clicked: false,
      error: [],
      currentUser: req.session && req.session.user ? req.session.user : null
    });
  // standard error catch
  } catch (error) {
    console.error("editEvent error:", error);
    res.send("Error reading database");
  }
}

// POST /events/:id/edit
async function postEditEvent(req, res) {
  // checks if user exists if not then send it to /login
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  // sets all the details
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
    // check every field to see if anything actually changed, comparing it from the database
    // to what the user have written from the get message
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

    // if there's no changes then renders the message that no changes were made
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
  // checks if user exists if not then send it to /login
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  // find the event id from the parameter
  const id = req.params.id;
  try {
    // tries ti see if event even exists
    const event = await Events.findById(id);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }
    // if event exists then it would render the delete-event ejs with event data inside for title and the id in the param
    //
    res.render("delete-event", { event });
  //standard error catch
  } catch (error) {
    console.error("getDeleteEvent error:", error);
    res.send("Error loading delete page");
  }
}

// POST /events/:id/delete
async function deleteEvent(req, res) {
  // checks if user exists if not then send it to /login
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  // find the event id from the parameter
  const id = req.params.id;
  try {
  // delete event based on the id and redirect to my-events
    await Events.deleteEvent(id);
    console.log("Event deleted:", id);
    res.redirect("/my-events");
  // standard error catch
  } catch (error) {
    console.error("deleteEvent error:", error);
    res.send("Error deleting event");
  }
}

async function getParticipants(req, res) {
  // checks if user exists if not then send it to /login
    if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  // gets the event id from the params
  const id = req.params.id; 
  // try first on getting the event details
  // and populating the attendess details as well
  // get participants as an object from attendees
  // render the participants and the event is used for the title of the event
  try {
    const event = await Events.findById(id).populate("attendees");     
    const participants = event.attendees;
    res.render('my-participants', {participants, event}) 
  } 
  // standard error catch
  catch (error) {
    console.error("deleteEvent error:", error);
    res.send("Error deleting event");
  }
}

async function postParticipants(req, res) {
  // checks if user exists if not then send it to /login
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  // gets the event id from the params
  const id = req.params.id;

  // get the specific user id to remove — this comes from the hidden input
  // in the EJS form: <input type="hidden" name="userId" value="<%= attendee._id %>">
  // without this, the server wouldn't know which participant the Remove button was clicked for
  const userId = req.body.userId;
  try {
    const event = await Events.findById(id);

    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    // filter() loops through the attendees array and builds a NEW array
    // keeping only people whose ID does NOT match the userId we want to remove
    // .toString() is needed because MongoDB IDs are objects, not plain strings
    event.attendees = event.attendees.filter(
      attendeeId => attendeeId.toString() !== userId.toString()
    );
    // save the updated attendees array back to MongoDB
    await event.save();

    // redirect back to the participants page to show the updated list
    res.redirect(`/events/${id}/participants`);
  } catch (error) {
    console.error("postParticipants error:", error);
    res.send("Error removing participant");
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
  deleteEvent,
  getParticipants,
  postParticipants,
};
