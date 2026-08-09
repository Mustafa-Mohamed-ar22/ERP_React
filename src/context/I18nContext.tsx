import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Arabic (Egyptian Market) Translations ───────────────────────────────────
const ar = {
  // Navigation
  dashboard: 'لوحة التحكم',
  customers: 'العملاء',
  salesOrders: 'أوامر البيع',
  suppliers: 'الموردون',
  purchaseOrders: 'أوامر الشراء',
  products: 'المنتجات',
  categories: 'الفئات',
  warehouses: 'المخازن',
  stock: 'المخزون',
  employees: 'الموظفون',
  departments: 'الأقسام',
  branches: 'الفروع',
  attendance: 'الحضور والانصراف',
  leaveRequests: 'طلبات الإجازة',
  myAttendance: 'حضوري الشخصي',
  myLeaves: 'إجازاتي الشخصية',
  acctSettings: 'إعدادات المحاسبة',
  accounts: 'دليل الحسابات',
  journalEntries: 'القيود اليومية',
  users: 'المستخدمون',
  roles: 'الصلاحيات',
  company: 'بيانات الشركة',
  accountingSettings: 'إعدادات المحاسبة',

  // Sections
  overview: 'الرئيسية',
  sales: 'المبيعات',
  purchasing: 'المشتريات',
  inventory: 'المخزون',
  hr: 'الموارد البشرية',
  accounting: 'المحاسبة',
  admin: 'الإدارة',

  // Auth
  signIn: 'تسجيل الدخول',
  signOut: 'تسجيل الخروج',
  register: 'إنشاء حساب',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  confirmPassword: 'تأكيد كلمة المرور',
  fullName: 'الاسم الكامل',
  companyName: 'اسم الشركة',
  forgotPassword: 'نسيت كلمة المرور؟',
  welcomeBack: 'أهلاً بك مرة أخرى',
  signInSubtitle: 'سجّل دخولك إلى منظومة ERP',
  createAccount: 'إنشاء حساب جديد',
  createAccountSubtitle: 'أنشئ منظومة ERP لشركتك',
  alreadyHaveAccount: 'لديك حساب بالفعل؟',
  noAccount: 'لا تمتلك حساباً؟',

  // Common actions
  add: 'إضافة',
  addNew: 'إضافة جديد',
  edit: 'تعديل',
  delete: 'حذف',
  save: 'حفظ',
  saveChanges: 'حفظ التغييرات',
  cancel: 'إلغاء',
  confirm: 'تأكيد',
  search: 'بحث',
  refresh: 'تحديث',
  view: 'عرض',
  close: 'إغلاق',
  submit: 'إرسال',
  approve: 'موافقة',
  reject: 'رفض',
  create: 'إنشاء',
  back: 'رجوع',

  // Common fields
  name: 'الاسم',
  code: 'الكود',
  status: 'الحالة',
  date: 'التاريخ',
  notes: 'ملاحظات',
  address: 'العنوان',
  phone: 'رقم الهاتف',
  taxNumber: 'الرقم الضريبي',
  active: 'نشط',
  inactive: 'غير نشط',
  actions: 'الإجراءات',
  records: 'سجل',

  // Status
  draft: 'مسودة',
  submitted: 'مقدّم',
  approved: 'معتمد',
  shipped: 'مشحون',
  received: 'مستلم',
  cancelled: 'ملغي',
  pending: 'قيد الانتظار',
  posted: 'مرحّل',
  reversed: 'معكوس',
  present: 'حاضر',
  absent: 'غائب',
  late: 'متأخر',

  // Customers
  customerName: 'اسم العميل',
  contactName: 'اسم جهة الاتصال',
  creditLimit: 'حد الائتمان',

  // Orders
  orderNumber: 'رقم الأمر',
  orderDate: 'تاريخ الأمر',
  totalAmount: 'الإجمالي',
  customer: 'العميل',
  supplier: 'المورد',
  warehouse: 'المخزن',
  quantity: 'الكمية',
  unitPrice: 'سعر الوحدة',
  total: 'الإجمالي',
  orderItems: 'بنود الأمر',
  newOrder: 'أمر جديد',
  newPO: 'أمر شراء جديد',
  ship: 'شحن',
  receive: 'استلام',
  receiveGoods: 'استلام بضاعة',

  // Products
  sku: 'كود الصنف',
  description: 'الوصف',
  unitOfMeasure: 'وحدة القياس',
  costPrice: 'سعر التكلفة',
  salePrice: 'سعر البيع',
  category: 'الفئة',

  // Employees
  employeeCode: 'كود الموظف',
  jobTitle: 'المسمى الوظيفي',
  department: 'القسم',
  branch: 'الفرع',
  hireDate: 'تاريخ التعيين',
  baseSalary: 'الراتب الأساسي',
  nationalId: 'الرقم القومي',
  dateOfBirth: 'تاريخ الميلاد',
  manager: 'المدير المباشر',

  // Leave
  leaveType: 'نوع الإجازة',
  startDate: 'تاريخ البداية',
  endDate: 'تاريخ النهاية',
  reason: 'السبب',
  annual: 'سنوية',
  sick: 'مرضية',
  emergency: 'طارئة',

  // Accounting
  accountCode: 'كود الحساب',
  accountName: 'اسم الحساب',
  accountType: 'نوع الحساب',
  debit: 'مدين',
  credit: 'دائن',
  balance: 'الرصيد',
  asset: 'أصول',
  liability: 'خصوم',
  equity: 'حقوق ملكية',
  revenue: 'إيرادات',
  expense: 'مصروفات',
  newEntry: 'قيد جديد',
  post: 'ترحيل',
  reverse: 'عكس',
  balanced: 'متوازن',
  difference: 'الفرق',
  entryLines: 'بنود القيد',

  // Dashboard
  goodMorning: 'صباح الخير',
  goodAfternoon: 'مساء الخير',
  revenueOverview: 'نظرة عامة على الإيرادات',
  orderStatus: 'حالة الأوامر',
  recentSalesOrders: 'أحدث أوامر البيع',
  viewAll: 'عرض الكل',
  totalCustomers: 'إجمالي العملاء',
  totalProducts: 'إجمالي المنتجات',
  totalSalesOrders: 'أوامر البيع',
  totalPurchaseOrders: 'أوامر الشراء',
  pendingSales: 'أوامر بيع معلقة',
  pendingPurchases: 'أوامر شراء معلقة',
  awaitingApproval: 'بانتظار الاعتماد أو الشحن',
  awaitingReceipt: 'بانتظار الاعتماد أو الاستلام',

  // Messages
  confirmDelete: 'تأكيد الحذف',
  confirmDeleteMsg: 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.',
  noData: 'لا توجد بيانات',
  noResults: 'لا توجد نتائج لـ',
  getStarted: 'ابدأ بإضافة',
  createdSuccess: 'تم الإنشاء بنجاح!',
  updatedSuccess: 'تم التحديث بنجاح!',
  deletedSuccess: 'تم الحذف بنجاح!',
  operationFailed: 'فشلت العملية',
  loadFailed: 'فشل تحميل البيانات',
  connectionError: 'حدث خطأ في الاتصال بالخادم',

  // Toasts
  welcomeToast: 'أهلاً بك!',
  loggedOut: 'تم تسجيل الخروج',
  saved: 'تم الحفظ!',
  rejected: 'تم الرفض',

  // Roles
  roleName: 'اسم الصلاحية',
  permissions: 'الأذونات',
  permissionsSelected: 'أذونات مختارة',
  savePermissions: 'حفظ الأذونات',

  // Stock
  quantityOnHand: 'الكمية المتاحة',
  movementType: 'نوع الحركة',
  stockIn: 'وارد',
  stockOut: 'صادر',
  adjustment: 'تسوية',
  recordMovement: 'تسجيل حركة مخزون',
  filterByProduct: 'تصفية بالمنتج',
  filterByWarehouse: 'تصفية بالمخزن',
  selectFilter: 'اختر فلتراً',
  selectFilterMsg: 'اختر منتجاً أو مخزناً لعرض مستويات المخزون.',

  // Currency
  egp: 'ج.م',

  // Misc
  isHeadquarters: 'المقر الرئيسي',
  parentDepartment: 'القسم الأب',
  parentCategory: 'الفئة الأب',
  parentAccount: 'الحساب الأب',
  currency: 'العملة',
  country: 'الدولة',
  legalName: 'الاسم القانوني',
  fiscalYear: 'السنة المالية',
  defaultAccounts: 'الحسابات الافتراضية',
};

const en: typeof ar = {
  dashboard: 'Dashboard', customers: 'Customers', salesOrders: 'Sales Orders',
  suppliers: 'Suppliers', purchaseOrders: 'Purchase Orders', products: 'Products',
  categories: 'Categories', warehouses: 'Warehouses', stock: 'Stock',
  employees: 'Employees', departments: 'Departments', branches: 'Branches',
  attendance: 'Attendance', leaveRequests: 'Leave Requests',
  myAttendance: 'My Attendance', myLeaves: 'My Leave Requests',
  acctSettings: 'Accounting Settings',
  accounts: 'Chart of Accounts',
  journalEntries: 'Journal Entries', users: 'Users', roles: 'Roles & Permissions',
  company: 'Company Settings', accountingSettings: 'Accounting Settings',
  overview: 'Overview', sales: 'Sales', purchasing: 'Purchasing',
  inventory: 'Inventory', hr: 'HR', accounting: 'Accounting', admin: 'Admin',
  signIn: 'Sign In', signOut: 'Sign Out', register: 'Register',
  email: 'Email Address', password: 'Password', confirmPassword: 'Confirm Password',
  fullName: 'Full Name', companyName: 'Company Name', forgotPassword: 'Forgot password?',
  welcomeBack: 'Welcome back', signInSubtitle: 'Sign in to your ERP workspace',
  createAccount: 'Create account', createAccountSubtitle: "Set up your company's ERP workspace",
  alreadyHaveAccount: 'Already have an account?', noAccount: "Don't have an account?",
  add: 'Add', addNew: 'Add New', edit: 'Edit', delete: 'Delete', save: 'Save',
  saveChanges: 'Save Changes', cancel: 'Cancel', confirm: 'Confirm', search: 'Search',
  refresh: 'Refresh', view: 'View', close: 'Close', submit: 'Submit', approve: 'Approve',
  reject: 'Reject', create: 'Create', back: 'Back',
  name: 'Name', code: 'Code', status: 'Status', date: 'Date', notes: 'Notes',
  address: 'Address', phone: 'Phone', taxNumber: 'Tax Number', active: 'Active',
  inactive: 'Inactive', actions: 'Actions', records: 'records',
  draft: 'Draft', submitted: 'Submitted', approved: 'Approved', shipped: 'Shipped',
  received: 'Received', cancelled: 'Cancelled', pending: 'Pending', posted: 'Posted',
  reversed: 'Reversed', present: 'Present', absent: 'Absent', late: 'Late',
  customerName: 'Customer Name', contactName: 'Contact Name', creditLimit: 'Credit Limit',
  orderNumber: 'Order #', orderDate: 'Order Date', totalAmount: 'Total Amount',
  customer: 'Customer', supplier: 'Supplier', warehouse: 'Warehouse',
  quantity: 'Quantity', unitPrice: 'Unit Price', total: 'Total', orderItems: 'Order Items',
  newOrder: 'New Order', newPO: 'New PO', ship: 'Ship', receive: 'Receive',
  receiveGoods: 'Receive Goods',
  sku: 'SKU', description: 'Description', unitOfMeasure: 'Unit of Measure',
  costPrice: 'Cost Price', salePrice: 'Sale Price', category: 'Category',
  employeeCode: 'Employee Code', jobTitle: 'Job Title', department: 'Department',
  branch: 'Branch', hireDate: 'Hire Date', baseSalary: 'Base Salary',
  nationalId: 'National ID', dateOfBirth: 'Date of Birth', manager: 'Manager',
  leaveType: 'Leave Type', startDate: 'Start Date', endDate: 'End Date',
  reason: 'Reason', annual: 'Annual', sick: 'Sick', emergency: 'Emergency',
  accountCode: 'Account Code', accountName: 'Account Name', accountType: 'Account Type',
  debit: 'Debit', credit: 'Credit', balance: 'Balance', asset: 'Asset',
  liability: 'Liability', equity: 'Equity', revenue: 'Revenue', expense: 'Expense',
  newEntry: 'New Entry', post: 'Post', reverse: 'Reverse', balanced: 'Balanced',
  difference: 'Difference', entryLines: 'Entry Lines',
  goodMorning: 'Good morning', goodAfternoon: 'Good afternoon',
  revenueOverview: 'Revenue Overview', orderStatus: 'Order Status',
  recentSalesOrders: 'Recent Sales Orders', viewAll: 'View all',
  totalCustomers: 'Total Customers', totalProducts: 'Total Products',
  totalSalesOrders: 'Sales Orders', totalPurchaseOrders: 'Purchase Orders',
  pendingSales: 'Sales Orders Pending', pendingPurchases: 'Purchase Orders Pending',
  awaitingApproval: 'Awaiting approval or shipment',
  awaitingReceipt: 'Awaiting approval or receipt',
  confirmDelete: 'Confirm Delete', confirmDeleteMsg: 'Are you sure you want to delete this record? This cannot be undone.',
  noData: 'No Data', noResults: 'No results for', getStarted: 'Get started by adding',
  createdSuccess: 'Created successfully!', updatedSuccess: 'Updated successfully!',
  deletedSuccess: 'Deleted successfully!', operationFailed: 'Operation failed',
  loadFailed: 'Failed to load data', connectionError: 'Connection error',
  welcomeToast: 'Welcome!', loggedOut: 'Logged out', saved: 'Saved!', rejected: 'Rejected',
  roleName: 'Role Name', permissions: 'Permissions', permissionsSelected: 'permissions selected',
  savePermissions: 'Save Permissions',
  quantityOnHand: 'Qty on Hand', movementType: 'Movement Type', stockIn: 'Stock In',
  stockOut: 'Stock Out', adjustment: 'Adjustment', recordMovement: 'Record Movement',
  filterByProduct: 'Filter by Product', filterByWarehouse: 'Filter by Warehouse',
  selectFilter: 'Select a Filter', selectFilterMsg: 'Choose a product or warehouse to view stock levels.',
  egp: 'EGP', isHeadquarters: 'Headquarters', parentDepartment: 'Parent Department',
  parentCategory: 'Parent Category', parentAccount: 'Parent Account',
  currency: 'Currency', country: 'Country', legalName: 'Legal Name',
  fiscalYear: 'Fiscal Year', defaultAccounts: 'Default Accounts',
};

type Lang = 'ar' | 'en';
type Translations = typeof ar;

interface I18nContextType {
  lang: Lang;
  t: Translations;
  setLang: (l: Lang) => void;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    (localStorage.getItem('lang') as Lang) || 'ar'
  );

  const setLang = (l: Lang) => {
    localStorage.setItem('lang', l);
    setLangState(l);
  };

  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [lang, isRTL]);

  const t = lang === 'ar' ? ar : en;

  return (
    <I18nContext.Provider value={{ lang, t, setLang, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
