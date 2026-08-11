import React from 'react';
import CrudPage from '../components/CrudPage';
import { accountsApi } from '../api/endpoints';
import { CreditCard } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function Accounts() {
  const { t, lang } = useI18n();

  const loadAccounts = async () => {
    const res = await accountsApi.getAll();
    return (Array.isArray(res.data) ? res.data : []).map((a: any) => ({
      value: a.id,
      label: `${a.code ? a.code + ' - ' : ''}${a.name}`,
    }));
  };

  const accountTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      Asset: t.asset, Liability: t.liability, Equity: t.equity,
      Revenue: t.revenue, Expense: t.expense,
    };
    return map[type] || type;
  };

  const accountTypeBadge: Record<string, string> = {
    Asset: 'badge-success', Liability: 'badge-error', Equity: 'badge-purple',
    Revenue: 'badge-info', Expense: 'badge-warning',
  };

  return (
    <CrudPage
      title={t.accounts}
      subtitle={lang === 'ar' ? 'دليل الحسابات العام' : 'General Ledger Chart of Accounts'}
      fetchAll={accountsApi.getAll}
      fetchById={accountsApi.getById}
      createItem={accountsApi.create}
      updateItem={accountsApi.update}
      deleteItem={accountsApi.delete}
      emptyIcon={<CreditCard size={28} />}
      columns={[
        { key: 'code', label: t.accountCode },
        { key: 'name', label: t.accountName, main: true },
        { key: 'accountType', label: t.accountType, render: (r: any) => (
          <span className={`badge ${accountTypeBadge[r.accountType] || 'badge-default'}`}>
            {accountTypeLabel(r.accountType)}
          </span>
        )},
        { key: 'parentAccountId', label: t.parentAccount, render: (r: any) => r.parentAccountName || r.parentAccountCode || '-' },
        { key: 'isActive', label: t.status, render: (r: any) => (
          <span className={`badge ${r.isActive !== false ? 'badge-success' : 'badge-error'}`}>
            {r.isActive !== false ? t.active : t.inactive}
          </span>
        )},
      ]}
      fields={[
        { name: 'code', label: t.accountCode, required: true, placeholder: lang === 'ar' ? 'مثال: 1001' : 'e.g. 1001' },
        { name: 'name', label: t.accountName, required: true, placeholder: lang === 'ar' ? 'اسم الحساب' : 'Account name' },
        { name: 'accountType', label: t.accountType, type: 'select', required: true, options: [
          { value: 'Asset', label: t.asset },
          { value: 'Liability', label: t.liability },
          { value: 'Equity', label: t.equity },
          { value: 'Revenue', label: t.revenue },
          { value: 'Expense', label: t.expense },
        ]},
        { name: 'parentAccountId', label: t.parentAccount, type: 'select-dynamic', optionsLoader: loadAccounts, optional: true },
      ]}
    />
  );
}
