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
  waitlist: [
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

// check duplicate event
module.exports.eventExists = async function (
  title,
  description,
  dateFrom,
  dateTo,
  time,
  venue,
  category,
  maxAttendees,
  organizer
) {
  const existing = await Event.findOne({
    title: title,
    description: description,
    startDate: new Date(dateFrom),
    endDate: new Date(dateTo),
    time: time,
    venue: venue,
    category: category,
    maxAttendees: Number(maxAttendees),
    organizer: organizer
  });

  return existing !== null;
};

// add event
module.exports.addEvent = async function (
  title,
  description,
  startDate,
  endDate,
  time,
  venue,
  category,
  maxAttendees,
  organizer,
  createdBy = null,
  createdByUsername = null
) {
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
    waitlist: []
  });

  return await newEvent.save();
};

// get all events (upcoming/active only)
module.exports.retrieveAll = function () {
  return Event.find({ endDate: { $gte: new Date() } })
    .populate("attendees")
    .populate("createdBy")
    .sort({ startDate: 1 });
};

// filtered events
module.exports.retrieveFiltered = async function (search, category, dateFrom, dateTo) {
  let query = { endDate: { $gte: new Date() } };

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

  return await Event.find(query)
    .populate("attendees")
    .populate("createdBy")
    .sort({ startDate: 1 });
};

module.exports.updateevents = function (
  id,
  title,
  description,
  startDate,
  endDate,
  time,
  venue,
  category,
  maxAttendees
) {
  return Event.findByIdAndUpdate(
    id,
    { title, description, startDate, endDate, time, venue, category, maxAttendees },
    { new: true }
  );
};

module.exports.deleteEvent = async function (id) {
  return await Event.findByIdAndDelete(id);
};

module.exports.findbyid = async function (id) {
  return await Event.findById(id)
    .populate("attendees")
    .populate("createdBy");
};