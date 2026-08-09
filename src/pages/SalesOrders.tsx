import React, { useEffect, useState, useCallback } from 'react';
import { salesOrdersApi, customersApi, warehousesApi, productsApi } from '../api/endpoints';
import {
  Plus, Search, X, RefreshCw, Eye, CheckCircle, Truck,
  XCircle, Send, ShoppingCart, Trash2, Clock, CheckCheck, Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../context/I18nContext';
import { extractApiError } from '../api/client';

const emptyLine = () => ({ productId: '', quantity: 1, unitPrice: 0 });

// ─── Full status enum ──────────────────────────────────────────────────────
// Draft → Submitted → Approved → PartiallyShipped → Shipped | Cancelled
const SO_STATUSES = ['Draft', 'Submitted', 'Approved', 'PartiallyShipped', 'Shipped', 'Cancelled'] as const;
type SOStatus = typeof SO_STATUSES[number];

function useStatusConfig(lang: string) {
  return (s: string): { cls: string; label: string; icon: React.ReactNode } => {
    const map: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
      Draft:            { cls: 'badge-default', label: lang === 'ar' ? 'مسودة'           : 'Draft',             icon: <Clock size={12} /> },
      Submitted:        { cls: 'badge-info',    label: lang === 'ar' ? 'مقدّم'           : 'Submitted',         icon: <Send size={12} /> },
      Approved:         { cls: 'badge-success', label: lang === 'ar' ? 'معتمد'           : 'Approved',          icon: <CheckCircle size={12} /> },
      PartiallyShipped: { cls: 'badge-warning', label: lang === 'ar' ? 'شحن جزئي'        : 'Partially Shipped',  icon: <Truck size={12} /> },
      Shipped:          { cls: 'badge-purple',  label: lang === 'ar' ? 'مشحون بالكامل'  : 'Shipped',           icon: <CheckCheck size={12} /> },
      Cancelled:        { cls: 'badge-error',   label: lang === 'ar' ? 'ملغي'            : 'Cancelled',         icon: <XCircle size={12} /> },
    };
    return map[s] || { cls: 'badge-default', label: s, icon: null };
  };
}

// ─── Status Timeline Component ─────────────────────────────────────────────
function StatusTimeline({ order, lang }: { order: any; lang: string }) {
  const getStatus = useStatusConfig(lang);
  const flow = ['Draft', 'Submitted', 'Approved', 'PartiallyShipped', 'Shipped'];
  const currentIdx = flow.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

  const dateFields: Record<string, string | undefined> = {
    Draft:            order.createdAt,
    Submitted:        order.submittedAt,
    Approved:         order.approvedAt,
    PartiallyShipped: order.shippedAt,
    Shipped:          order.shippedAt,
  };

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>
        {lang === 'ar' ? 'تتبع حالة الأمر' : 'Order Status Tracking'}
      </div>
      {isCancelled ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(244,63,94,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <XCircle size={18} color="var(--error)" />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--error)', fontSize: 14 }}>{lang === 'ar' ? 'الأمر ملغي' : 'Order Cancelled'}</div>
            {order.cancelledAt && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(order.cancelledAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</div>}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {flow.map((step, idx) => {
            const isDone = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            const isLast = idx === flow.length - 1;
            const sc = getStatus(step);
            const dt = dateFields[step];
            return (
              <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                {/* Dot + Line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone ? 'var(--brand-primary)' : 'var(--bg-elevated)',
                    border: `2px solid ${isDone ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                    transition: 'all 0.2s',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(124,58,237,0.15)' : 'none',
                  }}>
                    {isDone && <CheckCheck size={11} color="white" />}
                  </div>
                  {!isLast && <div style={{ width: 2, flex: 1, minHeight: 20, background: isDone && currentIdx > idx ? 'var(--brand-primary)' : 'var(--border-subtle)', margin: '2px 0' }} />}
                </div>
                {/* Content */}
                <div style={{ paddingBottom: isLast ? 0 : 16, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: isCurrent ? 700 : 500, fontSize: 13.5, color: isDone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {sc.label}
                        {isCurrent && <span className={`badge ${sc.cls}`} style={{ marginInlineStart: 8, fontSize: 10 }}>{lang === 'ar' ? 'الحالة الحالية' : 'Current'}</span>}
                      </div>
                    </div>
                    {isDone && dt && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(dt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SalesOrders() {
  const { t, lang } = useI18n();
  const getStatus = useStatusConfig(lang);

  const [orders, setOrders]       = useState<any[]>([]);
  const [filtered, setFiltered]   = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState<'create' | 'view' | 'ship' | null>(null);
  const [selected, setSelected]   = useState<any>(null);
  const [saving, setSaving]       = useState(false);

  const [form, setForm] = useState({
    customerId: '', warehouseId: '',
    orderDate: new Date().toISOString().slice(0, 10),
    notes: '', lines: [emptyLine()],
  });
  const [shipLines, setShipLines] = useState<{ lineId: string; quantityShipped: number }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, cRes, wRes, pRes] = await Promise.allSettled([
        salesOrdersApi.getAll(), customersApi.getAll(), warehousesApi.getAll(), productsApi.getAll(),
      ]);
      setOrders(oRes.status === 'fulfilled' ? (Array.isArray(oRes.value.data) ? oRes.value.data : []) : []);
      setCustomers(cRes.status === 'fulfilled' ? (Array.isArray(cRes.value.data) ? cRes.value.data : []) : []);
      setWarehouses(wRes.status === 'fulfilled' ? (Array.isArray(wRes.value.data) ? wRes.value.data : []) : []);
      setProducts(pRes.status === 'fulfilled' ? (Array.isArray(pRes.value.data) ? pRes.value.data : []) : []);
    } catch { toast.error(t.loadFailed); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!search.trim()) { setFiltered(orders); return; }
    const q = search.toLowerCase();
    setFiltered(orders.filter(o => `${o.orderNumber} ${o.customerName} ${o.status}`.toLowerCase().includes(q)));
  }, [search, orders]);

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }));
  const removeLine = (i: number) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  const updateLine = (i: number, key: string, val: any) =>
    setForm(f => ({ ...f, lines: f.lines.map((l, idx) => idx === i ? { ...l, [key]: val } : l) }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.lines.some(l => !l.productId)) {
      toast.error(lang === 'ar' ? 'يرجى اختيار منتج لكل بند' : 'Select a product for each line'); return;
    }
    setSaving(true);
    try {
      await salesOrdersApi.create({
        customerId: form.customerId, warehouseId: form.warehouseId,
        orderDate: new Date(form.orderDate).toISOString(),
        notes: form.notes || undefined,
        lines: form.lines.map(l => ({ productId: l.productId, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice) })),
      });
      toast.success(lang === 'ar' ? 'تم إنشاء أمر البيع!' : 'Sales order created!');
      setModal(null); load();
    } catch (err) { toast.error(extractApiError(err)); }
    setSaving(false);
  };

  const handleAction = async (action: 'submit' | 'approve' | 'cancel', id: string) => {
    try {
      if (action === 'submit') await salesOrdersApi.submit(id);
      else if (action === 'approve') await salesOrdersApi.approve(id);
      else await salesOrdersApi.cancel(id);
      const labels: Record<string, string> = {
        submit:  lang === 'ar' ? 'تم تقديم الأمر!'  : 'Order submitted!',
        approve: lang === 'ar' ? 'تم اعتماد الأمر!' : 'Order approved!',
        cancel:  lang === 'ar' ? 'تم إلغاء الأمر!'  : 'Order cancelled!',
      };
      toast.success(labels[action]); load();
    } catch (err) { toast.error(extractApiError(err)); }
  };

  const openShip = (order: any) => {
    setSelected(order);
    setShipLines((order.lines || []).map((l: any) => ({
      lineId: l.id,
      quantityShipped: Math.max(0, l.quantity - (l.shippedQuantity || 0)),
    })));
    setModal('ship');
  };

  const handleShip = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await salesOrdersApi.ship(selected.id, { lines: shipLines });
      toast.success(lang === 'ar' ? 'تم شحن الأمر!' : 'Order shipped!');
      setModal(null); load();
    } catch (err) { toast.error(extractApiError(err)); }
    setSaving(false);
  };

  const productName = (id: string) => products.find(p => p.id === id)?.name || id;
  const totalAmount = form.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  // Show ship for Approved OR PartiallyShipped
  const canShip = (s: string) => s === 'Approved' || s === 'PartiallyShipped';
  const canSubmit = (s: string) => s === 'Draft';
  const canApprove = (s: string) => s === 'Submitted';
  const canCancel = (s: string) => s === 'Draft' || s === 'Submitted';

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{t.salesOrders}</h1>
          <p>{lang === 'ar' ? 'إدارة أوامر البيع من الإنشاء حتى الشحن' : 'Manage sales orders from creation to shipment'}</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm btn-icon" onClick={load} title={t.refresh}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={() => {
            setForm({ customerId: '', warehouseId: '', orderDate: new Date().toISOString().slice(0, 10), notes: '', lines: [emptyLine()] });
            setModal('create');
          }}><Plus size={16} /> {t.newOrder}</button>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder={`${t.search} ${t.salesOrders}...`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{filtered.length} {t.records}</div>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="loading-overlay"><div className="spinner" /></div> :
            filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><ShoppingCart size={28} /></div>
                <h3>{t.noData}</h3><p>{t.getStarted} {t.salesOrders}</p>
                <button className="btn btn-primary" onClick={() => setModal('create')}><Plus size={16} /> {t.newOrder}</button>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr>
                  <th>{t.orderNumber}</th><th>{t.customer}</th><th>{t.warehouse}</th>
                  <th>{t.orderDate}</th><th>{t.totalAmount}</th><th>{t.status}</th>
                  <th style={{ textAlign: 'end' }}>{t.actions}</th>
                </tr></thead>
                <tbody>
                  {filtered.map(o => {
                    const s = getStatus(o.status);
                    return (
                      <tr key={o.id}>
                        <td className="td-main">#{o.orderNumber || o.id?.slice(0, 8)}</td>
                        <td>{o.customerName || '-'}</td>
                        <td>{o.warehouseName || '-'}</td>
                        <td>{o.orderDate ? new Date(o.orderDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB') : '-'}</td>
                        <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{t.egp} {(o.totalAmount || 0).toLocaleString()}</td>
                        <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm btn-icon" title={t.view} onClick={() => { setSelected(o); setModal('view'); }}><Eye size={14} /></button>
                            {canSubmit(o.status) && <button className="btn btn-secondary btn-sm" onClick={() => handleAction('submit', o.id)}><Send size={12} /> {lang === 'ar' ? 'تقديم' : 'Submit'}</button>}
                            {canApprove(o.status) && <button className="btn btn-success btn-sm" onClick={() => handleAction('approve', o.id)}><CheckCircle size={12} /> {lang === 'ar' ? 'اعتماد' : 'Approve'}</button>}
                            {canShip(o.status) && <button className="btn btn-primary btn-sm" onClick={() => openShip(o)}><Truck size={12} /> {t.ship}</button>}
                            {canCancel(o.status) && <button className="btn btn-danger btn-sm btn-icon" title={lang === 'ar' ? 'إلغاء' : 'Cancel'} onClick={() => handleAction('cancel', o.id)}><XCircle size={14} /></button>}
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

      {/* ── Create Modal ── */}
      {modal === 'create' && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-xl">
            <div className="modal-header">
              <div className="modal-title">{t.newOrder}</div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{t.customer} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <select className="form-select" value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} required>
                      <option value="">{lang === 'ar' ? '— اختر العميل —' : '— Select Customer —'}</option>
                      {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.warehouse} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <select className="form-select" value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))} required>
                      <option value="">{lang === 'ar' ? '— اختر المخزن —' : '— Select Warehouse —'}</option>
                      {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{t.orderDate} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input className="form-input" type="date" value={form.orderDate} onChange={e => setForm(f => ({ ...f, orderDate: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.notes} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{lang === 'ar' ? '(اختياري)' : '(optional)'}</span></label>
                    <input className="form-input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder={lang === 'ar' ? 'ملاحظات...' : 'Notes...'} />
                  </div>
                </div>
                {/* Line items */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label className="form-label" style={{ margin: 0 }}>{t.orderItems} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addLine}><Plus size={14} /> {lang === 'ar' ? 'إضافة بند' : 'Add Line'}</button>
                  </div>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: 'var(--bg-elevated)' }}>
                        {[t.products, t.quantity, t.unitPrice, t.total, ''].map((h, i) => (
                          <th key={i} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'start' }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {form.lines.map((line, idx) => (
                          <tr key={idx} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '8px 10px' }}>
                              <select className="form-select" value={line.productId} onChange={e => updateLine(idx, 'productId', e.target.value)} required style={{ minWidth: 200 }}>
                                <option value="">{lang === 'ar' ? '— اختر المنتج —' : '— Select Product —'}</option>
                                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                              </select>
                            </td>
                            <td style={{ padding: '8px 10px' }}><input className="form-input" type="number" min="1" value={line.quantity} onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} style={{ width: 80 }} /></td>
                            <td style={{ padding: '8px 10px' }}><input className="form-input" type="number" min="0" step="0.01" value={line.unitPrice} onChange={e => updateLine(idx, 'unitPrice', Number(e.target.value))} style={{ width: 100 }} /></td>
                            <td style={{ padding: '8px 10px', color: 'var(--accent-emerald)', fontWeight: 600, whiteSpace: 'nowrap' }}>{t.egp} {(line.quantity * line.unitPrice).toFixed(2)}</td>
                            <td style={{ padding: '8px 10px' }}>{form.lines.length > 1 && <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => removeLine(idx)}><Trash2 size={14} /></button>}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot><tr style={{ borderTop: '2px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
                        <td colSpan={3} style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'end', color: 'var(--text-secondary)' }}>{t.total}:</td>
                        <td style={{ padding: '10px 12px', color: 'var(--accent-emerald)', fontWeight: 800, fontSize: 16 }}>{t.egp} {totalAmount.toFixed(2)}</td>
                        <td />
                      </tr></tfoot>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> {t.save}...</> : t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Modal with Status Timeline ── */}
      {modal === 'view' && selected && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-xl">
            <div className="modal-header">
              <div>
                <div className="modal-title">#{selected.orderNumber || selected.id?.slice(0, 8)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{selected.customerName}</div>
              </div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
              {/* Left: order info + lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    [t.customer, selected.customerName],
                    [t.warehouse, selected.warehouseName],
                    [t.orderDate, selected.orderDate ? new Date(selected.orderDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB') : '-'],
                    [t.totalAmount, `${t.egp} ${(selected.totalAmount || 0).toLocaleString()}`],
                  ].map(([lbl, val]) => (
                    <div key={lbl as string} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{lbl}</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{val || '-'}</div>
                    </div>
                  ))}
                </div>
                {selected.notes && (
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>{t.notes}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.notes}</div>
                  </div>
                )}
                {(selected.lines || []).length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{t.orderItems}</div>
                    <table className="data-table" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                      <thead><tr>
                        <th>{t.products}</th><th>{t.quantity}</th>
                        <th>{lang === 'ar' ? 'مشحون' : 'Shipped'}</th>
                        <th>{lang === 'ar' ? 'متبقي' : 'Remaining'}</th>
                        <th>{t.unitPrice}</th><th>{t.total}</th>
                      </tr></thead>
                      <tbody>
                        {selected.lines.map((l: any, i: number) => {
                          const shipped = l.shippedQuantity || 0;
                          const remaining = l.quantity - shipped;
                          return (
                            <tr key={i}>
                              <td>{l.productName || productName(l.productId)}</td>
                              <td>{l.quantity}</td>
                              <td style={{ color: shipped > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>{shipped}</td>
                              <td style={{ color: remaining > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>{remaining}</td>
                              <td>{t.egp} {(l.unitPrice || 0).toLocaleString()}</td>
                              <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{t.egp} {((l.quantity || 0) * (l.unitPrice || 0)).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {/* Right: Status Timeline */}
              <div style={{ borderInlineStart: '1px solid var(--border-subtle)', paddingInlineStart: 20 }}>
                <StatusTimeline order={selected} lang={lang} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>{t.close}</button>
              {canShip(selected.status) && (
                <button className="btn btn-primary" onClick={() => { setModal(null); setTimeout(() => openShip(selected), 50); }}>
                  <Truck size={14} /> {t.ship}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Ship Modal ── */}
      {modal === 'ship' && selected && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title"><Truck size={16} /> {t.ship} — #{selected.orderNumber}</div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleShip}>
              <div className="modal-body">
                {selected.status === 'PartiallyShipped' && (
                  <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--accent-amber)' }}>
                    ⚠️ {lang === 'ar' ? 'هذا الأمر مشحون جزئياً — أدخل الكميات المتبقية' : 'This order is partially shipped — enter remaining quantities'}
                  </div>
                )}
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 14 }}>
                  {lang === 'ar' ? 'أدخل الكمية المشحونة لكل بند:' : 'Enter the quantity to ship for each line:'}
                </p>
                <table className="data-table" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <thead><tr>
                    <th>{t.products}</th>
                    <th>{lang === 'ar' ? 'الكمية الكلية' : 'Total Qty'}</th>
                    <th>{lang === 'ar' ? 'مشحون مسبقاً' : 'Already Shipped'}</th>
                    <th>{lang === 'ar' ? 'الكمية المشحونة الآن' : 'Ship Now'} *</th>
                  </tr></thead>
                  <tbody>
                    {(selected.lines || []).map((l: any, i: number) => (
                      <tr key={l.id}>
                        <td>{l.productName || productName(l.productId)}</td>
                        <td>{l.quantity}</td>
                        <td style={{ color: 'var(--accent-emerald)' }}>{l.shippedQuantity || 0}</td>
                        <td>
                          <input className="form-input" type="number" min="0" max={l.quantity - (l.shippedQuantity || 0)}
                            value={shipLines[i]?.quantityShipped ?? 0}
                            onChange={e => setShipLines(s => s.map((sl, si) => si === i ? { ...sl, quantityShipped: Number(e.target.value) } : sl))}
                            style={{ width: 90 }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}><Truck size={14} /> {saving ? '...' : t.ship}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
