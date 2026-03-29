const Event = require("../model/events-model");

async function getReview(req, res) {
  //check if there is a session going on and if there's a user tied to it.
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    res.render("reviews", {
      event,
      currentUser: req.session.user
    });

  } catch (error) {
    console.error("getReview error:", error);
    res.status(500).send("Failed to load review page.");
  }
}

async function postReview(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const eventId = req.params.id;
    const { rating, reviewText } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    // Initialize reviews array if it doesn't exist
    if (!event.reviews) {
      event.reviews = [];
    }

    // Add new review
    event.reviews.push({
      userId: req.session.user.id,
      userName: req.session.user.username,
      rating: parseInt(rating),
      reviewText: reviewText,
      createdAt: new Date()
    });

    await event.save();
    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("postReview error:", error);
    res.status(500).send("Failed to submit review.");
  }
}

// GET reviews for an event (only organizer can view)
async function getEventReviews(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const eventId = req.params.id;
    const event = await Event.findById(eventId).populate('createdBy');

    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    // Check if current user is the organizer
    if (event.createdBy._id.toString() !== req.session.user.id.toString()) {
      return res.status(403).render("error", { message: "You can only view reviews for your own events." });
    }

    res.render("my-review", {
      event,
      reviews: event.reviews || [],
      currentUser: req.session.user
    });
  } catch (error) {
    console.error("getEventReviews error:", error);
    res.status(500).send("Failed to load reviews.");
  }
}

module.exports = {
  getReview,
  postReview,
  getEventReviews
};