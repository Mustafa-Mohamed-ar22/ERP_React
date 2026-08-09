import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Topbar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const routeTitles: Record<string, string> = {
    '/dashboard': t.dashboard,
    '/customers': t.customers,
    '/sales-orders': t.salesOrders,
    '/suppliers': t.suppliers,
    '/purchase-orders': t.purchaseOrders,
    '/products': t.products,
    '/categories': t.categories,
    '/warehouses': t.warehouses,
    '/stock': t.stock,
    '/employees': t.employees,
    '/departments': t.departments,
    '/branches': t.branches,
    '/attendance': t.attendance,
    '/leave-requests': t.leaveRequests,
    '/accounts': t.accounts,
    '/journal-entries': t.journalEntries,
    '/users': t.users,
    '/roles': t.roles,
    '/company': t.company,
    '/accounting-settings': t.accountingSettings,
  };

  const title = Object.entries(routeTitles).find(([key]) => pathname.startsWith(key))?.[1] ?? 'ERP';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    toast.success(t.loggedOut);
    navigate('/login');
  };

  const displayName = user?.fullName || user?.firstName || user?.email || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="toggle-btn" onClick={onToggle} title="Toggle sidebar" id="sidebar-toggle">
          <Menu size={18} />
        </button>
        <div className="topbar-title">{title}</div>
      </div>

      <div className="topbar-right">
        {/* Dark / White Theme Toggle */}
        <button
          className="toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? (lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}
          id="theme-toggle-btn"
          style={{ width: 36, height: 36 }}
        >
          {theme === 'dark' ? <Sun size={18} color="var(--accent-amber)" /> : <Moon size={18} color="var(--brand-primary)" />}
        </button>

        {/* Language Switcher */}
        <div className="lang-switch">
          <button className={`lang-btn ${lang === 'ar' ? 'active' : ''}`} onClick={() => setLang('ar')}>ع</button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
        </div>

        {/* User Avatar + Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            id="user-menu-btn"
            onClick={() => setDropdownOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: dropdownOpen ? 'var(--bg-hover)' : 'transparent',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 10px 5px 6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{initial}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
            <ChevronDown size={14} color="var(--text-muted)" style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              insetInlineEnd: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              minWidth: 200,
              zIndex: 200,
              overflow: 'hidden',
              animation: 'slideUp 0.15s ease',
            }}>
              {/* User info */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
                {user?.role && (
                  <span className="badge badge-purple" style={{ marginTop: 6, fontSize: 11 }}>{user.role}</span>
                )}
              </div>

              {/* Logout button */}
              <button
                id="logout-btn"
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 16px', background: 'transparent', border: 'none',
                  color: 'var(--accent-rose)', fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.15s', textAlign: 'start',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={16} />
                {t.signOut}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
