import React, { useEffect, useState, useCallback } from 'react';
import { attendanceApi, employeesApi } from '../api/endpoints';
import { extractApiError } from '../api/client';
import { useI18n } from '../context/I18nContext';
import { Calendar, LogIn, LogOut, RefreshCw, Search, Clock, User, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Attendance() {
  const { t, lang } = useI18n();

  const [tab, setTab] = useState<'all' | 'my'>('all');
  const [records, setRecords] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'all') {
        const [attRes, empRes] = await Promise.allSettled([
          attendanceApi.getAll(selectedEmployeeId || undefined),
          employeesApi.getAll(),
        ]);
        if (attRes.status === 'fulfilled') {
          const arr = Array.isArray(attRes.value.data) ? attRes.value.data : [];
          setRecords(arr);
          setFiltered(arr);
        }
        if (empRes.status === 'fulfilled') {
          setEmployees(Array.isArray(empRes.value.data) ? empRes.value.data : []);
        }
      } else {
        const myRes = await attendanceApi.getMyHistory();
        const arr = Array.isArray(myRes.data) ? myRes.data : [];
        setRecords(arr);
        setFiltered(arr);
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [tab, selectedEmployeeId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(records); return; }
    const q = search.toLowerCase();
    setFiltered(records.filter(r => `${r.employeeName} ${r.status} ${r.notes}`.toLowerCase().includes(q)));
  }, [search, records]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceApi.checkIn();
      toast.success(lang === 'ar' ? 'تم تسجيل الحضور بنجاح!' : 'Checked in successfully!');
      loadData();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceApi.checkOut();
      toast.success(lang === 'ar' ? 'تم تسجيل الانصراف بنجاح!' : 'Checked out successfully!');
      loadData();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      Present: { cls: 'badge-success', label: t.present },
      Absent:  { cls: 'badge-error',   label: t.absent },
      Late:    { cls: 'badge-warning', label: t.late },
      HalfDay: { cls: 'badge-info',    label: lang === 'ar' ? 'نصف يوم' : 'Half Day' },
    };
    const b = map[s] || { cls: 'badge-default', label: s };
    return <span className={`badge ${b.cls}`}>{b.label}</span>;
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-';
    try {
      return new Date(timeStr).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header with Quick Self Check-In / Check-Out */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>{t.attendance}</h1>
          <p>{lang === 'ar' ? 'متابعة سجلات الحضور والانصراف وتسجيل الدخول اليومي' : 'Track daily employee attendance and self check-in/out'}</p>
        </div>
        <div className="page-header-actions" style={{ gap: 10 }}>
          <button className="btn btn-success" onClick={handleCheckIn} disabled={actionLoading}>
            <LogIn size={16} />
            {actionLoading ? '...' : (lang === 'ar' ? 'تسجيل حضور' : 'Check In')}
          </button>
          <button className="btn btn-danger" onClick={handleCheckOut} disabled={actionLoading}>
            <LogOut size={16} />
            {actionLoading ? '...' : (lang === 'ar' ? 'تسجيل انصراف' : 'Check Out')}
          </button>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={loadData} title={t.refresh}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`btn ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setTab('all'); setSelectedEmployeeId(''); }}
        >
          <Filter size={15} />
          {lang === 'ar' ? 'جميع الموظفين' : 'All Employees'}
        </button>
        <button
          className={`btn ${tab === 'my' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('my')}
        >
          <Clock size={15} />
          {lang === 'ar' ? 'سجلي الشخصي' : 'My Attendance History'}
        </button>
      </div>

      {/* Table Card */}
      <div className="card">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder={`${t.search} ${t.attendance}...`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Employee Filter dropdown when in 'all' tab */}
          {tab === 'all' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{lang === 'ar' ? 'الموظف:' : 'Employee:'}</label>
              <select
                className="form-select"
                style={{ minWidth: 180, padding: '6px 10px', fontSize: 13 }}
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">{lang === 'ar' ? '— كل الموظفين —' : '— All Employees —'}</option>
                {employees.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>
                ))}
              </select>
            </div>
          )}

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
              <p>{tab === 'my' ? (lang === 'ar' ? 'لا يوجد سجل حضور خاص بك حتى الآن.' : 'No personal attendance records yet.') : t.noData}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {tab === 'all' && <th>{lang === 'ar' ? 'الموظف' : 'Employee'}</th>}
                  <th>{t.date}</th>
                  <th>{lang === 'ar' ? 'وقت الحضور' : 'Check In'}</th>
                  <th>{lang === 'ar' ? 'وقت الانصراف' : 'Check Out'}</th>
                  <th>{t.status}</th>
                  <th>{t.notes}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={row.id || idx}>
                    {tab === 'all' && <td className="td-main">{row.employeeName || '-'}</td>}
                    <td>{formatDate(row.date)}</td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{formatTime(row.checkInTime)}</td>
                    <td style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{formatTime(row.checkOutTime)}</td>
                    <td>{statusBadge(row.status || 'Present')}</td>
                    <td>{row.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
