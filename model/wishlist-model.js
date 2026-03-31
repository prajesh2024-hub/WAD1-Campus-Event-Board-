const mongoose = require('mongoose');

const wishlistCollectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  items: [
    {
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const WishlistCollection = mongoose.model('WishlistCollection', wishlistCollectionSchema);

module.exports = WishlistCollection;
