const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
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
});

// Keep model name 'WishlistCollection' so existing DB data is still accessible
const Wishlist = mongoose.model('WishlistCollection', wishlistSchema);

module.exports = Wishlist;
