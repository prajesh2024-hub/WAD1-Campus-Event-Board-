const express = require("express");
const router = express.Router();
const rsvpController = require("../controllers/rsvp-controller");
const wishlistController = require("../controllers/wishlist-controller");

router.post("/events/:id/rsvp", rsvpController.joinEvent);
router.post("/events/:id/cancel-rsvp", rsvpController.cancelRSVP);
router.get("/my-rsvps", rsvpController.getMyRSVPs);
router.post("/events/:id/waitlist", rsvpController.promptWaitlist);
router.post("/events/:id/waitlisted", rsvpController.waitlistRSVPs);
router.post("/events/:id/waitlist", rsvpController.waitlistRSVPs);
router.post("/events/:id/leave-waitlist",rsvpController.cancelWaitlist);

router.get("/my-wishlist", wishlistController.getMyWishlist);
router.post("/events/:eventId/add", wishlistController.addToWishlist);
router.post("/events/:eventId/remove", wishlistController.removeFromWishlist);
router.post("/my-wishlist/events/:eventId/remove", wishlistController.removeFromWishlist);

module.exports = router;