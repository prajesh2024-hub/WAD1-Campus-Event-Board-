// import express so we can create routes
const express = require("express");

// create a router object to store related routes
const router = express.Router();

// import the RSVP controller file
// this contains the functions for joining, cancelling, and viewing RSVPs
const rsvpController = require("../controllers/rsvp-controller");

// import the wishlist controller file
// this contains the functions for adding, viewing, and removing wishlist items
const wishlistController = require("../controllers/wishlist-controller");

// when a user clicks "Join Event", this route sends the request
// to the joinEvent function in the RSVP controller
router.post("/events/:id/rsvp", rsvpController.joinEvent);

// when a user clicks "Cancel RSVP", this route sends the request
// to the cancelRSVP function in the RSVP controller
router.post("/events/:id/cancel-rsvp", rsvpController.cancelRSVP);

// when a user wants to see all the events they joined,
// this route loads the My RSVPs page
router.get("/my-rsvps", rsvpController.getMyRSVPs);

// when a user tries to join a full event, this route can be used
// to show a waitlist prompt or process that step
router.post("/events/:id/waitlist", rsvpController.PromptWaitlist);

// this route adds the user into the waitlist for a specific event
router.post("/events/:id/waitlisted", rsvpController.waitlistRSVPs);

// this route also adds the user into the waitlist
// this looks duplicated with the earlier "/events/:id/waitlist" route above
// so you should probably keep only one of them depending on your intended flow
router.post("/events/:id/waitlist", rsvpController.waitlistRSVPs);


// when a user wants to see all wishlist items,
// this route loads the My Wishlist page
router.get("/my-wishlist", wishlistController.getMyWishlist);

// when a user clicks "Add to Wishlist" for an event,
// this route sends the request to the wishlist controller
router.post("/events/:id/wishlist", wishlistController.addToWishlist);

// when a user removes an event from their wishlist,
// this route sends the request to the remove function
router.post("/my-wishlist/events/:eventId/remove", wishlistController.removeFromWishlist);

// export this router so server.js can use it
module.exports = router;