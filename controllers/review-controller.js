const Event = require("../model/events-model");

async function getReview(req, res) {
  
  try {
    //check if there is a session going on and if there's a user tied to it.
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    const userId = req.session.user.id.toString();
    const hasAttended = event.attendees.includes(userId);

    // If the user hasn't attended the event, show an error page
    if (!hasAttended) {
      return res.status(403).render("error", {
        message: "You must attend the event to review it."
      });
    }

    // If the event doesn't exist, show an error page
    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }
    
    // Check if the user has already reviewed this event
    let alreadyReviewed = false;
    for (const review of event.reviews || []) {
      if (review.userId && review.userId.toString() === userId) {
        alreadyReviewed = true;
        break; // stops early ✓
      }
    }
    res.render("review-prompt", {
      event,
      
      alreadyReviewed
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
    const userId = req.session.user.id.toString();


    // Initialize reviews array if it doesn't exist
    if (!event.reviews) {
      event.reviews = [];
    }

    // Check if the user has already reviewed this event
    let alreadyReviewed = false;
    for (const review of event.reviews || []) {
      if (review.userId && review.userId.toString() === userId) {
        alreadyReviewed = true;
        break; // stops early ✓
      }
    }
    // Check if rating is between 1 and 5
    const parsedRating = parseInt(rating)
    if (isNaN(parsedRating) ||parsedRating < 1 || parsedRating > 5){
      return res.status(400).render("error",{message:"Rating must be between 1 and 5."})
    }
    // Add new review
    event.reviews.push({
      userId: req.session.user.id,
      userName: req.session.user.username,
      rating: parsedRating,
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
    const userId = req.session.user.id;
    // Fetch event with reviews and organizer info
    const event = await Event.findById(eventId).populate('createdBy');


    if (!event.createdBy || event.createdBy._id.toString() !== userId) {
      return res.status(403).render("error", {
        message: "Only the event organizer can view reviews."
      });
    }

    if (!event) {
      return res.status(404).render("error", { message: "Event not found." });
    }

    res.render("reviews", {
      event,
      reviews: event.reviews || [],
      currentUser: req.session.user
    });
  } catch (error) {
    console.error("getEventReviews error:", error);
    res.status(500).send("Failed to load reviews.");
  }
}


// GET /my-reviews — all reviews the logged-in user has written
async function getMyReviews(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const userId = req.session.user.id.toString();
    // Find all events that have reviews by this user
    const events = await Event.find({ "reviews.userId": userId }).select("title reviews");

    // Check if we're in edit mode for a specific review
    const editingId = req.query.editing || null;

    // Flatten to just the user's own reviews, keeping the parent event info
    const myReviews = [];
    events.forEach(event => {
      event.reviews.forEach(review => {
        if (review.userId && review.userId.toString() === userId) {
          myReviews.push({ event, review });
        }
      });
    });
    // Sort reviews by most recent first
    myReviews.sort((a, b) => new Date(b.review.createdAt) - new Date(a.review.createdAt));

    res.render("my-reviews", { myReviews, currentUser: req.session.user, editingId });
  } catch (error) {
    console.error("getMyReviews error:", error);
    res.status(500).send("Failed to load your reviews.");
  }
}

// POST /events/:id/reviews/:reviewId/update
async function updateReview(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const { id: eventId, reviewId } = req.params;
    const { rating, reviewText } = req.body;
    const userId = req.session.user.id.toString();

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).render("error", { message: "Event not found." });

    const review = event.reviews.id(reviewId);
    if (!review) return res.status(404).render("error", { message: "Review not found." });

    review.rating = parseInt(rating);
    review.reviewText = reviewText;
    await event.save();

    res.redirect("/my-reviews");
  } catch (error) {
    console.error("updateReview error:", error);
    res.status(500).send("Failed to update review.");
  }
}

// POST /events/:id/reviews/:reviewId/delete
async function deleteReview(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const { id: eventId, reviewId } = req.params;
    const userId = req.session.user.id.toString();

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).render("error", { message: "Event not found." });

    const review = event.reviews.id(reviewId);
    if (!review) return res.status(404).render("error", { message: "Review not found." });

    const isAdmin = req.session.user.role === 'admin';
    const isOwner = review.userId && review.userId.toString() === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).render("error", { message: "Not authorized to delete." });
    }

    review.deleteOne();
    await event.save();

    res.redirect(isAdmin && !isOwner ? `/events/${eventId}` : "/my-reviews");
  } catch (error) {
    console.error("deleteReview error:", error);
    res.status(500).send("Failed to delete review.");
  }
}

module.exports = {
  getReview,
  postReview,
  getEventReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};