import React, { useEffect, useState } from 'react';
import { stockApi, productsApi, warehousesApi } from '../api/endpoints';
import { BarChart3, Search, RefreshCw, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../context/I18nContext';
import { extractApiError } from '../api/client';

const MOVEMENT_TYPES = [
  { value: 'In',                 labelAr: 'وارد (إدخال)',            labelEn: 'In (Goods Receipt)' },
  { value: 'Out',                labelAr: 'صادر (إخراج)',            labelEn: 'Out (Issue)' },
  { value: 'AdjustmentIncrease',labelAr: 'تعديل زيادة',             labelEn: 'Adjustment Increase' },
  { value: 'AdjustmentDecrease',labelAr: 'تعديل نقصان',             labelEn: 'Adjustment Decrease' },
  { value: 'TransferOut',        labelAr: 'تحويل خارج',              labelEn: 'Transfer Out' },
  { value: 'TransferIn',         labelAr: 'تحويل داخل',              labelEn: 'Transfer In' },
];

export default function Stock() {
  const { t, lang } = useI18n();
  const [products,   setProducts]   = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [stockLevels, setStockLevels] = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [selectedProduct,   setSelectedProduct]   = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [modal, setModal] = useState(false);
  const [movForm, setMovForm] = useState({ productId: '', warehouseId: '', quantity: 1, movementType: 'In', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.allSettled([productsApi.getAll(), warehousesApi.getAll()]).then(([p, w]) => {
      setProducts(p.status === 'fulfilled' ? (Array.isArray(p.value.data) ? p.value.data : []) : []);
      setWarehouses(w.status === 'fulfilled' ? (Array.isArray(w.value.data) ? w.value.data : []) : []);
    });
  }, []);

  const loadStock = async () => {
    setLoading(true);
    try {
      if (selectedProduct) {
        const res = await stockApi.getByProduct(selectedProduct);
        setStockLevels(Array.isArray(res.data) ? res.data : [res.data].filter(Boolean));
      } else if (selectedWarehouse) {
        const res = await stockApi.getByWarehouse(selectedWarehouse);
        setStockLevels(Array.isArray(res.data) ? res.data : [res.data].filter(Boolean));
      } else {
        setStockLevels([]);
      }
    } catch (err) { toast.error(extractApiError(err)); }
    setLoading(false);
  };

  useEffect(() => { if (selectedProduct || selectedWarehouse) loadStock(); }, [selectedProduct, selectedWarehouse]);

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await stockApi.recordMovement(movForm);
      toast.success(lang === 'ar' ? 'تم تسجيل حركة المخزون!' : 'Stock movement recorded!');
      setModal(false); loadStock();
    } catch (err) { toast.error(extractApiError(err)); }
    setSaving(false);
  };

  const movTypeLabel = (v: string) => {
    const mt = MOVEMENT_TYPES.find(m => m.value === v);
    return mt ? (lang === 'ar' ? mt.labelAr : mt.labelEn) : v;
  };

  const filtered = stockLevels.filter(s =>
    !search || `${s.productName} ${s.warehouseName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{t.stock}</h1>
          <p>{lang === 'ar' ? 'مراقبة مستويات المخزون في جميع المستودعات' : 'Monitor inventory across all warehouses'}</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm btn-icon" onClick={loadStock} title={t.refresh}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={() => {
            setMovForm({ productId: '', warehouseId: '', quantity: 1, movementType: 'In', notes: '' });
            setModal(true);
          }}>
            <Plus size={16} /> {lang === 'ar' ? 'تسجيل حركة' : 'Record Movement'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label">{lang === 'ar' ? 'تصفية بالمنتج' : 'Filter by Product'}</label>
          <select className="form-select" value={selectedProduct} onChange={e => { setSelectedProduct(e.target.value); setSelectedWarehouse(''); }}>
            <option value="">{lang === 'ar' ? 'كل المنتجات' : 'All Products'}</option>
            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{lang === 'ar' ? 'تصفية بالمخزن' : 'Filter by Warehouse'}</label>
          <select className="form-select" value={selectedWarehouse} onChange={e => { setSelectedWarehouse(e.target.value); setSelectedProduct(''); }}>
            <option value="">{lang === 'ar' ? 'كل المخازن' : 'All Warehouses'}</option>
            {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t.search}</label>
          <div className="search-bar">
            <Search size={16} color="var(--text-muted)" />
            <input placeholder={lang === 'ar' ? 'بحث في المخزون...' : 'Search stock...'} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? <div className="loading-overlay"><div className="spinner" /></div> :
            !selectedProduct && !selectedWarehouse ? (
              <div className="empty-state">
                <div className="empty-state-icon"><BarChart3 size={28} /></div>
                <h3>{lang === 'ar' ? 'اختر فلتراً' : 'Select a Filter'}</h3>
                <p>{lang === 'ar' ? 'اختر منتجاً أو مخزناً لعرض المخزون.' : 'Choose a product or warehouse to view stock levels.'}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><BarChart3 size={28} /></div>
                <h3>{t.noData}</h3>
                <p>{lang === 'ar' ? 'لا توجد بيانات مخزون للفلتر المحدد.' : 'No stock data found.'}</p>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr>
                  <th>{t.products}</th><th>{t.warehouses}</th>
                  <th>{lang === 'ar' ? 'الكمية الفعلية' : 'On Hand'}</th>
                  <th>{lang === 'ar' ? 'محجوز' : 'Reserved'}</th>
                  <th>{lang === 'ar' ? 'متاح' : 'Available'}</th>
                  <th>{t.unitOfMeasure}</th>
                </tr></thead>
                <tbody>
                  {filtered.map((s, idx) => {
                    const avail = (s.quantityOnHand || 0) - (s.quantityReserved || 0);
                    return (
                      <tr key={idx}>
                        <td className="td-main">{s.productName || '-'}</td>
                        <td>{s.warehouseName || '-'}</td>
                        <td style={{ fontWeight: 700, color: (s.quantityOnHand || 0) < 10 ? 'var(--error)' : 'var(--text-primary)' }}>
                          {s.quantityOnHand || 0}
                          {(s.quantityOnHand || 0) < 10 && <span style={{ marginInlineStart: 6, fontSize: 10, color: 'var(--error)' }}>{lang === 'ar' ? 'منخفض' : 'LOW'}</span>}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{s.quantityReserved || 0}</td>
                        <td style={{ color: avail < 5 ? 'var(--warning)' : 'var(--accent-emerald)', fontWeight: 600 }}>{avail}</td>
                        <td>{s.unit || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
        </div>
      </div>

      {/* Movement Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{lang === 'ar' ? 'تسجيل حركة مخزون' : 'Record Stock Movement'}</div>
              <button className="icon-btn" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleMovement}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">{t.products} <span style={{ color: 'var(--error)' }}>*</span></label>
                  <select className="form-select" value={movForm.productId}
                    onChange={e => setMovForm(f => ({ ...f, productId: e.target.value }))} required>
                    <option value="">{lang === 'ar' ? '— اختر المنتج —' : '— Select Product —'}</option>
                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.warehouses} <span style={{ color: 'var(--error)' }}>*</span></label>
                  <select className="form-select" value={movForm.warehouseId}
                    onChange={e => setMovForm(f => ({ ...f, warehouseId: e.target.value }))} required>
                    <option value="">{lang === 'ar' ? '— اختر المخزن —' : '— Select Warehouse —'}</option>
                    {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'نوع الحركة' : 'Movement Type'} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <select className="form-select" value={movForm.movementType}
                      onChange={e => setMovForm(f => ({ ...f, movementType: e.target.value }))}>
                      {MOVEMENT_TYPES.map(mt => (
                        <option key={mt.value} value={mt.value}>
                          {lang === 'ar' ? mt.labelAr : mt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.quantity} <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input className="form-input" type="number" min="1" value={movForm.quantity}
                      onChange={e => setMovForm(f => ({ ...f, quantity: Number(e.target.value) }))} required />
                  </div>
                </div>

                {/* Movement type hint */}
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>💡</span>
                  <span>{movTypeLabel(movForm.movementType)}: {lang === 'ar'
                    ? MOVEMENT_TYPES.find(m => m.value === movForm.movementType)?.labelAr
                    : MOVEMENT_TYPES.find(m => m.value === movForm.movementType)?.labelEn
                  }</span>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.notes} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{lang === 'ar' ? '(اختياري)' : '(optional)'}</span></label>
                  <textarea className="form-textarea" placeholder={lang === 'ar' ? 'ملاحظات الحركة...' : 'Movement notes...'}
                    value={movForm.notes} onChange={e => setMovForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : (lang === 'ar' ? 'تسجيل' : 'Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
