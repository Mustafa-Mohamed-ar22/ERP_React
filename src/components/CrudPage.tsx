import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../context/I18nContext';
import { extractApiError } from '../api/client';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  main?: boolean;
}

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'password' | 'textarea' | 'select' | 'select-dynamic' | 'date' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  optional?: boolean; // show "(اختياري / optional)" hint
  options?: { value: string; label: string }[];
  optionsLoader?: () => Promise<{ value: string; label: string }[]>; // async options for select-dynamic
  fullWidth?: boolean;
}

interface CrudPageProps<T extends { id?: string }> {
  title: string;
  subtitle?: string;
  fetchAll: () => Promise<{ data: T[] } | any>;
  createItem?: (data: any) => Promise<any>;
  updateItem?: (id: string, data: any) => Promise<any>;
  deleteItem?: (id: string) => Promise<any>;
  columns: Column<T>[];
  fields: FieldDef[];
  idKey?: string;
  defaultFormData?: Record<string, any>;
  extraActions?: (row: T, reload: () => void) => React.ReactNode;
  topActions?: React.ReactNode;
  emptyIcon?: React.ReactNode;
}

// ─── Async Select Component ───────────────────────────────────────────────────
function DynamicSelect({
  field, value, onChange
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const { t, lang } = useI18n();
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!field.optionsLoader) return;
    setLoading(true);
    field.optionsLoader()
      .then(opts => setOptions(opts))
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
  }, [field.name]); // re-load only if field identity changes

  return (
    <select
      className="form-select"
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      required={field.required}
      disabled={loading}
    >
      <option value="">
        {loading ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...') : `— ${lang === 'ar' ? 'اختر' : 'Select'} ${field.label} —`}
      </option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export default function CrudPage<T extends { id?: string }>({
  title, subtitle, fetchAll, createItem, updateItem, deleteItem,
  columns, fields, idKey = 'id', defaultFormData = {}, extraActions, topActions, emptyIcon
}: CrudPageProps<T>) {
  const { t, lang } = useI18n();

  const [items, setItems] = useState<T[]>([]);
  const [filtered, setFiltered] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>(defaultFormData);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAll();
      const arr = Array.isArray(res.data) ? res.data : [];
      setItems(arr);
      setFiltered(arr);
    } catch (err) {
      toast.error(extractApiError(err) || t.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(items); return; }
    const q = search.toLowerCase();
    setFiltered(items.filter(item =>
      Object.values(item as any).some(v => String(v).toLowerCase().includes(q))
    ));
  }, [search, items]);

  const openCreate = () => { setFormData(defaultFormData); setSelected(null); setModal('create'); };
  const openEdit = (row: T) => { setFormData({ ...defaultFormData, ...row }); setSelected(row); setModal('edit'); };
  const openDelete = (row: T) => { setSelected(row); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create' && createItem) {
        await createItem(formData);
        toast.success(t.createdSuccess);
      } else if (modal === 'edit' && updateItem && selected) {
        await updateItem((selected as any)[idKey], formData);
        toast.success(t.updatedSuccess);
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(extractApiError(err) || t.operationFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem || !selected) return;
    setSaving(true);
    try {
      await deleteItem((selected as any)[idKey]);
      toast.success(t.deletedSuccess);
      closeModal();
      load();
    } catch (err) {
      toast.error(extractApiError(err) || t.operationFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleField = (name: string, value: any) => setFormData(f => ({ ...f, [name]: value }));

  // Group fields into rows (2-col unless fullWidth)
  const fieldGroups: FieldDef[][] = [];
  let i = 0;
  while (i < fields.length) {
    if (fields[i].fullWidth) { fieldGroups.push([fields[i]]); i++; }
    else if (i + 1 < fields.length && !fields[i + 1].fullWidth) { fieldGroups.push([fields[i], fields[i + 1]]); i += 2; }
    else { fieldGroups.push([fields[i]]); i++; }
  }

  const renderField = (field: FieldDef) => {
    const val = formData[field.name];
    if (field.type === 'textarea') {
      return (
        <textarea className="form-textarea" placeholder={field.placeholder}
          value={val || ''} onChange={e => handleField(field.name, e.target.value)}
          required={field.required} />
      );
    }
    if (field.type === 'select') {
      return (
        <select className="form-select" value={val ?? ''}
          onChange={e => handleField(field.name, e.target.value)} required={field.required}>
          <option value="">{`— ${lang === 'ar' ? 'اختر' : 'Select'} ${field.label} —`}</option>
          {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      );
    }
    if (field.type === 'select-dynamic') {
      return (
        <DynamicSelect field={field} value={val ?? ''} onChange={v => handleField(field.name, v)} />
      );
    }
    if (field.type === 'checkbox') {
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 4 }}>
          <input type="checkbox" checked={!!val}
            onChange={e => handleField(field.name, e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{field.placeholder}</span>
        </label>
      );
    }
    return (
      <input className="form-input" type={field.type || 'text'} placeholder={field.placeholder}
        value={val ?? ''} onChange={e => handleField(field.name,
          field.type === 'number' ? Number(e.target.value) : e.target.value)}
        required={field.required} />
    );
  };

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="page-header-actions">
          {topActions}
          <button className="btn btn-secondary btn-sm btn-icon" onClick={load} title={t.refresh}><RefreshCw size={14} /></button>
          {createItem && (
            <button id={`btn-create-${title.replace(/\s/g, '-').toLowerCase()}`}
              className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} /> {t.addNew}
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {/* Search */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder={`${t.search} ${title}...`} value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="icon-btn btn-sm" onClick={() => setSearch('')}><X size={14} /></button>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {filtered.length} {t.records}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{emptyIcon || <Plus size={28} />}</div>
              <h3>{t.noData}</h3>
              <p>{search ? `${t.noResults} "${search}"` : `${t.getStarted} ${title}.`}</p>
              {createItem && !search && (
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> {t.add} {title}</button>
              )}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map(c => <th key={c.key}>{c.label}</th>)}
                  {(updateItem || deleteItem || extraActions) && <th style={{ textAlign: 'end' }}>{t.actions}</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={(row as any)[idKey] || idx}>
                    {columns.map(c => (
                      <td key={c.key} className={c.main ? 'td-main' : ''}>
                        {c.render ? c.render(row) : String((row as any)[c.key] ?? '-')}
                      </td>
                    ))}
                    {(updateItem || deleteItem || extraActions) && (
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {extraActions?.(row, load)}
                          {updateItem && (
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(row)} title={t.edit}><Pencil size={14} /></button>
                          )}
                          {deleteItem && (
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(row)} title={t.delete}><Trash2 size={14} /></button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title">{modal === 'create' ? `${t.add} ${title}` : `${t.edit} ${title}`}</div>
              <button className="icon-btn" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {fieldGroups.map((group, gi) => (
                  <div key={gi} className={group.length === 2 ? 'form-grid' : ''} style={{ marginBottom: 16 }}>
                    {group.map(field => (
                      <div key={field.name} className="form-group">
                        <label className="form-label">
                          {field.label}
                          {field.required && <span style={{ color: 'var(--error)' }}> *</span>}
                          {(field.optional || (!field.required && field.type !== 'checkbox')) && (
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginInlineStart: 4 }}>
                              {lang === 'ar' ? '(اختياري)' : '(optional)'}
                            </span>
                          )}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>{t.cancel}</button>
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

      {/* Delete Confirmation */}
      {modal === 'delete' && (
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
    </div>
  );
}
