import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { lang } = useI18n();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      gap: 20,
      textAlign: 'center',
      padding: '40px 24px',
    }}>
      {/* Icon */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'var(--error-dim, rgba(244,63,94,0.12))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
      }}>
        <ShieldOff size={36} color="var(--error, #f43f5e)" />
      </div>

      {/* Heading */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {lang === 'ar' ? '403 — وصول مرفوض' : '403 — Access Denied'}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 10, maxWidth: 420, lineHeight: 1.7 }}>
          {lang === 'ar'
            ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة. يُرجى التواصل مع مسؤول النظام إذا كنت تعتقد أن هذا خطأ.'
            : 'You do not have permission to view this page. Please contact your system administrator if you believe this is a mistake.'}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          {lang === 'ar' ? 'العودة للخلف' : 'Go Back'}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          {lang === 'ar' ? 'الرئيسية' : 'Dashboard'}
        </button>
      </div>
    </div>
  );
}
