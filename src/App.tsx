import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Laptop, UserCheck, AlertTriangle, 
  Wrench, ClipboardCheck, History, BarChart3, 
  Plus, Search, Check, X, ShieldAlert, Cpu, 
  ArrowRight, QrCode, Clock, Play, FileText, ChevronRight, 
  Trash2, HelpCircle, Eye, Package, ShoppingCart, Printer,
  ChevronLeft, ChevronDown, Tag, MapPin, Store, Filter,
  Layers, Factory, Boxes
} from 'lucide-react';

// Primitives
const AppleLogo: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

// ─────────────────────────────────────────────
//  Existing Interfaces
// ─────────────────────────────────────────────
interface Employee {
  name: string;
  email: string;
  department: string;
  role: 'Employee' | 'Asset Manager' | 'Department Head' | 'Admin';
  status: 'Active' | 'Inactive';
}

interface Department {
  name: string;
  head: string;
  parent: string;
  status: 'Active' | 'Inactive';
}

interface Category {
  name: string;
  warrantyPeriod: number;
  customField?: string;
}

interface Asset {
  tag: string;
  name: string;
  category: string;
  serial: string;
  cost: number;
  condition: 'New' | 'Good' | 'Fair' | 'Damaged' | 'Missing';
  status: 'Available' | 'Allocated' | 'Reserved' | 'Under Maintenance' | 'Lost' | 'Retired' | 'Disposed';
  location: string;
  holder: string;
  shared: boolean;
}

interface Booking {
  id: number;
  resource: string;
  user: string;
  start: string;
  end: string;
  date: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
}

interface MaintenanceRequest {
  id: number;
  assetTag: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Approved' | 'Technician Assigned' | 'In Progress' | 'Resolved';
}

interface AuditItem {
  assetTag: string;
  name: string;
  auditedStatus: 'Unchecked' | 'Verified' | 'Missing' | 'Damaged';
}

interface AuditCycle {
  id: number;
  scope: string;
  auditor: string;
  dateRange: string;
  status: 'Active' | 'Closed';
  items: AuditItem[];
}

interface DeltaLog {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  assetTag?: string;
  detail: string;
}

// ─────────────────────────────────────────────
//  NEW Interfaces — Vendor & Product Module
// ─────────────────────────────────────────────
interface VendorProduct {
  productId: string;
  price: number;
  inStock: boolean;
  minOrderQty: number;
}

interface Vendor {
  id: string;
  name: string;
  shopName: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  products: VendorProduct[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  sku: string;
  unitOfMeasure: string;
}

type MaterialCategory = 'Raw Material' | 'Semi-Finished Material' | 'Finished Material';

interface ItemMaster {
  id: string;
  name: string;
  sku: string;
  materialCategory: MaterialCategory;
  quantity: number;
  rate: number;
  materialLocation: string;
  companyName: string;
  description: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  vendorId: string;
  vendorName: string;
  materialCategory: MaterialCategory;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: string;
  items: OrderItem[];
  status: 'Draft' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  notes: string;
}

// ─────────────────────────────────────────────
//  Seed Data
// ─────────────────────────────────────────────
const SEED_PRODUCTS: Product[] = [
  { id: 'P001', name: 'Steel Rod 12mm', category: 'Raw Material', description: 'High tensile steel rod for structural use', sku: 'SR-12MM-001', unitOfMeasure: 'kg' },
  { id: 'P002', name: 'Copper Wire 2.5mm', category: 'Raw Material', description: 'Electrical grade copper wire', sku: 'CW-25MM-002', unitOfMeasure: 'meter' },
  { id: 'P003', name: 'Industrial Bearing 6205', category: 'Semi-Finished Material', description: 'Deep groove ball bearing for motors', sku: 'IB-6205-003', unitOfMeasure: 'unit' },
  { id: 'P004', name: 'Motor Drive PCB', category: 'Semi-Finished Material', description: 'Partially assembled motor control board', sku: 'PCB-MD-004', unitOfMeasure: 'unit' },
  { id: 'P005', name: 'Hydraulic Pump Assembly', category: 'Finished Material', description: 'Complete hydraulic pump for industrial use', sku: 'HPA-V2-005', unitOfMeasure: 'unit' },
  { id: 'P006', name: 'Stainless Sheet 2mm', category: 'Raw Material', description: '304 grade stainless steel sheet', sku: 'SS-2MM-006', unitOfMeasure: 'sqft' },
  { id: 'P007', name: 'Pneumatic Cylinder 50mm', category: 'Finished Material', description: 'Ready-to-install pneumatic cylinder', sku: 'PC-50MM-007', unitOfMeasure: 'unit' },
  { id: 'P008', name: 'Gear Assembly Kit', category: 'Semi-Finished Material', description: 'Partially machined gear set needing final finish', sku: 'GAK-V1-008', unitOfMeasure: 'set' },
  { id: 'P009', name: 'Aluminium Ingot 99%', category: 'Raw Material', description: 'Primary aluminium ingot for casting', sku: 'AI-99P-009', unitOfMeasure: 'kg' },
  { id: 'P010', name: 'Electric Motor 2HP', category: 'Finished Material', description: 'Single phase induction motor', sku: 'EM-2HP-010', unitOfMeasure: 'unit' },
  { id: 'P011', name: 'PVC Granules', category: 'Raw Material', description: 'Virgin grade PVC resin granules', sku: 'PVC-GR-011', unitOfMeasure: 'kg' },
  { id: 'P012', name: 'Control Panel Box', category: 'Finished Material', description: 'IP65 rated control panel enclosure', sku: 'CPB-IP65-012', unitOfMeasure: 'unit' },
];

const SEED_VENDORS: Vendor[] = [
  {
    id: 'V001', name: 'Ravi Steels Pvt Ltd', shopName: 'Ravi Metal Works',
    location: 'MIDC Phase II, Pune - 411019', contactEmail: 'ravi@ravisteels.com', contactPhone: '+91-9876541001',
    products: [
      { productId: 'P001', price: 82.50, inStock: true, minOrderQty: 100 },
      { productId: 'P006', price: 145.00, inStock: true, minOrderQty: 50 },
      { productId: 'P009', price: 210.00, inStock: false, minOrderQty: 200 },
    ]
  },
  {
    id: 'V002', name: 'Arjun Electricals', shopName: 'AE Electrical Supplies',
    location: 'Industrial Area, Nashik - 422001', contactEmail: 'supply@arjunelec.in', contactPhone: '+91-9876541002',
    products: [
      { productId: 'P002', price: 58.00, inStock: true, minOrderQty: 500 },
      { productId: 'P004', price: 1250.00, inStock: true, minOrderQty: 10 },
      { productId: 'P010', price: 4800.00, inStock: true, minOrderQty: 1 },
    ]
  },
  {
    id: 'V003', name: 'Precision Bearings Co.', shopName: 'PBC Warehouse',
    location: 'Bhosari MIDC, Pune - 411026', contactEmail: 'orders@pbc.co.in', contactPhone: '+91-9876541003',
    products: [
      { productId: 'P003', price: 320.00, inStock: true, minOrderQty: 20 },
      { productId: 'P008', price: 2100.00, inStock: true, minOrderQty: 5 },
    ]
  },
  {
    id: 'V004', name: 'Suresh Hydraulics', shopName: 'SH Fluid Power',
    location: 'Chakan Industrial Zone, Pune - 410501', contactEmail: 'sales@sureshhydraulics.com', contactPhone: '+91-9876541004',
    products: [
      { productId: 'P005', price: 18500.00, inStock: true, minOrderQty: 1 },
      { productId: 'P007', price: 3200.00, inStock: true, minOrderQty: 2 },
    ]
  },
  {
    id: 'V005', name: 'Polymer Solutions Ltd', shopName: 'PSL Depot',
    location: 'Talegaon MIDC, Pune - 412106', contactEmail: 'polymer@psl.in', contactPhone: '+91-9876541005',
    products: [
      { productId: 'P011', price: 95.00, inStock: true, minOrderQty: 500 },
      { productId: 'P012', price: 6800.00, inStock: false, minOrderQty: 1 },
    ]
  },
  {
    id: 'V006', name: 'MegaMetal Traders', shopName: 'MegaMetal Yard',
    location: 'Hadapsar, Pune - 411028', contactEmail: 'trade@megametal.in', contactPhone: '+91-9876541006',
    products: [
      { productId: 'P001', price: 79.00, inStock: true, minOrderQty: 200 },
      { productId: 'P006', price: 138.00, inStock: true, minOrderQty: 100 },
      { productId: 'P009', price: 205.00, inStock: true, minOrderQty: 500 },
    ]
  },
];

const SEED_ITEM_MASTER: ItemMaster[] = [
  { id: 'IM001', name: 'Steel Rod 12mm', sku: 'SR-12MM-001', materialCategory: 'Raw Material', quantity: 500, rate: 80, materialLocation: 'Warehouse A - Rack 3', companyName: 'In-House Production', description: 'Primary raw material for fabrication' },
  { id: 'IM002', name: 'Motor Drive PCB', sku: 'PCB-MD-004', materialCategory: 'Semi-Finished Material', quantity: 25, rate: 1200, materialLocation: 'Assembly Bay - Zone 2', companyName: 'Arjun Electricals', description: 'Requires final component soldering in-house' },
  { id: 'IM003', name: 'Hydraulic Pump Assembly', sku: 'HPA-V2-005', materialCategory: 'Finished Material', quantity: 8, rate: 18000, materialLocation: 'Store Room B - Shelf 1', companyName: 'Suresh Hydraulics', description: 'Fully vendor-manufactured, ready for dispatch' },
  { id: 'IM004', name: 'Copper Wire 2.5mm', sku: 'CW-25MM-002', materialCategory: 'Raw Material', quantity: 2000, rate: 56, materialLocation: 'Warehouse A - Rack 7', companyName: 'In-House Drawn', description: 'Electrical wiring raw stock' },
  { id: 'IM005', name: 'Gear Assembly Kit', sku: 'GAK-V1-008', materialCategory: 'Semi-Finished Material', quantity: 15, rate: 2000, materialLocation: 'Assembly Bay - Zone 4', companyName: 'Precision Bearings Co.', description: 'Requires final balancing and heat treatment in-house' },
];

const SEED_ORDERS: Order[] = [
  {
    id: 'ORD001', orderNumber: 'PO-2026-001', date: '2026-07-10', customer: 'ABC Manufacturing Ltd', status: 'Confirmed', notes: 'Urgent delivery required',
    items: [
      { productId: 'P001', productName: 'Steel Rod 12mm', quantity: 500, unitPrice: 82.50, vendorId: 'V001', vendorName: 'Ravi Steels Pvt Ltd', materialCategory: 'Raw Material' },
      { productId: 'P003', productName: 'Industrial Bearing 6205', quantity: 50, unitPrice: 320.00, vendorId: 'V003', vendorName: 'Precision Bearings Co.', materialCategory: 'Semi-Finished Material' },
    ]
  },
];

// ─────────────────────────────────────────────
//  Material Category Config
// ─────────────────────────────────────────────
const MATERIAL_CATEGORY_CONFIG: Record<MaterialCategory, { color: string; bg: string; border: string; icon: string; description: string }> = {
  'Raw Material': {
    color: 'text-sky-400', bg: 'bg-sky-950/40', border: 'border-sky-800/40',
    icon: '🔵',
    description: '100% manufactured / processed in-house by the company'
  },
  'Semi-Finished Material': {
    color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800/40',
    icon: '🟡',
    description: 'Partially made in-house & partially processed by a vendor'
  },
  'Finished Material': {
    color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/40',
    icon: '🟢',
    description: '100% manufactured / processed by the vendor'
  },
};

const ITEMS_PER_PAGE = 10;

export default function App() {
  // ─── Existing State ───────────────────────────────────────────
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('af_employees');
    return saved ? JSON.parse(saved) : [
      { name: 'Priya Sharma', email: 'priya@assetflow.com', department: 'Engineering', role: 'Employee', status: 'Active' },
      { name: 'Alex Mercer', email: 'alex@assetflow.com', department: 'Operations', role: 'Asset Manager', status: 'Active' },
      { name: 'Raj Patel', email: 'raj@assetflow.com', department: 'Design', role: 'Employee', status: 'Active' },
      { name: 'Sarah Jenkins', email: 'sarah@assetflow.com', department: 'Audit & Compliance', role: 'Employee', status: 'Active' },
      { name: 'Marcus Brody', email: 'marcus@assetflow.com', department: 'Operations', role: 'Department Head', status: 'Active' },
      { name: 'Rishikesh Singh', email: 'admin@assetflow.com', department: 'Operations', role: 'Admin', status: 'Active' },
    ];
  });

  const [credentials, setCredentials] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('af_credentials');
    return saved ? JSON.parse(saved) : {
      'admin@assetflow.com': 'admin123',
      'alex@assetflow.com': 'alex123',
      'marcus@assetflow.com': 'marcus123',
      'priya@assetflow.com': 'priya123',
      'raj@assetflow.com': 'raj123',
      'sarah@assetflow.com': 'sarah123',
    };
  });

  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('af_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'org' | 'assets' | 'allocations' | 'maintenance' | 'audit' | 'logs' | 'products' | 'orders' | 'itemmaster'>('dashboard');
  const [currentMenuTime, setCurrentMenuTime] = useState('Wed May 6 1:09 PM');
  const [orgSubTab, setOrgSubTab] = useState<'departments' | 'categories' | 'employees'>('departments');

  const [departments, setDepartments] = useState<Department[]>([
    { name: 'Engineering', head: 'Marcus Brody', parent: 'None', status: 'Active' },
    { name: 'Design', head: 'Raj Patel', parent: 'Engineering', status: 'Active' },
    { name: 'Operations', head: 'Alex Mercer', parent: 'None', status: 'Active' },
    { name: 'Audit & Compliance', head: 'Sarah Jenkins', parent: 'Operations', status: 'Active' },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { name: 'Electronics', warrantyPeriod: 365, customField: 'CPU / RAM specs' },
    { name: 'Furniture', warrantyPeriod: 1095, customField: 'Material type' },
    { name: 'Vehicles', warrantyPeriod: 730, customField: 'License Plate' },
    { name: 'Office Spaces', warrantyPeriod: 0, customField: 'Capacity' },
  ]);

  const [assets, setAssets] = useState<Asset[]>([
    { tag: 'AF-0114', name: 'MacBook Pro M3', category: 'Electronics', serial: 'S/N 83B4F83', cost: 2500, condition: 'New', status: 'Allocated', location: 'HQ - Floor 3', holder: 'Priya Sharma', shared: false },
    { tag: 'AF-0341', name: 'Dell XPS 15', category: 'Electronics', serial: 'S/N 29A4D19', cost: 1800, condition: 'Good', status: 'Available', location: 'HQ - Floor 2', holder: 'None', shared: false },
    { tag: 'AF-0883', name: 'Herman Miller Aeron', category: 'Furniture', serial: 'S/N 12B8C73', cost: 1200, condition: 'Good', status: 'Available', location: 'HQ - Room A1', holder: 'None', shared: false },
    { tag: 'AF-1002', name: 'Conference Room B2', category: 'Office Spaces', serial: 'LOC-B2', cost: 0, condition: 'New', status: 'Available', location: 'HQ - Floor 1', holder: 'Shared', shared: true },
    { tag: 'AF-0220', name: 'Tesla Model 3', category: 'Vehicles', serial: 'PLATE-AURA', cost: 42000, condition: 'Good', status: 'Available', location: 'Garage A', holder: 'Shared', shared: true },
  ]);

  const [bookings, setBookings] = useState<Booking[]>([
    { id: 1, resource: 'Conference Room B2', user: 'Raj Patel', start: '09:00', end: '10:00', date: '2026-07-12', status: 'Ongoing' },
  ]);

  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([
    { id: 1, assetTag: 'AF-0341', description: 'Keyboard double space defect', priority: 'Medium', status: 'Pending' },
  ]);

  const [audits, setAudits] = useState<AuditCycle[]>([
    {
      id: 12, scope: 'Engineering Department', auditor: 'Sarah Jenkins',
      dateRange: '2026-07-10 - 2026-07-15', status: 'Active',
      items: [
        { assetTag: 'AF-0114', name: 'MacBook Pro M3', auditedStatus: 'Unchecked' },
        { assetTag: 'AF-0341', name: 'Dell XPS 15', auditedStatus: 'Unchecked' },
        { assetTag: 'AF-0883', name: 'Herman Miller Aeron', auditedStatus: 'Unchecked' },
      ],
    }
  ]);

  const [deltaLogs, setDeltaLogs] = useState<DeltaLog[]>([
    { id: 1, timestamp: '09:04:12 AM', actor: 'System Seed Engine', action: 'INITIALIZE_DB', detail: 'Pre-populated core assets, employee directory, and departments.' },
    { id: 2, timestamp: '09:04:45 AM', actor: 'Marcus Brody (Admin)', action: 'ROLE_ELEVATION', detail: 'Priya Sharma promoted to Asset Manager permissions.' }
  ]);

  // ─── NEW State — Products / Vendors / Orders / Item Master ────
  const [products] = useState<Product[]>(() => {
    const saved = localStorage.getItem('af_products');
    return saved ? JSON.parse(saved) : SEED_PRODUCTS;
  });

  const [vendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('af_vendors');
    return saved ? JSON.parse(saved) : SEED_VENDORS;
  });

  const [itemMasters, setItemMasters] = useState<ItemMaster[]>(() => {
    const saved = localStorage.getItem('af_item_masters');
    return saved ? JSON.parse(saved) : SEED_ITEM_MASTER;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('af_orders');
    return saved ? JSON.parse(saved) : SEED_ORDERS;
  });

  // ─── Products Tab UI State ─────────────────────────────────────
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [pricePreset, setPricePreset] = useState<'all' | 'under100' | '100to500' | 'over500' | 'custom'>('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // ─── Orders Tab UI State ───────────────────────────────────────
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [activeBOM, setActiveBOM] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    notes: '',
    items: [] as OrderItem[],
  });
  const [orderItemForm, setOrderItemForm] = useState({
    productId: 'P001',
    vendorId: 'V001',
    quantity: 1,
    unitPrice: 0,
  });

  // ─── Item Master Tab UI State ──────────────────────────────────
  const [itemMasterModalOpen, setItemMasterModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<ItemMaster, 'id'>>({
    name: '', sku: '', materialCategory: 'Raw Material',
    quantity: 0, rate: 0, materialLocation: '', companyName: '', description: ''
  });

  // ─── Auth State ────────────────────────────────────────────────
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authDept, setAuthDept] = useState('Engineering');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // ─── Existing Modal State ──────────────────────────────────────
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', category: 'Electronics', serial: '', cost: '', location: '', condition: 'New' as any, shared: false });
  const [allocForm, setAllocForm] = useState({ assetTag: 'AF-0341', employee: 'Raj Patel', returnDate: '' });
  const [bookForm, setBookForm] = useState({ resource: 'Conference Room B2', employee: 'Raj Patel', start: '10:00', end: '11:00', date: '2026-07-12' });
  const [maintForm, setMaintForm] = useState({ assetTag: 'AF-0114', description: '', priority: 'Medium' as any });
  const [conflictAsset, setConflictAsset] = useState<Asset | null>(null);
  const [conflictForm, setConflictForm] = useState<any>(null);
  const [pendingHandover, setPendingHandover] = useState<{ asset: Asset; employee: string; returnDate: string } | null>(null);
  const [selectedAuditAssetTag, setSelectedAuditAssetTag] = useState<string | null>(null);
  const [scannedAssetDetails, setScannedAssetDetails] = useState<Asset | null>(null);
  const [auditVerified, setAuditVerified] = useState<'unscanned' | 'verifying' | 'verified' | 'damaged' | 'missing'>('unscanned');

  // ─── Persistence Effects ───────────────────────────────────────
  useEffect(() => { localStorage.setItem('af_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('af_credentials', JSON.stringify(credentials)); }, [credentials]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('af_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('af_current_user');
  }, [currentUser]);
  useEffect(() => { localStorage.setItem('af_item_masters', JSON.stringify(itemMasters)); }, [itemMasters]);
  useEffect(() => { localStorage.setItem('af_orders', JSON.stringify(orders)); }, [orders]);

  // ─── Tab Role Restrictions ─────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const allowedTabs: Record<string, string[]> = {
      'Admin': ['dashboard', 'org', 'assets', 'allocations', 'maintenance', 'audit', 'logs', 'products', 'orders', 'itemmaster'],
      'Asset Manager': ['dashboard', 'assets', 'allocations', 'maintenance', 'audit', 'logs', 'products', 'orders', 'itemmaster'],
      'Department Head': ['dashboard', 'assets', 'allocations', 'maintenance', 'audit'],
      'Employee': ['dashboard', 'assets', 'allocations', 'maintenance', 'audit']
    };
    const allowed = allowedTabs[currentUser.role] || ['dashboard'];
    if (!allowed.includes(activeTab)) setActiveTab('dashboard');
  }, [currentUser, activeTab]);

  // ─── Auto-clock ────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      setCurrentMenuTime(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', ''));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────
  const addLog = (actor: string, action: string, assetTag: string | undefined, detail: string) => {
    const activeActor = currentUser ? `${currentUser.name} (${currentUser.role})` : actor;
    const newEntry: DeltaLog = { id: Date.now(), timestamp: new Date().toLocaleTimeString(), actor: activeActor, action, assetTag, detail };
    setDeltaLogs(prev => [newEntry, ...prev]);
  };

  // ─── Product Filtering Logic ───────────────────────────────────
  const getVendorsForProduct = (productId: string) =>
    vendors.filter(v => v.products.some(p => p.productId === productId));

  const getProductVendorEntry = (vendorId: string, productId: string) =>
    vendors.find(v => v.id === vendorId)?.products.find(p => p.productId === productId);

  const getMinPriceForProduct = (productId: string): number => {
    const prices = vendors.flatMap(v => v.products.filter(p => p.productId === productId).map(p => p.price));
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = productSearch === '' ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const minPrice = getMinPriceForProduct(p.id);
    let matchPrice = true;
    if (pricePreset === 'under100') matchPrice = minPrice < 100;
    else if (pricePreset === '100to500') matchPrice = minPrice >= 100 && minPrice <= 500;
    else if (pricePreset === 'over500') matchPrice = minPrice > 500;
    else if (pricePreset === 'custom') {
      const min = priceMin !== '' ? Number(priceMin) : 0;
      const max = priceMax !== '' ? Number(priceMax) : Infinity;
      matchPrice = minPrice >= min && minPrice <= max;
    }
    return matchSearch && matchCat && matchPrice;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const productCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [productSearch, productCategoryFilter, pricePreset, priceMin, priceMax]);

  // ─── Order Item Form Logic ─────────────────────────────────────
  const availableVendorsForItem = vendors.filter(v => v.products.some(p => p.productId === orderItemForm.productId));

  useEffect(() => {
    if (availableVendorsForItem.length > 0) {
      const vendor = availableVendorsForItem[0];
      const vendorProduct = vendor.products.find(p => p.productId === orderItemForm.productId);
      setOrderItemForm(prev => ({ ...prev, vendorId: vendor.id, unitPrice: vendorProduct?.price || 0 }));
    }
  }, [orderItemForm.productId]);

  useEffect(() => {
    const vendor = vendors.find(v => v.id === orderItemForm.vendorId);
    const vendorProduct = vendor?.products.find(p => p.productId === orderItemForm.productId);
    if (vendorProduct) setOrderItemForm(prev => ({ ...prev, unitPrice: vendorProduct.price }));
  }, [orderItemForm.vendorId]);

  const addItemToOrder = () => {
    const product = products.find(p => p.id === orderItemForm.productId);
    const vendor = vendors.find(v => v.id === orderItemForm.vendorId);
    if (!product || !vendor) return;
    const matCat = (product.category as MaterialCategory) || 'Raw Material';
    const orderItem: OrderItem = {
      productId: product.id, productName: product.name,
      quantity: orderItemForm.quantity, unitPrice: orderItemForm.unitPrice,
      vendorId: vendor.id, vendorName: vendor.name,
      materialCategory: matCat,
    };
    setNewOrder(prev => ({ ...prev, items: [...prev.items, orderItem] }));
  };

  const removeItemFromOrder = (idx: number) => {
    setNewOrder(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrder.items.length === 0) { alert('Please add at least one item to the order.'); return; }
    const orderNum = `PO-${new Date().getFullYear()}-${String(orders.length + 2).padStart(3, '0')}`;
    const created: Order = {
      id: `ORD${Date.now()}`, orderNumber: orderNum,
      date: new Date().toISOString().split('T')[0],
      customer: newOrder.customer, items: newOrder.items,
      status: 'Confirmed', notes: newOrder.notes,
    };
    setOrders(prev => [created, ...prev]);
    setActiveBOM(created);
    addLog('System', 'CREATE_ORDER', undefined, `Order ${orderNum} created with ${newOrder.items.length} items. BOM auto-generated.`);
    setNewOrder({ customer: '', notes: '', items: [] });
    setOrderModalOpen(false);
  };

  const handlePrintBOM = () => { window.print(); };

  const handleAddItemMaster = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ItemMaster = { ...newItem, id: `IM${Date.now()}` };
    setItemMasters(prev => [item, ...prev]);
    addLog('System', 'ADD_ITEM_MASTER', undefined, `Item Master record created: ${item.name} (${item.materialCategory})`);
    setNewItem({ name: '', sku: '', materialCategory: 'Raw Material', quantity: 0, rate: 0, materialLocation: '', companyName: '', description: '' });
    setItemMasterModalOpen(false);
  };

  // ─── Existing Handlers ─────────────────────────────────────────
  const handleRegisterAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = `AF-0${assets.length + 101}`;
    const assetToAdd: Asset = { tag, name: newAsset.name, category: newAsset.category, serial: newAsset.serial, cost: Number(newAsset.cost) || 0, condition: newAsset.condition, status: 'Available', location: newAsset.location, holder: newAsset.shared ? 'Shared' : 'None', shared: newAsset.shared };
    setAssets(prev => [...prev, assetToAdd]);
    addLog('Alex Mercer (Asset Manager)', 'REGISTER_ASSET', tag, `Registered new asset [${assetToAdd.name}] in category [${assetToAdd.category}]`);
    setNewAsset({ name: '', category: 'Electronics', serial: '', cost: '', location: '', condition: 'New', shared: false });
    setRegisterModalOpen(false);
  };

  const handleAllocateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.tag === allocForm.assetTag);
    if (!asset) return;
    if (asset.status !== 'Available') { setConflictAsset(asset); setConflictForm(allocForm); setAllocationModalOpen(false); return; }
    setPendingHandover({ asset, employee: allocForm.employee, returnDate: allocForm.returnDate });
    setAllocationModalOpen(false);
  };

  const executeAllocation = (tag: string, employee: string, returnDate: string) => {
    setAssets(prev => prev.map(a => a.tag === tag ? { ...a, status: 'Allocated', holder: employee } : a));
    addLog('Alex Mercer (Asset Manager)', 'ALLOCATE_ASSET', tag, `Allocated asset to ${employee}. Expected return date: ${returnDate || 'Indefinite'}`);
    setPendingHandover(null);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const { resource, start, end } = bookForm;
    const hasOverlap = bookings.some(b => b.resource === resource && b.status !== 'Cancelled' && (start < b.end) && (end > b.start));
    if (hasOverlap) { alert(`Booking Conflict: ${resource} is already booked during this time-slot.`); return; }
    const newBook: Booking = { id: Date.now(), resource, user: bookForm.employee, start, end, date: bookForm.date, status: 'Upcoming' };
    setBookings(prev => [...prev, newBook]);
    setAssets(prev => prev.map(a => a.name === resource ? { ...a, status: 'Reserved' } : a));
    addLog(bookForm.employee, 'BOOK_RESOURCE', undefined, `Booked shared resource [${resource}] on ${bookForm.date} from ${start} to ${end}.`);
    setBookingModalOpen(false);
  };

  const handleMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: MaintenanceRequest = { id: Date.now(), assetTag: maintForm.assetTag, description: maintForm.description, priority: maintForm.priority, status: 'Pending' };
    setMaintenance(prev => [...prev, newTicket]);
    addLog('System Scheduler', 'RAISE_MAINTENANCE', maintForm.assetTag, `Raised repair ticket for [${maintForm.assetTag}]: "${maintForm.description}"`);
    setMaintForm({ assetTag: 'AF-0114', description: '', priority: 'Medium' });
    setMaintenanceModalOpen(false);
  };

  const approveMaintenance = (ticketId: number) => {
    let assetTag = '';
    setMaintenance(prev => prev.map(t => { if (t.id === ticketId) { assetTag = t.assetTag; return { ...t, status: 'Approved' }; } return t; }));
    setAssets(prev => prev.map(a => a.tag === assetTag ? { ...a, status: 'Under Maintenance' } : a));
    addLog('Alex Mercer (Asset Manager)', 'APPROVE_MAINTENANCE', assetTag, `State shift: Status changed from [Available] to [Under Maintenance]`);
  };

  const resolveMaintenance = (ticketId: number) => {
    let assetTag = '';
    setMaintenance(prev => prev.map(t => { if (t.id === ticketId) { assetTag = t.assetTag; return { ...t, status: 'Resolved' }; } return t; }));
    setAssets(prev => prev.map(a => a.tag === assetTag ? { ...a, status: 'Available' } : a));
    addLog('Alex Mercer (Asset Manager)', 'RESOLVE_MAINTENANCE', assetTag, `State shift: Status changed from [Under Maintenance] to [Available]`);
  };

  const handleAuditorScan = (tag: string) => {
    const asset = assets.find(a => a.tag === tag);
    if (!asset) return;
    setSelectedAuditAssetTag(tag);
    setScannedAssetDetails(asset);
    setAuditVerified('scanned' as any);
  };

  const saveAuditStatus = (status: 'Verified' | 'Missing' | 'Damaged') => {
    if (!selectedAuditAssetTag) return;
    setAudits(prev => prev.map(cycle => cycle.id === 12 ? { ...cycle, items: cycle.items.map(item => item.assetTag === selectedAuditAssetTag ? { ...item, auditedStatus: status } : item) } : cycle));
    setAssets(prev => prev.map(a => {
      if (a.tag === selectedAuditAssetTag) {
        if (status === 'Missing') return { ...a, status: 'Lost' as any, condition: 'Missing' };
        if (status === 'Damaged') return { ...a, status: 'Available', condition: 'Damaged' };
        return { ...a, condition: 'Good' };
      }
      return a;
    }));
    if (status === 'Damaged') {
      setMaintenance(prev => [...prev, { id: Date.now(), assetTag: selectedAuditAssetTag, description: `Audit Flag: Reported damaged during cycle #12`, priority: 'High', status: 'Pending' }]);
      addLog('Sarah Jenkins (Auditor)', 'AUDIT_FLAG_DISCREPANCY', selectedAuditAssetTag, `Audited condition: Damaged. Auto-generated maintenance ticket.`);
    } else {
      addLog('Sarah Jenkins (Auditor)', 'AUDIT_VERIFY', selectedAuditAssetTag, `Audited condition: ${status}`);
    }
    setAuditVerified('unscanned');
    setSelectedAuditAssetTag(null);
    setScannedAssetDetails(null);
  };

  const handlePromoteRole = (email: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.email === email) {
        const nextRole = emp.role === 'Employee' ? 'Asset Manager' : emp.role === 'Asset Manager' ? 'Department Head' : emp.role === 'Department Head' ? 'Admin' : 'Employee';
        addLog('Marcus Brody (Admin)', 'USER_PROMOTION', undefined, `Elevated ${emp.name} role level to [${nextRole}]`);
        const updated = { ...emp, role: nextRole };
        if (currentUser && currentUser.email === email) setCurrentUser(updated);
        return updated;
      }
      return emp;
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(''); setAuthSuccess('');
    const email = authEmail.trim().toLowerCase();
    if (!email || !authPassword) { setAuthError('Please fill in all fields.'); return; }
    if (credentials[email] === authPassword) {
      const user = employees.find(emp => emp.email.toLowerCase() === email);
      if (user) {
        if (user.status === 'Inactive') { setAuthError('Your account has been deactivated.'); return; }
        setCurrentUser(user); setAuthEmail(''); setAuthPassword('');
        addLog(`${user.name} (${user.role})`, 'USER_LOGIN', undefined, `Logged in successfully.`);
      } else { setAuthError('User record not found.'); }
    } else { setAuthError('Invalid email or password.'); }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(''); setAuthSuccess('');
    const name = authName.trim(); const email = authEmail.trim().toLowerCase();
    if (!name || !email || !authPassword || !authConfirmPassword) { setAuthError('Please fill in all fields.'); return; }
    if (authPassword !== authConfirmPassword) { setAuthError('Passwords do not match.'); return; }
    if (credentials[email]) { setAuthError('An account with this email already exists.'); return; }
    const newEmp: Employee = { name, email, department: authDept, role: 'Employee', status: 'Active' };
    setEmployees(prev => [...prev, newEmp]);
    setCredentials(prev => ({ ...prev, [email]: authPassword }));
    setCurrentUser(newEmp);
    setAuthName(''); setAuthEmail(''); setAuthPassword(''); setAuthConfirmPassword('');
    setDeltaLogs(prev => [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), actor: `${name} (Employee)`, action: 'USER_SIGNUP', detail: `Created a new Employee account and joined ${authDept} department.` }, ...prev]);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(''); setAuthSuccess('');
    const email = authEmail.trim().toLowerCase();
    if (!email) { setAuthError('Please enter your email.'); return; }
    if (credentials[email]) setAuthSuccess(`Password recovery: The password for this account is [${credentials[email]}]`);
    else setAuthError('No registered account found with this email.');
  };

  const handleLogout = () => {
    if (currentUser) addLog(`${currentUser.name} (${currentUser.role})`, 'USER_LOGOUT', undefined, `Logged out from session.`);
    setCurrentUser(null);
  };

  // ─── BOM Computed Values ───────────────────────────────────────
  const bomTotal = (order: Order) => order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  // ─────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white font-sans selection:bg-brand/30 selection:text-white">
      
      {/* Global Background Video */}
      <div className="fixed inset-0 z-0 pointer-events-none no-print">
        <video autoPlay loop muted playsInline
          className="w-full h-full object-cover pointer-events-none opacity-20"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4" />
      </div>

      {/* Grid borders */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/5 z-[5] no-print" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/5 z-[5] no-print" />

      {currentUser === null ? (
        /* ================= LOGIN SCREEN ================= */
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
          <div className="flex flex-col items-center mb-6 text-center animate-fade-in">
            <Cpu className="w-12 h-12 text-white mb-4 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase text-white">AssetFlow</h1>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-2">Enterprise Asset &amp; Resource Management</span>
          </div>
          <div className="premium-glass p-8 rounded-3xl border border-white/10 w-full max-w-md text-left font-mono">
            {authMode !== 'forgot' && (
              <div className="flex gap-4 border-b border-white/5 pb-4 mb-6">
                <button type="button" onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthSuccess(''); }} className={`flex-1 py-2 text-center text-xs font-semibold uppercase tracking-wider rounded-lg transition ${authMode === 'signin' ? 'bg-white/10 text-white border border-white/10' : 'text-white/50 hover:text-white'}`}>Sign In</button>
                <button type="button" onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }} className={`flex-1 py-2 text-center text-xs font-semibold uppercase tracking-wider rounded-lg transition ${authMode === 'signup' ? 'bg-white/10 text-white border border-white/10' : 'text-white/50 hover:text-white'}`}>Sign Up</button>
              </div>
            )}
            {authError && <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-xl mb-4 font-sans flex items-center gap-2"><ShieldAlert className="w-4 h-4 shrink-0" /><span>{authError}</span></div>}
            {authSuccess && <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs rounded-xl mb-4 font-sans flex items-center gap-2"><Check className="w-4 h-4 shrink-0" /><span>{authSuccess}</span></div>}
            {authMode === 'signin' && (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Email Address</label><input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="e.g. admin@assetflow.com" /></div>
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Password</label><input type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="••••••••" /></div>
                <div className="flex justify-end"><button type="button" onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthSuccess(''); }} className="text-[10px] text-brand hover:underline font-semibold">Forgot Password?</button></div>
                <button type="submit" className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider rounded-lg transition mt-4 shadow-lg shadow-brand/20">Log In</button>
                <div className="text-center pt-3 text-[10px] text-zinc-500 font-sans border-t border-white/5 mt-2">Demo Admin: <span className="text-zinc-400">admin@assetflow.com</span> / <span className="text-zinc-400">admin123</span></div>
              </form>
            )}
            {authMode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4 text-xs">
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Full Name</label><input type="text" required value={authName} onChange={e => setAuthName(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="e.g. John Doe" /></div>
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Email Address</label><input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="e.g. john@assetflow.com" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Password</label><input type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="••••••••" /></div>
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Confirm Password</label><input type="password" required value={authConfirmPassword} onChange={e => setAuthConfirmPassword(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="••••••••" /></div>
                </div>
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Department</label><select value={authDept} onChange={e => setAuthDept(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"><option value="Engineering">Engineering</option><option value="Design">Design</option><option value="Operations">Operations</option><option value="Audit & Compliance">Audit &amp; Compliance</option></select></div>
                <button type="submit" className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider rounded-lg transition mt-4">Create Account</button>
              </form>
            )}
            {authMode === 'forgot' && (
              <form onSubmit={handleForgot} className="space-y-4 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 pb-2 border-b border-white/5 mb-2">Recover Password</h4>
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Account Email</label><input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="e.g. admin@assetflow.com" /></div>
                <button type="submit" className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider rounded-lg transition mt-2">Retrieve Password</button>
                <button type="button" onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthSuccess(''); }} className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider rounded-lg transition mt-2">Back to Sign In</button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* ================= AUTHENTICATED LAYOUT ================= */
        <>
          {/* macOS Top Bar */}
          <div className="relative z-20 w-full h-10 bg-black/50 backdrop-blur-md border-b border-white/10 no-print">
            <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-4">
                <AppleLogo className="w-3.5 h-3.5 text-zinc-300 stroke-[2.5]" />
                <span className="font-extrabold uppercase tracking-wide text-zinc-400">AssetFlow</span>
              </div>
              <div className="flex items-center gap-3 text-white/50">
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 text-[9px] uppercase font-bold tracking-wide">Active Session: {currentUser.role}</span>
                <span className="font-mono text-[10px] tracking-widest">{currentMenuTime}</span>
              </div>
            </div>
          </div>

          <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
            
            {/* ─── Left Sidebar ─── */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-6 no-print">
              <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left">
                <div className="flex items-center gap-2.5 mb-6">
                  <Cpu className="w-5 h-5 text-white animate-pulse" />
                  <div>
                    <h1 className="text-sm font-bold tracking-wide uppercase font-mono leading-none">AssetFlow</h1>
                    <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">ERP Engine</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
                    { id: 'org', label: 'Organization Setup', icon: Building2, roles: ['Admin'] },
                    { id: 'assets', label: 'Asset Registry', icon: Laptop, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
                    { id: 'allocations', label: 'Allocations & Buffer', icon: Clock, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
                    { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
                    { id: 'audit', label: 'Physical Audit (QR)', icon: ClipboardCheck, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
                    { id: 'logs', label: 'Delta Logs', icon: History, roles: ['Admin', 'Asset Manager'] },
                    { id: 'products', label: 'Products & Vendors', icon: Package, roles: ['Admin', 'Asset Manager'] },
                    { id: 'orders', label: 'Orders & BOM', icon: ShoppingCart, roles: ['Admin', 'Asset Manager'] },
                    { id: 'itemmaster', label: 'Item Master', icon: Layers, roles: ['Admin', 'Asset Manager'] },
                  ]
                  .filter(tab => tab.roles.includes(currentUser.role))
                  .map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition ${activeTab === tab.id ? 'bg-brand text-white shadow shadow-brand/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                      <tab.icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left space-y-3">
                <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold font-mono">Quick Operations</span>
                <div className="flex flex-col gap-2">
                  {(currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') && (
                    <>
                      <button onClick={() => setRegisterModalOpen(true)} className="w-full py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"><Plus className="w-3.5 h-3.5" />Register Asset</button>
                      <button onClick={() => setAllocationModalOpen(true)} className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"><ArrowRight className="w-3.5 h-3.5 text-brand" />Allocate Asset</button>
                      <button onClick={() => setOrderModalOpen(true)} className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"><ShoppingCart className="w-3.5 h-3.5 text-purple-400" />New Order / BOM</button>
                    </>
                  )}
                  <button onClick={() => setBookingModalOpen(true)} className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"><Clock className="w-3.5 h-3.5 text-indigo-400" />Book Resource</button>
                  {(currentUser.role === 'Admin' || currentUser.role === 'Employee') && (
                    <button onClick={() => setMaintenanceModalOpen(true)} className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"><Wrench className="w-3.5 h-3.5 text-amber-400" />Raise Maintenance</button>
                  )}
                </div>
              </div>

              {/* User Profile Card */}
              <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold font-mono">Logged In As</span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="w-8 h-8 rounded-full bg-zinc-850 flex items-center justify-center font-bold text-xs uppercase text-zinc-300 border border-white/10">{currentUser.name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate text-white leading-tight">{currentUser.name}</h4>
                      <p className="text-[9px] text-zinc-500 truncate leading-tight font-mono mt-0.5">{currentUser.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-[10px] border-t border-b border-white/5 py-3 my-2">
                  <div className="flex justify-between items-center"><span className="text-zinc-500">Department:</span><span className="text-zinc-300 font-semibold">{currentUser.department}</span></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-500">Role:</span><span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${currentUser.role === 'Admin' ? 'bg-red-950/60 text-red-400 border border-red-900/30' : currentUser.role === 'Asset Manager' ? 'bg-brand/10 text-brand border border-brand/20' : currentUser.role === 'Department Head' ? 'bg-purple-950/60 text-purple-400 border border-purple-900/30' : 'bg-zinc-900 text-zinc-400'}`}>{currentUser.role}</span></div>
                </div>
                <button onClick={handleLogout} className="w-full py-2 border border-red-900/30 hover:border-red-500 bg-red-950/10 hover:bg-red-950/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition">Log Out</button>
              </div>
            </div>

            {/* ─── Right Content Pane ─── */}
            <div className="flex-1 min-w-0">

              {/* ═══════════════════════════════════════════════════
                  TAB: DASHBOARD
              ═══════════════════════════════════════════════════ */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="premium-glass p-8 rounded-3xl border border-white/5 text-left flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(400px_circle_at_100%_0%,rgba(61,129,227,0.15),transparent_70%)] pointer-events-none" />
                    <span className="text-[10px] bg-brand/10 border border-brand/20 text-brand px-3 py-1 rounded-full uppercase tracking-wider font-mono font-bold inline-self-start w-fit">Live Operations Status</span>
                    <h2 className="text-3xl md:text-5xl font-black mt-4 tracking-tight leading-none uppercase">Asset Lifecycle <br /><span className="bg-gradient-to-r from-brand via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Central Command</span></h2>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Available', value: assets.filter(a => a.status === 'Available').length, color: 'text-emerald-400', bg: 'bg-emerald-950/20' },
                      { label: 'Allocated', value: assets.filter(a => a.status === 'Allocated').length, color: 'text-brand', bg: 'bg-brand/10' },
                      { label: 'Servicing', value: assets.filter(a => a.status === 'Under Maintenance').length, color: 'text-amber-400', bg: 'bg-amber-950/20' },
                      { label: 'Active Bookings', value: bookings.filter(b => b.status === 'Ongoing').length, color: 'text-indigo-400', bg: 'bg-indigo-950/20' },
                    ].map(kpi => (
                      <div key={kpi.label} className={`premium-glass p-5 rounded-2xl border border-white/5 text-left ${kpi.bg}`}>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wide">{kpi.label}</span>
                        <h3 className={`text-3xl font-extrabold font-mono mt-2 ${kpi.color}`}>{kpi.value}</h3>
                      </div>
                    ))}
                  </div>
                  {/* New KPIs for vendor module */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Products Catalogued', value: products.length, color: 'text-purple-400', bg: 'bg-purple-950/20' },
                      { label: 'Active Vendors', value: vendors.length, color: 'text-cyan-400', bg: 'bg-cyan-950/20' },
                      { label: 'Item Master Records', value: itemMasters.length, color: 'text-rose-400', bg: 'bg-rose-950/20' },
                    ].map(kpi => (
                      <div key={kpi.label} className={`premium-glass p-5 rounded-2xl border border-white/5 text-left ${kpi.bg}`}>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wide">{kpi.label}</span>
                        <h3 className={`text-3xl font-extrabold font-mono mt-2 ${kpi.color}`}>{kpi.value}</h3>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-8 premium-glass p-6 rounded-2xl border border-white/5 text-left">
                      <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-4"><ShieldAlert className="w-5 h-5 text-red-500" /><h3 className="text-sm font-bold uppercase tracking-wider font-mono">Overdue Returns &amp; Warnings</h3></div>
                      <div className="space-y-3">
                        {(currentUser.role === 'Admin' || currentUser.role === 'Asset Manager' || currentUser.name === 'Priya Sharma') && (
                          <div className="p-3 bg-red-950/10 border border-red-900/30 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex flex-col gap-0.5"><span className="text-red-400 font-bold uppercase tracking-wider font-mono text-[9px]">OVERDUE RETURN</span><span className="text-zinc-200">MacBook Pro M3 (AF-0114) with Priya Sharma</span></div>
                            <span className="font-mono text-zinc-500 text-[10px]">Expected: 2026-06-30</span>
                          </div>
                        )}
                        <div className="p-3 bg-amber-950/10 border border-amber-900/30 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex flex-col gap-0.5"><span className="text-amber-400 font-bold uppercase tracking-wider font-mono text-[9px]">PREDICTIVE MAINTENANCE</span><span className="text-zinc-200">3 Electronic category assets due for service calibration</span></div>
                          <span className="font-mono text-zinc-500 text-[10px]">Threshold: 180 Days</span>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-4 premium-glass p-6 rounded-2xl border border-white/5 text-left flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Locks</span>
                        <h3 className="text-sm font-bold text-white mt-1 uppercase font-mono">DB Concurrency</h3>
                        <p className="text-[11px] text-zinc-500 leading-relaxed mt-2 font-light">AssetFlow utilizes Row-Level Locking constraints on writes. Preventing simultaneous double bookings.</p>
                      </div>
                      <div className="pt-4 border-t border-white/5 mt-4 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 shrink-0" />No overlap errors</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════
                  TAB: ORG SETUP
              ═══════════════════════════════════════════════════ */}
              {activeTab === 'org' && currentUser.role === 'Admin' && (
                <div className="space-y-6">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left">
                    <div className="flex gap-4 border-b border-white/5 pb-4">
                      {[{ id: 'departments', label: 'Departments' }, { id: 'categories', label: 'Asset Categories' }, { id: 'employees', label: 'Employee Directory' }].map(sub => (
                        <button key={sub.id} onClick={() => setOrgSubTab(sub.id as any)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition ${orgSubTab === sub.id ? 'bg-white/10 text-white border border-white/10' : 'text-white/50 hover:text-white'}`}>{sub.label}</button>
                      ))}
                    </div>
                    <div className="pt-4 font-mono text-xs">
                      {orgSubTab === 'departments' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-4">DEPARTMENT</span><span className="col-span-4">MANAGER / HEAD</span><span className="col-span-2">RELATION</span><span className="col-span-2 text-right">STATUS</span></div>
                          {departments.map((dept, idx) => (<div key={idx} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300"><span className="col-span-4 font-bold text-white">{dept.name}</span><span className="col-span-4">{dept.head}</span><span className="col-span-2 text-zinc-500">{dept.parent}</span><span className="col-span-2 text-right text-emerald-400">{dept.status}</span></div>))}
                        </div>
                      )}
                      {orgSubTab === 'categories' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-4">CATEGORY</span><span className="col-span-4">WARRANTY (DAYS)</span><span className="col-span-4 text-right">SPECIFIC FIELD</span></div>
                          {categories.map((cat, idx) => (<div key={idx} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300"><span className="col-span-4 font-bold text-white">{cat.name}</span><span className="col-span-4">{cat.warrantyPeriod === 0 ? 'Indefinite' : `${cat.warrantyPeriod} Days`}</span><span className="col-span-4 text-right text-zinc-500">{cat.customField || 'None'}</span></div>))}
                        </div>
                      )}
                      {orgSubTab === 'employees' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-4">EMPLOYEE / EMAIL</span><span className="col-span-4">DEPARTMENT</span><span className="col-span-2">ROLE LEVEL</span><span className="col-span-2 text-right">ACTION</span></div>
                          {employees.map((emp, idx) => (
                            <div key={idx} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300">
                              <div className="col-span-4 flex flex-col items-start text-left"><span className="font-bold text-white">{emp.name}</span><span className="text-[9px] text-zinc-500">{emp.email}</span></div>
                              <span className="col-span-4">{emp.department}</span>
                              <span className="col-span-2"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${emp.role === 'Admin' ? 'bg-red-950/60 text-red-400 border border-red-900/30' : emp.role === 'Asset Manager' ? 'bg-brand/10 text-brand border border-brand/20' : emp.role === 'Department Head' ? 'bg-purple-950/60 text-purple-400 border border-purple-900/30' : 'bg-zinc-900 text-zinc-400'}`}>{emp.role.toUpperCase()}</span></span>
                              <div className="col-span-2 text-right"><button type="button" onClick={() => handlePromoteRole(emp.email)} className="px-2 py-1 border border-zinc-800 hover:border-brand bg-zinc-950 hover:bg-brand/10 text-[9px] uppercase font-bold font-sans rounded transition text-zinc-400 hover:text-white">Elevate</button></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════
                  TAB: ASSET REGISTRY
              ═══════════════════════════════════════════════════ */}
              {activeTab === 'assets' && (
                <div className="space-y-6">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wide">Registered Assets Directory</h3>
                      <span className="text-[10px] text-zinc-500 font-mono">Count: {assets.filter(asset => { if (currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') return true; if (currentUser.role === 'Department Head') { const holderEmp = employees.find(e => e.name === asset.holder); return (holderEmp && holderEmp.department === currentUser.department) || asset.shared || asset.holder === currentUser.name; } return asset.holder === currentUser.name || asset.shared; }).length} items</span>
                    </div>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-2">TAG</span><span className="col-span-3">ASSET NAME</span><span className="col-span-3">CATEGORY</span><span className="col-span-2">HOLDER</span><span className="col-span-2 text-right">STATUS</span></div>
                      {assets.filter(asset => { if (currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') return true; if (currentUser.role === 'Department Head') { const holderEmp = employees.find(e => e.name === asset.holder); return (holderEmp && holderEmp.department === currentUser.department) || asset.shared || asset.holder === currentUser.name; } return asset.holder === currentUser.name || asset.shared; }).map((asset) => (
                        <div key={asset.tag} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300">
                          <span className="col-span-2 font-bold text-white">{asset.tag}</span>
                          <div className="col-span-3 flex flex-col items-start"><span className="font-semibold text-zinc-200">{asset.name}</span><span className="text-[9px] text-zinc-500">{asset.serial}</span></div>
                          <span className="col-span-3">{asset.category}</span>
                          <span className="col-span-2 text-zinc-400">{asset.holder}</span>
                          <span className="col-span-2 text-right"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${asset.status === 'Available' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30' : asset.status === 'Allocated' ? 'bg-brand/10 text-brand border border-brand/20' : asset.status === 'Under Maintenance' ? 'bg-amber-950/60 text-amber-400 border border-amber-900/30' : 'bg-zinc-900 text-zinc-500'}`}>{asset.status}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════
                  TAB: ALLOCATIONS
              ═══════════════════════════════════════════════════ */}
              {activeTab === 'allocations' && (
                <div className="space-y-6 text-left">
                  {pendingHandover && (
                    <div className="premium-glass p-5 rounded-2xl border border-brand/20 bg-brand/5">
                      <div className="flex items-center gap-2 pb-3 border-b border-brand/10 mb-3 text-brand"><ClipboardCheck className="w-5 h-5 animate-pulse" /><h3 className="text-sm font-bold uppercase tracking-wider font-mono">Digital Handover Sign-off Required</h3></div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-light">The allocation for [<strong>{pendingHandover.asset.name}</strong>] to [<strong>{pendingHandover.employee}</strong>] is staged. The employee must sign off acknowledging its condition is [<strong>{pendingHandover.asset.condition}</strong>] to complete.</p>
                      <div className="flex gap-2.5 mt-4">
                        <button onClick={() => executeAllocation(pendingHandover.asset.tag, pendingHandover.employee, pendingHandover.returnDate)} className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded text-xs font-bold uppercase tracking-wider transition">Acknowledge &amp; E-Sign Handover</button>
                        <button onClick={() => setPendingHandover(null)} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded text-xs font-bold uppercase tracking-wider transition">Cancel Handover</button>
                      </div>
                    </div>
                  )}
                  {conflictAsset && (
                    <div className="premium-glass p-5 rounded-2xl border border-red-500/20 bg-red-950/5">
                      <div className="flex items-center gap-2 pb-3 border-b border-red-950/30 mb-3 text-red-400"><AlertTriangle className="w-5 h-5" /><h3 className="text-sm font-bold uppercase tracking-wider font-mono">Asset Allocation Conflict Alert</h3></div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-light">[<strong>{conflictAsset.name}</strong>] is currently in status [<strong>{conflictAsset.status}</strong>] held by [<strong>{conflictAsset.holder}</strong>].</p>
                      <div className="flex flex-col gap-2 mt-4 max-w-md font-mono text-xs">
                        <button onClick={() => { addLog(conflictForm.employee, 'REQUEST_TRANSFER', conflictAsset.tag, `Requested asset transfer from ${conflictAsset.holder}`); setConflictAsset(null); alert("Transfer request dispatched successfully to " + conflictAsset.holder); }} className="text-left w-full p-2.5 rounded bg-zinc-950 border border-zinc-900 hover:border-brand/40 text-brand transition">&gt; Option 1. Dispatch Transfer request to {conflictAsset.holder}</button>
                        <button onClick={() => { const alternative = assets.find(a => a.status === 'Available' && a.category === conflictAsset.category); if (alternative) { setPendingHandover({ asset: alternative, employee: conflictForm.employee, returnDate: conflictForm.returnDate }); setConflictAsset(null); } else { alert("No similar available assets found."); } }} className="text-left w-full p-2.5 rounded bg-zinc-950 border border-zinc-900 hover:border-brand/40 text-brand transition">&gt; Option 2. Allocate Alternative available asset in same category</button>
                        <button onClick={() => { addLog(conflictForm.employee, 'JOIN_WAITLIST', conflictAsset.tag, `Joined queue for ${conflictAsset.name}`); setConflictAsset(null); alert("Successfully joined waitlist."); }} className="text-left w-full p-2.5 rounded bg-zinc-950 border border-zinc-900 hover:border-brand/40 text-brand transition">&gt; Option 3. Join Waitlist Queue</button>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <div className="premium-glass p-5 rounded-2xl border border-white/5">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wide pb-3 border-b border-white/5 mb-3">Active Resource Reservations</h3>
                      <div className="space-y-2 font-mono text-[11px]">
                        {bookings.map(b => (
                          <div key={b.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-900 flex justify-between items-center">
                            <div className="flex flex-col gap-0.5"><span className="text-zinc-200 font-bold uppercase">{b.resource}</span><span className="text-zinc-500">Reserved by: {b.user}</span></div>
                            <div className="text-right"><span className="block text-brand">{b.start} - {b.end}</span><span className="text-[9px] px-1.5 py-0.5 bg-indigo-950 text-indigo-400 rounded border border-indigo-900/30">+15m Buffer Block applied</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="premium-glass p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wide pb-3 border-b border-white/5 mb-3">Scheduling &amp; Buffer Policies</h3>
                        <ul className="space-y-3 font-light text-zinc-400 text-xs">
                          <li><strong className="text-zinc-200 uppercase font-mono text-[9px] tracking-wider block">Transition Buffer</strong>All shared resource allocations automatically lock a 15-minute cleaning slot afterwards.</li>
                          <li><strong className="text-zinc-200 uppercase font-mono text-[9px] tracking-wider block">Category Grouping</strong>Allows booking by Group Category rather than targeting single specific units.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════
                  TAB: MAINTENANCE
              ═══════════════════════════════════════════════════ */}
              {activeTab === 'maintenance' && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wide">Active Repair Tickets</h3>
                      {(currentUser.role === 'Admin' || currentUser.role === 'Employee') && (<button onClick={() => setMaintenanceModalOpen(true)} className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-black text-[10px] font-bold uppercase tracking-wider font-mono rounded">Raise Request</button>)}
                    </div>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-2">ASSET</span><span className="col-span-4">ISSUE DESCRIPTION</span><span className="col-span-2">PRIORITY</span><span className="col-span-2">STATUS</span><span className="col-span-2 text-right">ACTION</span></div>
                      {maintenance.map((ticket) => (
                        <div key={ticket.id} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300">
                          <span className="col-span-2 font-bold text-white">{ticket.assetTag}</span>
                          <span className="col-span-4 truncate pr-4">{ticket.description}</span>
                          <span className="col-span-2"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${ticket.priority === 'High' ? 'bg-red-950/60 text-red-400' : 'bg-zinc-900 text-zinc-500'}`}>{ticket.priority}</span></span>
                          <span className="col-span-2 text-zinc-400">{ticket.status}</span>
                          <div className="col-span-2 text-right">
                            {ticket.status === 'Pending' && (currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') && (<button onClick={() => approveMaintenance(ticket.id)} className="px-2 py-1 bg-brand text-white text-[9px] uppercase font-bold rounded hover:bg-brand/90 transition">Approve</button>)}
                            {ticket.status === 'Approved' && (currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') && (<button onClick={() => resolveMaintenance(ticket.id)} className="px-2 py-1 bg-emerald-700 text-white text-[9px] uppercase font-bold rounded hover:bg-emerald-600 transition">Resolve</button>)}
                            {ticket.status === 'Resolved' && (<span className="text-[10px] text-zinc-500 font-bold uppercase">Resolved ✓</span>)}
                            {ticket.status !== 'Resolved' && !(currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') && (<span className="text-[10px] text-zinc-500 font-semibold uppercase">{ticket.status}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════
                  TAB: AUDIT
              ═══════════════════════════════════════════════════ */}
              {activeTab === 'audit' && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <div><h3 className="text-sm font-bold font-mono uppercase tracking-wide">Physical Walkthrough Audit Cycle</h3><span className="text-[10px] text-zinc-500 font-mono block mt-1">Active Cycle: #12 · Auditor: Sarah Jenkins</span></div>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 text-[9px] font-bold uppercase tracking-wider font-mono">Active Run</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
                      <div className="lg:col-span-7 space-y-3 font-mono text-xs">
                        <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-3">TAG</span><span className="col-span-5">ASSET</span><span className="col-span-4 text-right">AUDIT STATUS</span></div>
                        {audits[0].items.map((item) => (
                          <div key={item.assetTag} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300">
                            <span className="col-span-3 font-bold text-white">{item.assetTag}</span>
                            <span className="col-span-5">{item.name}</span>
                            <div className="col-span-4 text-right flex items-center justify-end gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.auditedStatus === 'Verified' ? 'bg-emerald-950/60 text-emerald-400' : item.auditedStatus === 'Missing' ? 'bg-red-950/60 text-red-400' : item.auditedStatus === 'Damaged' ? 'bg-amber-950/60 text-amber-400' : 'bg-zinc-900 text-zinc-500'}`}>{item.auditedStatus}</span>
                              <button onClick={() => handleAuditorScan(item.assetTag)} className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition"><QrCode className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="lg:col-span-5">
                        {scannedAssetDetails ? (
                          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs space-y-3">
                            <div className="flex items-center gap-2 text-brand"><QrCode className="w-4 h-4 animate-pulse" /><span className="font-bold uppercase text-[10px] tracking-wider">QR Scan Active — {scannedAssetDetails.tag}</span></div>
                            <div className="space-y-1.5 text-zinc-400">
                              <div className="flex justify-between"><span>Asset:</span><span className="text-white font-bold">{scannedAssetDetails.name}</span></div>
                              <div className="flex justify-between"><span>Location:</span><span className="text-zinc-300">{scannedAssetDetails.location}</span></div>
                              <div className="flex justify-between"><span>Condition:</span><span className="text-zinc-300">{scannedAssetDetails.condition}</span></div>
                              <div className="flex justify-between"><span>Holder:</span><span className="text-zinc-300">{scannedAssetDetails.holder}</span></div>
                            </div>
                            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
                              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Mark As:</span>
                              <button onClick={() => saveAuditStatus('Verified')} className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase text-[10px] rounded transition">✓ Verified Present</button>
                              <button onClick={() => saveAuditStatus('Damaged')} className="w-full py-1.5 bg-amber-700 hover:bg-amber-600 text-white font-bold uppercase text-[10px] rounded transition">⚠ Mark as Damaged</button>
                              <button onClick={() => saveAuditStatus('Missing')} className="w-full py-1.5 bg-red-700 hover:bg-red-600 text-white font-bold uppercase text-[10px] rounded transition">✗ Report as Missing</button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-3 h-full min-h-[200px] font-mono text-xs">
                            <QrCode className="w-8 h-8 text-zinc-700" />
                            <span className="text-zinc-600 text-center">Click a QR icon to simulate scanning an asset tag</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════
                  TAB: LOGS
              ═══════════════════════════════════════════════════ */}
              {activeTab === 'logs' && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wide">Compliance Delta Logs</h3>
                      <span className="text-[10px] text-zinc-500 font-mono">{deltaLogs.length} entries</span>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 font-mono text-[11px] h-[340px] overflow-y-auto space-y-3">
                      {deltaLogs.map(log => (
                        <div key={log.id} className="border-l border-zinc-800 pl-3.5 py-0.5 text-left">
                          <div className="flex items-center gap-2"><span className="text-[9px] text-zinc-600">[{log.timestamp}]</span><span className="px-1.5 py-0.5 bg-brand/10 text-brand rounded text-[9px] border border-brand/20 font-bold uppercase tracking-wider">{log.action}</span><span className="text-zinc-400 font-bold text-[10px]">{log.actor}</span></div>
                          <div className="text-zinc-500 text-[10px] mt-1 leading-normal font-light">{log.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════
                  TAB: PRODUCTS & VENDORS  (Feature 1 + 2)
              ═══════════════════════════════════════════════════ */}
              {activeTab === 'products' && (
                <div className="space-y-6 text-left">
                  {/* Header */}
                  <div className="premium-glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_0%_100%,rgba(139,92,246,0.12),transparent_70%)] pointer-events-none" />
                    <div className="flex items-center gap-3 mb-1">
                      <Package className="w-5 h-5 text-purple-400" />
                      <h2 className="text-lg font-black uppercase tracking-tight font-mono">Products &amp; Vendor Catalog</h2>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono">Search products to see which vendors supply them and at what price.</p>
                  </div>

                  {/* ── Filter Section ── */}
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                      <Filter className="w-3.5 h-3.5" /> Filters &amp; Search
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Search */}
                      <div className="md:col-span-1 relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Search by name or SKU..."
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono outline-none focus:border-brand"
                        />
                      </div>
                      {/* Category Filter */}
                      <div>
                        <select value={productCategoryFilter} onChange={e => setProductCategoryFilter(e.target.value)} className="w-full py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono outline-none focus:border-brand">
                          {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      {/* Price Range Presets */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {[
                          { key: 'all', label: 'All Prices' },
                          { key: 'under100', label: 'Under ₹100' },
                          { key: '100to500', label: '₹100–₹500' },
                          { key: 'over500', label: '₹500+' },
                          { key: 'custom', label: 'Custom' },
                        ].map(p => (
                          <button key={p.key} onClick={() => setPricePreset(p.key as any)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider border transition ${pricePreset === p.key ? 'bg-brand text-white border-brand' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Custom Price Inputs */}
                    {pricePreset === 'custom' && (
                      <div className="flex gap-3 mt-3 items-center">
                        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">₹</span><input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="w-28 pl-7 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono outline-none focus:border-brand" /></div>
                        <span className="text-zinc-600 text-xs">—</span>
                        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">₹</span><input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="w-28 pl-7 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono outline-none focus:border-brand" /></div>
                      </div>
                    )}
                  </div>

                  {/* ── Product List ── */}
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wide">Product Directory</h3>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                      </span>
                    </div>

                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-12 text-zinc-600 font-mono text-sm">No products match your filters.</div>
                    ) : (
                      <div className="space-y-3">
                        {paginatedProducts.map(product => {
                          const vendorList = getVendorsForProduct(product.id);
                          const isExpanded = expandedProduct === product.id;
                          const cfg = MATERIAL_CATEGORY_CONFIG[product.category as MaterialCategory] || { color: 'text-zinc-400', bg: 'bg-zinc-900', border: 'border-zinc-800', icon: '⚪' };
                          const minPrice = getMinPriceForProduct(product.id);

                          return (
                            <div key={product.id} className={`rounded-xl border transition-all duration-200 ${isExpanded ? 'border-brand/30 bg-brand/5' : 'border-zinc-800/60 bg-zinc-950/40 hover:border-zinc-700'}`}>
                              {/* Product Row */}
                              <button
                                onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                                className="w-full flex items-center gap-4 px-4 py-3 text-left"
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${cfg.bg} border ${cfg.border}`}>{cfg.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-white font-mono">{product.name}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{product.category}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[10px] text-zinc-500 font-mono">SKU: {product.sku}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">Unit: {product.unitOfMeasure}</span>
                                    {minPrice > 0 && <span className="text-[10px] text-emerald-400 font-mono font-bold">From ₹{minPrice.toLocaleString()}</span>}
                                    <span className="text-[10px] text-purple-400 font-mono">{vendorList.length} vendor{vendorList.length !== 1 ? 's' : ''}</span>
                                  </div>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>

                              {/* Vendor Expansion Panel */}
                              {isExpanded && (
                                <div className="px-4 pb-4 border-t border-white/5 mt-1 pt-3">
                                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-bold mb-3">Vendors supplying this product</p>
                                  {vendorList.length === 0 ? (
                                    <p className="text-xs text-zinc-600 font-mono">No vendors currently supply this product.</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {vendorList.map(vendor => {
                                        const vp = getProductVendorEntry(vendor.id, product.id)!;
                                        return (
                                          <div key={vendor.id} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0"><Store className="w-4 h-4 text-zinc-400" /></div>
                                            <div className="flex-1 min-w-0">
                                              <div className="font-bold text-xs text-white font-mono">{vendor.name}</div>
                                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{vendor.shopName}</div>
                                              <div className="flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-zinc-600" /><span className="text-[10px] text-zinc-600 font-mono">{vendor.location}</span></div>
                                            </div>
                                            <div className="text-right shrink-0">
                                              <div className="text-base font-black text-emerald-400 font-mono">₹{vp.price.toLocaleString()}</div>
                                              <div className="text-[9px] text-zinc-500 font-mono">per {product.unitOfMeasure}</div>
                                              <div className={`text-[9px] font-bold uppercase mt-1 ${vp.inStock ? 'text-emerald-400' : 'text-red-400'}`}>{vp.inStock ? '● In Stock' : '○ Out of Stock'}</div>
                                              <div className="text-[9px] text-zinc-600 font-mono">Min: {vp.minOrderQty} {product.unitOfMeasure}</div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 font-mono text-xs">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
                          <ChevronLeft className="w-3.5 h-3.5" /> Prev
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), currentPage + 2).map(page => (
                            <button key={page} onClick={() => setCurrentPage(page)}
                              className={`w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold transition ${page === currentPage ? 'bg-brand text-white' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}>
                              {page}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
                          Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════
                  TAB: ORDERS & BOM  (Feature 3)
              ═══════════════════════════════════════════════════ */}
              {activeTab === 'orders' && (
                <div className="space-y-6 text-left">
                  {/* Header */}
                  <div className="premium-glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_100%_0%,rgba(168,85,247,0.12),transparent_70%)] pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-black uppercase tracking-tight font-mono">Orders &amp; Bill of Materials</h2>
                      </div>
                      <button onClick={() => setOrderModalOpen(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5" /> New Order
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-2">Create an order to auto-generate a Bill of Materials (BOM). Use "Print BOM" for physical paper output.</p>
                  </div>

                  {/* BOM Viewer — only shown if activeBOM is set */}
                  {activeBOM && (
                    <div id="bom-printable" className="premium-glass rounded-2xl border border-purple-500/20 bg-purple-950/5 overflow-hidden">
                      {/* BOM Header */}
                      <div className="p-5 border-b border-purple-900/20 flex items-center justify-between no-print">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-300">BOM Auto-Generated — {activeBOM.orderNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={handlePrintBOM}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-100 transition">
                            <Printer className="w-3.5 h-3.5" /> Print BOM
                          </button>
                          <button onClick={() => setActiveBOM(null)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition"><X className="w-4 h-4" /></button>
                        </div>
                      </div>

                      {/* Printable BOM Content */}
                      <div className="bom-print-area p-6">
                        {/* Print-only header */}
                        <div className="print-only-header hidden">
                          <h1 className="bom-company-name">AssetFlow ERP</h1>
                          <h2 className="bom-doc-title">Bill of Materials (BOM)</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {[
                            { label: 'Order No.', value: activeBOM.orderNumber },
                            { label: 'Date', value: activeBOM.date },
                            { label: 'Customer', value: activeBOM.customer },
                            { label: 'Status', value: activeBOM.status },
                          ].map(f => (
                            <div key={f.label} className="bom-meta-field">
                              <span className="text-[9px] text-zinc-500 font-mono uppercase font-bold block">{f.label}</span>
                              <span className="text-xs text-white font-mono font-bold">{f.value}</span>
                            </div>
                          ))}
                        </div>
                        {activeBOM.notes && <div className="mb-5 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 font-mono"><span className="font-bold text-zinc-300">Notes: </span>{activeBOM.notes}</div>}

                        {/* BOM Line Items Table */}
                        <div className="bom-table-container rounded-xl overflow-hidden border border-zinc-800/50">
                          <table className="w-full text-xs font-mono bom-table">
                            <thead>
                              <tr className="bg-zinc-900/80 border-b border-zinc-800">
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">#</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item / Product</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th>
                                <th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Qty</th>
                                <th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unit Price</th>
                                <th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Line Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeBOM.items.map((item, idx) => {
                                const cfg = MATERIAL_CATEGORY_CONFIG[item.materialCategory];
                                return (
                                  <tr key={idx} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition">
                                    <td className="px-4 py-3 text-zinc-500">{idx + 1}</td>
                                    <td className="px-4 py-3"><span className="font-bold text-white">{item.productName}</span></td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{item.materialCategory}</span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400">{item.vendorName}</td>
                                    <td className="px-4 py-3 text-right text-zinc-300">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right text-zinc-300">₹{item.unitPrice.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-bold text-white">₹{(item.quantity * item.unitPrice).toLocaleString()}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="bg-zinc-900/60">
                                <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">Grand Total</td>
                                <td className="px-4 py-3 text-right"></td>
                                <td className="px-4 py-3 text-right text-lg font-black text-emerald-400 font-mono">₹{bomTotal(activeBOM).toLocaleString()}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order History List */}
                  <div className="premium-glass p-5 rounded-2xl border border-white/5 no-print">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wide pb-4 border-b border-white/5 mb-4">Order History</h3>
                    {orders.length === 0 ? (
                      <div className="text-center py-10 text-zinc-600 font-mono text-sm">No orders yet. Create your first order above.</div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map(order => (
                          <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition">
                            <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center shrink-0"><ShoppingCart className="w-4 h-4 text-purple-400" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-white font-mono">{order.orderNumber}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${order.status === 'Confirmed' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' : order.status === 'Cancelled' ? 'bg-red-950/40 text-red-400 border-red-800/40' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>{order.status}</span>
                              </div>
                              <div className="flex gap-3 mt-0.5 text-[10px] text-zinc-500 font-mono">
                                <span>Customer: {order.customer}</span>
                                <span>Date: {order.date}</span>
                                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                <span className="text-emerald-400">₹{bomTotal(order).toLocaleString()}</span>
                              </div>
                            </div>
                            <button onClick={() => setActiveBOM(order)} className="px-3 py-1.5 border border-purple-800/40 bg-purple-950/20 text-purple-400 text-[10px] font-bold uppercase font-mono rounded-lg hover:bg-purple-950/40 transition flex items-center gap-1.5">
                              <FileText className="w-3 h-3" /> View BOM
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════
                  TAB: ITEM MASTER  (Feature 4)
              ═══════════════════════════════════════════════════ */}
              {activeTab === 'itemmaster' && (
                <div className="space-y-6 text-left">
                  {/* Header */}
                  <div className="premium-glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_50%_100%,rgba(20,184,166,0.1),transparent_70%)] pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-teal-400" />
                        <h2 className="text-lg font-black uppercase tracking-tight font-mono">Item Master</h2>
                      </div>
                      <button onClick={() => setItemMasterModalOpen(true)} className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5" /> Add Item
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-2">Categorize materials by manufacturing origin. Each category has specific business logic.</p>
                  </div>

                  {/* Material Category Legend */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.entries(MATERIAL_CATEGORY_CONFIG) as [MaterialCategory, typeof MATERIAL_CATEGORY_CONFIG[MaterialCategory]][]).map(([cat, cfg]) => (
                      <div key={cat} className={`p-4 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{cfg.icon}</span>
                          <span className={`text-xs font-black uppercase font-mono ${cfg.color}`}>{cat}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-light">{cfg.description}</p>
                        <div className="mt-3 text-[10px] font-mono text-zinc-500">
                          {itemMasters.filter(i => i.materialCategory === cat).length} items in master
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Item Master Table */}
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wide pb-4 border-b border-white/5 mb-4">Item Master Records</h3>
                    {itemMasters.length === 0 ? (
                      <div className="text-center py-10 text-zinc-600 font-mono text-sm">No items in master. Add your first item above.</div>
                    ) : (
                      <div className="space-y-3">
                        {itemMasters.map(item => {
                          const cfg = MATERIAL_CATEGORY_CONFIG[item.materialCategory];
                          return (
                            <div key={item.id} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition">
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${cfg.bg} border ${cfg.border}`}>{cfg.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="font-bold text-sm text-white font-mono">{item.name}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{item.materialCategory}</span>
                                  </div>
                                  <div className="text-[10px] text-zinc-500 font-mono mb-2">SKU: {item.sku}</div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                      { label: 'Quantity', value: item.quantity.toLocaleString(), icon: <Boxes className="w-3 h-3" /> },
                                      { label: 'Rate', value: `₹${item.rate.toLocaleString()}/unit`, icon: <Tag className="w-3 h-3" /> },
                                      { label: 'Location', value: item.materialLocation, icon: <MapPin className="w-3 h-3" /> },
                                      { label: 'Company', value: item.companyName, icon: <Factory className="w-3 h-3" /> },
                                    ].map(f => (
                                      <div key={f.label} className="flex items-start gap-1.5">
                                        <span className="text-zinc-600 mt-0.5 shrink-0">{f.icon}</span>
                                        <div>
                                          <div className="text-[9px] text-zinc-600 font-mono uppercase">{f.label}</div>
                                          <div className="text-[11px] text-zinc-300 font-mono">{f.value}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  {item.description && <p className="text-[10px] text-zinc-600 font-mono mt-2 italic">"{item.description}"</p>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </main>

          {/* ═══════════════════════════════════════════════════
              MODALS
          ═══════════════════════════════════════════════════ */}

          {/* Register Asset Modal */}
          {registerModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4"><h3 className="text-sm font-bold uppercase tracking-wider">Register New Asset</h3><button onClick={() => setRegisterModalOpen(false)}><X className="w-4 h-4" /></button></div>
                <form onSubmit={handleRegisterAsset} className="space-y-4 text-xs">
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Asset Name</label><input type="text" required value={newAsset.name} onChange={e => setNewAsset(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="e.g. MacBook Pro M3" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Category</label><select value={newAsset.category} onChange={e => setNewAsset(prev => ({ ...prev, category: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div>
                    <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Condition</label><select value={newAsset.condition} onChange={e => setNewAsset(prev => ({ ...prev, condition: e.target.value as any }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"><option value="New">New</option><option value="Good">Good</option><option value="Fair">Fair</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Serial Number</label><input type="text" required value={newAsset.serial} onChange={e => setNewAsset(prev => ({ ...prev, serial: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="S/N 83B..." /></div>
                    <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Acquisition Cost (₹)</label><input type="number" required value={newAsset.cost} onChange={e => setNewAsset(prev => ({ ...prev, cost: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="1200" /></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Location</label><input type="text" required value={newAsset.location} onChange={e => setNewAsset(prev => ({ ...prev, location: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="HQ - Floor 3" /></div>
                  <div className="flex items-center gap-2 pt-2"><input type="checkbox" checked={newAsset.shared} onChange={e => setNewAsset(prev => ({ ...prev, shared: e.target.checked }))} id="sharedAsset" className="rounded bg-zinc-950 border-zinc-850 accent-brand cursor-pointer h-4 w-4" /><label htmlFor="sharedAsset" className="text-zinc-400 cursor-pointer">Shared / bookable resource</label></div>
                  <button type="submit" className="w-full py-2 bg-white text-black font-bold uppercase tracking-wider rounded transition hover:bg-zinc-200 mt-4">Register Asset</button>
                </form>
              </div>
            </div>
          )}

          {/* Allocate Asset Modal */}
          {allocationModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4"><h3 className="text-sm font-bold uppercase tracking-wider">Allocate Asset</h3><button onClick={() => setAllocationModalOpen(false)}><X className="w-4 h-4" /></button></div>
                <form onSubmit={handleAllocateAsset} className="space-y-4 text-xs">
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Select Asset Tag</label><select value={allocForm.assetTag} onChange={e => setAllocForm(prev => ({ ...prev, assetTag: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{assets.filter(a => !a.shared).map(a => <option key={a.tag} value={a.tag}>{a.tag} - {a.name} ({a.status})</option>)}</select></div>
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Allocate to Employee</label><select value={allocForm.employee} onChange={e => setAllocForm(prev => ({ ...prev, employee: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{employees.map(emp => <option key={emp.email} value={emp.name}>{emp.name} ({emp.department})</option>)}</select></div>
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Expected Return Date</label><input type="date" value={allocForm.returnDate} onChange={e => setAllocForm(prev => ({ ...prev, returnDate: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" /></div>
                  <button type="submit" className="w-full py-2 bg-brand text-white font-bold uppercase tracking-wider rounded transition hover:bg-brand/90 mt-4">Validate Allocation</button>
                </form>
              </div>
            </div>
          )}

          {/* Book Resource Modal */}
          {bookingModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4"><h3 className="text-sm font-bold uppercase tracking-wider">Book Shared Resource</h3><button onClick={() => setBookingModalOpen(false)}><X className="w-4 h-4" /></button></div>
                <form onSubmit={handleBooking} className="space-y-4 text-xs">
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Select Resource</label><select value={bookForm.resource} onChange={e => setBookForm(prev => ({ ...prev, resource: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{assets.filter(a => a.shared).map(a => <option key={a.tag} value={a.name}>{a.name} ({a.location})</option>)}</select></div>
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Booked By Employee</label><select value={bookForm.employee} onChange={e => setBookForm(prev => ({ ...prev, employee: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{employees.map(emp => <option key={emp.email} value={emp.name}>{emp.name}</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Start Time</label><input type="time" required value={bookForm.start} onChange={e => setBookForm(prev => ({ ...prev, start: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" /></div>
                    <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">End Time</label><input type="time" required value={bookForm.end} onChange={e => setBookForm(prev => ({ ...prev, end: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" /></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Booking Date</label><input type="date" required value={bookForm.date} onChange={e => setBookForm(prev => ({ ...prev, date: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" /></div>
                  <button type="submit" className="w-full py-2 bg-brand text-white font-bold uppercase tracking-wider rounded transition hover:bg-brand/90 mt-4">Book Slot</button>
                </form>
              </div>
            </div>
          )}

          {/* Maintenance Modal */}
          {maintenanceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4"><h3 className="text-sm font-bold uppercase tracking-wider">Raise Maintenance Request</h3><button onClick={() => setMaintenanceModalOpen(false)}><X className="w-4 h-4" /></button></div>
                <form onSubmit={handleMaintenance} className="space-y-4 text-xs">
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Select Asset</label><select value={maintForm.assetTag} onChange={e => setMaintForm(prev => ({ ...prev, assetTag: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{assets.map(a => <option key={a.tag} value={a.tag}>{a.tag} - {a.name} ({a.status})</option>)}</select></div>
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Describe Physical Issue</label><textarea required rows={3} value={maintForm.description} onChange={e => setMaintForm(prev => ({ ...prev, description: e.target.value }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand resize-none" placeholder="e.g. Display backlight flickering..." /></div>
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Priority</label><select value={maintForm.priority} onChange={e => setMaintForm(prev => ({ ...prev, priority: e.target.value as any }))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select></div>
                  <button type="submit" className="w-full py-2 bg-brand text-white font-bold uppercase tracking-wider rounded transition hover:bg-brand/90 mt-4">Submit Repair Ticket</button>
                </form>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              NEW: Create Order Modal
          ═══════════════════════════════════════════════════ */}
          {orderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-2xl text-left font-mono max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <div><h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-purple-400" />Create New Order</h3><p className="text-[10px] text-zinc-500 mt-0.5">A BOM will be auto-generated upon creation.</p></div>
                  <button onClick={() => setOrderModalOpen(false)}><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleCreateOrder} className="space-y-5 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Customer / Company Name *</label><input type="text" required value={newOrder.customer} onChange={e => setNewOrder(prev => ({ ...prev, customer: e.target.value }))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-purple-500" placeholder="e.g. ABC Manufacturing Ltd" /></div>
                    <div className="col-span-2 space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Notes (Optional)</label><textarea rows={2} value={newOrder.notes} onChange={e => setNewOrder(prev => ({ ...prev, notes: e.target.value }))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-purple-500 resize-none" placeholder="Any special instructions..." /></div>
                  </div>

                  {/* Add Line Item */}
                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                    <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Add Line Item to BOM</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><label className="text-zinc-500 uppercase text-[9px] font-bold">Product</label>
                        <select value={orderItemForm.productId} onChange={e => setOrderItemForm(prev => ({ ...prev, productId: e.target.value }))} className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-purple-500">
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5"><label className="text-zinc-500 uppercase text-[9px] font-bold">Vendor</label>
                        <select value={orderItemForm.vendorId} onChange={e => setOrderItemForm(prev => ({ ...prev, vendorId: e.target.value }))} className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-purple-500">
                          {availableVendorsForItem.length === 0 ? <option>No vendors</option> : availableVendorsForItem.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5"><label className="text-zinc-500 uppercase text-[9px] font-bold">Quantity</label><input type="number" min={1} value={orderItemForm.quantity} onChange={e => setOrderItemForm(prev => ({ ...prev, quantity: Number(e.target.value) }))} className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-purple-500" /></div>
                      <div className="space-y-1.5"><label className="text-zinc-500 uppercase text-[9px] font-bold">Unit Price (₹)</label><input type="number" min={0} step="0.01" value={orderItemForm.unitPrice} onChange={e => setOrderItemForm(prev => ({ ...prev, unitPrice: Number(e.target.value) }))} className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-purple-500" /></div>
                    </div>
                    <button type="button" onClick={addItemToOrder} className="w-full py-2 border border-purple-700/40 bg-purple-950/20 text-purple-400 font-bold uppercase text-[10px] rounded-lg hover:bg-purple-950/40 transition flex items-center justify-center gap-1.5"><Plus className="w-3.5 h-3.5" />Add to BOM</button>
                  </div>

                  {/* Current Items */}
                  {newOrder.items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">BOM Items ({newOrder.items.length})</h4>
                      {newOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-white text-xs">{item.productName}</span>
                            <div className="text-[10px] text-zinc-500">Vendor: {item.vendorName} · Qty: {item.quantity} · ₹{item.unitPrice} each → <span className="text-emerald-400 font-bold">₹{(item.quantity * item.unitPrice).toLocaleString()}</span></div>
                          </div>
                          <button type="button" onClick={() => removeItemFromOrder(idx)} className="p-1 rounded text-zinc-600 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                      <div className="text-right text-xs font-bold text-emerald-400 font-mono pt-1">Total: ₹{newOrder.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toLocaleString()}</div>
                    </div>
                  )}

                  <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider rounded-lg transition mt-2 flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" /> Confirm Order &amp; Generate BOM
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              NEW: Add Item Master Modal
          ═══════════════════════════════════════════════════ */}
          {itemMasterModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-lg text-left font-mono max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4"><h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Layers className="w-4 h-4 text-teal-400" />Add Item Master Record</h3><button onClick={() => setItemMasterModalOpen(false)}><X className="w-4 h-4" /></button></div>
                <form onSubmit={handleAddItemMaster} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Material Name *</label><input type="text" required value={newItem.name} onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="e.g. Steel Rod 12mm" /></div>
                    <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">SKU *</label><input type="text" required value={newItem.sku} onChange={e => setNewItem(prev => ({ ...prev, sku: e.target.value }))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="SR-12MM-001" /></div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 uppercase text-[9px] font-bold">Material Category *</label>
                      <select value={newItem.materialCategory} onChange={e => setNewItem(prev => ({ ...prev, materialCategory: e.target.value as MaterialCategory }))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500">
                        <option value="Raw Material">🔵 Raw Material</option>
                        <option value="Semi-Finished Material">🟡 Semi-Finished Material</option>
                        <option value="Finished Material">🟢 Finished Material</option>
                      </select>
                    </div>
                  </div>
                  {/* Category description hint */}
                  <div className={`p-3 rounded-lg border text-[10px] leading-relaxed ${MATERIAL_CATEGORY_CONFIG[newItem.materialCategory].bg} ${MATERIAL_CATEGORY_CONFIG[newItem.materialCategory].border} ${MATERIAL_CATEGORY_CONFIG[newItem.materialCategory].color}`}>
                    {MATERIAL_CATEGORY_CONFIG[newItem.materialCategory].icon} {MATERIAL_CATEGORY_CONFIG[newItem.materialCategory].description}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Quantity *</label><input type="number" required min={0} value={newItem.quantity || ''} onChange={e => setNewItem(prev => ({ ...prev, quantity: Number(e.target.value) }))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="500" /></div>
                    <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Rate / Price per Unit (₹) *</label><input type="number" required min={0} step="0.01" value={newItem.rate || ''} onChange={e => setNewItem(prev => ({ ...prev, rate: Number(e.target.value) }))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="80.00" /></div>
                    <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Material Location *</label><input type="text" required value={newItem.materialLocation} onChange={e => setNewItem(prev => ({ ...prev, materialLocation: e.target.value }))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="Warehouse A - Rack 3" /></div>
                    <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Company Name *</label><input type="text" required value={newItem.companyName} onChange={e => setNewItem(prev => ({ ...prev, companyName: e.target.value }))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="Vendor or In-House" /></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Description (Optional)</label><textarea rows={2} value={newItem.description} onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500 resize-none" placeholder="Additional details..." /></div>
                  <button type="submit" className="w-full py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold uppercase tracking-wider rounded-lg transition">Add to Item Master</button>
                </form>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
}
