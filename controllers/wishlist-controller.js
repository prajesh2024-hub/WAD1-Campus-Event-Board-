const Event = require('../model/events-model');
const Wishlist = require('../model/wishlist-model');

function getCurrentUserId(req) {
  return req.session && req.session.user && (req.session.user.id || req.session.user._id);
}

async function getMyWishlist(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = getCurrentUserId(req);
    const wishlist = await Wishlist.findOne({ userId }).populate('items.event');
    const events = wishlist ? wishlist.items.map(i => i.event).filter(Boolean) : [];

    const now = new Date();
    const getEventStart = (event) => {
      if (!event || !event.startDate || !event.time) return null;
      const start = new Date(event.startDate);
      const [hours, minutes] = event.time.split(':').map(Number);
      start.setHours(hours || 0, minutes || 0, 0, 0);
      return start;
    };

    const upcomingEvents = events.filter(event => {
      const eventStart = getEventStart(event);
      return eventStart && eventStart >= now;
    });

    const ongoingPastEvents = events.filter(event => {
      const eventStart = getEventStart(event);
      return eventStart && eventStart < now;
    });

    res.render('my-wishlist', {
      events: upcomingEvents,
      ongoingPastEvents,
      currentUser: req.session.user
    });
  } catch (error) {
    console.error('getMyWishlist error:', error);
    res.status(500).render('error', { message: 'Failed to load wishlist.' });
  }
}

async function addToWishlist(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = getCurrentUserId(req);
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).render('error', { message: 'Event not found.' });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, items: [] });
    }

    const alreadyAdded = wishlist.items.some(item => item.event.toString() === eventId);
    if (!alreadyAdded) {
      wishlist.items.push({ event: eventId });
      await wishlist.save();
    }

    res.redirect('/all-events');
  } catch (error) {
    console.error('addToWishlist error:', error);
    res.status(500).render('error', { message: 'Failed to add event to wishlist.' });
  }
}

async function removeFromWishlist(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = getCurrentUserId(req);
    const eventId = req.params.eventId;
    // get fromPage from body to determine redirect
    const fromPage = req.body.fromPage;

    const wishlist = await Wishlist.findOne({ userId });
    if (wishlist) {
      wishlist.items = wishlist.items.filter(item => item.event.toString() !== eventId);
      await wishlist.save();
    }

    // redirect back to the appropriate page based on where the request came from
    if (fromPage === 'my-wishlist') {
      return res.redirect('/my-wishlist');
    }
    res.redirect('/all-events');
  } catch (error) {
    console.error('removeFromWishlist error:', error);
    res.status(500).render('error', { message: 'Failed to remove event from wishlist.' });
  }
}

module.exports = {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist
};
