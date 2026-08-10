import React, { useState, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const { isAuthenticated, isLoading } = useAuth();
  // Desktop: collapsed/expanded sidebar
  const [collapsed, setCollapsed] = useState(false);
  // Mobile: sidebar overlay open/closed
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDesktop = useCallback(() => setCollapsed(c => !c), []);
  const toggleMobile  = useCallback(() => setMobileOpen(o => !o), []);
  const closeMobile   = useCallback(() => setMobileOpen(false), []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      {/* Mobile backdrop — tapping it closes the sidebar */}
      {mobileOpen && (
        <div className="mobile-sidebar-backdrop" onClick={closeMobile} />
      )}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
      />

      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar
          collapsed={collapsed}
          onToggleDesktop={toggleDesktop}
          onToggleMobile={toggleMobile}
        />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
