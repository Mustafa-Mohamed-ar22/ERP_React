import React, { useEffect, useState, useCallback } from 'react';
import { usersApi, branchesApi, departmentsApi, rolesApi } from '../api/endpoints';
import { extractApiError } from '../api/client';
import { useI18n } from '../context/I18nContext';
import { Users as UsersIcon, Plus, Search, Shield, UserX, RefreshCw, X, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Users() {
  const { t, lang } = useI18n();

  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState<'create' | 'assign-roles' | 'deactivate' | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form states for Create User
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [branchId, setBranchId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, bRes, dRes, rRes] = await Promise.allSettled([
        usersApi.getAll(),
        branchesApi.getAll(),
        departmentsApi.getAll(),
        rolesApi.getAll(),
      ]);

      if (uRes.status === 'fulfilled') {
        const arr = Array.isArray(uRes.value.data) ? uRes.value.data : [];
        setUsers(arr);
        setFiltered(arr);
      }
      if (bRes.status === 'fulfilled') setBranches(Array.isArray(bRes.value.data) ? bRes.value.data : []);
      if (dRes.status === 'fulfilled') setDepartments(Array.isArray(dRes.value.data) ? dRes.value.data : []);
      if (rRes.status === 'fulfilled') setAvailableRoles(Array.isArray(rRes.value.data) ? rRes.value.data : []);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter(u => `${u.fullName} ${u.email} ${u.branchName} ${u.departmentName}`.toLowerCase().includes(q)));
  }, [search, users]);

  const openCreate = () => {
    setFullName('');
    setEmail('');
    setBranchId('');
    setDepartmentId('');
    setSelectedRoles([]);
    setSelectedUser(null);
    setModal('create');
  };

  const openAssignRoles = async (user: any) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setModal('assign-roles');
    try {
      const res = await usersApi.getById(user.id);
      if (res.data) {
        setSelectedUser(res.data);
        setSelectedRoles(res.data.roles || []);
      }
    } catch { }
  };

  const openDeactivate = (user: any) => {
    setSelectedUser(user);
    setModal('deactivate');
  };

  const toggleRole = (roleName: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleName) ? prev.filter(r => r !== roleName) : [...prev, roleName]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.create({
        fullName,
        email,
        branchId: branchId || null,
        departmentId: departmentId || null,
        roleNames: selectedRoles.length > 0 ? selectedRoles : null,
      });
      toast.success(t.createdSuccess);
      setModal(null);
      loadData();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAssignRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      await usersApi.assignRoles(selectedUser.id, {
        roleNames: selectedRoles.length > 0 ? selectedRoles : null,
      });
      toast.success(t.updatedSuccess);
      setModal(null);
      loadData();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await usersApi.deactivate(selectedUser.id);
      toast.success(lang === 'ar' ? 'تم إلغاء تنشيط الحساب' : 'User account deactivated');
      setModal(null);
      loadData();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>{t.users}</h1>
          <p>{lang === 'ar' ? 'إدارة حسابات المستخدمين وصلاحيات الوصول للنظام' : 'Manage system users and access permissions'}</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm btn-icon" onClick={loadData} title={t.refresh}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> {t.addNew}
          </button>
        </div>
      </div>

      {/* Info callout */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
        color: 'var(--text-secondary)'
      }}>
        <Info size={18} color="var(--brand-primary-light)" style={{ flexShrink: 0 }} />
        <span>
          {lang === 'ar'
            ? 'الأدوار اختيارية عند إضافة المستخدمين. يمكن تركها فارغة لمنح حساب تسجيل دخول أساسي لتمكين تسجيل الحضور والانضباط ذاتياً.'
            : 'Roles are optional when creating users. Leaving roles empty grants login-only access for self-service attendance.'}
        </span>
      </div>

      {/* Table Card */}
      <div className="card">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder={`${t.search} ${t.users}...`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {filtered.length} {t.records}
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><UsersIcon size={28} /></div>
              <h3>{t.noData}</h3>
              <p>{t.getStarted} {t.users}.</p>
              <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> {t.addNew}</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.fullName}</th>
                  <th>{t.email}</th>
                  <th>{t.branch}</th>
                  <th>{t.department}</th>
                  <th>{t.roles}</th>
                  <th>{t.status}</th>
                  <th style={{ textAlign: 'end' }}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id}>
                    <td className="td-main">{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.branchName || '-'}</td>
                    <td>{user.departmentName || '-'}</td>
                    <td>
                      {(user.roles || []).length === 0 ? (
                        <span className="badge badge-default">
                          {lang === 'ar' ? 'بدون أدوار (حساب فقط)' : 'No roles (Login only)'}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {user.roles.map((r: string) => (
                            <span key={r} className="badge badge-purple">{r}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${user.isActive !== false ? 'badge-success' : 'badge-error'}`}>
                        {user.isActive !== false ? t.active : t.inactive}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openAssignRoles(user)}
                          title={lang === 'ar' ? 'تعيين الأدوار' : 'Assign Roles'}
                        >
                          <Shield size={13} /> {lang === 'ar' ? 'الأدوار' : 'Roles'}
                        </button>
                        {user.isActive !== false && (
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => openDeactivate(user)}
                            title={lang === 'ar' ? 'إلغاء تنشيط' : 'Deactivate'}
                          >
                            <UserX size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {modal === 'create' && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title">{t.add} {t.users}</div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{t.fullName} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full Name'} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.email} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="user@company.com" />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{t.branch} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({lang === 'ar' ? 'اختياري' : 'optional'})</span></label>
                    <select className="form-select" value={branchId} onChange={e => setBranchId(e.target.value)}>
                      <option value="">{lang === 'ar' ? '— اختر الفرع —' : '— Select Branch —'}</option>
                      {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.department} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({lang === 'ar' ? 'اختياري' : 'optional'})</span></label>
                    <select className="form-select" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                      <option value="">{lang === 'ar' ? '— اختر القسم —' : '— Select Department —'}</option>
                      {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Roles Selector (Nullable/Optional) */}
                <div>
                  <label className="form-label">{t.roles} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({lang === 'ar' ? 'اختياري - يمكن تركها فارغة' : 'optional'})</span></label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 8,
                    marginTop: 6,
                    padding: 12,
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {availableRoles.length === 0 ? (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lang === 'ar' ? 'لا توجد أدوار معرفة بالسظام' : 'No roles defined'}</div>
                    ) : (
                      availableRoles.map((r: any) => {
                        const isChecked = selectedRoles.includes(r.name);
                        return (
                          <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleRole(r.name)}
                              style={{ accentColor: 'var(--brand-primary)' }}
                            />
                            {r.name}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Roles Modal */}
      {modal === 'assign-roles' && selectedUser && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="modal-title">{lang === 'ar' ? 'تعيين أدوار للمستخدم' : 'Assign User Roles'}</div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAssignRoles}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  {lang === 'ar' ? 'تعديل أدوار' : 'Updating roles for'} <strong>{selectedUser.fullName}</strong> ({selectedUser.email}):
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: 250,
                  overflowY: 'auto',
                  padding: 12,
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {availableRoles.map((r: any) => {
                    const isChecked = selectedRoles.includes(r.name);
                    return (
                      <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 8px', borderRadius: 4, background: isChecked ? 'var(--brand-primary-dim)' : 'transparent' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRole(r.name)}
                          style={{ accentColor: 'var(--brand-primary)' }}
                        />
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</span>
                        {r.description && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginInlineStart: 'auto' }}>{r.description}</span>}
                      </label>
                    );
                  })}
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  💡 {lang === 'ar' ? 'يمكن ترك جميع الأدوار غير محددة لإزالة كافة الصلاحيات والإبقاء على حساب الدخول فقط.' : 'Leaving all roles unchecked removes permissions while preserving login access.'}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate User Modal */}
      {modal === 'deactivate' && selectedUser && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">{lang === 'ar' ? 'إلغاء تنشيط حساب المستخدم' : 'Deactivate User Account'}</div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                {lang === 'ar'
                  ? `هل أنت متأكد من إلغاء تنشيط حساب "${selectedUser.fullName}"؟ لن يتمكن من تسجيل الدخول بعد الآن.`
                  : `Are you sure you want to deactivate account "${selectedUser.fullName}"? They will no longer be able to log in.`}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>{t.cancel}</button>
              <button className="btn btn-danger" onClick={handleDeactivate} disabled={saving}>
                {saving ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : (lang === 'ar' ? 'إلغاء التنشيط' : 'Deactivate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
