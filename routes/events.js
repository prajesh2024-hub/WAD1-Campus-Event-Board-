router.get("/events/:id", async (req, res) => {
    try {
      const event = await Event.findById(req.params.id)
        .populate("createdBy")
        .populate("attendees");
  
      if (!event) {
        return res.status(404).render("error", { message: "Event not found." });
      }
  
      const attendeeCount = event.attendees.length;
  
      let hasJoined = false;
      let isOwner = false;
  
      if (req.session.user) {
        const currentUserId = req.session.user._id.toString();
  
        isOwner = event.createdBy._id.toString() === currentUserId;
        hasJoined = event.attendees.some(
          attendee => attendee._id.toString() === currentUserId
        );
      }
  
      res.render("event-details", {
        event,
        attendeeCount,
        hasJoined,
        isOwner,
        currentUser: req.session.user || null
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("error", { message: "Failed to load event details." });
    }
  });