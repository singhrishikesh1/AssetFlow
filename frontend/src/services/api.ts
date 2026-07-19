import { mockApi } from './mockApi';

const getBaseUrl = () => {
  const envUrl = (import.meta.env as any).VITE_API_URL;
  if (envUrl) return envUrl;

  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'
    : `http://${window.location.hostname}:5001/api`;
};

const BASE_URL = getBaseUrl();

let isBackendUnreachable = false;

const executeWithFallback = async <T>(apiCall: () => Promise<T>, mockCall: () => Promise<T>): Promise<T> => {
  if (isBackendUnreachable) {
    return mockCall();
  }

  try {
    return await apiCall();
  } catch (err: any) {
    const isNetworkError = err instanceof TypeError || err.message?.includes('Failed to fetch') || err.message?.includes('network');
    if (isNetworkError) {
      console.warn('⚠️ API connection failed. Automatically routing all requests to client-side Mock Storage Fallback.');
      isBackendUnreachable = true;
      return mockCall();
    }
    throw err;
  }
};

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
      executeWithFallback(
        () => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
        () => mockApi.auth.login(credentials)
      ),
    signup: (userData: any) => 
      executeWithFallback(
        () => request('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
        () => mockApi.auth.signup(userData)
      ),
    forgot: (email: string) => 
      executeWithFallback(
        () => request('/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
        () => mockApi.auth.forgot(email)
      ),
    me: () => 
      executeWithFallback(
        () => request('/auth/me'),
        () => mockApi.auth.me()
      )
  },

  // Org Setup
  org: {
    getDepartments: () => 
      executeWithFallback(
        () => request('/departments'),
        () => mockApi.org.getDepartments()
      ),
    getCategories: () => 
      executeWithFallback(
        () => request('/categories'),
        () => mockApi.org.getCategories()
      ),
    getEmployees: () => 
      executeWithFallback(
        () => request('/employees'),
        () => mockApi.org.getEmployees()
      ),
    promoteEmployee: (email: string) => 
      executeWithFallback(
        () => request('/employees/promote', { method: 'POST', body: JSON.stringify({ email }) }),
        () => mockApi.org.promoteEmployee(email)
      )
  },

  // Asset Lifecycle
  assets: {
    getAssets: () => 
      executeWithFallback(
        () => request('/assets'),
        () => mockApi.assets.getAssets()
      ),
    registerAsset: (asset: any) => 
      executeWithFallback(
        () => request('/assets', { method: 'POST', body: JSON.stringify(asset) }),
        () => mockApi.assets.registerAsset(asset)
      ),
    allocateAsset: (tag: string, employee: string, returnDate?: string) => 
      executeWithFallback(
        () => request('/assets/allocate', { method: 'POST', body: JSON.stringify({ tag, employee, returnDate }) }),
        () => mockApi.assets.allocateAsset(tag, employee, returnDate)
      )
  },

  // Bookings
  bookings: {
    getBookings: () => 
      executeWithFallback(
        () => request('/bookings'),
        () => mockApi.bookings.getBookings()
      ),
    createBooking: (booking: any) => 
      executeWithFallback(
        () => request('/bookings', { method: 'POST', body: JSON.stringify(booking) }),
        () => mockApi.bookings.createBooking(booking)
      )
  },

  // Maintenance
  maintenance: {
    getMaintenance: () => 
      executeWithFallback(
        () => request('/maintenance'),
        () => mockApi.maintenance.getMaintenance()
      ),
    createMaintenance: (ticket: any) => 
      executeWithFallback(
        () => request('/maintenance', { method: 'POST', body: JSON.stringify(ticket) }),
        () => mockApi.maintenance.createMaintenance(ticket)
      ),
    approveMaintenance: (id: number) => 
      executeWithFallback(
        () => request(`/maintenance/${id}/approve`, { method: 'PUT' }),
        () => mockApi.maintenance.approveMaintenance(id)
      ),
    resolveMaintenance: (id: number) => 
      executeWithFallback(
        () => request(`/maintenance/${id}/resolve`, { method: 'PUT' }),
        () => mockApi.maintenance.resolveMaintenance(id)
      )
  },

  // Physical Audits
  audits: {
    getAudits: () => 
      executeWithFallback(
        () => request('/audits'),
        () => mockApi.audits.getAudits()
      ),
    saveAuditStatus: (cycleId: number, assetTag: string, status: string) => 
      executeWithFallback(
        () => request('/audits/save', { method: 'POST', body: JSON.stringify({ cycleId, assetTag, status }) }),
        () => mockApi.audits.saveAuditStatus(cycleId, assetTag, status)
      )
  },

  // Procurement & Inventory
  procurement: {
    getProducts: () => 
      executeWithFallback(
        () => request('/products'),
        () => mockApi.procurement.getProducts()
      ),
    getVendors: () => 
      executeWithFallback(
        () => request('/vendors'),
        () => mockApi.procurement.getVendors()
      ),
    getItemMasters: () => 
      executeWithFallback(
        () => request('/item-masters'),
        () => mockApi.procurement.getItemMasters()
      ),
    createItemMaster: (item: any) => 
      executeWithFallback(
        () => request('/item-masters', { method: 'POST', body: JSON.stringify(item) }),
        () => mockApi.procurement.createItemMaster(item)
      ),
    getOrders: () => 
      executeWithFallback(
        () => request('/orders'),
        () => mockApi.procurement.getOrders()
      ),
    createOrder: (order: any) => 
      executeWithFallback(
        () => request('/orders', { method: 'POST', body: JSON.stringify(order) }),
        () => mockApi.procurement.createOrder(order)
      )
  },

  // Notifications & Compliance Logs
  notifications: {
    getNotifications: () => 
      executeWithFallback(
        () => request('/notifications'),
        () => mockApi.notifications.getNotifications()
      ),
    markRead: (id: string) => 
      executeWithFallback(
        () => request(`/notifications/${id}/read`, { method: 'PUT' }),
        () => mockApi.notifications.markRead(id)
      ),
    markAllRead: () => 
      executeWithFallback(
        () => request('/notifications/read-all', { method: 'PUT' }),
        () => mockApi.notifications.markAllRead()
      )
  },
  logs: {
    getLogs: () => 
      executeWithFallback(
        () => request('/logs'),
        () => mockApi.logs.getLogs()
      )
  }
};
