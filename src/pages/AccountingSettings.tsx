import React, { useEffect, useState } from 'react';
import { accountingSettingsApi, accountsApi } from '../api/endpoints';
import { extractApiError } from '../api/client';
import { useI18n } from '../context/I18nContext';
import { Settings, Save, CheckCircle2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountingSettings() {
  const { t, lang } = useI18n();
  const [data, setData] = useState<any>({});
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      accountingSettingsApi.get(),
      accountsApi.getAll(),
    ]).then(([settledSettings, settledAccounts]) => {
      if (settledSettings.status === 'fulfilled') {
        setData(settledSettings.value.data || {});
      }
      if (settledAccounts.status === 'fulfilled') {
        setAccounts(Array.isArray(settledAccounts.value.data) ? settledAccounts.value.data : []);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await accountingSettingsApi.update(data);
      toast.success(t.updatedSuccess);
    } catch (err) { toast.error(extractApiError(err)); }
    setSaving(false);
  };

  const renderSelect = (key: string, label: string) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select
        className="form-select"
        value={data?.[key] || ''}
        onChange={e => setData((d: any) => ({ ...d, [key]: e.target.value || null }))}
      >
        <option value="">
          {`— ${lang === 'ar' ? 'اختر الحساب الافتراضي' : 'Select Default Account'} —`}
        </option>
        {accounts.map((a: any) => (
          <option key={a.id} value={a.id}>
            {a.code ? `${a.code} - ` : ''}{a.name}
          </option>
        ))}
      </select>
    </div>
  );

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{t.accountingSettings}</h1>
          <p>{lang === 'ar' ? 'تكوين الحسابات الافتراضية للنظام' : 'Configure default accounting accounts'}</p>
        </div>
      </div>

      {/* Info Alert Banner */}
      <div style={{
        background: 'var(--brand-primary-dim)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
      }}>
        <Info size={20} color="var(--brand-primary-light)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          <strong>{lang === 'ar' ? 'ملاحظة عامة حول الإعدادات المحاسبية:' : 'Automatic Accounting Initialization:'}</strong>{' '}
          {lang === 'ar'
            ? 'تم تهيئة وتكوين الإعدادات المحاسبية والحسابات الافتراضية تلقائياً عند تسجيل الشركة في النظام. لا يتوجب عليك إدخالها يدوياً، ويمكنك تعديل ربط الحسابات من الخيارات أدناه في أي وقت.'
            : 'Default accounting settings are automatically configured upon company registration. You do not need to construct them manually, but you can adjust account mappings below anytime.'}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} color="var(--brand-primary)" />
            {t.defaultAccounts}
          </div>
          <div className="card-subtitle">
            {lang === 'ar' ? 'اختر الحساب الافتراضي لكل عملية من دليل الحسابات الخفي بالمصطلحات الشائعة' : 'Select default GL account for each module transaction'}
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-grid">
              {renderSelect('inventoryAccountId', lang === 'ar' ? 'حساب المخزون (Inventory Account)' : 'Inventory Account')}
              {renderSelect('accountsPayableAccountId', lang === 'ar' ? 'حساب الدائنون / الموردين (Accounts Payable)' : 'Accounts Payable')}
            </div>
            <div className="form-grid">
              {renderSelect('accountsReceivableAccountId', lang === 'ar' ? 'حساب المدينون / العملاء (Accounts Receivable)' : 'Accounts Receivable')}
              {renderSelect('revenueAccountId', lang === 'ar' ? 'حساب الإيرادات المبيعات (Revenue Account)' : 'Revenue Account')}
            </div>
            {renderSelect('costOfGoodsSoldAccountId', lang === 'ar' ? 'حساب تكلفة البضاعة المباعة (COGS Account)' : 'Cost of Goods Sold Account')}
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
