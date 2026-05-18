// server/models/ClothingItem.js
const mongoose = require('mongoose');

const ClothingItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'activewear'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
    },
    colorFamily: {
      type: String,
      enum: ['warm', 'cool', 'neutral', 'earth', 'pastel', 'vibrant'],
      default: 'neutral',
    },
    occasion: {
      type: [String],
      enum: ['casual', 'formal', 'sport', 'party', 'beach', 'work', 'date'],
      default: ['casual'],
    },
    season: {
      type: [String],
      enum: ['spring', 'summer', 'autumn', 'winter', 'all'],
      default: ['all'],
    },
    style: {
      type: [String],
      enum: ['minimalist', 'streetwear', 'classic', 'bohemian', 'sporty', 'formal', 'vintage'],
      default: ['classic'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image is required'],
    },
    imagePublicId: {
      type: String, // Cloudinary public_id for deletion
    },
    brand: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    timesWorn: {
      type: Number,
      default: 0,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast querying by user
ClothingItemSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('ClothingItem', ClothingItemSchema);