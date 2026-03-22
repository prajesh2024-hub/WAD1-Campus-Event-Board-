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
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;

module.exports.eventExists = async function(title, date, time, venue) {
    const existing = await Event.findOne({ title, date, time, venue });
    return existing !== null;
}

module.exports.addEvent = function(title, description, date, time, venue, category, maxAttendees) {
    const newEvent = new Event({ title, description, date, time, venue, category, maxAttendees });
    return newEvent.save();
}

module.exports.retrieveAll = function() {
    return Event.find();
}