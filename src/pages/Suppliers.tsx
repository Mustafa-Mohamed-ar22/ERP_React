import React from 'react';
import CrudPage from '../components/CrudPage';
import { suppliersApi } from '../api/endpoints';
import { Truck } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function Suppliers() {
  const { t, lang } = useI18n();
  return (
    <CrudPage
      title={t.suppliers}
      subtitle={lang === 'ar' ? 'إدارة بيانات الموردين' : 'Manage your suppliers'}
      fetchAll={suppliersApi.getAll}
      fetchById={suppliersApi.getById}
      createItem={suppliersApi.create}
      updateItem={suppliersApi.update}
      deleteItem={suppliersApi.delete}
      emptyIcon={<Truck size={28} />}
      columns={[
        { key: 'name', label: t.name, main: true },
        { key: 'contactName', label: t.contactName },
        { key: 'email', label: t.email },
        { key: 'phone', label: t.phone },
        { key: 'taxNumber', label: t.taxNumber },
        { key: 'isActive', label: t.status, render: (r: any) => (
          <span className={`badge ${r.isActive !== false ? 'badge-success' : 'badge-error'}`}>
            {r.isActive !== false ? t.active : t.inactive}
          </span>
        )},
      ]}
      fields={[
        { name: 'name', label: t.name, required: true, placeholder: lang === 'ar' ? 'اسم المورد' : 'Supplier name' },
        { name: 'contactName', label: t.contactName, placeholder: lang === 'ar' ? 'اسم المسؤول' : 'Contact person' },
        { name: 'email', label: t.email, type: 'email', placeholder: 'supplier@email.com' },
        { name: 'phone', label: t.phone, placeholder: lang === 'ar' ? '01xxxxxxxxx' : '+20 1xx xxx xxxx' },
        { name: 'taxNumber', label: t.taxNumber, placeholder: lang === 'ar' ? 'الرقم الضريبي' : 'Tax / VAT number' },
        { name: 'address', label: t.address, type: 'textarea', placeholder: lang === 'ar' ? 'العنوان' : 'Address', fullWidth: true },
      ]}
    />
  );
}
