// server/routes/wardrobe.js
const express = require('express');
const router = express.Router();
const ClothingItem = require('../models/ClothingItem');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../middleware/upload');

// All wardrobe routes are protected
router.use(protect);

// ─── GET /api/wardrobe — Get all items for current user ───────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, occasion, season, search } = req.query;
    const filter = { user: req.user._id };

    if (category) filter.category = category;
    if (occasion) filter.occasion = { $in: [occasion] };
    if (season) filter.season = { $in: [season] };
    if (search) filter.name = { $regex: search, $options: 'i' };

    const items = await ClothingItem.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/wardrobe — Add new clothing item with image ────────────────────
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const { name, category, color, colorFamily, occasion, season, style, brand, tags } = req.body;

    const item = await ClothingItem.create({
      user: req.user._id,
      name,
      category,
      color,
      colorFamily: colorFamily || 'neutral',
      occasion: occasion ? JSON.parse(occasion) : ['casual'],
      season: season ? JSON.parse(season) : ['all'],
      style: style ? JSON.parse(style) : ['classic'],
      brand: brand || '',
      tags: tags ? JSON.parse(tags) : [],
      imageUrl: req.file.path,
      imagePublicId: req.file.filename,
    });

    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/wardrobe/:id — Get single item ──────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const item = await ClothingItem.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/wardrobe/:id — Update item ──────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const item = await ClothingItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/wardrobe/:id — Delete item + Cloudinary image ───────────────
router.delete('/:id', async (req, res) => {
  try {
    const item = await ClothingItem.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    // Delete from Cloudinary
    if (item.imagePublicId) {
      await cloudinary.uploader.destroy(item.imagePublicId);
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Item removed from wardrobe' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/wardrobe/:id/favorite — Toggle favorite ──────────────────────
router.patch('/:id/favorite', async (req, res) => {
  try {
    const item = await ClothingItem.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.isFavorite = !item.isFavorite;
    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;