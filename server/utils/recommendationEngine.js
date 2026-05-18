// server/utils/recommendationEngine.js

// Color harmony rules
const COLOR_COMPATIBILITY = {
  warm: ['warm', 'neutral', 'earth'],
  cool: ['cool', 'neutral', 'pastel'],
  neutral: ['warm', 'cool', 'neutral', 'earth', 'pastel', 'vibrant'],
  earth: ['warm', 'neutral', 'earth'],
  pastel: ['cool', 'neutral', 'pastel'],
  vibrant: ['neutral', 'vibrant'],
};

// Style compatibility matrix
const STYLE_COMPATIBILITY = {
  minimalist: ['minimalist', 'classic', 'formal'],
  streetwear: ['streetwear', 'sporty'],
  classic: ['classic', 'minimalist', 'formal'],
  bohemian: ['bohemian', 'vintage'],
  sporty: ['sporty', 'streetwear'],
  formal: ['formal', 'classic', 'minimalist'],
  vintage: ['vintage', 'bohemian', 'classic'],
};

/**
 * Score a combination of clothing items
 * @param {Array} items - Array of ClothingItem documents
 * @param {Object} userPrefs - { stylePreferences, favoriteColors }
 * @param {String} occasion - target occasion filter
 * @returns {Number} score 0–100
 */
function scoreOutfit(items, userPrefs = {}, occasion = null) {
  if (!items || items.length < 2) return 0;

  let score = 50; // base score

  // ── 1. Color harmony ──────────────────────────────────────────────────────
  const colorFamilies = items.map((i) => i.colorFamily || 'neutral');
  let colorScore = 0;
  for (let i = 0; i < colorFamilies.length; i++) {
    for (let j = i + 1; j < colorFamilies.length; j++) {
      const compatible = COLOR_COMPATIBILITY[colorFamilies[i]] || [];
      if (compatible.includes(colorFamilies[j])) colorScore += 10;
      else colorScore -= 5;
    }
  }
  score += Math.min(colorScore, 20);

  // ── 2. Occasion match ─────────────────────────────────────────────────────
  if (occasion) {
    const allMatch = items.every((i) => i.occasion.includes(occasion));
    const someMatch = items.some((i) => i.occasion.includes(occasion));
    if (allMatch) score += 20;
    else if (someMatch) score += 10;
    else score -= 10;
  }

  // ── 3. Style cohesion ─────────────────────────────────────────────────────
  const styles = items.flatMap((i) => i.style || []);
  const uniqueStyles = [...new Set(styles)];
  let styleScore = 0;
  for (const style of uniqueStyles) {
    const compatible = STYLE_COMPATIBILITY[style] || [];
    const allCompatible = uniqueStyles.every((s) => s === style || compatible.includes(s));
    if (allCompatible) styleScore += 10;
  }
  score += Math.min(styleScore, 20);

  // ── 4. User preference boost ──────────────────────────────────────────────
  if (userPrefs.stylePreferences && userPrefs.stylePreferences.length > 0) {
    const matchCount = items.filter((item) =>
      item.style.some((s) => userPrefs.stylePreferences.includes(s))
    ).length;
    score += matchCount * 3;
  }

  // ── 5. Category completeness bonus ───────────────────────────────────────
  const categories = items.map((i) => i.category);
  const hasTopsOrDress = categories.includes('tops') || categories.includes('dresses');
  const hasBottoms = categories.includes('bottoms') || categories.includes('dresses');
  const hasShoes = categories.includes('shoes');
  if (hasTopsOrDress) score += 5;
  if (hasBottoms) score += 5;
  if (hasShoes) score += 5;

  // Clamp score
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate outfit recommendations from a wardrobe
 * @param {Array} wardrobe - all clothing items for user
 * @param {Object} options - { occasion, season, limit, userPrefs }
 * @returns {Array} sorted outfit suggestions
 */
function generateRecommendations(wardrobe, options = {}) {
  const { occasion, season, limit = 6, userPrefs = {} } = options;

  // Filter by season if provided
  let filtered = wardrobe;
  if (season) {
    filtered = wardrobe.filter(
      (i) => i.season.includes(season) || i.season.includes('all')
    );
  }
  if (occasion) {
    filtered = filtered.filter((i) => i.occasion.includes(occasion));
  }

  // Group by category
  const byCategory = {};
  for (const item of filtered) {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
  }

  const categories = Object.keys(byCategory);
  if (categories.length < 2) return [];

  const outfits = [];

  // Generate combinations: top + bottom (+ optional shoes + accessory)
  const tops = [...(byCategory['tops'] || []), ...(byCategory['dresses'] || [])];
  const bottoms = byCategory['bottoms'] || [];
  const shoes = byCategory['shoes'] || [];
  const outerwear = byCategory['outerwear'] || [];
  const accessories = byCategory['accessories'] || [];

  for (const top of tops.slice(0, 8)) {
    for (const bottom of bottoms.slice(0, 8)) {
      const combo = [top, bottom];

      // Optionally add shoes
      if (shoes.length > 0) {
        combo.push(shoes[Math.floor(Math.random() * shoes.length)]);
      }

      // Optionally add outerwear
      if (outerwear.length > 0 && Math.random() > 0.5) {
        combo.push(outerwear[Math.floor(Math.random() * outerwear.length)]);
      }

      // Optionally add accessory
      if (accessories.length > 0 && Math.random() > 0.6) {
        combo.push(accessories[Math.floor(Math.random() * accessories.length)]);
      }

      const score = scoreOutfit(combo, userPrefs, occasion);
      outfits.push({ items: combo, score, occasion: occasion || 'casual' });
    }

    // Dresses don't need bottoms
    if (top.category === 'dresses') {
      const combo = [top];
      if (shoes.length > 0) combo.push(shoes[0]);
      if (accessories.length > 0) combo.push(accessories[0]);
      const score = scoreOutfit(combo, userPrefs, occasion);
      outfits.push({ items: combo, score, occasion: occasion || 'casual' });
    }
  }

  // Sort by score descending and return top N
  return outfits
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((o, idx) => ({ ...o, rank: idx + 1 }));
}

module.exports = { generateRecommendations, scoreOutfit };