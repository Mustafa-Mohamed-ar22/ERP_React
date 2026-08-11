import React from 'react';
import CrudPage from '../components/CrudPage';
import { categoriesApi } from '../api/endpoints';
import { Tag } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function Categories() {
  const { t, lang } = useI18n();
  return (
    <CrudPage
      title={t.categories}
      subtitle={lang === 'ar' ? 'تصنيف المنتجات' : 'Organize products into categories'}
      fetchAll={categoriesApi.getAll}
      fetchById={categoriesApi.getById}
      createItem={categoriesApi.create}
      updateItem={categoriesApi.update}
      deleteItem={categoriesApi.delete}
      emptyIcon={<Tag size={28} />}
      columns={[
        { key: 'name', label: t.name, main: true },
        { key: 'parentCategoryId', label: t.parentCategory, render: (r: any) => r.parentCategoryId || '-' },
        { key: 'isActive', label: t.status, render: (r: any) => (
          <span className={`badge ${r.isActive !== false ? 'badge-success' : 'badge-error'}`}>
            {r.isActive !== false ? t.active : t.inactive}
          </span>
        )},
      ]}
      fields={[
        { name: 'name', label: t.name, required: true, placeholder: lang === 'ar' ? 'اسم الفئة' : 'Category name' },
        { name: 'parentCategoryId', label: t.parentCategory, placeholder: lang === 'ar' ? 'UUID الفئة الأب (اختياري)' : 'Parent category UUID (optional)' },
      ]}
    />
  );
}
