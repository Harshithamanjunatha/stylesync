// client/src/pages/RecommendPage.js
import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './RecommendPage.css';

const OCCASIONS = ['', 'casual', 'formal', 'sport', 'party', 'beach', 'work', 'date'];
const SEASONS = ['', 'spring', 'summer', 'autumn', 'winter'];

export default function RecommendPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ occasion: '', season: '' });
  const [saving, setSaving] = useState({});

  const fetchRecommendations = async () => {
    setLoading(true);
    setRecommendations([]);
    setMessage('');
    try {
      const params = { limit: 6 };
      if (filters.occasion) params.occasion = filters.occasion;
      if (filters.season) params.season = filters.season;

      const res = await api.get('/outfits/recommend', { params });
      setRecommendations(res.data.recommendations || []);
      if (res.data.message) setMessage(res.data.message);
    } catch (err) {
      toast.error('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (outfit, idx) => {
    setSaving(s => ({ ...s, [idx]: true }));
    try {
      await api.post('/outfits/save', {
        itemIds: outfit.items.map(i => i._id),
        occasion: outfit.occasion,
        score: outfit.score,
        name: `${filters.occasion || 'Casual'} Outfit #${outfit.rank}`,
      });
      toast.success('Outfit saved! ♡');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(s => ({ ...s, [idx]: false }));
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="recommend-page fade-in">
      <div className="page-header">
        <div>
          <h1>Outfit Recommendations</h1>
          <p className="page-subtitle">AI-powered style combinations from your wardrobe</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="recommend-filters">
        <div className="filter-group">
          <label>Occasion</label>
          <select value={filters.occasion} onChange={e => setFilters({...filters, occasion: e.target.value})}>
            {OCCASIONS.map(o => <option key={o} value={o}>{o || 'Any occasion'}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Season</label>
          <select value={filters.season} onChange={e => setFilters({...filters, season: e.target.value})}>
            {SEASONS.map(s => <option key={s} value={s}>{s || 'Any season'}</option>)}
          </select>
        </div>
        <button className="generate-btn" onClick={fetchRecommendations} disabled={loading}>
          {loading ? (
            <span className="btn-loading"><span className="spin-icon">✦</span> Styling…</span>
          ) : '✨ Generate Outfits'}
        </button>
      </div>

      {/* ── Empty / message state ── */}
      {!loading && recommendations.length === 0 && (
        <div className="recommend-empty">
          {message ? (
            <>
              <p style={{ fontSize: 40 }}>👗</p>
              <h3>{message}</h3>
            </>
          ) : (
            <>
              <p style={{ fontSize: 40 }}>✨</p>
              <h3>Ready when you are</h3>
              <p>Hit "Generate Outfits" to see smart combinations from your wardrobe</p>
            </>
          )}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="outfits-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="outfit-skeleton" />)}
        </div>
      )}

      {/* ── Outfit cards ── */}
      {!loading && recommendations.length > 0 && (
        <>
          <p className="results-count">{recommendations.length} outfits found</p>
          <div className="outfits-grid">
            {recommendations.map((outfit, idx) => (
              <div key={idx} className="outfit-card">
                {/* Score badge */}
                <div className="score-badge" style={{ background: scoreColor(outfit.score) }}>
                  {outfit.score}%
                </div>

                {/* Item images */}
                <div className={`outfit-images count-${outfit.items.length}`}>
                  {outfit.items.slice(0, 4).map((item) => (
                    <div key={item._id} className="outfit-item-img">
                      <img src={item.imageUrl} alt={item.name} loading="lazy" />
                    </div>
                  ))}
                </div>

                {/* Info */}
                <div className="outfit-info">
                  <p className="outfit-title">Outfit #{outfit.rank}</p>
                  <div className="outfit-items-list">
                    {outfit.items.map(item => (
                      <span key={item._id} className="outfit-item-chip">
                        {item.category}: {item.name}
                      </span>
                    ))}
                  </div>
                  <div className="outfit-meta">
                    <span className="occasion-badge">{outfit.occasion}</span>
                  </div>
                  <button
                    className="save-outfit-btn"
                    onClick={() => handleSave(outfit, idx)}
                    disabled={saving[idx]}
                  >
                    {saving[idx] ? 'Saving…' : '♡ Save Outfit'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}