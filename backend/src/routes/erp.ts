import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getDepartments,
  getCategories,
  getEmployees,
  promoteEmployee,
  getAssets,
  registerAsset,
  allocateAsset,
  getBookings,
  createBooking,
  getMaintenance,
  createMaintenance,
  approveMaintenance,
  resolveMaintenance,
  getAudits,
  saveAuditItemStatus,
  getProducts,
  getVendors,
  getItemMasters,
  createItemMaster,
  getOrders,
  createOrder,
  getNotifications,
  markRead,
  markAllRead,
  getLogs
} from '../controllers/erp.js';

const router = Router();

// Org Directory
router.get('/departments', authenticateToken as any, getDepartments as any);
router.get('/categories', authenticateToken as any, getCategories as any);
router.get('/employees', authenticateToken as any, getEmployees as any);
router.post('/employees/promote', [authenticateToken as any, requireRole(['Admin']) as any], promoteEmployee as any);

// Asset Lifecycle
router.get('/assets', authenticateToken as any, getAssets as any);
router.post('/assets', [authenticateToken as any, requireRole(['Admin', 'Asset Manager']) as any], registerAsset as any);
router.post('/assets/allocate', [authenticateToken as any, requireRole(['Admin', 'Asset Manager']) as any], allocateAsset as any);

// Bookings
router.get('/bookings', authenticateToken as any, getBookings as any);
router.post('/bookings', authenticateToken as any, createBooking as any);

// Maintenance
router.get('/maintenance', authenticateToken as any, getMaintenance as any);
router.post('/maintenance', authenticateToken as any, createMaintenance as any);
router.put('/maintenance/:id/approve', [authenticateToken as any, requireRole(['Admin', 'Asset Manager']) as any], approveMaintenance as any);
router.put('/maintenance/:id/resolve', [authenticateToken as any, requireRole(['Admin', 'Asset Manager']) as any], resolveMaintenance as any);

// Physical Audits
router.get('/audits', authenticateToken as any, getAudits as any);
router.post('/audits/save', authenticateToken as any, saveAuditItemStatus as any);

// Procurement & Inventory
router.get('/products', authenticateToken as any, getProducts as any);
router.get('/vendors', authenticateToken as any, getVendors as any);
router.get('/item-masters', authenticateToken as any, getItemMasters as any);
router.post('/item-masters', [authenticateToken as any, requireRole(['Admin', 'Asset Manager']) as any], createItemMaster as any);
router.get('/orders', authenticateToken as any, getOrders as any);
router.post('/orders', [authenticateToken as any, requireRole(['Admin', 'Asset Manager']) as any], createOrder as any);

// Notifications & Compliance Logs
router.get('/notifications', authenticateToken as any, getNotifications as any);
router.put('/notifications/read-all', authenticateToken as any, markAllRead as any);
router.put('/notifications/:id/read', authenticateToken as any, markRead as any);
router.get('/logs', [authenticateToken as any, requireRole(['Admin', 'Asset Manager']) as any], getLogs as any);

export default router;
