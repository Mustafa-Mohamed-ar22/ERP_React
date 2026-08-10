import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { extractApiError } from '../api/client';
import { useI18n } from '../context/I18nContext';
import { Zap, Mail, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const { lang } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const AR = {
    title:       'استعادة كلمة المرور',
    subtitle:    'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.',
    emailLabel:  'البريد الإلكتروني',
    btn:         'إرسال رابط الاستعادة',
    sending:     'جارٍ الإرسال...',
    sentTitle:   'تم الإرسال!',
    sentMsg:     (e: string) => `إذا كان البريد ${e} مسجلاً في النظام، ستصل رسالة الاسترداد خلال دقائق. تفقد صندوق الوارد وملف البريد العشوائي.`,
    backLogin:   'العودة لتسجيل الدخول',
    resend:      'إعادة الإرسال',
  };
  const EN = {
    title:       'Reset Your Password',
    subtitle:    'Enter your email and we\'ll send you a reset link.',
    emailLabel:  'Email Address',
    btn:         'Send Reset Link',
    sending:     'Sending…',
    sentTitle:   'Check Your Inbox!',
    sentMsg:     (e: string) => `If ${e} is registered, a password reset email has been sent. Check your inbox and spam folder.`,
    backLogin:   'Back to Sign In',
    resend:      'Resend Email',
  };
  const tx = lang === 'ar' ? AR : EN;

  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />

      <div className="auth-card animate-slideUp" style={{ maxWidth: 420 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><Zap size={24} color="white" /></div>
          <div className="auth-logo-text">Synaptech<span>ERP</span></div>
        </div>

        {!sent ? (
          <>
            <h1 className="auth-title">{tx.title}</h1>
            <p className="auth-subtitle">{tx.subtitle}</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{tx.emailLabel}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', insetInlineStart: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    className="form-input"
                    style={{ paddingInlineStart: 38 }}
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: 4, width: '100%' }}
              >
                {loading
                  ? <><div className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> {tx.sending}</>
                  : <><Send size={15} /> {tx.btn}</>
                }
              </button>
            </form>
          </>
        ) : (
          /* ── Sent confirmation ── */
          <div style={{ textAlign: 'center', padding: '12px 0 24px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <h1 className="auth-title" style={{ marginBottom: 10 }}>{tx.sentTitle}</h1>
            <p className="auth-subtitle" style={{ marginBottom: 28 }}>{tx.sentMsg(email)}</p>

            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: 12 }}
              onClick={() => setSent(false)}
            >
              {tx.resend}
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: sent ? 0 : 20 }}>
          <Link to="/login" style={{ color: 'var(--brand-primary-light)', textDecoration: 'none', fontWeight: 600 }}>
            ← {tx.backLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}
