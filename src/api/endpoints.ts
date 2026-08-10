import apiClient from './client';

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authApi = {
  login:               (data: { email: string; password: string }) =>
                         apiClient.post('/api/Auth/login', data),
  register:            (data: any) => apiClient.post('/api/Auth/register', data),
  confirmEmail:        (data: { userId: string; code: string }) =>
                         apiClient.post('/api/Auth/confirm-email', data),
  resendConfirmation:  (data: { email: string }) =>
                         apiClient.post('/api/Auth/resend-confirmation-email', data),
  forgotPassword:      (data: { email: string }) =>
                         apiClient.post('/api/Auth/forgot-password', data),
  resetPassword:       (data: { email: string; code: string; newPassword: string }) =>
                         apiClient.post('/api/Auth/reset-password', data),
  refreshToken:        (token: string) => apiClient.post('/api/Auth/refresh-token', token),
  revokeToken:         (token: string) => apiClient.post('/api/Auth/revoke-token', token),
};

// ─── ACCOUNTS (GL) ───────────────────────────────────────────────────────────
export const accountsApi = {
  getAll: () => apiClient.get('/api/Accounts'),
  getById: (id: string) => apiClient.get(`/api/Accounts/${id}`),
  getBalance: (id: string) => apiClient.get(`/api/Accounts/${id}/balance`),
  getTypes: () => apiClient.get('/api/Accounts/account-types'),
  create: (data: any) => apiClient.post('/api/Accounts', data),
  update: (id: string, data: any) => apiClient.put(`/api/Accounts?id=${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Accounts/${id}`),
};

// ─── ACCOUNTING SETTINGS ─────────────────────────────────────────────────────
export const accountingSettingsApi = {
  get: () => apiClient.get('/api/AccountingSettings'),
  update: (data: any) => apiClient.put('/api/AccountingSettings', data),
};

// ─── JOURNAL ENTRIES ─────────────────────────────────────────────────────────
export const journalEntriesApi = {
  getAll: () => apiClient.get('/api/JournalEntries'),
  getById: (id: string) => apiClient.get(`/api/JournalEntries/${id}`),
  create: (data: any) => apiClient.post('/api/JournalEntries', data),
  delete: (id: string) => apiClient.delete(`/api/JournalEntries/${id}`),
  post: (id: string) => apiClient.post(`/api/JournalEntries/${id}/post`),
  reverse: (id: string) => apiClient.post(`/api/JournalEntries/${id}/reverse`),
};

// ─── BRANCHES ────────────────────────────────────────────────────────────────
export const branchesApi = {
  getAll: () => apiClient.get('/api/Branches'),
  getById: (id: string) => apiClient.get(`/api/Branches/${id}`),
  getDepartments: (branchId: string) => apiClient.get(`/api/Branches/${branchId}/departments`),
  create: (data: any) => apiClient.post('/api/Branches', data),
  update: (id: string, data: any) => apiClient.put(`/api/Branches/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Branches/${id}`),
};

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => apiClient.get('/api/Categories'),
  getById: (id: string) => apiClient.get(`/api/Categories/${id}`),
  create: (data: any) => apiClient.post('/api/Categories', data),
  update: (id: string, data: any) => apiClient.put(`/api/Categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Categories/${id}`),
};

// ─── COMPANIES ───────────────────────────────────────────────────────────────
export const companiesApi = {
  getMe: () => apiClient.get('/api/Companies/me'),
  update: (data: any) => apiClient.put('/api/Companies/me', data),
};

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────
export const customersApi = {
  getAll: () => apiClient.get('/api/Customers'),
  getById: (id: string) => apiClient.get(`/api/Customers/${id}`),
  create: (data: any) => apiClient.post('/api/Customers', data),
  update: (id: string, data: any) => apiClient.put(`/api/Customers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Customers/${id}`),
};

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
export const departmentsApi = {
  getAll: () => apiClient.get('/api/Departments'),
  getById: (id: string) => apiClient.get(`/api/Departments/${id}`),
  create: (data: any) => apiClient.post('/api/Departments', data),
  update: (id: string, data: any) => apiClient.put(`/api/Departments/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Departments/${id}`),
};

// ─── EMPLOYEES ───────────────────────────────────────────────────────────────
export const employeesApi = {
  getAll: () => apiClient.get('/api/Employees'),
  getById: (id: string) => apiClient.get(`/api/Employees/${id}`),
  create: (data: any) => apiClient.post('/api/Employees', data),
  update: (id: string, data: any) => apiClient.put(`/api/Employees/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Employees/${id}`),
  grantAccess: (id: string, data: { email: string; roleNames?: string[] | null }) =>
    apiClient.post(`/api/Employees/${id}/grant-access`, data),
};

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────
export const attendanceApi = {
  getAll: (employeeId?: string) =>
    apiClient.get('/api/Attendance', { params: employeeId ? { employeeId } : {} }),
  checkIn: () => apiClient.post('/api/Attendance/check-in'),
  checkOut: () => apiClient.post('/api/Attendance/check-out'),
  getMyHistory: () => apiClient.get('/api/Attendance/my-history'),
};

// ─── LEAVE REQUESTS ──────────────────────────────────────────────────────────
export const leaveRequestsApi = {
  getAll: () => apiClient.get('/api/LeaveRequests'),
  getById: (id: string) => apiClient.get(`/api/LeaveRequests/${id}`),
  getMyRequests: () => apiClient.get('/api/LeaveRequests/my-requests'),
  create: (data: any) => apiClient.post('/api/LeaveRequests', data),
  approve: (id: string) => apiClient.post(`/api/LeaveRequests/${id}/approve`),
  reject: (id: string) => apiClient.post(`/api/LeaveRequests/${id}/reject`),
  cancel: (id: string) => apiClient.post(`/api/LeaveRequests/${id}/cancel`),
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: () => apiClient.get('/api/Products'),
  getById: (id: string) => apiClient.get(`/api/Products/${id}`),
  create: (data: any) => apiClient.post('/api/Products', data),
  update: (id: string, data: any) => apiClient.put(`/api/Products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Products/${id}`),
};

// ─── PURCHASE ORDERS ─────────────────────────────────────────────────────────
export const purchaseOrdersApi = {
  getAll: () => apiClient.get('/api/PurchaseOrders'),
  getById: (id: string) => apiClient.get(`/api/PurchaseOrders/${id}`),
  create: (data: any) => apiClient.post('/api/PurchaseOrders', data),
  update: (id: string, data: any) => apiClient.put(`/api/PurchaseOrders/${id}`, data),
  submit: (id: string) => apiClient.post(`/api/PurchaseOrders/${id}/submit`),
  approve: (id: string) => apiClient.post(`/api/PurchaseOrders/${id}/approve`),
  receive: (id: string, data: any) => apiClient.post(`/api/PurchaseOrders/${id}/receive`, data),
  cancel: (id: string) => apiClient.post(`/api/PurchaseOrders/${id}/cancel`),
};

// ─── SALES ORDERS ────────────────────────────────────────────────────────────
export const salesOrdersApi = {
  getAll: () => apiClient.get('/api/SalesOrders'),
  getById: (id: string) => apiClient.get(`/api/SalesOrders/${id}`),
  create: (data: any) => apiClient.post('/api/SalesOrders', data),
  update: (id: string, data: any) => apiClient.put(`/api/SalesOrders/${id}`, data),
  submit: (id: string) => apiClient.post(`/api/SalesOrders/${id}/submit`),
  approve: (id: string) => apiClient.post(`/api/SalesOrders/${id}/approve`),
  ship: (id: string, data: any) => apiClient.post(`/api/SalesOrders/${id}/ship`, data),
  cancel: (id: string) => apiClient.post(`/api/SalesOrders/${id}/cancel`),
};

// ─── STOCK ───────────────────────────────────────────────────────────────────
export const stockApi = {
  getByProduct: (productId: string) => apiClient.get(`/api/Stock/products/${productId}`),
  getByWarehouse: (warehouseId: string) => apiClient.get(`/api/Stock/warehouses/${warehouseId}`),
  recordMovement: (data: any) => apiClient.post('/api/Stock/movements', data),
};

// ─── SUPPLIERS ───────────────────────────────────────────────────────────────
export const suppliersApi = {
  getAll: () => apiClient.get('/api/Suppliers'),
  getById: (id: string) => apiClient.get(`/api/Suppliers/${id}`),
  create: (data: any) => apiClient.post('/api/Suppliers', data),
  update: (id: string, data: any) => apiClient.put(`/api/Suppliers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Suppliers/${id}`),
};

// ─── WAREHOUSES ──────────────────────────────────────────────────────────────
export const warehousesApi = {
  getAll: () => apiClient.get('/api/Warehouses'),
  getById: (id: string) => apiClient.get(`/api/Warehouses/${id}`),
  create: (data: any) => apiClient.post('/api/Warehouses', data),
  update: (id: string, data: any) => apiClient.put(`/api/Warehouses/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/Warehouses/${id}`),
};

// ─── USERS ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => apiClient.get('/api/Users'),
  getById: (id: string) => apiClient.get(`/api/Users/${id}`),
  create: (data: { fullName: string; email: string; branchId?: string | null; departmentId?: string | null; roleNames?: string[] | null }) =>
    apiClient.post('/api/Users', data),
  update: (id: string, data: any) => apiClient.put(`/api/Users/${id}`, data),
  deactivate: (id: string) => apiClient.delete(`/api/Users/${id}`),
  assignRoles: (id: string, data: { roleNames?: string[] | null }) =>
    apiClient.put(`/api/Users/${id}/roles`, data),
};

// ─── ROLES ───────────────────────────────────────────────────────────────────
export const rolesApi = {
  getAll: () => apiClient.get('/api/Roles'),
  getById: (id: string) => apiClient.get(`/api/Roles/${id}`),
  getPermissionsCatalog: () => apiClient.get('/api/Roles/permissions-catalog'),
  create: (data: { name: string; description?: string | null; permissionCodes: string[] }) =>
    apiClient.post('/api/Roles', data),
  update: (id: string, data: { name: string; description?: string | null }) =>
    apiClient.put(`/api/Roles/${id}`, data),
  updatePermissions: (id: string, data: { permissionCodes: string[] }) =>
    apiClient.put(`/api/Roles/${id}/permissions`, data),
  delete: (id: string) => apiClient.delete(`/api/Roles/${id}`),
};
