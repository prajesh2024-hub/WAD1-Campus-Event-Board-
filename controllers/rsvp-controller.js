// import the Event model so we can read and update event data in MongoDB
const Event = require("../model/events-model");

// POST /events/:id/rsvp
// this function lets a logged-in user RSVP for an event 
// first check whether the user is logged in
// if not, redirect them to the login page
async function joinEvent(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const eventId = req.params.id;
    const currentUserId = req.session.user.id;

    // find the event in the database using its ID
    const event = await Event.findById(eventId);
    // if the event does not exist, show an error page
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    // prevent the creator of the event from RSVPing to their own event
    if (event.createdBy && event.createdBy.toString() === currentUserId.toString()) {
      return res.status(400).render("error", {
        message: "You cannot RSVP to your own event."
      });
    }

    
    // check whether the current user has already joined this event
    const alreadyJoined = event.attendees.some(
      attendeeId => attendeeId.toString() === currentUserId.toString()
    );

    // if the user is already attending, do not allow duplicate RSVP 
    if (alreadyJoined) {
      return res.status(400).render("error", {
        message: "You have already joined this event."
      });
    }

    event.attendees.push(currentUserId);
    console.log(event.attendees)
    //save event to MongoDB
    await event.save();

    // if anything unexpected happens, print the error and return a server error if not redirect to /events page
    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("joinEvent error:", error);
    res.status(500).send(error.message);
  }
}

// POST /events/:id/cancel-rsvp
//removes RSVP from an event
async function cancelRSVP(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }
    //get event ID and current user ID
    const eventId = req.params.id;
    const currentUserId = req.session.user.id;

    const event = await Event.findById(eventId);

    //show error page if event not found
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    // removes the user from the attendees list by filtering out their ID
    // This method creates a new array by including only those elements that 
    //satisfy the condition provided in the callback function.
    event.attendees = event.attendees.filter(
      attendeeId => attendeeId.toString() !== currentUserId.toString()
    );
    // checks if there are waitlisted people if not empty array
    if(!event.waitlist) {
        event.waitlist = []
    };

    // Add waitlisted person if conditions are fulfilled
    if (event.attendees.length < event.maxAttendees && event.waitlist.length>0){
      const nextPerson = event.waitlist.shift();
      console.log(nextPerson)
      event.attendees.push(nextPerson);
    }

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

    const currentUserId = req.session.user.id;

    // find all events where the user appears in either:
    // 1. the attendees list
    // 2. the waitlist
    //This query checks if the currentUserId exists in 
    //either the attendees array or the waitlist array of the event with the given eventId.
    //get events where the user is either attending or waitlisted
    const events = await Event.find({
      $or: [
        { attendees: currentUserId },
        { waitlist: currentUserId }
      ]
    })
      .populate("createdBy") //replace with actual user data instead of just ID
      .populate("attendees")
      .sort({ startDate: 1 });

    // render the My RSVPs page and pass the event data in
    res.render("my-rsvps", {
      events,
      currentUser: req.session.user
    });
  } catch (error) {
    console.error("getMyRSVPs error:", error);
    res.status(500).send(error.message);
  }
}
// this function shows the waitlist prompt page for a full event
async function PromptWaitlist (req,res){
  try{
     // get the event ID from the route parameter
     // get current user ID from session 
     // find the event in the database
    const eventId = req.params.id;
    const currentUserId = req.session.user.id;
    const event = await Event.findById(eventId);

    res.render('waitlist-prompt', {event})
  } catch (error) {
    console.error("waitlistRSVPs error:", error);
    res.status(500).send(error.message);
  }
}

// this function adds a logged-in user to the waitlist of a full event
async function waitlistRSVPs (req,res){
  try {
    // check if the user is logged in
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }
    // get event ID and current user ID
    const eventId = req.params.id;
    const currentUserId = req.session.user.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }
    // remove this part once old databases are removed
    if (!event.attendees) event.attendees = [];
    if (!event.waitlist) event.waitlist = [];

    //Check if user is already in the attendees list
    const alreadyJoined = event.attendees.some(
      id => id.toString() === currentUserId.toString()
    );
    if (alreadyJoined) {
      return res.status(400).render("error", { message: "You are already attending this event." });
    }

    //Check if they are already on the waitlist
    const alreadyWaitlisted = event.waitlist.some(
      id => id.toString() === currentUserId.toString()
    );
    if (alreadyWaitlisted) {
      return res.status(400).render("error", { message: "You are already on the waitlist." });
    }

    //Add to waitlist if checks are sucessful
    event.waitlist.push(currentUserId);
    await event.save();
    console.log(event.waitlist) 
    res.redirect(`/events/${eventId}`);
    // res.render(`/waitlist-prompt`);

  } catch (error) { 
    console.error("waitlistRSVPs error:", error);
    res.status(500).send(error.message);
  }
}

// export so that the route file can use them
module.exports = {
  joinEvent,
  cancelRSVP,
  getMyRSVPs,
  waitlistRSVPs,
  PromptWaitlist
};