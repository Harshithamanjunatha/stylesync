// server/models/SavedOutfit.js
const mongoose = require('mongoose');

const SavedOutfitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      default: 'My Outfit',
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClothingItem',
      },
    ],
    occasion: {
      type: String,
      enum: ['casual', 'formal', 'sport', 'party', 'beach', 'work', 'date'],
      default: 'casual',
    },
    score: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedOutfit', SavedOutfitSchema);