const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  maxAttendees: {
    type: Number,
    default: 50
  },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;

// helper: check duplicate event
module.exports.eventExists = async function(title, date, time, venue) {
  const existing = await Event.findOne({ title, date, time, venue });
  return existing !== null;
};

// helper: add event
module.exports.addEvent = async function(title, description, date, time, venue, category, maxAttendees, createdBy = null) {
  const newEvent = new Event({
    title,
    description,
    date,
    time,
    venue,
    category,
    maxAttendees,
    createdBy,
    attendees: []
  });

  return await newEvent.save();
};

// helper: get all events
module.exports.retrieveAll = function() {
  return Event.find().populate("createdBy").populate("attendees");
};