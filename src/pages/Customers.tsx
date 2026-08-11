import React from 'react';
import CrudPage from '../components/CrudPage';
import { customersApi } from '../api/endpoints';
import { Users } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function Customers() {
  const { t, lang } = useI18n();
  return (
    <CrudPage
      title={t.customers}
      subtitle={lang === 'ar' ? 'إدارة قاعدة بيانات العملاء' : 'Manage your customer database'}
      fetchAll={customersApi.getAll}
      fetchById={customersApi.getById}
      createItem={customersApi.create}
      updateItem={customersApi.update}
      deleteItem={customersApi.delete}
      emptyIcon={<Users size={28} />}
      columns={[
        { key: 'name', label: t.customerName, main: true },
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
        { name: 'name', label: t.customerName, required: true, placeholder: lang === 'ar' ? 'اسم العميل أو الشركة' : 'Customer or company name' },
        { name: 'contactName', label: t.contactName, placeholder: lang === 'ar' ? 'اسم جهة الاتصال' : 'Contact person name' },
        { name: 'email', label: t.email, type: 'email', placeholder: 'customer@email.com' },
        { name: 'phone', label: t.phone, placeholder: lang === 'ar' ? '01xxxxxxxxx' : '+20 1xx xxx xxxx' },
        { name: 'taxNumber', label: t.taxNumber, placeholder: lang === 'ar' ? 'الرقم الضريبي' : 'Tax / VAT number' },
        { name: 'address', label: t.address, type: 'textarea', placeholder: lang === 'ar' ? 'العنوان بالتفصيل' : 'Full address', fullWidth: true },
      ]}
    />
  );
}
