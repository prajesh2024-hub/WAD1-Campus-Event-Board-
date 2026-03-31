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
  waitlist:[
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
  }, // it make is it deafults so that the time created is now
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
  ] // plis help explain what is this
});


// set the mongoose model under and object called event
const Event = mongoose.model("Event", eventSchema);

//export event 
module.exports = Event;

// helper: check duplicate event
// checks for duplicates if there is any found within it
module.exports.eventExists = async function(title, description, dateFrom, dateTo, time, venue, category, maxAttendees, organizer) {
  const existing = await Event.findOne({
    title: title,
    description: description,
    startDate: new Date(dateFrom),
    endDate: new Date(dateTo),
    time: time,
    venue: venue,
    category: category,
    maxAttendees: maxAttendees,
    organizer: organizer
  });
  // if matching was found then return true while if it was not found then it would return null then it would return false;\
  return existing !== null;
};

// helper: add event
// basically just adds a new event with all the details
// from the input gained from the user in the EJS
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
    waitlist: [],
  });

  return await newEvent.save();
};

// helper: get all events
// basically returns all the events 
// mongoose function .find() without a specific
// event returns everything
// .populate is used to be able to retrieve
// sorts it based on relevance from earlest to latest
// in ascending order
module.exports.retrieveAll = function () {
  return Event.find().sort({ startDate: 1 })
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

// find by Event ID and it details the updating them using
// mongoose built-in function

module.exports.updateevents = function(id, title, description, startDate, endDate, time, venue, category, maxAttendees) {
  return Event.findByIdAndUpdate(id, { title, description, startDate, endDate, time, venue, category, maxAttendees }, { new: true });
};

// find by Event/Object ID of event then deleting the event
// using mongoose built-in function 
module.exports.deleteEvent = async function(id) {
  return await Event.findByIdAndDelete(id);
};

// find by object of event by event ID

// the populate function is used to replace all the array
// of user IDs with the full user objects used for reasons 
// of security, preventing users who have access to mongodb database
// they can't directly know by name who's joining the event

// same goes with the populate for createdby
module.exports.findbyid = async function(id) {
  return await Event.findById(id).populate("attendees").populate("createdBy");                            
}

