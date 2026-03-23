// Get Service model
const Events = require('./../models/events-model');

// GET /
exports.getHome = (req, res) => {
    res.render('events');
};

// GET /create-event
exports.getCreateEvent = async (req, res) => {
    let title = req.query.title || "";
    let description = req.query.description || "";
    let date = req.query.date || "";
    let time = req.query.time || "";
    let location = req.query.location || "";
    let category = req.query.category || "";
    let maxAttendees = req.query.maxAttendees || "";
    let clicked = false;
    let error = [];
    res.render('create-event', { title, description, date, time, location, category, maxAttendees, clicked, error });
};

// POST /create-event
exports.postCreateEvent = async (req, res) => {
    let title = req.body.title;
    let description = req.body.description;
    let date = req.body.date;
    let time = req.body.time;
    let location = req.body.location;
    let category = req.body.category;
    let maxAttendees = req.body.maxAttendees;
    let clicked = true;
    let error = [];

    try {
        let isDuplicate = await Events.eventExists(title, date, time, location);
        if (isDuplicate) {
            error.push('Error adding event, this event already exists');
            res.render('create-event', { title, description, date, time, location, category, maxAttendees, clicked, error });
        } else {
            await Events.addEvent(title, description, date, time, location, category, maxAttendees);
            res.render('create-event', { title, description, date, time, location, category, maxAttendees, clicked, error });
        }
    } catch (err) {
        console.error(err);
        res.send('Error reading database');
    }
};

exports.eventList = async (req,res) => {
 try {
      const { search, category, dateFrom, dateTo } = req.query;
      let eventslist;
      
      if (search || category || dateFrom || dateTo) {
        eventslist = await Events.retrieveFiltered(search, category, dateFrom, dateTo);
      } else {
        eventslist = await Events.retrieveAll();
      }
      
      let template = "my-events";
      
      if (req.path === "/all-events") {
        template = "all-events";
      } else if (req.path === "/edit-events") {
        template = "edit-event";
      }
      
      res.render(template, {eventslist, search, category, dateFrom, dateTo});
    } catch (error) {                                   
      res.send("Error reading database");               
    }  
}

exports.editEvent = async (req,res) => {
 try {          
      res.render("edit-event", {});
    } catch (error) {                                   
      res.send("Error reading database");               
    }  
}