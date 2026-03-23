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
    return Event.find().sort({ date: 1 });
}

module.exports.retrieveFiltered = function(search, category, dateFrom, dateTo) {
    let query = {};
    
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    
    if (category) {
        query.category = category;
    }
    
    if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) {
            query.date.$gte = new Date(dateFrom);
        }
        if (dateTo) {
            query.date.$lte = new Date(dateTo);
        }
    }
    
    return Event.find(query).sort({ date: 1 });
}