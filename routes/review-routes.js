 const express = require('express');
 const router = express.Router();
 const reviewController = require('../controllers/review-controller');

//review event
router.get("/events/:id/review", reviewController.getReview);
router.post("/events/:id/review", reviewController.postReview);

// View reviews for event (only organizer)
router.get("/events/:id/reviews", reviewController.getEventReviews);

module.exports = router;