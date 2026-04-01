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

// get all events created by a specific user
module.exports.retrieveFromUser = function (userId) {
  return Event.find({ createdBy: userId })
    .populate("attendees")
    .populate("createdBy")
    .populate("waitlist")
    .sort({ startDate: 1 });
};

// get all events
module.exports.retrieveAll = function () {
  return Event.find()
    .populate("attendees")
    .populate("createdBy")
    .sort({ startDate: 1 });
};

// Get all events, then narrow them down based on what the user searched for
module.exports.retrieveFiltered = async function (search, category, dateFrom, dateTo) {

  // Step 1 - Get all events from the database
  let allEvents = await Event.retrieveAll()


  // Step 2 - Loop through every event and only keep ones that match the filters
  let filteredEvents = [];

  for (let i = 0; i < allEvents.length; i++) {
    let event = allEvents[i];

    // Check if the event title matches the search word (if no search was given, this is always true)
    // so basically it's trying to say of if serach is indeed there and it exists and the       
    // includes return true, then it would mean false or true, which is true entirely, if !search 
    //  is true then it won't bother going to the include part correct 
    let matchesSearch = !search || event.title.toLowerCase().includes(search.toLowerCase());

    // Check if the event category matches the selected category (if no category was given, this is always true)
    let matchesCategory = !category || event.category === category;

    // Check if the event starts on or after the from date (if no from date was given, this is always true)
    let matchesDateFrom = !dateFrom || new Date(event.startDate) >= new Date(dateFrom);

    // Check if the event starts on or before the to date (if no to date was given, this is always true)
    let matchesDateTo = !dateTo || new Date(event.startDate) <= new Date(dateTo);

    // If the event passed all 4 checks, add it to the results list
    if (matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo) {
      filteredEvents.push(event);
    }
  }

  return filteredEvents;
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
    id,{ title, description, startDate, endDate, time, venue, category, maxAttendees },{ new: true });
};

module.exports.deleteEvent = async function (id) {
  return await Event.findByIdAndDelete(id);
};

module.exports.findbyid = async function (id) {
  return await Event.findById(id)
    .populate("attendees")
    .populate("createdBy");
};