const Event = require('../model/events-model');
const WishlistCollection = require('../model/wishlist-model');

function getCurrentUserId(req) {
  return req.session && req.session.user && (req.session.user.id || req.session.user._id);
}

async function getMyWishlist(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const currentUserId = getCurrentUserId(req);

    const collections = await WishlistCollection.find({ userId: currentUserId }).populate('items.event');

    res.render('my-wishlist', {
      collections,
      currentUser: req.session.user
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
      return res.status(400).render('error', { message: 'Collection name cannot be empty.' });
    }

    const collection = await WishlistCollection.findOne({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).render('error', { message: 'Wishlist collection not found.' });
    }

    collection.name = newName;
    await collection.save();

    res.redirect('/my-wishlist');
  } catch (error) {
    console.error('editCollectionName error:', error);
    res.status(500).render('error', { message: 'Failed to update wishlist collection name.' });
  }
}

async function moveWishlistEvent(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = getCurrentUserId(req);
    const fromCollectionId = req.params.collectionId;
    const eventId = req.params.eventId;
    const targetCollectionId = req.body.targetCollectionId;

    if (!targetCollectionId) {
      return res.status(400).render('error', { message: 'Target collection is required.' });
    }

    if (fromCollectionId === targetCollectionId) {
      return res.redirect('/my-wishlist');
    }

    const fromCollection = await WishlistCollection.findOne({ _id: fromCollectionId, userId });
    const toCollection = await WishlistCollection.findOne({ _id: targetCollectionId, userId });

    if (!fromCollection || !toCollection) {
      return res.status(404).render('error', { message: 'Collection not found.' });
    }

    fromCollection.items = fromCollection.items.filter(item => item.event.toString() !== eventId);

    const existsInTarget = toCollection.items.some(item => item.event.toString() === eventId);
    if (!existsInTarget) {
      toCollection.items.push({ event: eventId });
    }

    await fromCollection.save();
    await toCollection.save();

    res.redirect('/my-wishlist');
  } catch (error) {
    console.error('moveWishlistEvent error:', error);
    res.status(500).render('error', { message: 'Failed to move event between collections.' });
  }
}

module.exports = {
  getMyWishlist,
  showAddToWishlistForm,
  addToWishlist,
  removeFromWishlist,
  removeEventFromAllCollections,
  editCollectionName,
  moveWishlistEvent
};
