import React, { useEffect, useState, useCallback } from 'react';
import { employeesApi, branchesApi, departmentsApi, rolesApi } from '../api/endpoints';
import { Plus, Search, Pencil, Trash2, RefreshCw, X, UserCheck, KeyRound, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../context/I18nContext';
import { extractApiError } from '../api/client';

const EMPTY_FORM = {
  employeeCode: '', fullName: '', nationalId: '', dateOfBirth: '',
  hireDate: '', jobTitle: '', departmentId: '', branchId: '',
  managerId: '', baseSalary: 0, email: '', phone: '', address: '', userId: '',
};

const formatDateForInput = (d?: string) => {
  if (!d) return '';
  return d.split('T')[0] || '';
};

export default function Employees() {
  const { t, lang } = useI18n();

  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [allDepts, setAllDepts] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);   // filtered by selected branch
  const [managers, setManagers] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | 'grant-access' | 'details' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [viewDetails, setViewDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Grant Access states
  const [grantEmail, setGrantEmail] = useState('');
  const [grantRoles, setGrantRoles] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, brRes, deptRes, roleRes] = await Promise.allSettled([
        employeesApi.getAll(), branchesApi.getAll(), departmentsApi.getAll(), rolesApi.getAll(),
      ]);
      const emps = empRes.status === 'fulfilled' ? (Array.isArray(empRes.value.data) ? empRes.value.data : []) : [];
      setItems(emps);
      setFiltered(emps);
      setManagers(emps); // employees can be managers too
      setBranches(brRes.status === 'fulfilled' ? (Array.isArray(brRes.value.data) ? brRes.value.data : []) : []);
      const allD = deptRes.status === 'fulfilled' ? (Array.isArray(deptRes.value.data) ? deptRes.value.data : []) : [];
      setAllDepts(allD);
      setDepts(allD); // initially show all
      setAvailableRoles(roleRes.status === 'fulfilled' ? (Array.isArray(roleRes.value.data) ? roleRes.value.data : []) : []);
    } catch (err) { toast.error(extractApiError(err)); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // When branch changes, filter departments or load branch-specific ones
  useEffect(() => {
    if (!form.branchId) {
      setDepts(allDepts);
    } else {
      branchesApi.getDepartments(form.branchId)
        .then(res => {
          const arr = Array.isArray(res.data) ? res.data : [];
          setDepts(arr.length > 0 ? arr : allDepts.filter((d: any) => d.branchId === form.branchId));
        })
        .catch(() => setDepts(allDepts.filter((d: any) => d.branchId === form.branchId)));
    }
  }, [form.branchId, allDepts]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(items); return; }
    const q = search.toLowerCase();
    setFiltered(items.filter(e => `${e.fullName} ${e.employeeCode} ${e.jobTitle}`.toLowerCase().includes(q)));
  }, [search, items]);

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setSelected(null); setModal('create'); };

  const openView = async (row: any) => {
    setSelected(row);
    setViewDetails(row);
    setModal('details');
    setLoadingDetails(true);
    try {
      const res = await employeesApi.getById(row.id);
      if (res.data) setViewDetails(res.data);
    } catch { }
    setLoadingDetails(false);
  };

  const openEdit = async (row: any) => {
    setSelected(row);
    let data = row;
    try {
      const res = await employeesApi.getById(row.id);
      if (res.data) data = res.data;
    } catch { }
    setForm({
      ...EMPTY_FORM,
      ...data,
      hireDate: formatDateForInput(data.hireDate),
      dateOfBirth: formatDateForInput(data.dateOfBirth),
    });
    setModal('edit');
  };

  const openDelete = (row: any) => { setSelected(row); setModal('delete'); };
  const openGrantAccess = (row: any) => {
    setSelected(row);
    setGrantEmail(row.email || '');
    setGrantRoles([]);
    setModal('grant-access');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const toggleGrantRole = (roleName: string) => {
    setGrantRoles(prev =>
      prev.includes(roleName) ? prev.filter(r => r !== roleName) : [...prev, roleName]
    );
  };

  const sf = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload: any = {
        fullName: form.fullName, employeeCode: form.employeeCode,
        jobTitle: form.jobTitle, hireDate: form.hireDate,
        baseSalary: Number(form.baseSalary),
      };
      if (form.nationalId) payload.nationalId = form.nationalId;
      if (form.dateOfBirth) payload.dateOfBirth = form.dateOfBirth;
      if (form.departmentId) payload.departmentId = form.departmentId;
      if (form.branchId) payload.branchId = form.branchId;
      if (form.managerId) payload.managerId = form.managerId;
      if (form.email) payload.email = form.email;
      if (form.phone) payload.phone = form.phone;
      if (form.address) payload.address = form.address;
      if (form.userId) payload.userId = form.userId;

      if (modal === 'create') {
        await employeesApi.create(payload);
        toast.success(t.createdSuccess);
      } else if (modal === 'edit' && selected) {
        await employeesApi.update(selected.id, { ...payload, status: (selected as any).status || 'Active' });
        toast.success(t.updatedSuccess);
      }
      closeModal(); load();
    } catch (err) { toast.error(extractApiError(err)); }
    setSaving(false);
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await employeesApi.grantAccess(selected.id, {
        email: grantEmail,
        roleNames: grantRoles.length > 0 ? grantRoles : null,
      });
      toast.success(lang === 'ar' ? 'تم منح حساب الوصول للموظف بنجاح!' : 'Employee user access granted successfully!');
      closeModal(); load();
    } catch (err) { toast.error(extractApiError(err)); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selected) return; setSaving(true);
    try {
      await employeesApi.delete(selected.id);
      toast.success(t.deletedSuccess); closeModal(); load();
    } catch (err) { toast.error(extractApiError(err)); }
    setSaving(false);
  };

  const statusLabel: Record<string, string> = {
    Active: t.active, Inactive: t.inactive,
    OnLeave: lang === 'ar' ? 'في إجازة' : 'On Leave',
    Terminated: lang === 'ar' ? 'منتهي الخدمة' : 'Terminated',
  };
  const statusBadge: Record<string, string> = {
    Active: 'badge-success', Inactive: 'badge-error',
    OnLeave: 'badge-warning', Terminated: 'badge-error',
  };

  const Lbl = ({ txt, required, optional }: { txt: string; required?: boolean; optional?: boolean }) => (
    <label className="form-label">
      {txt}
      {required && <span style={{ color: 'var(--error)' }}> *</span>}
      {optional && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginInlineStart: 4 }}>{lang === 'ar' ? '(اختياري)' : '(optional)'}</span>}
    </label>
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{t.employees}</h1>
          <p>{lang === 'ar' ? 'إدارة سجلات الموظفين ومنح حسابات الوصول للنظام' : 'Manage employee records and grant system user access'}</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm btn-icon" onClick={load} title={t.refresh}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> {t.addNew}</button>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder={`${t.search} ${t.employees}...`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{filtered.length} {t.records}</div>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="loading-overlay"><div className="spinner" /></div> :
            filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><UserCheck size={28} /></div>
                <h3>{t.noData}</h3><p>{t.getStarted} {t.employees}</p>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> {t.addNew}</button>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr>
                  <th>{t.employeeCode}</th>
                  <th>{t.fullName}</th>
                  <th>{t.jobTitle}</th>
                  <th>{t.branch} / {t.department}</th>
                  <th>{lang === 'ar' ? 'حساب الوصول' : 'System Access'}</th>
                  <th>{t.baseSalary}</th>
                  <th>{t.status}</th>
                  <th style={{ textAlign: 'end' }}>{t.actions}</th>
                </tr></thead>
                <tbody>
                  {filtered.map(emp => (
                    <tr key={emp.id}>
                      <td><span className="badge badge-info">{emp.employeeCode}</span></td>
                      <td className="td-main">{emp.fullName}</td>
                      <td>{emp.jobTitle || '-'}</td>
                      <td>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{emp.branchName || '-'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.departmentName || '-'}</div>
                      </td>
                      <td>
                        {emp.userId ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={12} /> {lang === 'ar' ? 'يمتلك حساب' : 'Has Account'}
                          </span>
                        ) : (
                          <span className="badge badge-default" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <AlertCircle size={12} /> {lang === 'ar' ? 'عامل / بدون حساب' : 'No User Account'}
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{t.egp} {(emp.baseSalary || 0).toLocaleString()}</td>
                      <td><span className={`badge ${statusBadge[emp.status] || 'badge-default'}`}>{statusLabel[emp.status] || emp.status || '-'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openView(emp)} title={t.view || (lang === 'ar' ? 'عرض التفاصيل' : 'View Details')}>
                            <Eye size={14} />
                          </button>
                          {!emp.userId && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openGrantAccess(emp)}
                              title={lang === 'ar' ? 'منح حساب وصول للنظام' : 'Grant System Access'}
                            >
                              <KeyRound size={13} /> {lang === 'ar' ? 'منح وصول' : 'Grant Access'}
                            </button>
                          )}
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(emp)} title={t.edit}><Pencil size={14} /></button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(emp)} title={t.delete}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>

      {/* Grant Access Modal */}
      {modal === 'grant-access' && selected && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="modal-title">{lang === 'ar' ? 'منح صلاحية الوصول للنظام للموظف' : 'Grant System Access'}</div>
              <button className="icon-btn" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleGrantAccess}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  {lang === 'ar' ? 'أنشئ حساب مستخدم للموظف' : 'Creating user login account for'} <strong>{selected.fullName}</strong> ({selected.employeeCode}):
                </div>

                <div className="form-group">
                  <label className="form-label">{t.email} <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input
                    className="form-input"
                    type="email"
                    value={grantEmail}
                    onChange={e => setGrantEmail(e.target.value)}
                    required
                    placeholder="employee@company.com"
                  />
                </div>

                {/* Optional Roles Selector */}
                <div>
                  <label className="form-label">
                    {t.roles} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({lang === 'ar' ? 'اختياري - يمكن تركها فارغة للموظفين' : 'optional'})</span>
                  </label>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    maxHeight: 200,
                    overflowY: 'auto',
                    marginTop: 6,
                    padding: 10,
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {availableRoles.map((r: any) => {
                      const isChecked = grantRoles.includes(r.name);
                      return (
                        <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleGrantRole(r.name)}
                            style={{ accentColor: 'var(--brand-primary)' }}
                          />
                          {r.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--brand-primary-dim)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  💡 {lang === 'ar'
                    ? 'في حال عدم تحديد أي أدوار، سيتم إنشاء حساب تسجيل دخول للموظف بدون أدوار (تمكّنه فقط من تسجيل الحضور والانصراف وعرض إجازاته ذاتياً).'
                    : 'If no roles are selected, a login account will be created with no administrative roles (allowing self-service attendance check-in/out).'}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : (lang === 'ar' ? 'تأكيد منح الوصول' : 'Grant Access')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal modal-xl">
            <div className="modal-header">
              <div className="modal-title">{modal === 'create' ? `${t.add} ${t.employees}` : `${t.edit} ${t.employees}`}</div>
              <button className="icon-btn" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Row 1 */}
                <div className="form-grid">
                  <div className="form-group">
                    <Lbl txt={t.employeeCode} required />
                    <input className="form-input" value={form.employeeCode} onChange={sf('employeeCode')} placeholder="EMP-001" required />
                  </div>
                  <div className="form-group">
                    <Lbl txt={t.fullName} required />
                    <input className="form-input" value={form.fullName} onChange={sf('fullName')} placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full name'} required />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="form-grid">
                  <div className="form-group">
                    <Lbl txt={t.jobTitle} required />
                    <input className="form-input" value={form.jobTitle} onChange={sf('jobTitle')} placeholder={lang === 'ar' ? 'المسمى الوظيفي' : 'e.g. Sales Manager'} required />
                  </div>
                  <div className="form-group">
                    <Lbl txt={t.hireDate} required />
                    <input className="form-input" type="date" value={form.hireDate} onChange={sf('hireDate')} required />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="form-grid">
                  <div className="form-group">
                    <Lbl txt={t.nationalId} optional />
                    <input className="form-input" value={form.nationalId} onChange={sf('nationalId')} placeholder={lang === 'ar' ? '14 رقماً' : '14-digit national ID'} />
                  </div>
                  <div className="form-group">
                    <Lbl txt={t.dateOfBirth} optional />
                    <input className="form-input" type="date" value={form.dateOfBirth} onChange={sf('dateOfBirth')} />
                  </div>
                </div>

                {/* Branch + Department (cascading) */}
                <div className="form-grid">
                  <div className="form-group">
                    <Lbl txt={t.branch} optional />
                    <select className="form-select" value={form.branchId}
                      onChange={e => setForm(f => ({ ...f, branchId: e.target.value, departmentId: '' }))}>
                      <option value="">{lang === 'ar' ? '— اختر الفرع —' : '— Select Branch —'}</option>
                      {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <Lbl txt={t.department} optional />
                    <select className="form-select" value={form.departmentId} onChange={sf('departmentId')}>
                      <option value="">
                        {!form.branchId
                          ? (lang === 'ar' ? '— اختر الفرع أولاً —' : '— Select branch first —')
                          : (lang === 'ar' ? '— اختر القسم —' : '— Select Department —')
                        }
                      </option>
                      {depts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Manager */}
                <div className="form-group">
                  <Lbl txt={t.manager} optional />
                  <select className="form-select" value={form.managerId} onChange={sf('managerId')}>
                    <option value="">{lang === 'ar' ? '— اختر المدير المباشر —' : '— Select Manager —'}</option>
                    {managers.filter(m => m.id !== selected?.id).map((m: any) => (
                      <option key={m.id} value={m.id}>{m.fullName} — {m.jobTitle || ''}</option>
                    ))}
                  </select>
                </div>

                {/* Salary */}
                <div className="form-group">
                  <Lbl txt={t.baseSalary} required />
                  <input className="form-input" type="number" min="0" step="0.01" value={form.baseSalary}
                    onChange={e => setForm(f => ({ ...f, baseSalary: Number(e.target.value) }))} required />
                </div>

                {/* Contact */}
                <div className="form-grid">
                  <div className="form-group">
                    <Lbl txt={t.email} optional />
                    <input className="form-input" type="email" value={form.email} onChange={sf('email')} placeholder="employee@company.com" />
                  </div>
                  <div className="form-group">
                    <Lbl txt={t.phone} optional />
                    <input className="form-input" value={form.phone} onChange={sf('phone')} placeholder="01xxxxxxxxx" />
                  </div>
                </div>

                <div className="form-group">
                  <Lbl txt={t.address} optional />
                  <textarea className="form-textarea" value={form.address} onChange={sf('address')} placeholder={lang === 'ar' ? 'عنوان الموظف' : 'Employee address'} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> {t.save}...</> : (modal === 'create' ? t.create : t.saveChanges)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete */}
      {modal === 'delete' && selected && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">{t.confirmDelete}</div>
              <button className="icon-btn" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>{t.confirmDeleteMsg}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>{t.cancel}</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Employee Details Modal */}
      {modal === 'details' && viewDetails && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title">
                {lang === 'ar' ? 'تفاصيل بيانات الموظف' : 'Employee Details'}
              </div>
              <button className="icon-btn" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {loadingDetails ? (
                <div className="loading-overlay"><div className="spinner" /></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Summary Card */}
                  <div style={{ background: 'var(--bg-elevated)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{viewDetails.fullName}</h2>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{viewDetails.jobTitle || '-'} • <span className="badge badge-info">{viewDetails.employeeCode}</span></div>
                    </div>
                    <div>
                      <span className={`badge ${statusBadge[viewDetails.status] || 'badge-default'}`} style={{ fontSize: 13, padding: '6px 12px' }}>
                        {statusLabel[viewDetails.status] || viewDetails.status || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t.branch}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{viewDetails.branchName || '-'}</div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t.department}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{viewDetails.departmentName || '-'}</div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t.manager}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{viewDetails.managerName || '-'}</div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t.baseSalary}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-emerald)' }}>{t.egp} {(viewDetails.baseSalary || 0).toLocaleString()}</div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t.hireDate}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {viewDetails.hireDate ? new Date(viewDetails.hireDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB') : '-'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t.dateOfBirth}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {viewDetails.dateOfBirth ? new Date(viewDetails.dateOfBirth).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB') : '-'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t.nationalId}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{viewDetails.nationalId || '-'}</div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t.email}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{viewDetails.email || '-'}</div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t.phone}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{viewDetails.phone || '-'}</div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{lang === 'ar' ? 'حساب الوصول بالنظام' : 'System Access'}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {viewDetails.userId ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={12} /> {lang === 'ar' ? 'يمتلك حساب' : 'Has System Account'}
                          </span>
                        ) : (
                          <span className="badge badge-default" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <AlertCircle size={12} /> {lang === 'ar' ? 'عامل / بدون حساب' : 'No User Account'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {viewDetails.address && (
                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t.address}</div>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{viewDetails.address}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
