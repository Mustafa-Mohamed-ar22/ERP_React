import React from 'react';
import CrudPage from '../components/CrudPage';
import { branchesApi } from '../api/endpoints';
import { Building2 } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function Branches() {
  const { t, lang } = useI18n();
  return (
    <CrudPage
      title={t.branches}
      subtitle={lang === 'ar' ? 'إدارة فروع الشركة' : 'Manage company branches'}
      fetchAll={branchesApi.getAll}
      fetchById={branchesApi.getById}
      createItem={branchesApi.create}
      updateItem={branchesApi.update}
      deleteItem={branchesApi.delete}
      emptyIcon={<Building2 size={28} />}
      columns={[
        { key: 'name', label: t.name, main: true },
        { key: 'code', label: t.code },
        { key: 'address', label: t.address },
        { key: 'phone', label: t.phone },
        { key: 'isMain', label: t.isHeadquarters, render: (r: any) => (
          r.isMain ? <span className="badge badge-purple">{t.isHeadquarters}</span> : '-'
        )},
        { key: 'isActive', label: t.status, render: (r: any) => (
          <span className={`badge ${r.isActive !== false ? 'badge-success' : 'badge-error'}`}>
            {r.isActive !== false ? t.active : t.inactive}
          </span>
        )},
      ]}
      fields={[
        { name: 'name', label: t.name, required: true, placeholder: lang === 'ar' ? 'اسم الفرع' : 'Branch name' },
        { name: 'code', label: t.code, required: true, placeholder: lang === 'ar' ? 'كود الفرع' : 'e.g. BR-CAI-01' },
        { name: 'address', label: t.address, placeholder: lang === 'ar' ? 'عنوان الفرع' : 'Branch address' },
        { name: 'phone', label: t.phone, placeholder: lang === 'ar' ? '01xxxxxxxxx' : '+20 1xx xxx xxxx' },
        { name: 'isMain', label: t.isHeadquarters, type: 'checkbox', placeholder: lang === 'ar' ? 'هذا هو المقر الرئيسي' : 'This is the main headquarters' },
      ]}
    />
  );
}
