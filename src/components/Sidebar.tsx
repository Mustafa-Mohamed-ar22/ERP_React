import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { MENU } from '../config/menu';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  Building2, Warehouse, BarChart3, BookOpen,
  Zap, LogOut, Settings, Truck, ClipboardList,
  CreditCard, Briefcase, Calendar, UserCheck, Shield,
  ChevronDown, ChevronRight, ChevronLeft,
  CalendarOff, CalendarCheck, Clock, Tag,
} from 'lucide-react';

// Map icon name strings (from menu.ts) to Lucide components
const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, ShoppingCart, Package, Users,
  Building2, Warehouse, BarChart3, BookOpen,
  Settings, Truck, ClipboardList,
  CreditCard, Briefcase, Calendar, UserCheck, Shield,
  CalendarOff, CalendarCheck, Clock, Tag,
};

export default function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { user, logout, hasPermission } = useAuth();
  const { t, isRTL } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  // Translation keys → rendered label (falls back to raw key)
  const label = (key: string): string => (t as any)[key] ?? key;

  // ── Build visible nav from MENU config ────────────────────────────────────
  // An item is visible if:
  //   • its permission is null  (ungated — all authenticated users)
  //   • the current user holds that permission code
  // A section is hidden entirely if it ends up with zero visible items.
  const visibleSections = MENU
    .map(section => ({
      ...section,
      visibleItems: section.items.filter(
        item => !item.permission || hasPermission(item.permission)
      ),
    }))
    .filter(section => section.visibleItems.length > 0);

  // ── Accordion open/closed state ───────────────────────────────────────────
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    visibleSections.forEach(section => {
      const hasActive = section.visibleItems.some(item => location.pathname.startsWith(item.path));
      initial[section.id] = hasActive || section.id === 'overview';
    });
    return initial;
  });

  // Auto-expand the section of the currently active route
  useEffect(() => {
    visibleSections.forEach(section => {
      const hasActive = section.visibleItems.some(item => location.pathname.startsWith(item.path));
      if (hasActive) {
        setOpenSections(prev => ({ ...prev, [section.id]: true }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleSection = (id: string) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} color="white" />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">Synaptech<span>ERP</span></div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {visibleSections.map((section) => {
          const isOpen = !!openSections[section.id];
          const hasActiveChild = section.visibleItems.some(
            item => location.pathname.startsWith(item.path)
          );

          return (
            <div key={section.id} className="sidebar-section">
              {!collapsed && (
                <button
                  type="button"
                  className={`sidebar-section-header ${hasActiveChild ? 'active-section' : ''}`}
                  onClick={() => toggleSection(section.id)}
                  title={label(section.labelKey)}
                >
                  <span className="sidebar-section-title">{label(section.labelKey)}</span>
                  <span className="sidebar-section-chevron">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronIcon size={14} />}
                  </span>
                </button>
              )}

              {(isOpen || collapsed) && (
                <div className="sidebar-section-items">
                  {section.visibleItems.map((item) => {
                    const IconComp = ICONS[item.icon] ?? LayoutDashboard;
                    return (
                      <NavLink
                        key={item.key}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        title={collapsed ? label(item.labelKey) : undefined}
                        onClick={onCloseMobile}
                      >
                        <span className="nav-icon"><IconComp size={18} /></span>
                        {!collapsed && <span className="nav-label">{label(item.labelKey)}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', marginBottom: 8 }}>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
              {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.fullName || user.firstName || user.email}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
        )}
        <button
          className="nav-item"
          style={{ width: '100%', border: 'none', cursor: 'pointer' }}
          onClick={handleLogout}
          title={collapsed ? (t as any).signOut ?? 'Sign Out' : undefined}
        >
          <span className="nav-icon"><LogOut size={18} /></span>
          {!collapsed && <span className="nav-label">{(t as any).signOut ?? 'Sign Out'}</span>}
        </button>
      </div>
    </aside>
  );
}
