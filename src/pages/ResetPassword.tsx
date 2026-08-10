import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { extractApiError } from '../api/client';
import { useI18n } from '../context/I18nContext';
import { Zap, Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // The backend email link is: /auth/forgetPassword?email=...&code=...
  const emailFromUrl = params.get('email') || '';
  const codeFromUrl  = params.get('code')  || '';

  const [form, setForm] = useState({
    email:           emailFromUrl,
    code:            codeFromUrl,
    newPassword:     '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const sf = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error(lang === 'ar' ? 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({
        email:       form.email,
        code:        form.code,
        newPassword: form.newPassword,
      });
      setDone(true);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const AR = {
    title:        'تعيين كلمة مرور جديدة',
    subtitle:     'اختر كلمة مرور قوية لحمايةحسابك.',
    emailLabel:   'البريد الإلكتروني',
    codeLabel:    'رمز التحقق (من البريد)',
    newPassLabel: 'كلمة المرور الجديدة',
    confLabel:    'تأكيد كلمة المرور',
    btn:          'تعيين كلمة المرور',
    saving:       'جارٍ الحفظ...',
    doneTitle:    'تم تغيير كلمة المرور!',
    doneMsg:      'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
    goLogin:      'تسجيل الدخول',
    backLogin:    'العودة لتسجيل الدخول',
  };
  const EN = {
    title:        'Set a New Password',
    subtitle:     'Choose a strong password to protect your account.',
    emailLabel:   'Email Address',
    codeLabel:    'Reset Code (from email)',
    newPassLabel: 'New Password',
    confLabel:    'Confirm New Password',
    btn:          'Reset Password',
    saving:       'Saving…',
    doneTitle:    'Password Updated!',
    doneMsg:      'You can now sign in with your new password.',
    goLogin:      'Sign In',
    backLogin:    'Back to Sign In',
  };
  const tx = lang === 'ar' ? AR : EN;

  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />

      <div className="auth-card animate-slideUp" style={{ maxWidth: 440 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><Zap size={24} color="white" /></div>
          <div className="auth-logo-text">Synaptech<span>ERP</span></div>
        </div>

        {!done ? (
          <>
            <h1 className="auth-title">{tx.title}</h1>
            <p className="auth-subtitle">{tx.subtitle}</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Email — pre-filled from URL but editable in case user opens link manually */}
              <div className="form-group">
                <label className="form-label">{tx.emailLabel}</label>
                <input
                  className="form-input"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={sf('email')}
                />
              </div>

              {/* Code — pre-filled from URL param */}
              <div className="form-group">
                <label className="form-label">{tx.codeLabel}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <KeyRound size={16} style={{ position: 'absolute', insetInlineStart: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    className="form-input"
                    style={{ paddingInlineStart: 38 }}
                    required
                    placeholder="xxxxxx"
                    value={form.code}
                    onChange={sf('code')}
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="form-group">
                <label className="form-label">{tx.newPassLabel}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', insetInlineStart: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    className="form-input"
                    style={{ paddingInlineStart: 38, paddingInlineEnd: 42 }}
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder={lang === 'ar' ? '٨ أحرف على الأقل' : 'Min. 8 characters'}
                    value={form.newPassword}
                    onChange={sf('newPassword')}
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

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">{tx.confLabel}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', insetInlineStart: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    className="form-input"
                    style={{ paddingInlineStart: 38 }}
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={sf('confirmPassword')}
                  />
                </div>
              </div>

              {/* Password strength hints */}
              {form.newPassword.length > 0 && (
                <div style={{ fontSize: 12, color: form.newPassword.length >= 8 ? 'var(--success)' : 'var(--warning)', marginTop: -8 }}>
                  {form.newPassword.length >= 8
                    ? (lang === 'ar' ? '✓ طول كلمة المرور مناسب' : '✓ Good length')
                    : (lang === 'ar' ? `${8 - form.newPassword.length} أحرف إضافية مطلوبة` : `${8 - form.newPassword.length} more characters needed`)}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: 8, width: '100%' }}
              >
                {loading
                  ? <><div className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> {tx.saving}</>
                  : tx.btn
                }
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
              <Link to="/login" style={{ color: 'var(--brand-primary-light)', textDecoration: 'none', fontWeight: 600 }}>
                ← {tx.backLogin}
              </Link>
            </p>
          </>
        ) : (
          /* ── Success state ── */
          <div style={{ textAlign: 'center', padding: '12px 0 24px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <h1 className="auth-title" style={{ marginBottom: 10 }}>{tx.doneTitle}</h1>
            <p className="auth-subtitle" style={{ marginBottom: 28 }}>{tx.doneMsg}</p>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => navigate('/login')}
            >
              {tx.goLogin}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
