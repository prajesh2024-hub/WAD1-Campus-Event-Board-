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
  organizer: {
    type: String,
    required: true
  },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  waitList:[
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
  createdByUsername: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviews: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      userName: String,
      rating: Number,
      reviewText: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;

// helper: check duplicate event
module.exports.eventExists = async function(title, description, startDate, endDate, time, venue, category, maxAttendees, organizer) {
  const conditions = [];
  if (title) conditions.push({ title });
  if (description) conditions.push({ description });
  if (startDate) conditions.push({ startDate: new Date(startDate) });
  if (endDate) conditions.push({ endDate: new Date(endDate) });
  if (time) conditions.push({ time });
  if (venue) conditions.push({ venue });
  if (category) conditions.push({ category });
  if (maxAttendees) conditions.push({ maxAttendees });
  if (organizer) conditions.push({ organizer });

  if (conditions.length === 0) return false;

  const existing = await Event.findOne({conditions});
  return existing !== null;
};

// helper: add event
module.exports.addEvent = async function(title, description, startDate, endDate, time, venue, category, maxAttendees, organizer, createdBy = null, createdByUsername = null) {
  const newEvent = new Event({
    title,
    description,
    startDate,
    endDate,
    time,
    venue,
    category,
    maxAttendees,
    organizer,
    createdBy,
    createdByUsername,
    attendees: [],
    attendeeWaitList: [],
  });

  return await newEvent.save();
};

// helper: get all events
module.exports.retrieveAll = function () {
  return Event.find()
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

  return await Event.find(query).populate("attendees").sort({ startDate: 1 });
};

module.exports.updateevents = function(id, title, description, startDate, endDate, time, venue, category, maxAttendees) {
  return Event.findByIdAndUpdate(id, { title, description, startDate, endDate, time, venue, category, maxAttendees }, { new: true });
};

module.exports.deleteEvent = async function(id) {
  return await Event.findByIdAndDelete(id);
};


