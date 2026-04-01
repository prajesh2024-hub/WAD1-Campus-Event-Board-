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

    res.render('my-wishlist', {
      events,
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

    const wishlist = await Wishlist.findOne({ userId });
    if (wishlist) {
      wishlist.items = wishlist.items.filter(item => item.event.toString() !== eventId);
      await wishlist.save();
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
