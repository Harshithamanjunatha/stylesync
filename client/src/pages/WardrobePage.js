// client/src/pages/WardrobePage.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './WardrobePage.css';

const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'activewear'];
const OCCASIONS = ['casual', 'formal', 'sport', 'party', 'beach', 'work', 'date'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter', 'all'];
const STYLES = ['minimalist', 'streetwear', 'classic', 'bohemian', 'sporty', 'formal', 'vintage'];
const COLOR_FAMILIES = ['warm', 'cool', 'neutral', 'earth', 'pastel', 'vibrant'];

const CAT_ICONS = {
  tops: '👕', bottoms: '👖', dresses: '👗', outerwear: '🧥',
  shoes: '👟', accessories: '👜', activewear: '🩱', all: '✦'
};

export default function WardrobePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', category: 'tops', color: '', colorFamily: 'neutral',
    occasion: ['casual'], season: ['all'], style: ['classic'], brand: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();

  const fetchItems = async () => {
    try {
      const params = {};
      if (filterCat !== 'all') params.category = filterCat;
      if (search) params.search = search;
      const res = await api.get('/wardrobe', { params });
      setItems(res.data.items || []);
    } catch (e) {
      toast.error('Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [filterCat, search]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleArray = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error('Please select an image');
    if (form.occasion.length === 0) return toast.error('Select at least one occasion');

    setSubmitting(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
    });

    try {
      await api.post('/wardrobe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Item added to wardrobe!');
      setShowModal(false);
      resetForm();
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item?')) return;
    try {
      await api.delete(`/wardrobe/${id}`);
      toast.success('Item removed');
      setItems(items.filter(i => i._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const handleFavorite = async (id) => {
    try {
      const res = await api.patch(`/wardrobe/${id}/favorite`);
      setItems(items.map(i => i._id === id ? res.data.item : i));
    } catch { toast.error('Failed to update'); }
  };

  const resetForm = () => {
    setForm({ name: '', category: 'tops', color: '', colorFamily: 'neutral', occasion: ['casual'], season: ['all'], style: ['classic'], brand: '' });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="wardrobe-page fade-in">
      <div className="page-header">
        <div>
          <h1>My Wardrobe</h1>
          <p className="page-subtitle">{items.length} items in your collection</p>
        </div>
        <button className="btn-primary-sm" onClick={() => setShowModal(true)}>+ Add Item</button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="category-filters">
          {['all', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              className={`filter-btn ${filterCat === cat ? 'active' : ''}`}
              onClick={() => setFilterCat(cat)}
            >
              {CAT_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          placeholder="Search items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="wardrobe-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-item" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-wardrobe">
          <p>👗</p>
          <h3>No items yet</h3>
          <p>Add your first clothing item to get started</p>
          <button className="btn-primary-sm" onClick={() => setShowModal(true)}>Add Item</button>
        </div>
      ) : (
        <div className="wardrobe-grid">
          {items.map(item => (
            <div key={item._id} className="wardrobe-card">
              <div className="card-image">
                <img src={item.imageUrl} alt={item.name} loading="lazy" />
                <button
                  className={`fav-btn ${item.isFavorite ? 'active' : ''}`}
                  onClick={() => handleFavorite(item._id)}
                >♡</button>
              </div>
              <div className="card-info">
                <p className="card-name">{item.name}</p>
                <p className="card-meta">{item.category} · {item.color}</p>
                <div className="card-tags">
                  {item.occasion.map(o => <span key={o} className="tag">{o}</span>)}
                </div>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(item._id)}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Item Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add to Wardrobe</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="add-form">
              {/* Image upload */}
              <div
                className="image-upload-zone"
                onClick={() => fileRef.current.click()}
                style={{ backgroundImage: imagePreview ? `url(${imagePreview})` : 'none' }}
              >
                {!imagePreview && (
                  <>
                    <span className="upload-icon">📷</span>
                    <p>Click to upload photo</p>
                    <small>JPEG, PNG, WEBP · max 5MB</small>
                  </>
                )}
                <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleImageChange} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Item name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. White linen shirt" required />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="e.g. Zara" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Color *</label>
                  <input value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="e.g. Sky blue" required />
                </div>
                <div className="form-group">
                  <label>Color family</label>
                  <select value={form.colorFamily} onChange={e => setForm({...form, colorFamily: e.target.value})}>
                    {COLOR_FAMILIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Occasions</label>
                <div className="chip-group">
                  {OCCASIONS.map(o => (
                    <button type="button" key={o} className={`chip ${form.occasion.includes(o) ? 'selected' : ''}`} onClick={() => toggleArray('occasion', o)}>{o}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Seasons</label>
                <div className="chip-group">
                  {SEASONS.map(s => (
                    <button type="button" key={s} className={`chip ${form.season.includes(s) ? 'selected' : ''}`} onClick={() => toggleArray('season', s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Style</label>
                <div className="chip-group">
                  {STYLES.map(s => (
                    <button type="button" key={s} className={`chip ${form.style.includes(s) ? 'selected' : ''}`} onClick={() => toggleArray('style', s)}>{s}</button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Uploading…' : 'Add to Wardrobe'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}