// client/src/components/Layout.js
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '✦', label: 'Dashboard' },
  { path: '/wardrobe', icon: '👗', label: 'Wardrobe' },
  { path: '/recommend', icon: '✨', label: 'Recommend' },
  { path: '/saved', icon: '♡', label: 'Saved' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-mark">S</span>
          <span className="logo-text">StyleSync</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      {/* ── Mobile overlay ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="main-content">
        <header className="mobile-header">
          <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
          <span className="mobile-logo">StyleSync</span>
        </header>
        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}