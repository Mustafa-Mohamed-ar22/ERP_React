import React, { useEffect, useState, useCallback } from 'react';
import { journalEntriesApi, accountsApi } from '../api/endpoints';
import { Plus, Search, X, RefreshCw, Eye, CheckCircle, RotateCcw, Trash2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../context/I18nContext';
import { extractApiError } from '../api/client';

export default function JournalEntries() {
  const { t, lang } = useI18n();

  const [entries, setEntries]   = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState<'create' | 'view' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [saving, setSaving]     = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const openView = async (entry: any) => {
    setSelected(entry);
    setModal('view');
    setLoadingDetails(true);
    try {
      const res = await journalEntriesApi.getById(entry.id);
      if (res.data) setSelected(res.data);
    } catch { }
    setLoadingDetails(false);
  };

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    lines: [
      { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
      { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
    ],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [jeRes, accRes] = await Promise.allSettled([
        journalEntriesApi.getAll(),
        accountsApi.getAll(),
      ]);
      setEntries(jeRes.status === 'fulfilled' ? (Array.isArray(jeRes.value.data) ? jeRes.value.data : []) : []);
      setAccounts(accRes.status === 'fulfilled' ? (Array.isArray(accRes.value.data) ? accRes.value.data : []) : []);
    } catch {
      toast.error(t.loadFailed);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(entries); return; }
    const q = search.toLowerCase();
    setFiltered(entries.filter(e => `${e.reference} ${e.description} ${e.status}`.toLowerCase().includes(q)));
  }, [search, entries]);

  const addLine = () => setForm(f => ({
    ...f, lines: [...f.lines, { accountId: '', description: '', debitAmount: 0, creditAmount: 0 }]
  }));
  const removeLine = (idx: number) => setForm(f => ({
    ...f, lines: f.lines.filter((_, i) => i !== idx)
  }));
  const updateLine = (idx: number, key: string, value: any) => setForm(f => ({
    ...f, lines: f.lines.map((l, i) => i === idx ? { ...l, [key]: value } : l)
  }));

  const totalDebit = form.lines.reduce((s, l) => s + (l.debitAmount || 0), 0);
  const totalCredit = form.lines.reduce((s, l) => s + (l.creditAmount || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      toast.error(lang === 'ar' ? 'يجب أن يكون القيد متوازناً (المدين = الدائن)' : 'Journal entry must balance (Debit = Credit)');
      return;
    }
    if (form.lines.some(l => !l.accountId)) {
      toast.error(lang === 'ar' ? 'يرجى اختيار الحساب لكل بند' : 'Please select an account for each line');
      return;
    }
    setSaving(true);
    try {
      await journalEntriesApi.create(form);
      toast.success(lang === 'ar' ? 'تم إنشاء القيد بنجاح!' : 'Journal entry created!');
      setModal(null);
      load();
    } catch (err) {
      toast.error(extractApiError(err));
    }
    setSaving(false);
  };

  const handlePost = async (id: string) => {
    try {
      await journalEntriesApi.post(id);
      toast.success(lang === 'ar' ? 'تم ترحيل القيد!' : 'Entry posted!');
      load();
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleReverse = async (id: string) => {
    try {
      await journalEntriesApi.reverse(id);
      toast.success(lang === 'ar' ? 'تم عكس القيد!' : 'Entry reversed!');
      load();
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await journalEntriesApi.delete(id);
      toast.success(t.deletedSuccess);
      load();
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const accountName = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? `${acc.code ? acc.code + ' - ' : ''}${acc.name}` : id;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      Draft:    { cls: 'badge-default', label: lang === 'ar' ? 'مسودة' : 'Draft' },
      Posted:   { cls: 'badge-success', label: lang === 'ar' ? 'مرحّل' : 'Posted' },
      Reversed: { cls: 'badge-error',   label: lang === 'ar' ? 'معكوس' : 'Reversed' },
    };
    const s = map[status] || { cls: 'badge-default', label: status };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{t.journalEntries}</h1>
          <p>{lang === 'ar' ? 'تسجيل وإدارة القيود المحاسبية اليومية' : 'Record and manage double-entry accounting transactions'}</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm btn-icon" onClick={load} title={t.refresh}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={() => {
            setForm({
              date: new Date().toISOString().split('T')[0],
              reference: '', description: '',
              lines: [
                { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
                { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
              ],
            });
            setModal('create');
          }}>
            <Plus size={16} /> {t.newEntry}
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder={`${t.search} ${t.journalEntries}...`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{filtered.length} {t.records}</div>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="loading-overlay"><div className="spinner" /></div> :
            filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><BookOpen size={28} /></div>
                <h3>{t.noData}</h3>
                <p>{t.getStarted} {t.journalEntries}</p>
                <button className="btn btn-primary" onClick={() => setModal('create')}><Plus size={16} /> {t.newEntry}</button>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr>
                  <th>{lang === 'ar' ? 'المرجع' : 'Reference'}</th>
                  <th>{t.date}</th>
                  <th>{t.description}</th>
                  <th>{t.debit}</th>
                  <th>{t.credit}</th>
                  <th>{t.status}</th>
                  <th style={{ textAlign: 'end' }}>{t.actions}</th>
                </tr></thead>
                <tbody>
                  {filtered.map(entry => (
                    <tr key={entry.id}>
                      <td className="td-main" style={{ fontFamily: 'monospace' }}>{entry.reference || entry.id?.slice(0, 8)}</td>
                      <td>{entry.date ? new Date(entry.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB') : '-'}</td>
                      <td>{entry.description || '-'}</td>
                      <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{t.egp} {(entry.totalDebit || 0).toLocaleString()}</td>
                      <td style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{t.egp} {(entry.totalCredit || 0).toLocaleString()}</td>
                      <td>{statusBadge(entry.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" title={t.view} onClick={() => openView(entry)}><Eye size={14} /></button>
                          {entry.status === 'Draft' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handlePost(entry.id)}><CheckCircle size={12} /> {t.post}</button>
                              <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(entry.id)}><Trash2 size={14} /></button>
                            </>
                          )}
                          {entry.status === 'Posted' && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleReverse(entry.id)}><RotateCcw size={12} /> {t.reverse}</button>
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

      {/* Create Modal */}
      {modal === 'create' && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-xl">
            <div className="modal-header">
              <div className="modal-title">{t.newEntry}</div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{t.date} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'رقم المرجع' : 'Reference'} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{lang === 'ar' ? '(اختياري)' : '(optional)'}</span></label>
                    <input className="form-input" placeholder="JE-001" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.description} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{lang === 'ar' ? '(اختياري)' : '(optional)'}</span></label>
                  <input className="form-input" placeholder={lang === 'ar' ? 'وصف القيد...' : 'Entry description...'} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                {/* Lines */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label className="form-label" style={{ margin: 0 }}>{t.entryLines}</label>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: isBalanced ? 'var(--success)' : 'var(--error)', fontWeight: 700 }}>
                        {isBalanced ? `✓ ${t.balanced}` : `⚠ ${t.difference}: ${t.egp} ${Math.abs(totalDebit - totalCredit).toFixed(2)}`}
                      </span>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={addLine}><Plus size={14} /> {lang === 'ar' ? 'إضافة بند' : 'Add Line'}</button>
                    </div>
                  </div>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-elevated)' }}>
                          {[t.accountName, t.description, t.debit, t.credit, ''].map((h, i) => (
                            <th key={i} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'start' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {form.lines.map((line, idx) => (
                          <tr key={idx} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '8px 10px' }}>
                              <select className="form-select" value={line.accountId} onChange={e => updateLine(idx, 'accountId', e.target.value)} required style={{ minWidth: 200 }}>
                                <option value="">{lang === 'ar' ? '— اختر الحساب —' : '— Select Account —'}</option>
                                {accounts.map((a: any) => (
                                  <option key={a.id} value={a.id}>{a.code ? `${a.code} - ` : ''}{a.name}</option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <input className="form-input" placeholder={lang === 'ar' ? 'وصف البند' : 'Line description'} value={line.description} onChange={e => updateLine(idx, 'description', e.target.value)} />
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <input className="form-input" type="number" min="0" step="0.01" value={line.debitAmount || ''} onChange={e => updateLine(idx, 'debitAmount', Number(e.target.value))} style={{ width: 100 }} />
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <input className="form-input" type="number" min="0" step="0.01" value={line.creditAmount || ''} onChange={e => updateLine(idx, 'creditAmount', Number(e.target.value))} style={{ width: 100 }} />
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              {form.lines.length > 2 && <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => removeLine(idx)}><X size={14} /></button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: '2px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
                          <td colSpan={2} style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'end' }}>{t.total}:</td>
                          <td style={{ padding: '10px 12px', color: 'var(--accent-emerald)', fontWeight: 800 }}>{t.egp} {totalDebit.toFixed(2)}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--accent-rose)', fontWeight: 800 }}>{t.egp} {totalCredit.toFixed(2)}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !isBalanced}>
                  {saving ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title">{selected.reference || selected.id?.slice(0, 8)}</div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {loadingDetails ? (
                <div className="loading-overlay"><div className="spinner" /></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                      [t.date, selected.date ? new Date(selected.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB') : '-'],
                      [t.status, statusBadge(selected.status)],
                      [t.description, selected.description || '-'],
                    ].map(([lbl, val]) => (
                      <div key={lbl as string} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{lbl}</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {(selected.lines || []).length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>{t.entryLines}</div>
                      <table className="data-table" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                        <thead><tr>
                          <th>{t.accountName}</th>
                          <th>{t.description}</th>
                          <th>{t.debit}</th>
                          <th>{t.credit}</th>
                        </tr></thead>
                        <tbody>
                          {selected.lines.map((l: any, i: number) => (
                            <tr key={i}>
                              <td className="td-main">{l.accountName || accountName(l.accountId)}</td>
                              <td>{l.description || '-'}</td>
                              <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{l.debitAmount ? `${t.egp} ${l.debitAmount.toLocaleString()}` : '-'}</td>
                              <td style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{l.creditAmount ? `${t.egp} ${l.creditAmount.toLocaleString()}` : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
