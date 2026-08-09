// ─── Menu Configuration ───────────────────────────────────────────────────────
// Single source of truth for sidebar navigation and route-level permission checks.
// Permission codes are exact strings from ERP.BusinessLogic/Data/Seed/PermissionsCatalog.cs
// null = ungated (any authenticated user may access, with or without roles)

export interface MenuItem {
  key: string;          // unique key for React
  labelKey: string;     // key into the i18n translation dict
  path: string;
  icon: string;         // lucide icon name — resolved in Sidebar
  permission: string | null;
}

export interface MenuSection {
  id: string;
  labelKey: string;     // section header translation key
  items: MenuItem[];
}

export const MENU: MenuSection[] = [
  // ─── Overview ───────────────────────────────────────────────────────────────
  // Dashboard is always visible to every authenticated user
  {
    id: 'overview',
    labelKey: 'overview',
    items: [
      { key: 'dashboard', labelKey: 'dashboard', path: '/dashboard', icon: 'LayoutDashboard', permission: null },
    ],
  },

  // ─── Sales ──────────────────────────────────────────────────────────────────
  {
    id: 'sales',
    labelKey: 'sales',
    items: [
      { key: 'customers',   labelKey: 'customers',   path: '/customers',    icon: 'Users',        permission: 'sales.customers.view' },
      { key: 'salesOrders', labelKey: 'salesOrders', path: '/sales-orders', icon: 'ShoppingCart', permission: 'sales.orders.view'    },
    ],
  },

  // ─── Purchasing ─────────────────────────────────────────────────────────────
  {
    id: 'purchasing',
    labelKey: 'purchasing',
    items: [
      { key: 'suppliers',      labelKey: 'suppliers',      path: '/suppliers',       icon: 'Truck',         permission: 'purchasing.suppliers.view' },
      { key: 'purchaseOrders', labelKey: 'purchaseOrders', path: '/purchase-orders', icon: 'ClipboardList', permission: 'purchasing.orders.view'    },
    ],
  },

  // ─── Inventory ──────────────────────────────────────────────────────────────
  {
    id: 'inventory',
    labelKey: 'inventory',
    items: [
      { key: 'products',    labelKey: 'products',    path: '/products',    icon: 'Package',   permission: 'inventory.products.view'    },
      { key: 'categories',  labelKey: 'categories',  path: '/categories',  icon: 'Tag',       permission: 'inventory.categories.manage' },
      { key: 'warehouses',  labelKey: 'warehouses',  path: '/warehouses',  icon: 'Warehouse', permission: 'inventory.warehouses.view'   },
      { key: 'stock',       labelKey: 'stock',       path: '/stock',       icon: 'BarChart3', permission: 'inventory.stock.view'        },
    ],
  },

  // ─── HR ─────────────────────────────────────────────────────────────────────
  {
    id: 'hr',
    labelKey: 'hr',
    items: [
      { key: 'employees',    labelKey: 'employees',    path: '/employees',     icon: 'UserCheck',  permission: 'hr.employees.view'    },
      { key: 'departments',  labelKey: 'departments',  path: '/departments',   icon: 'Briefcase',  permission: 'core.departments.manage' },
      { key: 'branches',     labelKey: 'branches',     path: '/branches',      icon: 'Building2',  permission: 'core.branches.manage'    },
      // Attendance records (admin view) — requires hr.attendance.view
      { key: 'attendance',   labelKey: 'attendance',   path: '/attendance',    icon: 'Calendar',   permission: 'hr.attendance.view'   },
      // Leave requests management — requires hr.leaves.view
      { key: 'leaveRequests',labelKey: 'leaveRequests',path: '/leave-requests',icon: 'CalendarOff',permission: 'hr.leaves.view'       },
      // Ungated self-service: any authenticated employee can see their own history
      { key: 'myAttendance', labelKey: 'myAttendance', path: '/my-attendance', icon: 'Clock',      permission: null                   },
      { key: 'myLeaves',     labelKey: 'myLeaves',     path: '/my-leaves',     icon: 'CalendarCheck', permission: null               },
    ],
  },

  // ─── Accounting ─────────────────────────────────────────────────────────────
  {
    id: 'accounting',
    labelKey: 'accounting',
    items: [
      { key: 'accounts',       labelKey: 'accounts',       path: '/accounts',            icon: 'CreditCard', permission: 'accounting.accounts.view'  },
      { key: 'journalEntries', labelKey: 'journalEntries', path: '/journal-entries',     icon: 'BookOpen',   permission: 'accounting.journal.view'   },
      { key: 'acctSettings',   labelKey: 'accountingSettings', path: '/accounting-settings', icon: 'Settings', permission: 'accounting.settings.manage' },
    ],
  },

  // ─── Admin / Core ───────────────────────────────────────────────────────────
  {
    id: 'admin',
    labelKey: 'admin',
    items: [
      { key: 'users',   labelKey: 'users',   path: '/users',   icon: 'Users',    permission: 'core.users.manage'   },
      { key: 'roles',   labelKey: 'roles',   path: '/roles',   icon: 'Shield',   permission: 'core.roles.manage'   },
      { key: 'company', labelKey: 'company', path: '/company', icon: 'Building2',permission: 'core.companies.manage' },
    ],
  },
];
