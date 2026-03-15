// GET /events/create
exports.getCreateEvent = (req, res) => {
    res.render('create-event');
};

// POST /events
exports.postCreateEvent = (req, res) => {
    // Business logic will go here
    res.render('event-details', { event: req.body });
};
