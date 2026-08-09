import React, { useEffect, useState } from 'react';
import { companiesApi } from '../api/endpoints';
import { extractApiError } from '../api/client';
import { useI18n } from '../context/I18nContext';
import { Building2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Company() {
  const { t, lang } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    companiesApi.getMe()
      .then(res => setData(res.data))
      .catch(err => toast.error(extractApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await companiesApi.update(data);
      toast.success(t.updatedSuccess);
    } catch (err) { toast.error(extractApiError(err)); }
    setSaving(false);
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  const f = (key: string, label: string, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} placeholder={placeholder}
        value={data?.[key] || ''}
        onChange={e => setData((d: any) => ({ ...d, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{t.company}</h1>
          <p>{lang === 'ar' ? 'بيانات وإعدادات الشركة' : 'Company profile and settings'}</p>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} color="var(--brand-primary)" />
              {lang === 'ar' ? 'بيانات الشركة' : 'Company Details'}
            </div>
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-grid">
              {f('name', lang === 'ar' ? 'الاسم التجاري' : 'Trade Name', 'text', lang === 'ar' ? 'اسم الشركة' : 'Company name')}
              {f('legalName', t.legalName, 'text', lang === 'ar' ? 'الاسم القانوني الرسمي' : 'Official legal name')}
            </div>
            <div className="form-grid">
              {f('taxNumber', t.taxNumber, 'text', lang === 'ar' ? 'الرقم الضريبي' : 'Tax / VAT number')}
              {f('currency', t.currency, 'text', 'EGP')}
            </div>
            {f('country', t.country, 'text', lang === 'ar' ? 'مثال: مصر' : 'e.g. Egypt')}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="isActive" checked={!!data?.isActive}
                onChange={e => setData((d: any) => ({ ...d, isActive: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)' }} />
              <label htmlFor="isActive" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {t.active}
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={15} />
              {saving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
