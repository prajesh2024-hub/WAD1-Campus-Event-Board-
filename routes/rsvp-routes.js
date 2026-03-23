const express = require("express");
const router = express.Router();
const rsvpController = require("../controllers/rsvp-controller");

router.post("/events/:id/rsvp", rsvpController.joinEvent);
router.post("/events/:id/cancel-rsvp", rsvpController.cancelRSVP);
router.get("/my-rsvps", rsvpController.getMyRSVPs);

module.exports = router;