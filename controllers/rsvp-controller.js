const Event = require("../model/events-model");

// POST /events/:id/rsvp
async function joinEvent(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const eventId = req.params.id;
    const currentUserId = req.session.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    if (event.createdBy && event.createdBy.toString() === currentUserId.toString()) {
      return res.status(400).render("error", {
        message: "You cannot RSVP to your own event."
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
    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).render("waitlist-prompt",{message: "This event is already full. Would you like to be placed on the waitlist?",eventId: eventId})
      }

    event.attendees.push(currentUserId);
    console.log(event.attendees)
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
    const currentUserId = req.session.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    event.attendees = event.attendees.filter(
      attendeeId => attendeeId.toString() !== currentUserId.toString()
    );
    // checks if there are waitlisted people
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

    const events = await Event.find({
      $or: [
        { attendees: currentUserId },
        { waitlist: currentUserId }
      ]
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

async function PromptWaitlist (req,res){
  try{
    const eventId = req.params.id;
    const currentUserId = req.session.user.id;
    const event = await Event.findById(eventId);

    res.render('waitlist-prompt', {event})
  } catch (error) {
    console.error("waitlistRSVPs error:", error);
    res.status(500).send(error.message);
  }
}
async function waitlistRSVPs (req,res){
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }
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

    //Add to waitlist

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


module.exports = {
  joinEvent,
  cancelRSVP,
  getMyRSVPs,
  waitlistRSVPs,
  promptWaitlist
};