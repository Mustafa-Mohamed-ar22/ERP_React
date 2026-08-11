import React from 'react';
import CrudPage from '../components/CrudPage';
import { departmentsApi, branchesApi } from '../api/endpoints';
import { Briefcase } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function Departments() {
  const { t, lang } = useI18n();

  const loadBranches = async () => {
    const res = await branchesApi.getAll();
    return (Array.isArray(res.data) ? res.data : []).map((b: any) => ({ value: b.id, label: b.name }));
  };

  const loadParentDepts = async () => {
    const res = await departmentsApi.getAll();
    return (Array.isArray(res.data) ? res.data : []).map((d: any) => ({ value: d.id, label: d.name }));
  };

  return (
    <CrudPage
      title={t.departments}
      subtitle={lang === 'ar' ? 'الهيكل التنظيمي للأقسام' : 'Organizational department structure'}
      fetchAll={departmentsApi.getAll}
      fetchById={departmentsApi.getById}
      createItem={departmentsApi.create}
      updateItem={departmentsApi.update}
      deleteItem={departmentsApi.delete}
      emptyIcon={<Briefcase size={28} />}
      columns={[
        { key: 'name', label: t.name, main: true },
        { key: 'branchId', label: t.branch, render: (r: any) => r.branchName || '-' },
        { key: 'parentDepartmentId', label: t.parentDepartment, render: (r: any) => r.parentDepartmentName || '-' },
        { key: 'isActive', label: t.status, render: (r: any) => (
          <span className={`badge ${r.isActive !== false ? 'badge-success' : 'badge-error'}`}>
            {r.isActive !== false ? t.active : t.inactive}
          </span>
        )},
      ]}
      fields={[
        { name: 'name', label: t.name, required: true, placeholder: lang === 'ar' ? 'اسم القسم' : 'Department name' },
        { name: 'branchId', label: t.branch, type: 'select-dynamic', optionsLoader: loadBranches, optional: true },
        { name: 'parentDepartmentId', label: t.parentDepartment, type: 'select-dynamic', optionsLoader: loadParentDepts, optional: true },
      ]}
    />
  );
}
