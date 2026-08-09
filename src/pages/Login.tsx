import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { extractApiError } from '../api/client';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { t, lang } = useI18n();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success(t.welcomeToast);
    } catch (err) {
      // Extract error message from backend's ProblemDetails format
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />

      <div className="auth-card animate-slideUp">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Zap size={24} color="white" /></div>
          <div className="auth-logo-text">Synaptech<span>ERP</span></div>
        </div>

        <h1 className="auth-title">{t.welcomeBack}</h1>
        <p className="auth-subtitle">{t.signInSubtitle}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">{t.email}</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', insetInlineStart: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                id="login-email"
                className="form-input"
                style={{ paddingInlineStart: 38 }}
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">{t.password}</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--brand-primary-light)', textDecoration: 'none' }}>
                {t.forgotPassword}
              </Link>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', insetInlineStart: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                id="login-password"
                className="form-input"
                style={{ paddingInlineStart: 38, paddingInlineEnd: 42 }}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="icon-btn"
                style={{ position: 'absolute', insetInlineEnd: 4 }}
                onClick={() => setShowPass(s => !s)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4, width: '100%' }}>
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> {t.signIn}...</>
            ) : t.signIn}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 24 }}>
          {t.noAccount}{' '}
          <Link to="/register" style={{ color: 'var(--brand-primary-light)', textDecoration: 'none', fontWeight: 600 }}>
            {t.createAccount}
          </Link>
        </p>
      </div>
    </div>
  );
}
