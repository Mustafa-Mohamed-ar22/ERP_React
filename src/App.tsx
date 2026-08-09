import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './context/I18nContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// ── Auth pages ────────────────────────────────────────────────────────────────
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// ── App pages ─────────────────────────────────────────────────────────────────
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Warehouses from './pages/Warehouses';
import Branches from './pages/Branches';
import Departments from './pages/Departments';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import Accounts from './pages/Accounts';
import JournalEntries from './pages/JournalEntries';
import SalesOrders from './pages/SalesOrders';
import PurchaseOrders from './pages/PurchaseOrders';
import Stock from './pages/Stock';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Company from './pages/Company';
import AccountingSettings from './pages/AccountingSettings';

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster
              position="top-left"
              toastOptions={{
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                },
                success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
                error:   { iconTheme: { primary: '#f43f5e', secondary: 'white' } },
              }}
            />
            <Routes>
              {/* ── Public routes ─────────────────────────────────────────── */}
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ── All authenticated routes inside Layout ─────────────────── */}
              <Route element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard — ungated (every authenticated user) */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Unauthorized — shown by ProtectedRoute when access is denied */}
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* ── Sales ──────────────────────────────────────────────── */}
                <Route path="/customers" element={
                  <ProtectedRoute permission="sales.customers.view"><Customers /></ProtectedRoute>
                } />
                <Route path="/sales-orders" element={
                  <ProtectedRoute permission="sales.orders.view"><SalesOrders /></ProtectedRoute>
                } />

                {/* ── Purchasing ─────────────────────────────────────────── */}
                <Route path="/suppliers" element={
                  <ProtectedRoute permission="purchasing.suppliers.view"><Suppliers /></ProtectedRoute>
                } />
                <Route path="/purchase-orders" element={
                  <ProtectedRoute permission="purchasing.orders.view"><PurchaseOrders /></ProtectedRoute>
                } />

                {/* ── Inventory ──────────────────────────────────────────── */}
                <Route path="/products" element={
                  <ProtectedRoute permission="inventory.products.view"><Products /></ProtectedRoute>
                } />
                <Route path="/categories" element={
                  <ProtectedRoute permission="inventory.categories.manage"><Categories /></ProtectedRoute>
                } />
                <Route path="/warehouses" element={
                  <ProtectedRoute permission="inventory.warehouses.view"><Warehouses /></ProtectedRoute>
                } />
                <Route path="/stock" element={
                  <ProtectedRoute permission="inventory.stock.view"><Stock /></ProtectedRoute>
                } />

                {/* ── HR — gated ─────────────────────────────────────────── */}
                <Route path="/employees" element={
                  <ProtectedRoute permission="hr.employees.view"><Employees /></ProtectedRoute>
                } />
                <Route path="/departments" element={
                  <ProtectedRoute permission="core.departments.manage"><Departments /></ProtectedRoute>
                } />
                <Route path="/branches" element={
                  <ProtectedRoute permission="core.branches.manage"><Branches /></ProtectedRoute>
                } />
                <Route path="/attendance" element={
                  <ProtectedRoute permission="hr.attendance.view"><Attendance /></ProtectedRoute>
                } />
                <Route path="/leave-requests" element={
                  <ProtectedRoute permission="hr.leaves.view"><LeaveRequests /></ProtectedRoute>
                } />

                {/* ── HR — ungated self-service (any authenticated user) ──── */}
                {/* These routes intentionally have NO ProtectedRoute wrapper.  */}
                {/* Any employee with a login account can reach their own data. */}
                <Route path="/my-attendance" element={<Attendance />} />
                <Route path="/my-leaves"     element={<LeaveRequests />} />

                {/* ── Accounting ─────────────────────────────────────────── */}
                <Route path="/accounts" element={
                  <ProtectedRoute permission="accounting.accounts.view"><Accounts /></ProtectedRoute>
                } />
                <Route path="/journal-entries" element={
                  <ProtectedRoute permission="accounting.journal.view"><JournalEntries /></ProtectedRoute>
                } />
                <Route path="/accounting-settings" element={
                  <ProtectedRoute permission="accounting.settings.manage"><AccountingSettings /></ProtectedRoute>
                } />

                {/* ── Admin / Core ───────────────────────────────────────── */}
                <Route path="/users" element={
                  <ProtectedRoute permission="core.users.manage"><Users /></ProtectedRoute>
                } />
                <Route path="/roles" element={
                  <ProtectedRoute permission="core.roles.manage"><Roles /></ProtectedRoute>
                } />
                <Route path="/company" element={
                  <ProtectedRoute permission="core.companies.manage"><Company /></ProtectedRoute>
                } />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
