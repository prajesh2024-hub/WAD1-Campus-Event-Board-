const express = require("express");
const router = express.Router();
const rsvpController = require("../controllers/rsvp-controller");


router.post("/events/:id/rsvp", rsvpController.joinEvent);
router.post("/events/:id/cancel-rsvp", rsvpController.cancelRSVP);
router.get("/my-rsvps", rsvpController.getMyRSVPs);
router.post("/events/:id/waitlist", rsvpController.PromptWaitlist)
<<<<<<< Updated upstream
router.post("/events/:id/waitlisted", rsvpController.waitlistRSVPs);

=======
router.post("/events/:id/waitlist", rsvpController.waitlistRSVPs);
>>>>>>> Stashed changes
module.exports = router;