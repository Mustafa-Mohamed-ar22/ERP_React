import React, { useEffect, useState, useCallback } from 'react';
import { leaveRequestsApi, employeesApi } from '../api/endpoints';
import { Plus, Search, X, RefreshCw, CheckCircle, XCircle, Calendar, Ban, User, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../context/I18nContext';
import { extractApiError } from '../api/client';

export default function LeaveRequests() {
  const { t, lang } = useI18n();

  const [tab, setTab] = useState<'all' | 'my'>('all');
  const [requests, setRequests] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    employeeId: '',
    leaveType: 'Annual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const leaveTypes = [
    { value: 'Annual', label: t.annual },
    { value: 'Sick', label: t.sick },
    { value: 'Emergency', label: t.emergency },
    { value: 'Maternity', label: lang === 'ar' ? 'إجازة أمومة' : 'Maternity' },
    { value: 'Paternity', label: lang === 'ar' ? 'إجازة أبوة' : 'Paternity' },
    { value: 'Unpaid', label: lang === 'ar' ? 'بدون راتب' : 'Unpaid' },
  ];

  const statusMap: Record<string, { cls: string; label: string }> = {
    Pending:   { cls: 'badge-warning', label: t.pending },
    Approved:  { cls: 'badge-success', label: t.approved },
    Rejected:  { cls: 'badge-error',   label: lang === 'ar' ? 'مرفوض' : 'Rejected' },
    Cancelled: { cls: 'badge-default', label: t.cancelled },
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'all') {
        const [lRes, eRes] = await Promise.allSettled([
          leaveRequestsApi.getAll(),
          employeesApi.getAll(),
        ]);
        if (lRes.status === 'fulfilled') {
          const arr = Array.isArray(lRes.value.data) ? lRes.value.data : [];
          setRequests(arr);
          setFiltered(arr);
        }
        if (eRes.status === 'fulfilled') {
          setEmployees(Array.isArray(eRes.value.data) ? eRes.value.data : []);
        }
      } else {
        const myRes = await leaveRequestsApi.getMyRequests();
        const arr = Array.isArray(myRes.data) ? myRes.data : [];
        setRequests(arr);
        setFiltered(arr);
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(requests); return; }
    const q = search.toLowerCase();
    setFiltered(requests.filter(r => `${r.employeeName} ${r.leaveType} ${r.status} ${r.reason}`.toLowerCase().includes(q)));
  }, [search, requests]);

  const openCreate = () => {
    setForm({
      employeeId: employees[0]?.id || '',
      leaveType: 'Annual',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
    });
    setModal('create');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) {
      toast.error(lang === 'ar' ? 'يرجى اختيار الموظف' : 'Please select an employee');
      return;
    }
    setSaving(true);
    try {
      await leaveRequestsApi.create({
        employeeId: form.employeeId,
        leaveType: form.leaveType,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        reason: form.reason || undefined,
      });
      toast.success(lang === 'ar' ? 'تم تقديم طلب الإجازة بنجاح!' : 'Leave request submitted!');
      setModal(null);
      loadData();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await leaveRequestsApi.approve(id);
      toast.success(lang === 'ar' ? 'تمت الموافقة على الطلب!' : 'Leave request approved!');
      loadData();
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await leaveRequestsApi.reject(id);
      toast.success(lang === 'ar' ? 'تم رفض طلب الإجازة' : 'Leave request rejected');
      loadData();
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await leaveRequestsApi.cancel(id);
      toast.success(lang === 'ar' ? 'تم إلغاء طلب الإجازة' : 'Leave request cancelled');
      loadData();
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>{t.leaveRequests}</h1>
          <p>{lang === 'ar' ? 'إدارة ومتابعة طلبات الإجازات والموافقات' : 'Manage and approve employee leave requests'}</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm btn-icon" onClick={loadData} title={t.refresh}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> {lang === 'ar' ? 'طلب إجازة جديد' : 'New Leave Request'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`btn ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('all')}
        >
          <Filter size={15} />
          {lang === 'ar' ? 'طلبات جميع الموظفين' : 'All Company Requests'}
        </button>
        <button
          className={`btn ${tab === 'my' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('my')}
        >
          <User size={15} />
          {lang === 'ar' ? 'طلباتي الشخصية' : 'My Requests'}
        </button>
      </div>

      {/* Table Card */}
      <div className="card">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder={`${t.search} ${t.leaveRequests}...`} value={search} onChange={e => setSearch(e.target.value)} />
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
              <div className="empty-state-icon"><Calendar size={28} /></div>
              <h3>{t.noData}</h3>
              <p>{tab === 'my' ? (lang === 'ar' ? 'لم تقم بتقديم أي طلبات إجازة حتى الآن.' : 'You have not submitted any leave requests yet.') : t.noData}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {tab === 'all' && <th>{lang === 'ar' ? 'الموظف' : 'Employee'}</th>}
                  <th>{t.leaveType}</th>
                  <th>{t.startDate}</th>
                  <th>{t.endDate}</th>
                  <th>{lang === 'ar' ? 'مدة الإجازة' : 'Duration'}</th>
                  <th>{t.reason}</th>
                  <th>{t.status}</th>
                  <th style={{ textAlign: 'end' }}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => {
                  const days = req.startDate && req.endDate
                    ? Math.max(1, Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / 86400000) + 1)
                    : '-';
                  const st = statusMap[req.status] || { cls: 'badge-default', label: req.status };

                  return (
                    <tr key={req.id}>
                      {tab === 'all' && <td className="td-main">{req.employeeName || '-'}</td>}
                      <td>
                        <span className="badge badge-info">
                          {leaveTypes.find(l => l.value === req.leaveType)?.label || req.leaveType}
                        </span>
                      </td>
                      <td>{req.startDate ? new Date(req.startDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB') : '-'}</td>
                      <td>{req.endDate ? new Date(req.endDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB') : '-'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {days} {lang === 'ar' ? 'أيام' : 'days'}
                      </td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.reason || '-'}
                      </td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {req.status === 'Pending' && (
                            <>
                              {tab === 'all' && (
                                <>
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleApprove(req.id)}
                                    title={t.approve}
                                  >
                                    <CheckCircle size={13} /> {t.approve}
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm btn-icon"
                                    onClick={() => handleReject(req.id)}
                                    title={t.reject}
                                  >
                                    <XCircle size={14} />
                                  </button>
                                </>
                              )}
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleCancel(req.id)}
                                title={lang === 'ar' ? 'إلغاء الطلب' : 'Cancel Request'}
                              >
                                <Ban size={13} /> {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Leave Request Modal */}
      {modal === 'create' && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="modal-title">{lang === 'ar' ? 'تقديم طلب إجازة جديد' : 'New Leave Request'}</div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Employee select */}
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الموظف' : 'Employee'} <span style={{ color: 'var(--error)' }}>*</span></label>
                  <select
                    className="form-select"
                    value={form.employeeId}
                    onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                    required
                  >
                    <option value="">{lang === 'ar' ? '— اختر الموظف —' : '— Select Employee —'}</option>
                    {employees.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeCode})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.leaveType} <span style={{ color: 'var(--error)' }}>*</span></label>
                  <select
                    className="form-select"
                    value={form.leaveType}
                    onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
                    required
                  >
                    {leaveTypes.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{t.startDate} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      className="form-input"
                      type="date"
                      value={form.startDate}
                      onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.endDate} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      className="form-input"
                      type="date"
                      value={form.endDate}
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {t.reason} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({lang === 'ar' ? 'اختياري' : 'optional'})</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    value={form.reason}
                    onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                    placeholder={lang === 'ar' ? 'أسباب طلب الإجازة...' : 'Reason for leave request...'}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : t.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
