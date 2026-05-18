// server/routes/outfits.js
const express = require('express');
const router = express.Router();
const ClothingItem = require('../models/ClothingItem');
const SavedOutfit = require('../models/SavedOutfit');
const { protect } = require('../middleware/auth');
const { generateRecommendations } = require('../utils/recommendationEngine');

router.use(protect);

// ─── GET /api/outfits/recommend ───────────────────────────────────────────────
router.get('/recommend', async (req, res) => {
  try {
    const { occasion, season, limit } = req.query;

    const wardrobe = await ClothingItem.find({ user: req.user._id });

    if (wardrobe.length < 2) {
      return res.json({
        success: true,
        recommendations: [],
        message: 'Add at least 2 items to your wardrobe to get recommendations!',
      });
    }

    const recommendations = generateRecommendations(wardrobe, {
      occasion,
      season,
      limit: parseInt(limit) || 6,
      userPrefs: {
        stylePreferences: req.user.stylePreferences,
        favoriteColors: req.user.favoriteColors,
      },
    });

    res.json({ success: true, count: recommendations.length, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/outfits/save — Save a liked outfit ────────────────────────────
router.post('/save', async (req, res) => {
  try {
    const { itemIds, name, occasion, score, notes } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length < 1) {
      return res.status(400).json({ success: false, message: 'itemIds array required' });
    }

    // Validate items belong to user
    const items = await ClothingItem.find({ _id: { $in: itemIds }, user: req.user._id });
    if (items.length !== itemIds.length) {
      return res.status(400).json({ success: false, message: 'Some items not found in your wardrobe' });
    }

    const outfit = await SavedOutfit.create({
      user: req.user._id,
      name: name || `Outfit ${Date.now()}`,
      items: itemIds,
      occasion: occasion || 'casual',
      score: score || 0,
      notes: notes || '',
    });

    // Increment timesWorn for each item
    await ClothingItem.updateMany({ _id: { $in: itemIds } }, { $inc: { timesWorn: 1 } });

    const populated = await outfit.populate('items');
    res.status(201).json({ success: true, outfit: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/outfits/saved — Get all saved outfits ──────────────────────────
router.get('/saved', async (req, res) => {
  try {
    const outfits = await SavedOutfit.find({ user: req.user._id })
      .populate('items')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: outfits.length, outfits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/outfits/:id — Delete saved outfit ───────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const outfit = await SavedOutfit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!outfit) return res.status(404).json({ success: false, message: 'Outfit not found' });
    res.json({ success: true, message: 'Outfit deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;