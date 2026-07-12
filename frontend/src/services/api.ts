const BASE_URL = 'http://localhost:5001/api';

// Helper to get token
const getHeaders = () => {
  const token = localStorage.getItem('af_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Generic request handler
const request = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

export const api = {
  // Auth
  auth: {
    login: (credentials: any) => 
      request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    signup: (userData: any) => 
      request('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
    forgot: (email: string) => 
      request('/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
    me: () => 
      request('/auth/me')
  },

  // Org Setup
  org: {
    getDepartments: () => request('/departments'),
    getCategories: () => request('/categories'),
    getEmployees: () => request('/employees'),
    promoteEmployee: (email: string) => 
      request('/employees/promote', { method: 'POST', body: JSON.stringify({ email }) })
  },

  // Asset Lifecycle
  assets: {
    getAssets: () => request('/assets'),
    registerAsset: (asset: any) => 
      request('/assets', { method: 'POST', body: JSON.stringify(asset) }),
    allocateAsset: (tag: string, employee: string, returnDate?: string) => 
      request('/assets/allocate', { method: 'POST', body: JSON.stringify({ tag, employee, returnDate }) })
  },

  // Bookings
  bookings: {
    getBookings: () => request('/bookings'),
    createBooking: (booking: any) => 
      request('/bookings', { method: 'POST', body: JSON.stringify(booking) })
  },

  // Maintenance
  maintenance: {
    getMaintenance: () => request('/maintenance'),
    createMaintenance: (ticket: any) => 
      request('/maintenance', { method: 'POST', body: JSON.stringify(ticket) }),
    approveMaintenance: (id: number) => 
      request(`/maintenance/${id}/approve`, { method: 'PUT' }),
    resolveMaintenance: (id: number) => 
      request(`/maintenance/${id}/resolve`, { method: 'PUT' })
  },

  // Physical Audits
  audits: {
    getAudits: () => request('/audits'),
    saveAuditStatus: (cycleId: number, assetTag: string, status: string) => 
      request('/audits/save', { method: 'POST', body: JSON.stringify({ cycleId, assetTag, status }) })
  },

  // Procurement & Inventory
  procurement: {
    getProducts: () => request('/products'),
    getVendors: () => request('/vendors'),
    getItemMasters: () => request('/item-masters'),
    createItemMaster: (item: any) => 
      request('/item-masters', { method: 'POST', body: JSON.stringify(item) }),
    getOrders: () => request('/orders'),
    createOrder: (order: any) => 
      request('/orders', { method: 'POST', body: JSON.stringify(order) })
  },

  // Notifications & Compliance Logs
  notifications: {
    getNotifications: () => request('/notifications'),
    markRead: (id: string) => 
      request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => 
      request('/notifications/read-all', { method: 'PUT' })
  },
  logs: {
    getLogs: () => request('/logs')
  }
};
