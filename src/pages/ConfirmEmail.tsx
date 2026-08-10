import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { extractApiError } from '../api/client';
import { useI18n } from '../context/I18nContext';
import { Zap, CheckCircle2, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

type State = 'loading' | 'success' | 'error' | 'resend';

export default function ConfirmEmail() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const userId = params.get('userId') || '';
  const code   = params.get('code')   || '';

  const [state, setState] = useState<State>('loading');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // ── Auto-confirm on mount if params are present ──────────────────────────
  useEffect(() => {
    if (!userId || !code) {
      setState('error');
      return;
    }
    authApi.confirmEmail({ userId, code })
      .then(() => setState('success'))
      .catch(() => setState('error'));
  }, [userId, code]);

  // ── Countdown for resend cooldown ─────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      await authApi.resendConfirmation({ email: resendEmail });
      toast.success(lang === 'ar'
        ? 'تم إرسال رابط التفعيل إلى بريدك الإلكتروني.'
        : 'Confirmation email resent! Check your inbox.');
      setCountdown(60);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setResendLoading(false);
    }
  };

  const AR = {
    verifying:       'جارٍ التحقق من بريدك...',
    successTitle:    'تم تفعيل الحساب!',
    successMsg:      'تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.',
    goLogin:         'تسجيل الدخول الآن',
    errorTitle:      'رابط غير صالح أو منتهي الصلاحية',
    errorMsg:        'رابط التفعيل غير صحيح أو انتهت صلاحيته. أدخل بريدك لإعادة الإرسال.',
    resendTitle:     'إعادة إرسال رابط التفعيل',
    emailLabel:      'البريد الإلكتروني',
    resendBtn:       'إعادة الإرسال',
    waitMsg:         (s: number) => `أعد المحاولة بعد ${s} ثانية`,
    backLogin:       'العودة لتسجيل الدخول',
  };
  const EN = {
    verifying:       'Verifying your email…',
    successTitle:    'Email Confirmed!',
    successMsg:      'Your email address has been verified. You can now sign in.',
    goLogin:         'Sign In Now',
    errorTitle:      'Invalid or Expired Link',
    errorMsg:        'The confirmation link is invalid or has expired. Enter your email to resend.',
    resendTitle:     'Resend Confirmation Email',
    emailLabel:      'Email Address',
    resendBtn:       'Resend Email',
    waitMsg:         (s: number) => `Retry in ${s}s`,
    backLogin:       'Back to Sign In',
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

        {/* ── Loading ── */}
        {state === 'loading' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Loader2 size={48} color="var(--brand-primary-light)" style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{tx.verifying}</p>
          </div>
        )}

        {/* ── Success ── */}
        {state === 'success' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={56} color="var(--success)" style={{ marginBottom: 16 }} />
            <h1 className="auth-title" style={{ marginBottom: 8 }}>{tx.successTitle}</h1>
            <p className="auth-subtitle" style={{ marginBottom: 28 }}>{tx.successMsg}</p>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => navigate('/login')}
            >
              {tx.goLogin}
            </button>
          </div>
        )}

        {/* ── Error + Resend ── */}
        {(state === 'error' || state === 'resend') && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <XCircle size={48} color="var(--error)" style={{ marginBottom: 12 }} />
              <h1 className="auth-title" style={{ marginBottom: 8 }}>{tx.errorTitle}</h1>
              <p className="auth-subtitle">{tx.errorMsg}</p>
            </div>

            {/* Resend form */}
            <form onSubmit={handleResend} className="auth-form">
              <div className="form-group">
                <label className="form-label">{tx.emailLabel}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', insetInlineStart: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    className="form-input"
                    style={{ paddingInlineStart: 38 }}
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={resendEmail}
                    onChange={e => setResendEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={resendLoading || countdown > 0}
              >
                {resendLoading
                  ? <><div className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> {tx.resendBtn}...</>
                  : countdown > 0
                    ? <><RefreshCw size={15} /> {tx.waitMsg(countdown)}</>
                    : <><RefreshCw size={15} /> {tx.resendBtn}</>
                }
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
              <Link to="/login" style={{ color: 'var(--brand-primary-light)', textDecoration: 'none', fontWeight: 600 }}>
                ← {tx.backLogin}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
