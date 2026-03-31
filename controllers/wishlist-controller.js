const Event = require('../model/events-model');
const WishlistCollection = require('../model/wishlist-model');

function getCurrentUserId(req) {
  return req.session && req.session.user && (req.session.user.id || req.session.user._id);
}

function normalizeName(name) {
  return name.toLowerCase().replace(/\s+/g, '');
}

async function getMyWishlist(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const currentUserId = getCurrentUserId(req);

    const collections = await WishlistCollection.find({ userId: currentUserId }).populate('items.event');

    // Build RSVP status map for all events in wishlist
    const rsvpStatus = {};
    if (collections && collections.length > 0) {
      collections.forEach(collection => {
        if (collection.items && collection.items.length > 0) {
          collection.items.forEach(item => {
            if (item.event) {
              const isAttendee = item.event.attendees && item.event.attendees.some(
                attendeeId => attendeeId.toString() === currentUserId.toString()
              );
              rsvpStatus[item.event._id] = isAttendee;
            }
          });
        }
      });
    }

    // Get error messages from session
    const collectionError = req.session.collectionError || null;
    const collectionEditError = req.session.collectionEditError || null;
    const activeCollectionId = req.session.activeCollectionId || null;

    // Clear error messages after capturing them
    req.session.collectionError = null;
    req.session.collectionEditError = null;
    req.session.activeCollectionId = null;

    res.render('my-wishlist', {
      collections,
      currentUser: req.session.user,
      rsvpStatus,
      collectionError,
      collectionEditError,
      activeCollectionId
    });
  } catch (error) {
    console.error('getMyWishlist error:', error);
    res.status(500).render('error', { message: 'Failed to load My Wishlist.' });
  }
}

async function showAddToWishlistForm(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).render('error', { message: 'Event not found.' });
    }

    const currentUserId = getCurrentUserId(req);
    const collections = await WishlistCollection.find({ userId: currentUserId });

    res.render('wishlist-select', {
      event,
      collections,
      currentUser: req.session.user
    });
  } catch (error) {
    console.error('showAddToWishlistForm error:', error);
    res.status(500).render('error', { message: 'Failed to load wishlist selection.' });
  }
}

async function addToWishlist(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const eventId = req.params.id;
    const userId = getCurrentUserId(req);

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).render('error', { message: 'Event not found.' });
    }

    let collection;
    if (req.body.collectionId) {
      collection = await WishlistCollection.findOne({ _id: req.body.collectionId, userId });
      if (!collection) {
        return res.status(400).render('error', { message: 'Selected wishlist collection does not exist.' });
      }
    } else if (req.body.newCollectionName && req.body.newCollectionName.trim().length > 0) {
      collection = await WishlistCollection.create({
        userId,
        name: req.body.newCollectionName.trim(),
        items: []
      });
    } else {
      return res.status(400).render('error', { message: 'Please select or create a wishlist collection.' });
    }

    const alreadyAdded = collection.items.some((item) => item.event.toString() === eventId);
    if (!alreadyAdded) {
      collection.items.push({ event: eventId });
      await collection.save();
    }

    res.redirect('/my-wishlist');
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
    const collectionId = req.params.collectionId;
    const eventId = req.params.eventId;

    const collection = await WishlistCollection.findOne({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).render('error', { message: 'Wishlist collection not found.' });
    }

    collection.items = collection.items.filter(item => item.event.toString() !== eventId);
    await collection.save();

    res.redirect('/my-wishlist');
  } catch (error) {
    console.error('removeFromWishlist error:', error);
    res.status(500).render('error', { message: 'Failed to remove event from wishlist.' });
  }
}

async function removeEventFromAllCollections(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = getCurrentUserId(req);
    const eventId = req.params.eventId;

    await WishlistCollection.updateMany(
      { userId },
      { $pull: { items: { event: eventId } } }
    );

    res.redirect('/all-events');
  } catch (error) {
    console.error('removeEventFromAllCollections error:', error);
    res.status(500).render('error', { message: 'Failed to remove event from wishlist.' });
  }
}

async function editCollectionName(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = getCurrentUserId(req);
    const collectionId = req.params.collectionId;
    const newName = req.body.collectionName && req.body.collectionName.trim();

    if (!newName) {
      req.session.collectionEditError = 'Collection name cannot be empty.';
      req.session.activeCollectionId = collectionId;
      return res.redirect('/my-wishlist');
    }

    const collection = await WishlistCollection.findOne({ _id: collectionId, userId });
    if (!collection) {
      req.session.collectionEditError = 'Wishlist collection not found.';
      return res.redirect('/my-wishlist');
    }

    // Check for duplicate names (ignoring case and spaces)
    const normalizedNewName = normalizeName(newName);
    const existingCollections = await WishlistCollection.find({ userId });
    const duplicateName = existingCollections.some(
      col => col._id.toString() !== collectionId && normalizeName(col.name) === normalizedNewName
    );
    if (duplicateName) {
      req.session.collectionEditError = 'A collection with the same name already exists.';
      req.session.activeCollectionId = collectionId;
      return res.redirect('/my-wishlist');
    }

    collection.name = newName;
    await collection.save();

    req.session.collectionEditError = null;
    req.session.activeCollectionId = null;
    res.redirect('/my-wishlist');
  } catch (error) {
    console.error('editCollectionName error:', error);
    req.session.collectionEditError = 'Failed to update wishlist collection name.';
    res.redirect('/my-wishlist');
  }
}

async function deleteCollection(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = getCurrentUserId(req);
    const collectionId = req.params.collectionId;

    const collection = await WishlistCollection.findOneAndDelete({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).render('error', { message: 'Wishlist collection not found.' });
    }

    req.session.collectionError = null;
    res.redirect('/my-wishlist');
  } catch (error) {
    console.error('createCollection error:', error);
    req.session.collectionError = 'Failed to create wishlist collection.';
    res.redirect('/my-wishlist');
  }
}

async function createCollection(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = getCurrentUserId(req);
    const collectionName = req.body.collectionName && req.body.collectionName.trim();

    if (!collectionName) {
      req.session.collectionError = 'Collection name cannot be empty.';
      return res.redirect('/my-wishlist');
    }

    // Check for duplicate names (ignoring case and spaces)
    const normalizedName = normalizeName(collectionName);
    const existingCollections = await WishlistCollection.find({ userId });
    const duplicateName = existingCollections.some(
      col => normalizeName(col.name) === normalizedName
    );
    if (duplicateName) {
      req.session.collectionError = 'A collection with the same name already exists.';
      return res.redirect('/my-wishlist');
    }

    await WishlistCollection.create({
      userId,
      name: collectionName,
      items: []
    });

    req.session.collectionError = null;
    res.redirect('/my-wishlist');
  } catch (error) {
    console.error('createCollection error:', error);
    req.session.collectionError = 'Failed to create wishlist collection.';
    res.redirect('/my-wishlist');
  }
}

module.exports = {
  getMyWishlist,
  showAddToWishlistForm,
  addToWishlist,
  removeFromWishlist,
  removeEventFromAllCollections,
  editCollectionName,
  deleteCollection,
  createCollection
};
