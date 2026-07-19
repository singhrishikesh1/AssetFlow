// Persistent Client-Side Mock API fallback for AssetFlow / ANUMATICS ERP
// Manages the state in localStorage and implements all API endpoints.

// ─── INITIAL SEED DATA ──────────────────────────────────────────────

const DEFAULT_EMPLOYEES = [
  { id: 1, name: 'Rishikesh Singh', email: 'admin@assetflow.com', department: 'Operations', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Sarah Jenkins', email: 'manager@assetflow.com', department: 'Operations', role: 'Asset Manager', status: 'Active' },
  { id: 3, name: 'Raj Patel', email: 'head@assetflow.com', department: 'Engineering', role: 'Department Head', status: 'Active' },
  { id: 4, name: 'Priya Sharma', email: 'employee@assetflow.com', department: 'Engineering', role: 'Employee', status: 'Active' }
];

const DEFAULT_DEPARTMENTS = [
  { name: 'Engineering', head: 'Marcus Brody', parent: 'None', status: 'Active' },
  { name: 'Design', head: 'Raj Patel', parent: 'Engineering', status: 'Active' },
  { name: 'Operations', head: 'Alex Mercer', parent: 'None', status: 'Active' },
  { name: 'Audit & Compliance', head: 'Sarah Jenkins', parent: 'Operations', status: 'Active' }
];

const DEFAULT_CATEGORIES = [
  { name: 'Electronics', warrantyPeriod: 365, customField: 'CPU / RAM specs' },
  { name: 'Furniture', warrantyPeriod: 1095, customField: 'Material type' },
  { name: 'Vehicles', warrantyPeriod: 730, customField: 'License Plate' },
  { name: 'Office Spaces', warrantyPeriod: 0, customField: 'Capacity' }
];

const DEFAULT_ASSETS = [
  { tag: 'AF-0114', name: 'MacBook Pro M3', category: 'Electronics', serial: 'S/N 83B4F83', cost: 2500.00, condition: 'New', status: 'Allocated', location: 'HQ - Floor 3', holder: 'Priya Sharma', shared: false },
  { tag: 'AF-0341', name: 'Dell XPS 15', category: 'Electronics', serial: 'S/N 29A4D19', cost: 1800.00, condition: 'Good', status: 'Available', location: 'HQ - Floor 2', holder: 'None', shared: false },
  { tag: 'AF-0883', name: 'Herman Miller Aeron', category: 'Furniture', serial: 'S/N 12B8C73', cost: 1200.00, condition: 'Good', status: 'Available', location: 'HQ - Room A1', holder: 'None', shared: false },
  { tag: 'AF-1002', name: 'Conference Room B2', category: 'Office Spaces', serial: 'LOC-B2', cost: 0.00, condition: 'New', status: 'Available', location: 'HQ - Floor 1', holder: 'Shared', shared: true },
  { tag: 'AF-0220', name: 'Tesla Model 3', category: 'Vehicles', serial: 'PLATE-AURA', cost: 42000.00, condition: 'Good', status: 'Available', location: 'Garage A', holder: 'Shared', shared: true }
];

const DEFAULT_BOOKINGS = [
  { id: 1, resource: 'Conference Room B2', user: 'Raj Patel', start: '09:00', end: '10:00', date: '2026-07-12', status: 'Ongoing' }
];

const DEFAULT_MAINTENANCE = [
  { id: 1, assetTag: 'AF-0341', description: 'Keyboard double space defect', priority: 'Medium', status: 'Pending' }
];

const DEFAULT_AUDITS = [
  {
    id: 1,
    scope: 'Engineering Department',
    auditor: 'Sarah Jenkins',
    dateRange: '2026-07-10 - 2026-07-15',
    status: 'Active',
    items: [
      { assetTag: 'AF-0114', name: 'MacBook Pro M3', auditedStatus: 'Unchecked' },
      { assetTag: 'AF-0341', name: 'Dell XPS 15', auditedStatus: 'Unchecked' },
      { assetTag: 'AF-0883', name: 'Herman Miller Aeron', auditedStatus: 'Unchecked' }
    ]
  }
];

const DEFAULT_PRODUCTS = [
  { id: 'P001', name: 'Steel Rod 12mm', category: 'Raw Material', description: 'High tensile steel rod', sku: 'SR-12MM-001', unitOfMeasure: 'kg' },
  { id: 'P002', name: 'Copper Wire 2.5mm', category: 'Raw Material', description: 'Electrical grade copper wire', sku: 'CW-25MM-002', unitOfMeasure: 'meter' },
  { id: 'P003', name: 'Industrial Bearing 6205', category: 'Semi-Finished Material', description: 'Deep groove ball bearing', sku: 'IB-6205-003', unitOfMeasure: 'unit' },
  { id: 'P004', name: 'Motor Drive PCB', category: 'Semi-Finished Material', description: 'Partially assembled motor PCB', sku: 'PCB-MD-004', unitOfMeasure: 'unit' },
  { id: 'P005', name: 'Hydraulic Pump Assembly', category: 'Finished Material', description: 'Complete hydraulic pump', sku: 'HPA-V2-005', unitOfMeasure: 'unit' },
  { id: 'P006', name: 'Stainless Sheet 2mm', category: 'Raw Material', description: '304 grade stainless steel sheet', sku: 'SS-2MM-006', unitOfMeasure: 'sqft' },
  { id: 'P007', name: 'Pneumatic Cylinder 50mm', category: 'Finished Material', description: 'Ready-to-install pneumatic cylinder', sku: 'PC-50MM-007', unitOfMeasure: 'unit' },
  { id: 'P008', name: 'Gear Assembly Kit', category: 'Semi-Finished Material', description: 'Partially machined gear set', sku: 'GAK-V1-008', unitOfMeasure: 'set' },
  { id: 'P009', name: 'Aluminium Ingot 99%', category: 'Raw Material', description: 'Primary aluminium ingot', sku: 'AI-99P-009', unitOfMeasure: 'kg' },
  { id: 'P010', name: 'Electric Motor 2HP', category: 'Finished Material', description: 'Single phase induction motor', sku: 'EM-2HP-010', unitOfMeasure: 'unit' },
  { id: 'P011', name: 'PVC Granules', category: 'Raw Material', description: 'Virgin grade PVC resin granules', sku: 'PVC-GR-011', unitOfMeasure: 'kg' },
  { id: 'P012', name: 'Control Panel Box', category: 'Finished Material', description: 'IP65 rated control panel enclosure', sku: 'CPB-IP65-012', unitOfMeasure: 'unit' }
];

const DEFAULT_VENDORS = [
  { id: 'V001', name: 'Ravi Steels Pvt Ltd', shopName: 'Ravi Metal Works', location: 'MIDC Phase II, Pune - 411019', contactEmail: 'ravi@ravisteels.com', contactPhone: '+91-9876541001', products: [{ productId: 'P001', price: 82.50, inStock: true, minOrderQty: 100 }, { productId: 'P006', price: 145.00, inStock: true, minOrderQty: 50 }, { productId: 'P009', price: 210.00, inStock: false, minOrderQty: 200 }] },
  { id: 'V002', name: 'Arjun Electricals', shopName: 'AE Electrical Supplies', location: 'Industrial Area, Nashik - 422001', contactEmail: 'supply@arjunelec.in', contactPhone: '+91-9876541002', products: [{ productId: 'P002', price: 58.00, inStock: true, minOrderQty: 500 }, { productId: 'P004', price: 1250.00, inStock: true, minOrderQty: 10 }, { productId: 'P010', price: 4800.00, inStock: true, minOrderQty: 1 }] },
  { id: 'V003', name: 'Precision Bearings Co.', shopName: 'PBC Warehouse', location: 'Bhosari MIDC, Pune - 411026', contactEmail: 'orders@pbc.co.in', contactPhone: '+91-9876541003', products: [{ productId: 'P003', price: 320.00, inStock: true, minOrderQty: 20 }, { productId: 'P008', price: 2100.00, inStock: true, minOrderQty: 5 }] },
  { id: 'V004', name: 'Suresh Hydraulics', shopName: 'SH Fluid Power', location: 'Chakan Industrial Zone, Pune - 410501', contactEmail: 'sales@sureshhydraulics.com', contactPhone: '+91-9876541004', products: [{ productId: 'P005', price: 18500.00, inStock: true, minOrderQty: 1 }, { productId: 'P007', price: 3200.00, inStock: true, minOrderQty: 2 }] },
  { id: 'V005', name: 'Polymer Solutions Ltd', shopName: 'PSL Depot', location: 'Talegaon MIDC, Pune - 412106', contactEmail: 'polymer@psl.in', contactPhone: '+91-9876541005', products: [{ productId: 'P011', price: 95.00, inStock: true, minOrderQty: 500 }, { productId: 'P012', price: 6800.00, inStock: false, minOrderQty: 1 }] },
  { id: 'V006', name: 'MegaMetal Traders', shopName: 'MegaMetal Yard', location: 'Hadapsar, Pune - 411028', contactEmail: 'trade@megametal.in', contactPhone: '+91-9876541006', products: [{ productId: 'P001', price: 79.00, inStock: true, minOrderQty: 200 }, { productId: 'P006', price: 138.00, inStock: true, minOrderQty: 100 }, { productId: 'P009', price: 205.00, inStock: true, minOrderQty: 500 }] }
];

const DEFAULT_ITEM_MASTERS = [
  { id: 'IM001', name: 'Steel Rod 12mm', sku: 'SR-12MM-001', materialCategory: 'Raw Material', quantity: 500, rate: 80, materialLocation: 'Warehouse A - Rack 3', companyName: 'In-House Production', description: 'Primary raw material for fabrication' },
  { id: 'IM002', name: 'Motor Drive PCB', sku: 'PCB-MD-004', materialCategory: 'Semi-Finished Material', quantity: 25, rate: 1200, materialLocation: 'Assembly Bay - Zone 2', companyName: 'Arjun Electricals', description: 'Requires final component soldering in-house' },
  { id: 'IM003', name: 'Hydraulic Pump Assembly', sku: 'HPA-V2-005', materialCategory: 'Finished Material', quantity: 8, rate: 18000, materialLocation: 'Store Room B - Shelf 1', companyName: 'Suresh Hydraulics', description: 'Fully vendor-manufactured, ready for dispatch' },
  { id: 'IM004', name: 'Copper Wire 2.5mm', sku: 'CW-25MM-002', materialCategory: 'Raw Material', quantity: 2000, rate: 56, materialLocation: 'Warehouse A - Rack 7', companyName: 'In-House Drawn', description: 'Electrical wiring raw stock' },
  { id: 'IM005', name: 'Gear Assembly Kit', sku: 'GAK-V1-008', materialCategory: 'Semi-Finished Material', quantity: 15, rate: 2000, materialLocation: 'Assembly Bay - Zone 4', companyName: 'Precision Bearings Co.', description: 'Requires final balancing and heat treatment in-house' }
];

const DEFAULT_ORDERS = [
  { id: 'ORD001', orderNumber: 'PO-2026-001', date: '2026-07-10', customer: 'ABC Manufacturing Ltd', status: 'Confirmed', notes: 'Urgent delivery required', items: [{ productId: 'P001', productName: 'Steel Rod 12mm', quantity: 500, unitPrice: 82.50, vendorId: 'V001', vendorName: 'Ravi Steels Pvt Ltd', materialCategory: 'Raw Material' }, { productId: 'P003', productName: 'Industrial Bearing 6205', quantity: 50, unitPrice: 320.00, vendorId: 'V003', vendorName: 'Precision Bearings Co.', materialCategory: 'Semi-Finished Material' }] },
  { id: 'ORD002', orderNumber: 'PO-2026-002', date: '2026-07-08', customer: 'XYZ Engineering Works', status: 'Confirmed', notes: '', items: [{ productId: 'P005', productName: 'Hydraulic Pump Assembly', quantity: 3, unitPrice: 18500, vendorId: 'V004', vendorName: 'Suresh Hydraulics', materialCategory: 'Finished Material' }] },
  { id: 'ORD003', orderNumber: 'PO-2026-003', date: '2026-07-05', customer: 'Delta Auto Parts', status: 'Completed', notes: 'Monthly standing order', items: [{ productId: 'P002', productName: 'Copper Wire 2.5mm', quantity: 1000, unitPrice: 58, vendorId: 'V002', vendorName: 'Arjun Electricals', materialCategory: 'Raw Material' }, { productId: 'P010', productName: 'Electric Motor 2HP', quantity: 5, unitPrice: 4800, vendorId: 'V002', vendorName: 'Arjun Electricals', materialCategory: 'Finished Material' }] }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 'N001', title: '⚠ Low Stock Alert', message: 'Steel Rod 12mm (SR-12MM-001) has only 500 units — below threshold of 1,000 for Raw Materials.', type: 'alert', isRead: false, targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), link: 'itemmaster' },
  { id: 'N002', title: '✅ Order Placed', message: 'Order PO-2026-001 for ABC Manufacturing Ltd confirmed. Total: ₹57,250.', type: 'success', isRead: false, targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), link: 'orders' },
  { id: 'N003', title: '📄 BOM Generated', message: 'Bill of Materials auto-generated for PO-2026-001 with 2 line items totalling ₹57,250.', type: 'info', isRead: true, targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), link: 'orders' },
  { id: 'N004', title: '⚠ Low Stock Alert', message: 'Gear Assembly Kit (GAK-V1-008) has only 15 units — below threshold of 20 for Semi-Finished Materials.', type: 'alert', isRead: false, targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), link: 'itemmaster' },
  { id: 'N005', title: '✅ Order Placed', message: 'Order PO-2026-002 for XYZ Engineering Works confirmed. Total: ₹55,500.', type: 'success', isRead: true, targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 30).toISOString(), link: 'orders' },
  { id: 'N006', title: '⚠ Low Stock Alert', message: 'Hydraulic Pump Assembly (HPA-V2-005) has only 8 units — below threshold of 10 for Finished Materials.', type: 'alert', isRead: false, targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), link: 'itemmaster' }
];

const DEFAULT_LOGS = [
  { id: 1, timestamp: new Date(Date.now() - 3600000 * 10).toISOString(), actor: 'System Seed Engine', action: 'INITIALIZE_DB', detail: 'Pre-populated core assets, employee directory, and departments.' },
  { id: 2, timestamp: new Date(Date.now() - 3600000 * 9).toISOString(), actor: 'Marcus Brody (Admin)', action: 'ROLE_ELEVATION', detail: 'Priya Sharma promoted to Asset Manager permissions.' }
];

// ─── LOCAL STORAGE HELPERS ──────────────────────────────────────────

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize collections
const getEmployeesList = () => getStorageItem('mock_employees', DEFAULT_EMPLOYEES);
const saveEmployeesList = (list: any[]) => setStorageItem('mock_employees', list);

const getDepartmentsList = () => getStorageItem('mock_departments', DEFAULT_DEPARTMENTS);

const getCategoriesList = () => getStorageItem('mock_categories', DEFAULT_CATEGORIES);

const getAssetsList = () => getStorageItem('mock_assets', DEFAULT_ASSETS);
const saveAssetsList = (list: any[]) => setStorageItem('mock_assets', list);

const getBookingsList = () => getStorageItem('mock_bookings', DEFAULT_BOOKINGS);
const saveBookingsList = (list: any[]) => setStorageItem('mock_bookings', list);

const getMaintenanceList = () => getStorageItem('mock_maintenance', DEFAULT_MAINTENANCE);
const saveMaintenanceList = (list: any[]) => setStorageItem('mock_maintenance', list);

const getAuditsList = () => getStorageItem('mock_audits', DEFAULT_AUDITS);
const saveAuditsList = (list: any[]) => setStorageItem('mock_audits', list);

const getProductsList = () => getStorageItem('mock_products', DEFAULT_PRODUCTS);
const saveProductsList = (list: any[]) => setStorageItem('mock_products', list);

const getVendorsList = () => getStorageItem('mock_vendors', DEFAULT_VENDORS);

const getItemMastersList = () => getStorageItem('mock_item_masters', DEFAULT_ITEM_MASTERS);
const saveItemMastersList = (list: any[]) => setStorageItem('mock_item_masters', list);

const getOrdersList = () => getStorageItem('mock_orders', DEFAULT_ORDERS);
const saveOrdersList = (list: any[]) => setStorageItem('mock_orders', list);

const getNotificationsList = () => getStorageItem('mock_notifications', DEFAULT_NOTIFICATIONS);
const saveNotificationsList = (list: any[]) => setStorageItem('mock_notifications', list);

const getLogsList = () => getStorageItem('mock_logs', DEFAULT_LOGS);
const saveLogsList = (list: any[]) => setStorageItem('mock_logs', list);

// Helper to write system logs client-side
const addMockLog = (actor: string, action: string, assetTag: string | undefined, detail: string) => {
  const logs = getLogsList();
  const newLog = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    actor,
    action,
    assetTag,
    detail
  };
  saveLogsList([newLog, ...logs]);
};

// Helper to raise mock notifications client-side
const addMockNotification = (title: string, message: string, type: string, link?: string, targetUserId = 'all') => {
  const notifications = getNotificationsList();
  const newNotif = {
    id: `N${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    type,
    isRead: false,
    targetUserId,
    createdAt: new Date().toISOString(),
    link
  };
  saveNotificationsList([newNotif, ...notifications]);
};

// Current Session Helper
const getLoggedInUser = (): any => {
  const token = localStorage.getItem('af_token');
  if (!token) return null;
  try {
    // Decode base64 payload
    const payloadStr = atob(token.replace('mock-session-', ''));
    return JSON.parse(payloadStr);
  } catch (e) {
    return null;
  }
};

const getActorString = (): string => {
  const user = getLoggedInUser();
  return user ? `${user.name} (${user.role})` : 'System Admin';
};

// ─── MOCK API IMPLEMENTATION ────────────────────────────────────────

export const mockApi = {
  auth: {
    login: async (credentials: any) => {
      const { email, password } = credentials;
      if (!email || !password) {
        throw new Error('Please provide email and password.');
      }
      const employees = getEmployeesList();
      const user = employees.find(e => e.email.toLowerCase() === email.trim().toLowerCase());
      
      if (!user) {
        throw new Error('User not found.');
      }
      if (user.status === 'Inactive') {
        throw new Error('Account deactivated. Please contact an administrator.');
      }
      // Simple pass verification for mock client demo
      if (password !== 'admin123') {
        throw new Error('Invalid email or password.');
      }

      // Generate a mock base64 token
      const token = 'mock-session-' + btoa(JSON.stringify(user));
      
      // Write audit log
      addMockLog(`${user.name} (${user.role})`, 'USER_LOGIN', undefined, 'Logged in successfully via Client-side Fallback.');

      return { token, user };
    },
    signup: async (userData: any) => {
      const { name, email, password, department } = userData;
      if (!name || !email || !password || !department) {
        throw new Error('Please fill in all fields.');
      }
      const employees = getEmployeesList();
      const emailClean = email.trim().toLowerCase();
      if (employees.some(e => e.email.toLowerCase() === emailClean)) {
        throw new Error('Account already exists.');
      }

      const role = emailClean === 'admin@assetflow.com' ? 'Admin' : 'Employee';
      const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: emailClean,
        department,
        role,
        status: 'Active'
      };

      saveEmployeesList([...employees, newUser]);
      const token = 'mock-session-' + btoa(JSON.stringify(newUser));

      addMockLog(`${newUser.name} (${newUser.role})`, 'USER_SIGNUP', undefined, `New account created for department [${newUser.department}].`);

      return { token, user: newUser };
    },
    forgot: async (email: string) => {
      if (!email) {
        throw new Error('Please enter your email.');
      }
      const employees = getEmployeesList();
      const user = employees.find(e => e.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        throw new Error('No account found with this email address.');
      }
      return {
        success: true,
        message: 'Demo Reset Successful: For demonstration purposes, you can use the password "admin123" to sign in next, or check the database seeding.'
      };
    },
    me: async () => {
      const user = getLoggedInUser();
      if (!user) {
        throw new Error('Unauthorized: No active session');
      }
      // Reload fresh employee details from mock storage
      const employees = getEmployeesList();
      const freshUser = employees.find(e => e.id === user.id);
      if (!freshUser) {
        throw new Error('User profile not found.');
      }
      return { user: freshUser };
    }
  },

  org: {
    getDepartments: async () => getDepartmentsList(),
    getCategories: async () => getCategoriesList(),
    getEmployees: async () => getEmployeesList(),
    promoteEmployee: async (email: string) => {
      if (!email) throw new Error('Employee email is required.');
      const employees = getEmployeesList();
      const empIndex = employees.findIndex(e => e.email.toLowerCase() === email.trim().toLowerCase());
      if (empIndex === -1) {
        throw new Error('Employee not found.');
      }

      const currentRole = employees[empIndex].role;
      let nextRole = 'Employee';
      if (currentRole === 'Employee') nextRole = 'Asset Manager';
      else if (currentRole === 'Asset Manager') nextRole = 'Department Head';
      else if (currentRole === 'Department Head') nextRole = 'Admin';

      employees[empIndex].role = nextRole;
      saveEmployeesList(employees);

      addMockLog(getActorString(), 'ROLE_ELEVATION', undefined, `Elevated ${employees[empIndex].name} role level from [${currentRole}] to [${nextRole}]`);

      return { success: true, nextRole };
    }
  },

  assets: {
    getAssets: async () => getAssetsList(),
    registerAsset: async (asset: any) => {
      const { name, category, serial, cost, location, condition, shared } = asset;
      if (!name || !category || !serial || !location) {
        throw new Error('Missing required asset details.');
      }
      const assets = getAssetsList();
      const tag = `AF-0${assets.length + 101}`;
      const costNum = Number(cost) || 0;
      const isShared = shared === true || shared === 'true';
      const holder = isShared ? 'Shared' : 'None';

      const newAsset = {
        tag,
        name: name.trim(),
        category,
        serial: serial.trim(),
        cost: costNum,
        condition: condition || 'New',
        status: 'Available',
        location: location.trim(),
        holder,
        shared: isShared
      };

      saveAssetsList([...assets, newAsset]);
      addMockLog(getActorString(), 'REGISTER_ASSET', tag, `Registered new asset [${name}] in category [${category}]`);

      return newAsset;
    },
    allocateAsset: async (tag: string, employee: string, returnDate?: string) => {
      if (!tag || !employee) {
        throw new Error('Asset tag and employee name are required.');
      }
      const assets = getAssetsList();
      const assetIndex = assets.findIndex(a => a.tag === tag);
      if (assetIndex === -1) {
        throw new Error('Asset not found.');
      }
      if (assets[assetIndex].status !== 'Available') {
        throw new Error(`Asset is currently [${assets[assetIndex].status}] and cannot be allocated.`);
      }

      assets[assetIndex].status = 'Allocated';
      assets[assetIndex].holder = employee;
      saveAssetsList(assets);

      addMockLog(getActorString(), 'ALLOCATE_ASSET', tag, `Allocated asset to ${employee}. Expected return date: ${returnDate || 'Indefinite'}`);

      return { success: true, message: 'Asset allocated successfully.' };
    }
  },

  bookings: {
    getBookings: async () => getBookingsList(),
    createBooking: async (booking: any) => {
      const { resource, user_name, start_time, end_time, booking_date } = booking;
      if (!resource || !user_name || !start_time || !end_time || !booking_date) {
        throw new Error('All booking fields are required.');
      }

      const bookings = getBookingsList();
      
      // Overlap logic: (StartA < EndB) AND (EndA > StartB)
      const conflict = bookings.some(b => 
        b.resource === resource &&
        b.status !== 'Cancelled' &&
        b.date === booking_date &&
        b.start < end_time &&
        b.end > start_time
      );

      if (conflict) {
        // Return 409 conflict like Express does
        const err = new Error(`Booking conflict: ${resource} is already booked during this time-slot.`);
        (err as any).status = 409;
        throw err;
      }

      const newBooking = {
        id: Date.now(),
        resource,
        user: user_name,
        start: start_time,
        end: end_time,
        date: booking_date,
        status: 'Upcoming'
      };

      saveBookingsList([newBooking, ...bookings]);

      // Lock asset to Reserved status
      const assets = getAssetsList();
      const assetIdx = assets.findIndex(a => a.name === resource);
      if (assetIdx !== -1) {
        assets[assetIdx].status = 'Reserved';
        saveAssetsList(assets);
      }

      addMockLog(getActorString(), 'BOOK_RESOURCE', undefined, `Booked shared resource [${resource}] on ${booking_date} from ${start_time} to ${end_time}. Injected 15-minute buffer cleaning.`);

      return { success: true, message: 'Resource booked successfully.' };
    }
  },

  maintenance: {
    getMaintenance: async () => getMaintenanceList(),
    createMaintenance: async (ticket: any) => {
      const { assetTag, description, priority } = ticket;
      if (!assetTag || !description) {
        throw new Error('Asset tag and ticket description are required.');
      }
      const list = getMaintenanceList();
      const newTicket = {
        id: Date.now(),
        assetTag,
        description,
        priority: priority || 'Medium',
        status: 'Pending'
      };
      saveMaintenanceList([newTicket, ...list]);

      addMockLog(getActorString(), 'RAISE_MAINTENANCE', assetTag, `Raised repair ticket for [${assetTag}]: "${description}"`);

      return { success: true };
    },
    approveMaintenance: async (id: number) => {
      const list = getMaintenanceList();
      const idx = list.findIndex(t => t.id === Number(id));
      if (idx === -1) {
        throw new Error('Maintenance ticket not found.');
      }
      list[idx].status = 'Approved';
      saveMaintenanceList(list);

      const tag = list[idx].assetTag;
      const assets = getAssetsList();
      const assetIdx = assets.findIndex(a => a.tag === tag);
      if (assetIdx !== -1) {
        assets[assetIdx].status = 'Under Maintenance';
        saveAssetsList(assets);
      }

      addMockLog(getActorString(), 'APPROVE_MAINTENANCE', tag, `State shift: Status changed from [Available] to [Under Maintenance]`);

      return { success: true };
    },
    resolveMaintenance: async (id: number) => {
      const list = getMaintenanceList();
      const idx = list.findIndex(t => t.id === Number(id));
      if (idx === -1) {
        throw new Error('Maintenance ticket not found.');
      }
      list[idx].status = 'Resolved';
      saveMaintenanceList(list);

      const tag = list[idx].assetTag;
      const assets = getAssetsList();
      const assetIdx = assets.findIndex(a => a.tag === tag);
      if (assetIdx !== -1) {
        assets[assetIdx].status = 'Available';
        saveAssetsList(assets);
      }

      addMockLog(getActorString(), 'RESOLVE_MAINTENANCE', tag, `State shift: Status changed from [Under Maintenance] to [Available]`);

      return { success: true };
    }
  },

  audits: {
    getAudits: async () => getAuditsList(),
    saveAuditStatus: async (cycleId: number, assetTag: string, status: string) => {
      if (!cycleId || !assetTag || !status) {
        throw new Error('Missing cycle ID, asset tag, or audited status.');
      }
      const audits = getAuditsList();
      const auditIdx = audits.findIndex(a => a.id === Number(cycleId));
      if (auditIdx === -1) {
        throw new Error('Audit cycle not found.');
      }

      const itemIdx = audits[auditIdx].items.findIndex(item => item.assetTag === assetTag);
      if (itemIdx === -1) {
        throw new Error('Audit item not found in this cycle.');
      }

      audits[auditIdx].items[itemIdx].auditedStatus = status;
      saveAuditsList(audits);

      const assets = getAssetsList();
      const assetIdx = assets.findIndex(a => a.tag === assetTag);

      if (status === 'Missing') {
        if (assetIdx !== -1) {
          assets[assetIdx].status = 'Lost';
          assets[assetIdx].condition = 'Missing';
          saveAssetsList(assets);
        }
      } else if (status === 'Damaged') {
        if (assetIdx !== -1) {
          assets[assetIdx].condition = 'Damaged';
          saveAssetsList(assets);
        }
        // Auto-trigger maintenance
        const maintenance = getMaintenanceList();
        maintenance.unshift({
          id: Date.now(),
          assetTag,
          description: 'Audit Flag: Reported damaged during cycle #12',
          priority: 'High',
          status: 'Pending'
        });
        saveMaintenanceList(maintenance);

        addMockLog(getActorString(), 'AUDIT_FLAG_DISCREPANCY', assetTag, `Audited condition: Damaged. Auto-generated maintenance ticket.`);
      } else {
        if (assetIdx !== -1) {
          assets[assetIdx].condition = 'Good';
          saveAssetsList(assets);
        }
        addMockLog(getActorString(), 'AUDIT_VERIFY', assetTag, `Audited condition: Verified Good.`);
      }

      return { success: true };
    }
  },

  procurement: {
    getProducts: async () => getProductsList(),
    getVendors: async () => getVendorsList(),
    getItemMasters: async () => getItemMastersList(),
    createItemMaster: async (item: any) => {
      const { name, sku, materialCategory, quantity, rate, materialLocation, companyName, description } = item;
      if (!name || !sku || !materialCategory || !materialLocation || !companyName) {
        throw new Error('Missing required Item Master details.');
      }

      const products = getProductsList();
      if (!products.some(p => p.sku === sku.trim())) {
        products.push({
          id: `P${Date.now()}`,
          name: name.trim(),
          category: materialCategory,
          description: `Auto-generated description for SKU ${sku.trim()}`,
          sku: sku.trim(),
          unitOfMeasure: 'unit'
        });
        saveProductsList(products);
      }

      const id = `IM${Date.now()}`;
      const qty = Number(quantity) || 0;
      const rt = Number(rate) || 0;

      const newItem = {
        id,
        name: name.trim(),
        sku: sku.trim(),
        materialCategory,
        quantity: qty,
        rate: rt,
        materialLocation: materialLocation.trim(),
        companyName: companyName.trim(),
        description: description || ''
      };

      const itemMasters = getItemMastersList();
      saveItemMastersList([newItem, ...itemMasters]);

      // Low stock warning logic
      const thresholds: Record<string, number> = { 'Raw Material': 1000, 'Semi-Finished Material': 20, 'Finished Material': 10 };
      const limit = thresholds[materialCategory] || 0;
      if (qty < limit) {
        addMockNotification(
          '⚠ Low Stock Alert',
          `${name} (${sku}) added with only ${qty} units — below threshold of ${limit.toLocaleString()} for ${materialCategory}.`,
          'alert',
          'itemmaster'
        );
      }

      addMockLog(getActorString(), 'ADD_ITEM_MASTER', undefined, `Item Master record created: ${name} (${materialCategory})`);

      return newItem;
    },
    getOrders: async () => getOrdersList(),
    createOrder: async (order: any) => {
      const { customer, notes, items } = order;
      if (!customer || !items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Customer and line items are required to place an order.');
      }

      const orders = getOrdersList();
      const orderNumber = `PO-${new Date().getFullYear()}-${String(orders.length + 4).padStart(3, '0')}`;
      const id = `ORD${Date.now()}`;
      const date = new Date().toISOString().split('T')[0];

      let total = 0;
      const mappedItems = items.map(item => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        total += qty * price;
        return {
          productId: item.productId,
          productName: item.productName,
          quantity: qty,
          unitPrice: price,
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          materialCategory: item.materialCategory
        };
      });

      const newOrder = {
        id,
        orderNumber,
        date,
        customer: customer.trim(),
        status: 'Confirmed' as const,
        notes: notes || '',
        items: mappedItems
      };

      saveOrdersList([newOrder, ...orders]);

      // Raise notifications
      addMockNotification(
        `✅ Order Placed`,
        `Order ${orderNumber} for ${customer} confirmed. Total: ₹${total.toLocaleString()}.`,
        'success',
        'orders'
      );

      addMockNotification(
        `📄 BOM Generated`,
        `Bill of Materials auto-generated for ${orderNumber} with ${items.length} line items.`,
        'info',
        'orders'
      );

      addMockLog(getActorString(), 'CREATE_ORDER', undefined, `Order ${orderNumber} created with ${items.length} items. BOM auto-generated.`);

      return newOrder;
    }
  },

  notifications: {
    getNotifications: async () => {
      const user = getLoggedInUser();
      const userEmail = user?.email || '';
      const list = getNotificationsList();
      return list.filter(n => n.targetUserId === 'all' || n.targetUserId.toLowerCase() === userEmail.toLowerCase());
    },
    markRead: async (id: string) => {
      const list = getNotificationsList();
      const idx = list.findIndex(n => n.id === id);
      if (idx !== -1) {
        list[idx].isRead = true;
        saveNotificationsList(list);
      }
      return { success: true };
    },
    markAllRead: async () => {
      const user = getLoggedInUser();
      const userEmail = user?.email || 'all';
      const list = getNotificationsList();
      list.forEach(n => {
        if (n.targetUserId === 'all' || n.targetUserId.toLowerCase() === userEmail.toLowerCase()) {
          n.isRead = true;
        }
      });
      saveNotificationsList(list);
      return { success: true };
    }
  },

  logs: {
    getLogs: async () => getLogsList()
  }
};
