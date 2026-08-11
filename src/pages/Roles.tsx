import React, { useEffect, useState, useCallback } from 'react';
import { rolesApi } from '../api/endpoints';
import { extractApiError } from '../api/client';
import { useI18n } from '../context/I18nContext';
import { Shield, Plus, Search, Pencil, Trash2, RefreshCw, X, CheckSquare, Square, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Roles() {
  const { t, lang } = useI18n();

  const [roles, setRoles] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.allSettled([
        rolesApi.getAll(),
        rolesApi.getPermissionsCatalog(),
      ]);

      if (rRes.status === 'fulfilled') {
        const arr = Array.isArray(rRes.value.data) ? rRes.value.data : [];
        setRoles(arr);
        setFiltered(arr);
      }
      if (cRes.status === 'fulfilled') {
        setCatalog(Array.isArray(cRes.value.data) ? cRes.value.data : []);
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(roles); return; }
    const q = search.toLowerCase();
    setFiltered(roles.filter(r => `${r.name} ${r.description}`.toLowerCase().includes(q)));
  }, [search, roles]);

  // Group permission catalog by module
  const modulesGrouped = catalog.reduce((acc: Record<string, any[]>, perm: any) => {
    const mod = perm.module || 'General';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  const openCreate = () => {
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setSelectedRole(null);
    setModal('create');
  };

  const openEdit = async (role: any) => {
    setSelectedRole(role);
    setName(role.name || '');
    setDescription(role.description || '');
    setSelectedPermissions(role.permissions || role.permissionCodes || []);
    setModal('edit');
    try {
      const res = await rolesApi.getById(role.id);
      if (res.data) {
        const data = res.data;
        setSelectedRole(data);
        setName(data.name || '');
        setDescription(data.description || '');
        setSelectedPermissions(data.permissions || data.permissionCodes || []);
      }
    } catch { }
  };

  const openDelete = (role: any) => {
    setSelectedRole(role);
    setModal('delete');
  };

  const togglePermission = (code: string) => {
    setSelectedPermissions(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleModulePermissions = (modulePerms: any[]) => {
    const codes = modulePerms.map(p => p.code);
    const allSelected = codes.every(c => selectedPermissions.includes(c));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(c => !codes.includes(c)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...codes])));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await rolesApi.create({
        name,
        description: description || undefined,
        permissionCodes: selectedPermissions,
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setSaving(true);
    try {
      // 1. Update basic info (name, description)
      await rolesApi.update(selectedRole.id, {
        name,
        description: description || undefined,
      });
      // 2. Update permissions
      await rolesApi.updatePermissions(selectedRole.id, {
        permissionCodes: selectedPermissions,
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

  const handleDelete = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await rolesApi.delete(selectedRole.id);
      toast.success(t.deletedSuccess);
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
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>{t.roles}</h1>
          <p>{lang === 'ar' ? 'إدارة أدوار النظام وتحديد الأذونات لكل دور' : 'Manage system roles and assign permissions'}</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm btn-icon" onClick={loadData} title={t.refresh}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> {t.addNew}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder={`${t.search} ${t.roles}...`} value={search} onChange={e => setSearch(e.target.value)} />
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
              <div className="empty-state-icon"><Shield size={28} /></div>
              <h3>{t.noData}</h3>
              <p>{t.getStarted} {t.roles}.</p>
              <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> {t.addNew}</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.roleName}</th>
                  <th>{t.description}</th>
                  <th>{t.permissions}</th>
                  <th style={{ textAlign: 'end' }}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(role => (
                  <tr key={role.id}>
                    <td className="td-main">{role.name}</td>
                    <td>{role.description || '-'}</td>
                    <td>
                      <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Key size={12} />
                        {(role.permissions || []).length} {t.permissionsSelected}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(role)} title={t.edit}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(role)} title={t.delete}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Role Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-xl">
            <div className="modal-header">
              <div className="modal-title">
                {modal === 'create' ? `${t.add} ${t.roles}` : `${t.edit} ${t.roles}`}
              </div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={modal === 'create' ? handleCreate : handleUpdate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Role info */}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{t.roleName} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      className="form-input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: مدير المبيعات' : 'e.g. Sales Manager'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      {t.description} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({lang === 'ar' ? 'اختياري' : 'optional'})</span>
                    </label>
                    <input
                      className="form-input"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder={lang === 'ar' ? 'وصف صلاحيات ومسؤوليات هذا الدور' : 'Role permissions overview'}
                    />
                  </div>
                </div>

                {/* Permissions Selector Catalog */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <label className="form-label" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {t.permissions} ({selectedPermissions.length})
                      </label>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {lang === 'ar' ? 'حدد الصلاحيات المسموح بها لهذا الدور حسب الأقسام:' : 'Check the permissions allowed for this role:'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    maxHeight: 380,
                    overflowY: 'auto',
                    paddingRight: 4,
                  }}>
                    {Object.keys(modulesGrouped).length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {lang === 'ar' ? 'جاري تحميل كتالوج الأذونات...' : 'Loading permissions catalog...'}
                      </div>
                    ) : (
                      Object.entries(modulesGrouped).map(([moduleName, perms]) => {
                        const moduleCodes = perms.map((p: any) => p.code);
                        const isAllModuleSelected = moduleCodes.every((c: string) => selectedPermissions.includes(c));

                        return (
                          <div key={moduleName} style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: 14,
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: 10,
                              paddingBottom: 8,
                              borderBottom: '1px solid var(--border-subtle)'
                            }}>
                              <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand-primary-light)', letterSpacing: '0.05em' }}>
                                📂 {moduleName}
                              </span>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => toggleModulePermissions(perms)}
                                style={{ fontSize: 12, padding: '2px 8px' }}
                              >
                                {isAllModuleSelected ? (lang === 'ar' ? 'إلغاء تحديد الكل' : 'Deselect All') : (lang === 'ar' ? 'تحديد الكل' : 'Select All')}
                              </button>
                            </div>

                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                              gap: 8,
                            }}>
                              {perms.map((p: any) => {
                                const isChecked = selectedPermissions.includes(p.code);
                                return (
                                  <label
                                    key={p.code}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      gap: 8,
                                      padding: '6px 8px',
                                      borderRadius: 'var(--radius-sm)',
                                      background: isChecked ? 'var(--brand-primary-dim)' : 'transparent',
                                      border: `1px solid ${isChecked ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => togglePermission(p.code)}
                                      style={{ marginTop: 3, accentColor: 'var(--brand-primary)' }}
                                    />
                                    <div>
                                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {p.description || p.code}
                                      </div>
                                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                        {p.code}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving
                    ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> {t.save}...</>
                    : (modal === 'create' ? t.create : t.saveChanges)
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selectedRole && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">{t.confirmDelete}</div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                {t.confirmDeleteMsg}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>{t.cancel}</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
