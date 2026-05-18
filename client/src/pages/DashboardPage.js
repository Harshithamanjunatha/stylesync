// client/src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, categories: {}, saved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [wardrobeRes, outfitsRes] = await Promise.all([
          api.get('/wardrobe'),
          api.get('/outfits/saved'),
        ]);
        const items = wardrobeRes.data.items || [];
        const catCounts = items.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {});
        setStats({
          total: items.length,
          categories: catCounts,
          saved: outfitsRes.data.count || 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const CATEGORY_ICONS = {
    tops: '👕', bottoms: '👖', dresses: '👗', outerwear: '🧥',
    shoes: '👟', accessories: '👜', activewear: '🩱',
  };

  return (
    <div className="dashboard fade-in">
      {/* ── Greeting ── */}
      <div className="dash-header">
        <div>
          <h1>Good {getTimeOfDay()}, {user?.name?.split(' ')[0]} ✦</h1>
          <p className="dash-subtitle">Here's your style overview for today.</p>
        </div>
        <Link to="/recommend" className="cta-btn">Get Outfit Ideas →</Link>
      </div>

      {/* ── Stats cards ── */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Wardrobe items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{Object.keys(stats.categories).length}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.saved}</div>
          <div className="stat-label">Saved outfits</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">∞</div>
          <div className="stat-label">Combinations</div>
        </div>
      </div>

      {/* ── Wardrobe breakdown ── */}
      <div className="section">
        <h2>Wardrobe breakdown</h2>
        {loading ? (
          <div className="skeleton-grid">
            {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : stats.total === 0 ? (
          <div className="empty-state">
            <p>Your wardrobe is empty. <Link to="/wardrobe">Add your first item →</Link></p>
          </div>
        ) : (
          <div className="category-grid">
            {Object.entries(stats.categories).map(([cat, count]) => (
              <Link key={cat} to="/wardrobe" className="category-card">
                <span className="cat-icon">{CATEGORY_ICONS[cat] || '📦'}</span>
                <span className="cat-count">{count}</span>
                <span className="cat-name">{cat}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick actions ── */}
      <div className="section">
        <h2>Quick actions</h2>
        <div className="actions-grid">
          <Link to="/wardrobe" className="action-card">
            <span className="action-icon">＋</span>
            <div>
              <strong>Add clothing</strong>
              <p>Upload an item to your wardrobe</p>
            </div>
          </Link>
          <Link to="/recommend" className="action-card">
            <span className="action-icon">✨</span>
            <div>
              <strong>Get recommendations</strong>
              <p>Smart outfits based on your wardrobe</p>
            </div>
          </Link>
          <Link to="/saved" className="action-card">
            <span className="action-icon">♡</span>
            <div>
              <strong>Saved outfits</strong>
              <p>View your favourite combinations</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}