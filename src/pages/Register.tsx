import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { extractApiError } from '../api/client';
import { useI18n } from '../context/I18nContext';
import { Mail, Lock, User, Building2, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  // RegisterRequest: { fullName, email, password, companyName }
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
      });
      toast.success(lang === 'ar'
        ? 'تم إنشاء حساب الشركة بنجاح! تم تهيئة الإعدادات المحاسبية الافتراضية تلقائياً. تحقق من بريدك لتفعيل الحساب.'
        : 'Company created successfully! Default accounting settings were initialized automatically. Check your email to activate.', { duration: 6000 });
      navigate('/login');
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const InputIcon = ({ icon: Icon }: { icon: React.FC<any> }) => (
    <Icon size={16} style={{ position: 'absolute', insetInlineStart: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
  );

  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />

      <div className="auth-card animate-slideUp" style={{ maxWidth: 460 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon"><Zap size={24} color="white" /></div>
          <div className="auth-logo-text">Synaptech<span>ERP</span></div>
        </div>

        <h1 className="auth-title">{t.createAccount}</h1>
        <p className="auth-subtitle">{t.createAccountSubtitle}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">{t.fullName} <span style={{ color: 'var(--error)' }}>*</span></label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <InputIcon icon={User} />
              <input className="form-input" style={{ paddingInlineStart: 38 }}
                placeholder={lang === 'ar' ? 'محمد أحمد' : 'John Doe'}
                autoComplete="name" required {...field('fullName')} />
            </div>
          </div>

          {/* Company Name */}
          <div className="form-group">
            <label className="form-label">{t.companyName} <span style={{ color: 'var(--error)' }}>*</span></label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <InputIcon icon={Building2} />
              <input className="form-input" style={{ paddingInlineStart: 38 }}
                placeholder={lang === 'ar' ? 'شركة النور للتجارة' : 'Acme Corp'}
                autoComplete="organization" required {...field('companyName')} />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">{t.email} <span style={{ color: 'var(--error)' }}>*</span></label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <InputIcon icon={Mail} />
              <input className="form-input" style={{ paddingInlineStart: 38 }}
                type="email" placeholder="you@company.com"
                autoComplete="email" required {...field('email')} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">{t.password} <span style={{ color: 'var(--error)' }}>*</span></label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <InputIcon icon={Lock} />
              <input className="form-input" style={{ paddingInlineStart: 38, paddingInlineEnd: 42 }}
                type={showPass ? 'text' : 'password'}
                placeholder={lang === 'ar' ? '٨ أحرف على الأقل' : 'Min. 8 characters'}
                autoComplete="new-password" required {...field('password')} />
              <button type="button" className="icon-btn"
                style={{ position: 'absolute', insetInlineEnd: 4 }}
                onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">{t.confirmPassword} <span style={{ color: 'var(--error)' }}>*</span></label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <InputIcon icon={Lock} />
              <input className="form-input" style={{ paddingInlineStart: 38 }}
                type="password" autoComplete="new-password" required {...field('confirmPassword')} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4, width: '100%' }}>
            {loading
              ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> {t.createAccount}...</>
              : t.createAccount}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 24 }}>
          {t.alreadyHaveAccount}{' '}
          <Link to="/login" style={{ color: 'var(--brand-primary-light)', textDecoration: 'none', fontWeight: 600 }}>
            {t.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
