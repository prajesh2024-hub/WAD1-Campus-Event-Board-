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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
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
module.exports.eventExists = async function(title, startDate, endDate, time, venue) {
  const existing = await Event.findOne({ title, startDate, endDate, time, venue });
  return existing !== null;
};

// helper: add event
module.exports.addEvent = async function(title, description, startDate, endDate, time, venue, category, maxAttendees, createdBy = null) {
  const newEvent = new Event({
    title,
    description,
    startDate,
    endDate,
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
module.exports.retrieveAll = function () {
  return Event.find()
    .populate("createdBy")
    .populate("attendees")
    .sort({ startDate: 1 })
};


// helper: get all filtered events
module.exports.retrieveFiltered = async function(search, category, dateFrom, dateTo) {
  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (dateFrom || dateTo) {
    query.startDate = {};
    if (dateFrom) query.startDate.$gte = new Date(dateFrom);
    if (dateTo) query.startDate.$lte = new Date(dateTo);
  }

  return await Event.find(query).populate("createdBy").populate("attendees").sort({ startDate: 1 });
};

module.exports.updateevents = function(id, title, description, startDate, endDate, time, venue, category, maxAttendees) {
  return Event.findByIdAndUpdate(id, { title, description, startDate, endDate, time, venue, category, maxAttendees }, { new: true });
};

module.exports.deleteEvent = async function(id) {
  return await Event.findByIdAndDelete(id);
};


