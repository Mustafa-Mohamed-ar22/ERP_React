# Synaptech ERP Web Client

A modern, responsive Enterprise Resource Planning (ERP) web dashboard built with React, TypeScript, and Vite.

## 🚀 Features

- **Permission-Based Access Control**: Dynamic menu & page protection using fine-grained permission codes.
- **Multilingual Support (i18n)**: Native LTR/RTL support for English and Arabic.
- **Dark / Light Theme**: Premium UI theme toggle.
- **Core ERP Modules**:
  - **Company & Organization**: Branches, Departments, Accounting Settings.
  - **Sales Management**: Customers, Sales Orders, Order Status Tracking, Shipping.
  - **Purchasing Management**: Suppliers, Purchase Orders, Receiving Goods.
  - **Inventory & Stock**: Products, Categories, Warehouses, Stock Movements.
  - **HR & Payroll**: Employees, Attendance, Leave Requests.
  - **Financial Accounting**: Chart of Accounts, Journal Entries.
  - **System Administration**: Users & Role Permission Management.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid, Glassmorphism design tokens)
- **State & Router**: React Context, React Router DOM v7
- **HTTP Client**: Axios (with auto token injection & 403 authorization handling)
- **Icons & Visuals**: Lucide React, Recharts

## 📦 Getting Started

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

### Production Build

```bash
npm run build
```
