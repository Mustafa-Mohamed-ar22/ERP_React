import React from 'react';
import CrudPage from '../components/CrudPage';
import { warehousesApi, branchesApi } from '../api/endpoints';
import { Warehouse } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function Warehouses() {
  const { t, lang } = useI18n();

  const loadBranches = async () => {
    const res = await branchesApi.getAll();
    return (Array.isArray(res.data) ? res.data : []).map((b: any) => ({ value: b.id, label: b.name }));
  };

  return (
    <CrudPage
      title={t.warehouses}
      subtitle={lang === 'ar' ? 'إدارة المخازن والمستودعات' : 'Manage storage locations'}
      fetchAll={warehousesApi.getAll}
      fetchById={warehousesApi.getById}
      createItem={warehousesApi.create}
      updateItem={warehousesApi.update}
      deleteItem={warehousesApi.delete}
      emptyIcon={<Warehouse size={28} />}
      columns={[
        { key: 'name', label: t.name, main: true },
        { key: 'code', label: t.code },
        { key: 'branchId', label: t.branch, render: (r: any) => r.branchName || '-' },
        { key: 'isActive', label: t.status, render: (r: any) => (
          <span className={`badge ${r.isActive !== false ? 'badge-success' : 'badge-error'}`}>
            {r.isActive !== false ? t.active : t.inactive}
          </span>
        )},
      ]}
      fields={[
        { name: 'name', label: t.name, required: true, placeholder: lang === 'ar' ? 'اسم المخزن' : 'Warehouse name' },
        { name: 'code', label: t.code, required: true, placeholder: lang === 'ar' ? 'كود المخزن' : 'e.g. WH-CAI-01' },
        { name: 'branchId', label: t.branch, type: 'select-dynamic', optionsLoader: loadBranches, optional: true },
      ]}
    />
  );
}
