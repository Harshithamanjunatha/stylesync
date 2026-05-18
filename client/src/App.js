// client/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WardrobePage from './pages/WardrobePage';
import RecommendPage from './pages/RecommendPage';
import SavedOutfitsPage from './pages/SavedOutfitsPage';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loader" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="wardrobe" element={<WardrobePage />} />
        <Route path="recommend" element={<RecommendPage />} />
        <Route path="saved" element={<SavedOutfitsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#f9f5f0',
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '12px',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;