import React from 'react';
import CrudPage from '../components/CrudPage';
import { productsApi, categoriesApi } from '../api/endpoints';
import { Package } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function Products() {
  const { t, lang } = useI18n();

  const loadCategories = async () => {
    const res = await categoriesApi.getAll();
    return (Array.isArray(res.data) ? res.data : []).map((c: any) => ({ value: c.id, label: c.name }));
  };

  return (
    <CrudPage
      title={t.products}
      subtitle={lang === 'ar' ? 'إدارة كتالوج المنتجات' : 'Manage your product catalog'}
      fetchAll={productsApi.getAll}
      createItem={productsApi.create}
      updateItem={productsApi.update}
      deleteItem={productsApi.delete}
      emptyIcon={<Package size={28} />}
      columns={[
        { key: 'sku', label: t.sku },
        { key: 'name', label: t.name, main: true },
        { key: 'unitOfMeasure', label: t.unitOfMeasure },
        { key: 'costPrice', label: t.costPrice, render: (r: any) => `${t.egp} ${(r.costPrice || 0).toLocaleString()}` },
        { key: 'salePrice', label: t.salePrice, render: (r: any) => `${t.egp} ${(r.salePrice || 0).toLocaleString()}` },
        { key: 'isActive', label: t.status, render: (r: any) => (
          <span className={`badge ${r.isActive !== false ? 'badge-success' : 'badge-error'}`}>
            {r.isActive !== false ? t.active : t.inactive}
          </span>
        )},
      ]}
      fields={[
        { name: 'sku', label: t.sku, required: true, placeholder: lang === 'ar' ? 'مثال: PROD-001' : 'e.g. PROD-001' },
        { name: 'name', label: t.name, required: true, placeholder: lang === 'ar' ? 'اسم المنتج' : 'Product name' },
        { name: 'unitOfMeasure', label: t.unitOfMeasure, required: true, placeholder: lang === 'ar' ? 'قطعة / كيلو / متر' : 'PCS / KG / M' },
        {
          name: 'categoryId', label: t.category, type: 'select-dynamic',
          optionsLoader: loadCategories,
          optional: true,
        },
        { name: 'costPrice', label: t.costPrice, type: 'number', required: true, placeholder: '0.00' },
        { name: 'salePrice', label: t.salePrice, type: 'number', required: true, placeholder: '0.00' },
        { name: 'description', label: t.description, type: 'textarea', optional: true, placeholder: lang === 'ar' ? 'وصف المنتج' : 'Product description', fullWidth: true },
      ]}
    />
  );
}
