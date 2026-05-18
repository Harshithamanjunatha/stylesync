// client/src/pages/SavedOutfitsPage.js
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './SavedOutfitsPage.css';

export default function SavedOutfitsPage() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOutfits = async () => {
    try {
      const res = await api.get('/outfits/saved');
      setOutfits(res.data.outfits || []);
    } catch { toast.error('Failed to load saved outfits'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOutfits(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this outfit?')) return;
    try {
      await api.delete(`/outfits/${id}`);
      setOutfits(outfits.filter(o => o._id !== id));
      toast.success('Outfit removed');
    } catch { toast.error('Delete failed'); }
  };

  const scoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#94a3b8';
  };

  return (
    <div className="saved-page fade-in">
      <div className="page-header">
        <div>
          <h1>Saved Outfits</h1>
          <p className="page-subtitle">{outfits.length} outfits in your favourites</p>
        </div>
      </div>

      {loading ? (
        <div className="saved-grid">
          {[1,2,3].map(i => <div key={i} className="outfit-skeleton" />)}
        </div>
      ) : outfits.length === 0 ? (
        <div className="saved-empty">
          <p style={{ fontSize: 48 }}>♡</p>
          <h3>No saved outfits yet</h3>
          <p>Go to <strong>Recommend</strong> and save outfits you love</p>
        </div>
      ) : (
        <div className="saved-grid">
          {outfits.map(outfit => (
            <div key={outfit._id} className="saved-card">
              <div className="saved-images">
                {(outfit.items || []).slice(0, 4).map((item, i) => (
                  <div key={item._id || i} className="saved-img">
                    <img src={item.imageUrl} alt={item.name} loading="lazy" />
                  </div>
                ))}
              </div>

              <div className="saved-info">
                <div className="saved-header">
                  <div>
                    <p className="saved-name">{outfit.name}</p>
                    <p className="saved-date">{new Date(outfit.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  {outfit.score > 0 && (
                    <span className="saved-score" style={{ background: scoreColor(outfit.score) }}>
                      {outfit.score}%
                    </span>
                  )}
                </div>

                <div className="saved-items-list">
                  {(outfit.items || []).map((item, i) => (
                    <span key={item._id || i} className="saved-item-chip">
                      {item.category} · {item.name}
                    </span>
                  ))}
                </div>

                <div className="saved-footer">
                  <span className="occasion-badge">{outfit.occasion}</span>
                  <button className="remove-btn" onClick={() => handleDelete(outfit._id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}