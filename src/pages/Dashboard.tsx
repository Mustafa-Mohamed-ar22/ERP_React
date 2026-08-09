import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ShoppingCart, Package, Users, Truck, TrendingUp, TrendingDown,
  DollarSign, AlertTriangle, CheckCircle, Clock, ArrowUpRight
} from 'lucide-react';
import { salesOrdersApi, purchaseOrdersApi, customersApi, productsApi, suppliersApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'];

const salesData = [
  { month: 'Jan', sales: 42000, purchases: 28000 },
  { month: 'Feb', sales: 58000, purchases: 34000 },
  { month: 'Mar', sales: 49000, purchases: 31000 },
  { month: 'Apr', sales: 71000, purchases: 42000 },
  { month: 'May', sales: 63000, purchases: 38000 },
  { month: 'Jun', sales: 85000, purchases: 51000 },
  { month: 'Jul', sales: 92000, purchases: 55000 },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft: 'badge-default', Submitted: 'badge-info', Approved: 'badge-success',
    Shipped: 'badge-purple', Cancelled: 'badge-error', Received: 'badge-success',
    Pending: 'badge-warning',
  };
  return <span className={`badge ${map[status] || 'badge-default'}`}>{status}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    customers: [] as any[], products: [] as any[],
    salesOrders: [] as any[], purchaseOrders: [] as any[], suppliers: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      customersApi.getAll(), productsApi.getAll(),
      salesOrdersApi.getAll(), purchaseOrdersApi.getAll(), suppliersApi.getAll()
    ]).then(([customers, products, salesOrders, purchaseOrders, suppliers]) => {
      setData({
        customers: customers.status === 'fulfilled' ? customers.value.data : [],
        products: products.status === 'fulfilled' ? products.value.data : [],
        salesOrders: salesOrders.status === 'fulfilled' ? salesOrders.value.data : [],
        purchaseOrders: purchaseOrders.status === 'fulfilled' ? purchaseOrders.value.data : [],
        suppliers: suppliers.status === 'fulfilled' ? suppliers.value.data : [],
      });
      setLoading(false);
    });
  }, []);

  const pendingSales = data.salesOrders.filter(o => o.status === 'Submitted' || o.status === 'Approved').length;
  const pendingPO = data.purchaseOrders.filter(o => o.status === 'Submitted' || o.status === 'Approved').length;

  const orderStatusData = [
    { name: 'Approved', value: data.salesOrders.filter(o => o.status === 'Approved').length || 4 },
    { name: 'Submitted', value: data.salesOrders.filter(o => o.status === 'Submitted').length || 2 },
    { name: 'Shipped', value: data.salesOrders.filter(o => o.status === 'Shipped').length || 6 },
    { name: 'Draft', value: data.salesOrders.filter(o => o.status === 'Draft').length || 1 },
    { name: 'Cancelled', value: data.salesOrders.filter(o => o.status === 'Cancelled').length || 0 },
  ].filter(d => d.value > 0);

  const stats = [
    {
      icon: Users, label: 'Total Customers', value: data.customers.length,
      change: '+12%', up: true, color: 'var(--brand-primary)', bg: 'rgba(99,102,241,0.12)'
    },
    {
      icon: Package, label: 'Total Products', value: data.products.length,
      change: '+5%', up: true, color: 'var(--accent-cyan)', bg: 'rgba(6,182,212,0.12)'
    },
    {
      icon: ShoppingCart, label: 'Sales Orders', value: data.salesOrders.length,
      change: '+18%', up: true, color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.12)'
    },
    {
      icon: Truck, label: 'Purchase Orders', value: data.purchaseOrders.length,
      change: '-3%', up: false, color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.12)'
    },
  ];

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner" style={{ width: 48, height: 48 }} />
    </div>
  );

  return (
    <div className="animate-fadeIn">
      {/* Welcome */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Good morning, {user?.firstName || 'Admin'} 👋</h1>
          <p>Here's what's happening across your business today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ '--stat-color': s.color, '--stat-bg': s.bg } as any}>
            <div className="flex justify-between items-center">
              <div className="stat-icon">
                <s.icon size={22} />
              </div>
              <div className={`stat-change ${s.up ? 'up' : 'down'}`}>
                {s.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {s.change}
              </div>
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Row */}
      {(pendingSales > 0 || pendingPO > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {pendingSales > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <AlertTriangle size={20} color="var(--accent-amber)" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--accent-amber)', fontSize: 14 }}>{pendingSales} Sales Orders Pending</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Awaiting approval or shipment</div>
              </div>
            </div>
          )}
          {pendingPO > 0 && (
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <Clock size={20} color="var(--brand-primary)" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: 14 }}>{pendingPO} Purchase Orders Pending</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Awaiting approval or receipt</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Area Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Overview</div>
              <div className="card-subtitle">Sales vs Purchases (last 7 months)</div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPurch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)' }}
                  formatter={(v: any) => [`$${v.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" fill="url(#gradSales)" strokeWidth={2} name="Sales" />
                <Area type="monotone" dataKey="purchases" stroke="#10b981" fill="url(#gradPurch)" strokeWidth={2} name="Purchases" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Order Status</div>
              <div className="card-subtitle">Sales orders breakdown</div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={orderStatusData.length ? orderStatusData : [{name:'No data', value:1}]} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {(orderStatusData.length ? orderStatusData : [{name:'No data', value:1}]).map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Sales Orders */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Sales Orders</div>
            <div className="card-subtitle">Latest {Math.min(data.salesOrders.length, 8)} orders</div>
          </div>
          <a href="/sales-orders" style={{ color: 'var(--brand-primary-light)', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="table-wrapper">
          {data.salesOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><ShoppingCart size={28} /></div>
              <h3>No Sales Orders</h3>
              <p>Sales orders will appear here once created.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.salesOrders.slice(0, 8).map((order: any) => (
                  <tr key={order.id}>
                    <td className="td-main">#{order.orderNumber || order.id?.slice(0, 8)}</td>
                    <td>{order.customerName || order.customerId?.slice(0, 8) || '-'}</td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      ${(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}</td>
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
