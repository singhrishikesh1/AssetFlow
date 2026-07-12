import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Laptop, AlertTriangle,
  Wrench, ClipboardCheck, History, BarChart3,
  Plus, Search, Check, X, ShieldAlert, Cpu,
  ArrowRight, QrCode, Clock, FileText, ChevronRight,
  Trash2, Package, ShoppingCart, Printer,
  ChevronLeft, ChevronDown, Tag, MapPin, Store, Filter,
  Layers, Factory, Boxes, Bell, TrendingUp, Download,
  BarChart2, PieChart, Calendar, CheckCheck, Info,
  AlertCircle, CheckCircle2, Eye, FileDown, Sparkles
} from 'lucide-react';

// ─── Logo ────────────────────────────────────
const AppleLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

// ─── Mini Chart Components ────────────────────
const MiniBarChart: React.FC<{
  data: { label: string; value: number; color?: string }[];
  height?: number;
  defaultColor?: string;
}> = ({ data, height = 100, defaultColor = '#3d81e3' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0 h-full justify-end group">
          <div className="text-[8px] text-zinc-600 opacity-0 group-hover:opacity-100 transition font-mono whitespace-nowrap">
            {typeof item.value === 'number' && item.value > 999 ? (item.value / 1000).toFixed(1) + 'k' : item.value}
          </div>
          <div
            className="w-full rounded-t-md transition-all duration-500 cursor-default"
            style={{
              height: `${Math.max((item.value / max) * 80, 4)}%`,
              background: item.color || defaultColor,
            }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="text-[8px] text-zinc-600 truncate w-full text-center leading-none">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const DonutRing: React.FC<{
  data: { label: string; value: number; color: string }[];
  size?: number;
}> = ({ data, size = 96 }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const segments = data.map(d => {
    const pct = (d.value / total) * 100;
    const seg = { ...d, start: acc, end: acc + pct };
    acc += pct;
    return seg;
  });
  const gradient = segments.map(s => `${s.color} ${s.start}% ${s.end}%`).join(', ');
  return (
    <div className="flex items-center gap-4">
      <div
        className="rounded-full shrink-0"
        style={{
          width: size, height: size,
          background: total === 0 ? '#27272a' : `conic-gradient(${gradient})`,
          mask: `radial-gradient(circle at center, transparent ${size * 0.3}px, black ${size * 0.31}px)`,
          WebkitMask: `radial-gradient(circle at center, transparent ${size * 0.3}px, black ${size * 0.31}px)`,
        }}
      />
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
            <span className="text-[10px] text-zinc-400 font-mono">{d.label}</span>
            <span className="text-[10px] text-white font-bold font-mono ml-1">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── CSV Export Utility ───────────────────────
const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csvContent = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
};

// ─── Time Ago Helper ──────────────────────────
const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─────────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────────
interface Employee { name: string; email: string; department: string; role: 'Employee' | 'Asset Manager' | 'Department Head' | 'Admin'; status: 'Active' | 'Inactive'; }
interface Department { name: string; head: string; parent: string; status: 'Active' | 'Inactive'; }
interface Category { name: string; warrantyPeriod: number; customField?: string; }
interface Asset { tag: string; name: string; category: string; serial: string; cost: number; condition: 'New' | 'Good' | 'Fair' | 'Damaged' | 'Missing'; status: 'Available' | 'Allocated' | 'Reserved' | 'Under Maintenance' | 'Lost' | 'Retired' | 'Disposed'; location: string; holder: string; shared: boolean; }
interface Booking { id: number; resource: string; user: string; start: string; end: string; date: string; status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'; }
interface MaintenanceRequest { id: number; assetTag: string; description: string; priority: 'Low' | 'Medium' | 'High'; status: 'Pending' | 'Approved' | 'Technician Assigned' | 'In Progress' | 'Resolved'; }
interface AuditItem { assetTag: string; name: string; auditedStatus: 'Unchecked' | 'Verified' | 'Missing' | 'Damaged'; }
interface AuditCycle { id: number; scope: string; auditor: string; dateRange: string; status: 'Active' | 'Closed'; items: AuditItem[]; }
interface DeltaLog { id: number; timestamp: string; actor: string; action: string; assetTag?: string; detail: string; }
interface VendorProduct { productId: string; price: number; inStock: boolean; minOrderQty: number; }
interface Vendor { id: string; name: string; shopName: string; location: string; contactEmail: string; contactPhone: string; products: VendorProduct[]; }
interface Product { id: string; name: string; category: string; description: string; sku: string; unitOfMeasure: string; }
type MaterialCategory = 'Raw Material' | 'Semi-Finished Material' | 'Finished Material';
interface ItemMaster { id: string; name: string; sku: string; materialCategory: MaterialCategory; quantity: number; rate: number; materialLocation: string; companyName: string; description: string; }
interface OrderItem { productId: string; productName: string; quantity: number; unitPrice: number; vendorId: string; vendorName: string; materialCategory: MaterialCategory; }
interface Order { id: string; orderNumber: string; date: string; customer: string; items: OrderItem[]; status: 'Draft' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled'; notes: string; }

// NEW ── Notification
interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  isRead: boolean;
  targetUserId: string;   // 'all' or specific email
  createdAt: string;      // ISO string
  link?: string;          // sidebar tab to navigate to
}

// ─────────────────────────────────────────────
//  CONSTANTS & SEED DATA
// ─────────────────────────────────────────────
const LOW_STOCK_THRESHOLDS: Record<MaterialCategory, number> = {
  'Raw Material': 1000,
  'Semi-Finished Material': 20,
  'Finished Material': 10,
};

const MATERIAL_CATEGORY_CONFIG: Record<MaterialCategory, { color: string; bg: string; border: string; icon: string; description: string; chartColor: string }> = {
  'Raw Material':          { color: 'text-sky-400',     bg: 'bg-sky-950/40',     border: 'border-sky-800/40',     icon: '🔵', description: '100% manufactured / processed in-house by the company',            chartColor: '#38bdf8' },
  'Semi-Finished Material':{ color: 'text-amber-400',   bg: 'bg-amber-950/40',   border: 'border-amber-800/40',   icon: '🟡', description: 'Partially made in-house & partially processed by a vendor',       chartColor: '#fbbf24' },
  'Finished Material':     { color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/40', icon: '🟢', description: '100% manufactured / processed by the vendor',                     chartColor: '#34d399' },
};

const ITEMS_PER_PAGE = 10;

const SEED_PRODUCTS: Product[] = [
  { id: 'P001', name: 'Steel Rod 12mm',         category: 'Raw Material',          description: 'High tensile steel rod',             sku: 'SR-12MM-001', unitOfMeasure: 'kg' },
  { id: 'P002', name: 'Copper Wire 2.5mm',       category: 'Raw Material',          description: 'Electrical grade copper wire',       sku: 'CW-25MM-002', unitOfMeasure: 'meter' },
  { id: 'P003', name: 'Industrial Bearing 6205', category: 'Semi-Finished Material',description: 'Deep groove ball bearing',           sku: 'IB-6205-003', unitOfMeasure: 'unit' },
  { id: 'P004', name: 'Motor Drive PCB',         category: 'Semi-Finished Material',description: 'Partially assembled motor PCB',      sku: 'PCB-MD-004',  unitOfMeasure: 'unit' },
  { id: 'P005', name: 'Hydraulic Pump Assembly', category: 'Finished Material',     description: 'Complete hydraulic pump',            sku: 'HPA-V2-005',  unitOfMeasure: 'unit' },
  { id: 'P006', name: 'Stainless Sheet 2mm',     category: 'Raw Material',          description: '304 grade stainless steel sheet',    sku: 'SS-2MM-006',  unitOfMeasure: 'sqft' },
  { id: 'P007', name: 'Pneumatic Cylinder 50mm', category: 'Finished Material',     description: 'Ready-to-install pneumatic cylinder',sku: 'PC-50MM-007', unitOfMeasure: 'unit' },
  { id: 'P008', name: 'Gear Assembly Kit',       category: 'Semi-Finished Material',description: 'Partially machined gear set',        sku: 'GAK-V1-008',  unitOfMeasure: 'set' },
  { id: 'P009', name: 'Aluminium Ingot 99%',     category: 'Raw Material',          description: 'Primary aluminium ingot',            sku: 'AI-99P-009',  unitOfMeasure: 'kg' },
  { id: 'P010', name: 'Electric Motor 2HP',      category: 'Finished Material',     description: 'Single phase induction motor',       sku: 'EM-2HP-010',  unitOfMeasure: 'unit' },
  { id: 'P011', name: 'PVC Granules',            category: 'Raw Material',          description: 'Virgin grade PVC resin granules',    sku: 'PVC-GR-011',  unitOfMeasure: 'kg' },
  { id: 'P012', name: 'Control Panel Box',       category: 'Finished Material',     description: 'IP65 rated control panel enclosure', sku: 'CPB-IP65-012',unitOfMeasure: 'unit' },
];

const SEED_VENDORS: Vendor[] = [
  { id: 'V001', name: 'Ravi Steels Pvt Ltd',    shopName: 'Ravi Metal Works',      location: 'MIDC Phase II, Pune - 411019',       contactEmail: 'ravi@ravisteels.com',    contactPhone: '+91-9876541001', products: [{ productId: 'P001', price: 82.50,    inStock: true,  minOrderQty: 100 },{ productId: 'P006', price: 145.00,   inStock: true,  minOrderQty: 50 },{ productId: 'P009', price: 210.00,   inStock: false, minOrderQty: 200 }] },
  { id: 'V002', name: 'Arjun Electricals',       shopName: 'AE Electrical Supplies',location: 'Industrial Area, Nashik - 422001',   contactEmail: 'supply@arjunelec.in',   contactPhone: '+91-9876541002', products: [{ productId: 'P002', price: 58.00,    inStock: true,  minOrderQty: 500 },{ productId: 'P004', price: 1250.00,  inStock: true,  minOrderQty: 10 },{ productId: 'P010', price: 4800.00,  inStock: true,  minOrderQty: 1 }] },
  { id: 'V003', name: 'Precision Bearings Co.', shopName: 'PBC Warehouse',          location: 'Bhosari MIDC, Pune - 411026',        contactEmail: 'orders@pbc.co.in',      contactPhone: '+91-9876541003', products: [{ productId: 'P003', price: 320.00,   inStock: true,  minOrderQty: 20 },{ productId: 'P008', price: 2100.00,  inStock: true,  minOrderQty: 5 }] },
  { id: 'V004', name: 'Suresh Hydraulics',       shopName: 'SH Fluid Power',        location: 'Chakan Industrial Zone, Pune - 410501',contactEmail: 'sales@sureshhydraulics.com',contactPhone: '+91-9876541004', products: [{ productId: 'P005', price: 18500.00, inStock: true,  minOrderQty: 1 },{ productId: 'P007', price: 3200.00,  inStock: true,  minOrderQty: 2 }] },
  { id: 'V005', name: 'Polymer Solutions Ltd',   shopName: 'PSL Depot',             location: 'Talegaon MIDC, Pune - 412106',       contactEmail: 'polymer@psl.in',        contactPhone: '+91-9876541005', products: [{ productId: 'P011', price: 95.00,    inStock: true,  minOrderQty: 500 },{ productId: 'P012', price: 6800.00,  inStock: false, minOrderQty: 1 }] },
  { id: 'V006', name: 'MegaMetal Traders',       shopName: 'MegaMetal Yard',        location: 'Hadapsar, Pune - 411028',            contactEmail: 'trade@megametal.in',    contactPhone: '+91-9876541006', products: [{ productId: 'P001', price: 79.00,    inStock: true,  minOrderQty: 200 },{ productId: 'P006', price: 138.00,   inStock: true,  minOrderQty: 100 },{ productId: 'P009', price: 205.00,   inStock: true,  minOrderQty: 500 }] },
];

const SEED_ITEM_MASTER: ItemMaster[] = [
  { id: 'IM001', name: 'Steel Rod 12mm',         sku: 'SR-12MM-001', materialCategory: 'Raw Material',          quantity: 500,  rate: 80,    materialLocation: 'Warehouse A - Rack 3',    companyName: 'In-House Production',       description: 'Primary raw material for fabrication' },
  { id: 'IM002', name: 'Motor Drive PCB',         sku: 'PCB-MD-004',  materialCategory: 'Semi-Finished Material',quantity: 25,   rate: 1200,  materialLocation: 'Assembly Bay - Zone 2',   companyName: 'Arjun Electricals',          description: 'Requires final component soldering in-house' },
  { id: 'IM003', name: 'Hydraulic Pump Assembly', sku: 'HPA-V2-005',  materialCategory: 'Finished Material',     quantity: 8,    rate: 18000, materialLocation: 'Store Room B - Shelf 1',  companyName: 'Suresh Hydraulics',          description: 'Fully vendor-manufactured, ready for dispatch' },
  { id: 'IM004', name: 'Copper Wire 2.5mm',       sku: 'CW-25MM-002', materialCategory: 'Raw Material',          quantity: 2000, rate: 56,    materialLocation: 'Warehouse A - Rack 7',    companyName: 'In-House Drawn',             description: 'Electrical wiring raw stock' },
  { id: 'IM005', name: 'Gear Assembly Kit',        sku: 'GAK-V1-008',  materialCategory: 'Semi-Finished Material',quantity: 15,   rate: 2000,  materialLocation: 'Assembly Bay - Zone 4',   companyName: 'Precision Bearings Co.',     description: 'Requires final balancing and heat treatment in-house' },
];

const SEED_ORDERS: Order[] = [
  { id: 'ORD001', orderNumber: 'PO-2026-001', date: '2026-07-10', customer: 'ABC Manufacturing Ltd', status: 'Confirmed', notes: 'Urgent delivery required', items: [{ productId: 'P001', productName: 'Steel Rod 12mm', quantity: 500, unitPrice: 82.50, vendorId: 'V001', vendorName: 'Ravi Steels Pvt Ltd', materialCategory: 'Raw Material' },{ productId: 'P003', productName: 'Industrial Bearing 6205', quantity: 50, unitPrice: 320.00, vendorId: 'V003', vendorName: 'Precision Bearings Co.', materialCategory: 'Semi-Finished Material' }] },
  { id: 'ORD002', orderNumber: 'PO-2026-002', date: '2026-07-08', customer: 'XYZ Engineering Works', status: 'Confirmed', notes: '', items: [{ productId: 'P005', productName: 'Hydraulic Pump Assembly', quantity: 3, unitPrice: 18500, vendorId: 'V004', vendorName: 'Suresh Hydraulics', materialCategory: 'Finished Material' }] },
  { id: 'ORD003', orderNumber: 'PO-2026-003', date: '2026-07-05', customer: 'Delta Auto Parts', status: 'Completed', notes: 'Monthly standing order', items: [{ productId: 'P002', productName: 'Copper Wire 2.5mm', quantity: 1000, unitPrice: 58, vendorId: 'V002', vendorName: 'Arjun Electricals', materialCategory: 'Raw Material' },{ productId: 'P010', productName: 'Electric Motor 2HP', quantity: 5, unitPrice: 4800, vendorId: 'V002', vendorName: 'Arjun Electricals', materialCategory: 'Finished Material' }] },
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: 'N001', title: '⚠ Low Stock Alert', message: 'Steel Rod 12mm (SR-12MM-001) has only 500 units — below threshold of 1,000 for Raw Materials.', type: 'alert',   isRead: false, targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), link: 'itemmaster' },
  { id: 'N002', title: '✅ Order Placed',    message: 'Order PO-2026-001 for ABC Manufacturing Ltd confirmed. Total: ₹57,250.', type: 'success', isRead: false, targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), link: 'orders' },
  { id: 'N003', title: '📄 BOM Generated',  message: 'Bill of Materials auto-generated for PO-2026-001 with 2 line items totalling ₹57,250.', type: 'info',    isRead: true,  targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), link: 'orders' },
  { id: 'N004', title: '⚠ Low Stock Alert', message: 'Gear Assembly Kit (GAK-V1-008) has only 15 units — below threshold of 20 for Semi-Finished Materials.', type: 'alert',   isRead: false, targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), link: 'itemmaster' },
  { id: 'N005', title: '✅ Order Placed',    message: 'Order PO-2026-002 for XYZ Engineering Works confirmed. Total: ₹55,500.', type: 'success', isRead: true,  targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 30).toISOString(), link: 'orders' },
  { id: 'N006', title: '⚠ Low Stock Alert', message: 'Hydraulic Pump Assembly (HPA-V2-005) has only 8 units — below threshold of 10 for Finished Materials.', type: 'alert',   isRead: false, targetUserId: 'all', createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), link: 'itemmaster' },
];

// ─────────────────────────────────────────────
//  APP
// ─────────────────────────────────────────────
export default function App() {

  // ── Existing State ──────────────────────────
  const [employees, setEmployees] = useState<Employee[]>(() => { const s = localStorage.getItem('af_employees'); return s ? JSON.parse(s) : [{ name: 'Priya Sharma', email: 'priya@assetflow.com', department: 'Engineering', role: 'Employee', status: 'Active' },{ name: 'Alex Mercer', email: 'alex@assetflow.com', department: 'Operations', role: 'Asset Manager', status: 'Active' },{ name: 'Raj Patel', email: 'raj@assetflow.com', department: 'Design', role: 'Employee', status: 'Active' },{ name: 'Sarah Jenkins', email: 'sarah@assetflow.com', department: 'Audit & Compliance', role: 'Employee', status: 'Active' },{ name: 'Marcus Brody', email: 'marcus@assetflow.com', department: 'Operations', role: 'Department Head', status: 'Active' },{ name: 'Rishikesh Singh', email: 'admin@assetflow.com', department: 'Operations', role: 'Admin', status: 'Active' }]; });
  const [credentials, setCredentials] = useState<Record<string, string>>(() => { const s = localStorage.getItem('af_credentials'); return s ? JSON.parse(s) : { 'admin@assetflow.com': 'admin123', 'alex@assetflow.com': 'alex123', 'marcus@assetflow.com': 'marcus123', 'priya@assetflow.com': 'priya123', 'raj@assetflow.com': 'raj123', 'sarah@assetflow.com': 'sarah123' }; });
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => { const s = localStorage.getItem('af_current_user'); return s ? JSON.parse(s) : null; });
  const [activeTab, setActiveTab] = useState<'dashboard'|'org'|'assets'|'allocations'|'maintenance'|'audit'|'logs'|'products'|'orders'|'itemmaster'|'reports'|'notifications'>('dashboard');
  const [currentMenuTime, setCurrentMenuTime] = useState('');
  const [orgSubTab, setOrgSubTab] = useState<'departments'|'categories'|'employees'>('departments');
  const [departments] = useState<Department[]>([{ name: 'Engineering', head: 'Marcus Brody', parent: 'None', status: 'Active' },{ name: 'Design', head: 'Raj Patel', parent: 'Engineering', status: 'Active' },{ name: 'Operations', head: 'Alex Mercer', parent: 'None', status: 'Active' },{ name: 'Audit & Compliance', head: 'Sarah Jenkins', parent: 'Operations', status: 'Active' }]);
  const [categories] = useState<Category[]>([{ name: 'Electronics', warrantyPeriod: 365, customField: 'CPU / RAM specs' },{ name: 'Furniture', warrantyPeriod: 1095, customField: 'Material type' },{ name: 'Vehicles', warrantyPeriod: 730, customField: 'License Plate' },{ name: 'Office Spaces', warrantyPeriod: 0, customField: 'Capacity' }]);
  const [assets, setAssets] = useState<Asset[]>([{ tag: 'AF-0114', name: 'MacBook Pro M3', category: 'Electronics', serial: 'S/N 83B4F83', cost: 2500, condition: 'New', status: 'Allocated', location: 'HQ - Floor 3', holder: 'Priya Sharma', shared: false },{ tag: 'AF-0341', name: 'Dell XPS 15', category: 'Electronics', serial: 'S/N 29A4D19', cost: 1800, condition: 'Good', status: 'Available', location: 'HQ - Floor 2', holder: 'None', shared: false },{ tag: 'AF-0883', name: 'Herman Miller Aeron', category: 'Furniture', serial: 'S/N 12B8C73', cost: 1200, condition: 'Good', status: 'Available', location: 'HQ - Room A1', holder: 'None', shared: false },{ tag: 'AF-1002', name: 'Conference Room B2', category: 'Office Spaces', serial: 'LOC-B2', cost: 0, condition: 'New', status: 'Available', location: 'HQ - Floor 1', holder: 'Shared', shared: true },{ tag: 'AF-0220', name: 'Tesla Model 3', category: 'Vehicles', serial: 'PLATE-AURA', cost: 42000, condition: 'Good', status: 'Available', location: 'Garage A', holder: 'Shared', shared: true }]);
  const [bookings, setBookings] = useState<Booking[]>([{ id: 1, resource: 'Conference Room B2', user: 'Raj Patel', start: '09:00', end: '10:00', date: '2026-07-12', status: 'Ongoing' }]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([{ id: 1, assetTag: 'AF-0341', description: 'Keyboard double space defect', priority: 'Medium', status: 'Pending' }]);
  const [audits, setAudits] = useState<AuditCycle[]>([{ id: 12, scope: 'Engineering Department', auditor: 'Sarah Jenkins', dateRange: '2026-07-10 - 2026-07-15', status: 'Active', items: [{ assetTag: 'AF-0114', name: 'MacBook Pro M3', auditedStatus: 'Unchecked' },{ assetTag: 'AF-0341', name: 'Dell XPS 15', auditedStatus: 'Unchecked' },{ assetTag: 'AF-0883', name: 'Herman Miller Aeron', auditedStatus: 'Unchecked' }] }]);
  const [deltaLogs, setDeltaLogs] = useState<DeltaLog[]>([{ id: 1, timestamp: '09:04:12 AM', actor: 'System Seed Engine', action: 'INITIALIZE_DB', detail: 'Pre-populated core assets, employee directory, and departments.' },{ id: 2, timestamp: '09:04:45 AM', actor: 'Marcus Brody (Admin)', action: 'ROLE_ELEVATION', detail: 'Priya Sharma promoted to Asset Manager permissions.' }]);

  const [products] = useState<Product[]>(() => { const s = localStorage.getItem('af_products'); return s ? JSON.parse(s) : SEED_PRODUCTS; });
  const [vendors] = useState<Vendor[]>(() => { const s = localStorage.getItem('af_vendors'); return s ? JSON.parse(s) : SEED_VENDORS; });
  const [itemMasters, setItemMasters] = useState<ItemMaster[]>(() => { const s = localStorage.getItem('af_item_masters'); return s ? JSON.parse(s) : SEED_ITEM_MASTER; });
  const [orders, setOrders] = useState<Order[]>(() => { const s = localStorage.getItem('af_orders'); return s ? JSON.parse(s) : SEED_ORDERS; });

  // ── NEW State ───────────────────────────────
  const [notifications, setNotifications] = useState<AppNotification[]>(() => { const s = localStorage.getItem('af_notifications'); return s ? JSON.parse(s) : SEED_NOTIFICATIONS; });
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifBellRef = useRef<HTMLDivElement>(null);

  // Reports state
  const [reportSubTab, setReportSubTab] = useState<'inventory'|'vendor'|'orders'>('inventory');
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');

  // Products tab state
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [pricePreset, setPricePreset] = useState<'all'|'under100'|'100to500'|'over500'|'custom'>('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedProduct, setExpandedProduct] = useState<string|null>(null);

  // Orders tab state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [activeBOM, setActiveBOM] = useState<Order|null>(null);
  const [newOrder, setNewOrder] = useState({ customer: '', notes: '', items: [] as OrderItem[] });
  const [orderItemForm, setOrderItemForm] = useState({ productId: 'P001', vendorId: 'V001', quantity: 1, unitPrice: 0 });

  // Item master state
  const [itemMasterModalOpen, setItemMasterModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<ItemMaster,'id'>>({ name:'', sku:'', materialCategory:'Raw Material', quantity:0, rate:0, materialLocation:'', companyName:'', description:'' });

  // Auth state
  const [authMode, setAuthMode] = useState<'signin'|'signup'|'forgot'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authDept, setAuthDept] = useState('Engineering');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Existing modal states
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ name:'', category:'Electronics', serial:'', cost:'', location:'', condition:'New' as any, shared:false });
  const [allocForm, setAllocForm] = useState({ assetTag:'AF-0341', employee:'Raj Patel', returnDate:'' });
  const [bookForm, setBookForm] = useState({ resource:'Conference Room B2', employee:'Raj Patel', start:'10:00', end:'11:00', date:'2026-07-12' });
  const [maintForm, setMaintForm] = useState({ assetTag:'AF-0114', description:'', priority:'Medium' as any });
  const [conflictAsset, setConflictAsset] = useState<Asset|null>(null);
  const [conflictForm, setConflictForm] = useState<any>(null);
  const [pendingHandover, setPendingHandover] = useState<{asset:Asset;employee:string;returnDate:string}|null>(null);
  const [selectedAuditAssetTag, setSelectedAuditAssetTag] = useState<string|null>(null);
  const [scannedAssetDetails, setScannedAssetDetails] = useState<Asset|null>(null);
  const [auditVerified] = useState<'unscanned'|'verifying'|'verified'|'damaged'|'missing'>('unscanned');

  // ── localStorage Sync ───────────────────────
  useEffect(() => { localStorage.setItem('af_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('af_credentials', JSON.stringify(credentials)); }, [credentials]);
  useEffect(() => { if (currentUser) localStorage.setItem('af_current_user', JSON.stringify(currentUser)); else localStorage.removeItem('af_current_user'); }, [currentUser]);
  useEffect(() => { localStorage.setItem('af_item_masters', JSON.stringify(itemMasters)); }, [itemMasters]);
  useEffect(() => { localStorage.setItem('af_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('af_notifications', JSON.stringify(notifications)); }, [notifications]);

  // ── Tab Role Guard ──────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const allowed: Record<string, string[]> = {
      'Admin':          ['dashboard','org','assets','allocations','maintenance','audit','logs','products','orders','itemmaster','reports','notifications'],
      'Asset Manager':  ['dashboard','assets','allocations','maintenance','audit','logs','products','orders','itemmaster','reports','notifications'],
      'Department Head':['dashboard','assets','allocations','maintenance','audit','notifications'],
      'Employee':       ['dashboard','assets','allocations','maintenance','audit','notifications'],
    };
    if (!(allowed[currentUser.role] || []).includes(activeTab)) setActiveTab('dashboard');
  }, [currentUser, activeTab]);

  // ── Close notif dropdown on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifBellRef.current && !notifBellRef.current.contains(e.target as Node)) setNotifDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Clock ───────────────────────────────────
  useEffect(() => {
    const tick = () => setCurrentMenuTime(new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', ''));
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  // ── Computed ────────────────────────────────
  const unreadCount = notifications.filter(n => !n.isRead && (n.targetUserId === 'all' || n.targetUserId === currentUser?.email)).length;

  // ── Notification Helpers ────────────────────
  const addNotification = (title: string, message: string, type: AppNotification['type'], link?: string, targetUserId = 'all') => {
    const n: AppNotification = { id: `N${Date.now()}`, title, message, type, isRead: false, targetUserId, createdAt: new Date().toISOString(), link };
    setNotifications(prev => [n, ...prev]);
  };

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

  // ── DeltaLog ────────────────────────────────
  const addLog = (actor: string, action: string, assetTag: string | undefined, detail: string) => {
    const activeActor = currentUser ? `${currentUser.name} (${currentUser.role})` : actor;
    setDeltaLogs(prev => [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), actor: activeActor, action, assetTag, detail }, ...prev]);
  };

  // ── Product Helpers ─────────────────────────
  const getVendorsForProduct = (productId: string) => vendors.filter(v => v.products.some(p => p.productId === productId));
  const getProductVendorEntry = (vendorId: string, productId: string) => vendors.find(v => v.id === vendorId)?.products.find(p => p.productId === productId);
  const getMinPriceForProduct = (productId: string) => { const prices = vendors.flatMap(v => v.products.filter(p => p.productId === productId).map(p => p.price)); return prices.length > 0 ? Math.min(...prices) : 0; };

  const filteredProducts = products.filter(p => {
    const matchSearch = productSearch === '' || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const minPrice = getMinPriceForProduct(p.id);
    let matchPrice = true;
    if (pricePreset === 'under100') matchPrice = minPrice < 100;
    else if (pricePreset === '100to500') matchPrice = minPrice >= 100 && minPrice <= 500;
    else if (pricePreset === 'over500') matchPrice = minPrice > 500;
    else if (pricePreset === 'custom') { const mn = priceMin !== '' ? Number(priceMin) : 0; const mx = priceMax !== '' ? Number(priceMax) : Infinity; matchPrice = minPrice >= mn && minPrice <= mx; }
    return matchSearch && matchCat && matchPrice;
  });
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const productCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  useEffect(() => { setCurrentPage(1); }, [productSearch, productCategoryFilter, pricePreset, priceMin, priceMax]);

  // ── Order Item Form Sync ────────────────────
  const availableVendorsForItem = vendors.filter(v => v.products.some(p => p.productId === orderItemForm.productId));
  useEffect(() => {
    if (availableVendorsForItem.length > 0) {
      const v = availableVendorsForItem[0];
      const vp = v.products.find(p => p.productId === orderItemForm.productId);
      setOrderItemForm(prev => ({ ...prev, vendorId: v.id, unitPrice: vp?.price || 0 }));
    }
  }, [orderItemForm.productId]);
  useEffect(() => {
    const v = vendors.find(v => v.id === orderItemForm.vendorId);
    const vp = v?.products.find(p => p.productId === orderItemForm.productId);
    if (vp) setOrderItemForm(prev => ({ ...prev, unitPrice: vp.price }));
  }, [orderItemForm.vendorId]);

  const addItemToOrder = () => {
    const product = products.find(p => p.id === orderItemForm.productId);
    const vendor = vendors.find(v => v.id === orderItemForm.vendorId);
    if (!product || !vendor) return;
    const oi: OrderItem = { productId: product.id, productName: product.name, quantity: orderItemForm.quantity, unitPrice: orderItemForm.unitPrice, vendorId: vendor.id, vendorName: vendor.name, materialCategory: product.category as MaterialCategory };
    setNewOrder(prev => ({ ...prev, items: [...prev.items, oi] }));
  };

  const removeItemFromOrder = (idx: number) => setNewOrder(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  // ── BOM Total ───────────────────────────────
  const bomTotal = (order: Order) => order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  // ── Create Order ────────────────────────────
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrder.items.length === 0) { alert('Please add at least one item.'); return; }
    const orderNum = `PO-${new Date().getFullYear()}-${String(orders.length + 4).padStart(3, '0')}`;
    const total = newOrder.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const created: Order = { id: `ORD${Date.now()}`, orderNumber: orderNum, date: new Date().toISOString().split('T')[0], customer: newOrder.customer, items: newOrder.items, status: 'Confirmed', notes: newOrder.notes };
    setOrders(prev => [created, ...prev]);
    setActiveBOM(created);
    // Trigger notifications
    addNotification(`✅ Order Placed`, `Order ${orderNum} for ${newOrder.customer} confirmed. Total: ₹${total.toLocaleString()}.`, 'success', 'orders');
    addNotification(`📄 BOM Generated`, `Bill of Materials auto-generated for ${orderNum} with ${newOrder.items.length} line item${newOrder.items.length > 1 ? 's' : ''}.`, 'info', 'orders');
    addLog('System', 'CREATE_ORDER', undefined, `Order ${orderNum} created with ${newOrder.items.length} items. BOM auto-generated.`);
    setNewOrder({ customer: '', notes: '', items: [] });
    setOrderModalOpen(false);
  };

  // ── Add Item Master ─────────────────────────
  const handleAddItemMaster = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ItemMaster = { ...newItem, id: `IM${Date.now()}` };
    setItemMasters(prev => [item, ...prev]);
    // Low stock check
    const threshold = LOW_STOCK_THRESHOLDS[item.materialCategory];
    if (item.quantity < threshold) {
      addNotification(`⚠ Low Stock Alert`, `${item.name} (${item.sku}) added with only ${item.quantity} units — below threshold of ${threshold.toLocaleString()} for ${item.materialCategory}.`, 'alert', 'itemmaster');
    }
    addLog('System', 'ADD_ITEM_MASTER', undefined, `Item Master record created: ${item.name} (${item.materialCategory})`);
    setNewItem({ name:'', sku:'', materialCategory:'Raw Material', quantity:0, rate:0, materialLocation:'', companyName:'', description:'' });
    setItemMasterModalOpen(false);
  };

  // ── Report Data ─────────────────────────────
  const filteredOrders = orders.filter(o => {
    if (reportDateFrom && o.date < reportDateFrom) return false;
    if (reportDateTo && o.date > reportDateTo) return false;
    return true;
  });

  const inventoryData = itemMasters.map(item => ({
    ...item,
    totalValue: item.quantity * item.rate,
    isLowStock: item.quantity < LOW_STOCK_THRESHOLDS[item.materialCategory],
    threshold: LOW_STOCK_THRESHOLDS[item.materialCategory],
  }));
  const totalInventoryValue = inventoryData.reduce((s, i) => s + i.totalValue, 0);

  // Vendor pricing: for each product, get all vendor prices
  const vendorPricingData = products.map(product => {
    const entries = vendors.flatMap(v => v.products.filter(vp => vp.productId === product.id).map(vp => ({ vendorName: v.name, location: v.location, price: vp.price, inStock: vp.inStock })));
    if (entries.length === 0) return null;
    const prices = entries.map(e => e.price);
    return { product, entries, minPrice: Math.min(...prices), maxPrice: Math.max(...prices), avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length };
  }).filter(Boolean) as { product: Product; entries: { vendorName: string; location: string; price: number; inStock: boolean }[]; minPrice: number; maxPrice: number; avgPrice: number }[];

  // ── CSV Exporters ───────────────────────────
  const exportInventoryCSV = () => {
    downloadCSV(`inventory-report-${new Date().toISOString().split('T')[0]}.csv`,
      ['Item Name','SKU','Category','Qty','Rate (₹)','Total Value (₹)','Location','Company','Low Stock'],
      inventoryData.map(i => [i.name, i.sku, i.materialCategory, i.quantity, i.rate, i.totalValue, i.materialLocation, i.companyName, i.isLowStock ? 'YES' : 'No'])
    );
  };
  const exportVendorCSV = () => {
    downloadCSV(`vendor-pricing-report-${new Date().toISOString().split('T')[0]}.csv`,
      ['Product','SKU','Category','Vendor','Location','Price (₹)','In Stock','Min Price','Max Price','Avg Price'],
      vendorPricingData.flatMap(d => d.entries.map(e => [d.product.name, d.product.sku, d.product.category, e.vendorName, e.location, e.price, e.inStock ? 'Yes' : 'No', d.minPrice, d.maxPrice, d.avgPrice.toFixed(2)]))
    );
  };
  const exportOrdersCSV = () => {
    downloadCSV(`orders-report-${new Date().toISOString().split('T')[0]}.csv`,
      ['Order No.','Date','Customer','Status','Items','Total (₹)'],
      filteredOrders.map(o => [o.orderNumber, o.date, o.customer, o.status, o.items.length, bomTotal(o)])
    );
  };

  // ── Existing Asset/Allocation handlers ──────
  const handleRegisterAsset = (e: React.FormEvent) => { e.preventDefault(); const tag = `AF-0${assets.length + 101}`; const a: Asset = { tag, name: newAsset.name, category: newAsset.category, serial: newAsset.serial, cost: Number(newAsset.cost)||0, condition: newAsset.condition, status: 'Available', location: newAsset.location, holder: newAsset.shared ? 'Shared' : 'None', shared: newAsset.shared }; setAssets(prev => [...prev, a]); addLog('', 'REGISTER_ASSET', tag, `Registered ${a.name}`); setNewAsset({ name:'', category:'Electronics', serial:'', cost:'', location:'', condition:'New', shared:false }); setRegisterModalOpen(false); };
  const handleAllocateAsset = (e: React.FormEvent) => { e.preventDefault(); const asset = assets.find(a => a.tag === allocForm.assetTag); if (!asset) return; if (asset.status !== 'Available') { setConflictAsset(asset); setConflictForm(allocForm); setAllocationModalOpen(false); return; } setPendingHandover({ asset, employee: allocForm.employee, returnDate: allocForm.returnDate }); setAllocationModalOpen(false); };
  const executeAllocation = (tag: string, employee: string, returnDate: string) => { setAssets(prev => prev.map(a => a.tag === tag ? { ...a, status: 'Allocated', holder: employee } : a)); addLog('', 'ALLOCATE_ASSET', tag, `Allocated to ${employee}. Return: ${returnDate||'Indefinite'}`); setPendingHandover(null); };
  const handleBooking = (e: React.FormEvent) => { e.preventDefault(); const { resource, start, end } = bookForm; const hasOverlap = bookings.some(b => b.resource === resource && b.status !== 'Cancelled' && (start < b.end) && (end > b.start)); if (hasOverlap) { alert(`Conflict: ${resource} already booked.`); return; } setBookings(prev => [...prev, { id: Date.now(), resource, user: bookForm.employee, start, end, date: bookForm.date, status: 'Upcoming' }]); setAssets(prev => prev.map(a => a.name === resource ? { ...a, status: 'Reserved' } : a)); addLog('', 'BOOK_RESOURCE', undefined, `Booked ${resource}`); setBookingModalOpen(false); };
  const handleMaintenance = (e: React.FormEvent) => { e.preventDefault(); setMaintenance(prev => [...prev, { id: Date.now(), assetTag: maintForm.assetTag, description: maintForm.description, priority: maintForm.priority, status: 'Pending' }]); addLog('', 'RAISE_MAINTENANCE', maintForm.assetTag, `Raised ticket for ${maintForm.assetTag}`); setMaintForm({ assetTag: 'AF-0114', description: '', priority: 'Medium' }); setMaintenanceModalOpen(false); };
  const approveMaintenance = (id: number) => { let tag = ''; setMaintenance(prev => prev.map(t => { if (t.id === id) { tag = t.assetTag; return { ...t, status: 'Approved' }; } return t; })); setAssets(prev => prev.map(a => a.tag === tag ? { ...a, status: 'Under Maintenance' } : a)); addLog('', 'APPROVE_MAINTENANCE', tag, 'Approved'); };
  const resolveMaintenance = (id: number) => { let tag = ''; setMaintenance(prev => prev.map(t => { if (t.id === id) { tag = t.assetTag; return { ...t, status: 'Resolved' }; } return t; })); setAssets(prev => prev.map(a => a.tag === tag ? { ...a, status: 'Available' } : a)); addLog('', 'RESOLVE_MAINTENANCE', tag, 'Resolved'); };
  const handleAuditorScan = (tag: string) => { const asset = assets.find(a => a.tag === tag); if (!asset) return; setSelectedAuditAssetTag(tag); setScannedAssetDetails(asset); };
  const saveAuditStatus = (status: 'Verified'|'Missing'|'Damaged') => { if (!selectedAuditAssetTag) return; setAudits(prev => prev.map(c => c.id === 12 ? { ...c, items: c.items.map(i => i.assetTag === selectedAuditAssetTag ? { ...i, auditedStatus: status } : i) } : c)); setAssets(prev => prev.map(a => { if (a.tag === selectedAuditAssetTag) { if (status === 'Missing') return { ...a, status: 'Lost' as any, condition: 'Missing' }; if (status === 'Damaged') return { ...a, condition: 'Damaged' }; return { ...a, condition: 'Good' }; } return a; })); if (status === 'Damaged') setMaintenance(prev => [...prev, { id: Date.now(), assetTag: selectedAuditAssetTag, description: 'Audit Flag: Damaged during cycle #12', priority: 'High', status: 'Pending' }]); addLog('', status === 'Damaged' ? 'AUDIT_FLAG_DISCREPANCY' : 'AUDIT_VERIFY', selectedAuditAssetTag, `Audited: ${status}`); setSelectedAuditAssetTag(null); setScannedAssetDetails(null); };
  const handlePromoteRole = (email: string) => { setEmployees(prev => prev.map(emp => { if (emp.email === email) { const r = emp.role === 'Employee' ? 'Asset Manager' : emp.role === 'Asset Manager' ? 'Department Head' : emp.role === 'Department Head' ? 'Admin' : 'Employee'; const updated = { ...emp, role: r as Employee['role'] }; if (currentUser?.email === email) setCurrentUser(updated); return updated; } return emp; })); };
  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); setAuthError(''); const email = authEmail.trim().toLowerCase(); if (!email || !authPassword) { setAuthError('Please fill in all fields.'); return; } if (credentials[email] === authPassword) { const user = employees.find(emp => emp.email.toLowerCase() === email); if (user) { if (user.status === 'Inactive') { setAuthError('Account deactivated.'); return; } setCurrentUser(user); setAuthEmail(''); setAuthPassword(''); addLog(`${user.name}`, 'USER_LOGIN', undefined, 'Logged in.'); } else setAuthError('User not found.'); } else setAuthError('Invalid email or password.'); };
  const handleSignup = (e: React.FormEvent) => { e.preventDefault(); setAuthError(''); const name = authName.trim(); const email = authEmail.trim().toLowerCase(); if (!name||!email||!authPassword||!authConfirmPassword) { setAuthError('Please fill in all fields.'); return; } if (authPassword !== authConfirmPassword) { setAuthError('Passwords do not match.'); return; } if (credentials[email]) { setAuthError('Account already exists.'); return; } const newEmp: Employee = { name, email, department: authDept, role: 'Employee', status: 'Active' }; setEmployees(prev => [...prev, newEmp]); setCredentials(prev => ({ ...prev, [email]: authPassword })); setCurrentUser(newEmp); setAuthName(''); setAuthEmail(''); setAuthPassword(''); setAuthConfirmPassword(''); };
  const handleForgot = (e: React.FormEvent) => { e.preventDefault(); setAuthError(''); setAuthSuccess(''); const email = authEmail.trim().toLowerCase(); if (!email) { setAuthError('Please enter your email.'); return; } if (credentials[email]) setAuthSuccess(`Password: [${credentials[email]}]`); else setAuthError('No account found.'); };
  const handleLogout = () => { if (currentUser) addLog(`${currentUser.name}`, 'USER_LOGOUT', undefined, 'Logged out.'); setCurrentUser(null); };

  // ── Notification Icon Config ────────────────
  const notifIconConfig: Record<AppNotification['type'], { icon: React.ReactNode; color: string; bg: string }> = {
    alert:   { icon: <AlertCircle className="w-4 h-4" />,   color: 'text-red-400',     bg: 'bg-red-950/40' },
    warning: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-400',   bg: 'bg-amber-950/40' },
    info:    { icon: <Info className="w-4 h-4" />,          color: 'text-sky-400',     bg: 'bg-sky-950/40' },
    success: { icon: <CheckCircle2 className="w-4 h-4" />,  color: 'text-emerald-400', bg: 'bg-emerald-950/40' },
  };

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white font-sans">

      {/* Background Video */}
      <div className="fixed inset-0 z-0 pointer-events-none no-print">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4" />
      </div>
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/5 z-[5] no-print" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/5 z-[5] no-print" />

      {currentUser === null ? (
        /* ════════════════ LOGIN ════════════════ */
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
          <div className="flex flex-col items-center mb-6 text-center">
            <Cpu className="w-12 h-12 text-white mb-4 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase text-white">AssetFlow</h1>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-2">Enterprise Asset &amp; Resource Management</span>
          </div>
          <div className="premium-glass p-8 rounded-3xl border border-white/10 w-full max-w-md text-left font-mono">
            {authMode !== 'forgot' && (
              <div className="flex gap-4 border-b border-white/5 pb-4 mb-6">
                <button onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthSuccess(''); }} className={`flex-1 py-2 text-center text-xs font-semibold uppercase tracking-wider rounded-lg transition ${authMode==='signin'?'bg-white/10 text-white border border-white/10':'text-white/50 hover:text-white'}`}>Sign In</button>
                <button onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }} className={`flex-1 py-2 text-center text-xs font-semibold uppercase tracking-wider rounded-lg transition ${authMode==='signup'?'bg-white/10 text-white border border-white/10':'text-white/50 hover:text-white'}`}>Sign Up</button>
              </div>
            )}
            {authError && <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-xl mb-4 flex items-center gap-2"><ShieldAlert className="w-4 h-4 shrink-0"/>{authError}</div>}
            {authSuccess && <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs rounded-xl mb-4 flex items-center gap-2"><Check className="w-4 h-4 shrink-0"/>{authSuccess}</div>}
            {authMode==='signin' && (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Email</label><input type="email" required value={authEmail} onChange={e=>setAuthEmail(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="admin@assetflow.com"/></div>
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Password</label><input type="password" required value={authPassword} onChange={e=>setAuthPassword(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="••••••••"/></div>
                <div className="flex justify-end"><button type="button" onClick={()=>{setAuthMode('forgot');setAuthError('');setAuthSuccess('');}} className="text-[10px] text-brand hover:underline font-semibold">Forgot Password?</button></div>
                <button type="submit" className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider rounded-lg transition shadow-lg shadow-brand/20">Log In</button>
                <div className="text-center pt-3 text-[10px] text-zinc-500 border-t border-white/5 mt-2">Demo: <span className="text-zinc-400">admin@assetflow.com</span> / <span className="text-zinc-400">admin123</span></div>
              </form>
            )}
            {authMode==='signup' && (
              <form onSubmit={handleSignup} className="space-y-4 text-xs">
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Full Name</label><input type="text" required value={authName} onChange={e=>setAuthName(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="John Doe"/></div>
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Email</label><input type="email" required value={authEmail} onChange={e=>setAuthEmail(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="john@assetflow.com"/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Password</label><input type="password" required value={authPassword} onChange={e=>setAuthPassword(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="••••••••"/></div>
                  <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Confirm</label><input type="password" required value={authConfirmPassword} onChange={e=>setAuthConfirmPassword(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="••••••••"/></div>
                </div>
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Department</label><select value={authDept} onChange={e=>setAuthDept(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"><option>Engineering</option><option>Design</option><option>Operations</option><option value="Audit & Compliance">Audit &amp; Compliance</option></select></div>
                <button type="submit" className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider rounded-lg transition">Create Account</button>
              </form>
            )}
            {authMode==='forgot' && (
              <form onSubmit={handleForgot} className="space-y-4 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 pb-2 border-b border-white/5 mb-2">Recover Password</h4>
                <div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Email</label><input type="email" required value={authEmail} onChange={e=>setAuthEmail(e.target.value)} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="admin@assetflow.com"/></div>
                <button type="submit" className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider rounded-lg transition">Retrieve</button>
                <button type="button" onClick={()=>{setAuthMode('signin');setAuthError('');setAuthSuccess('');}} className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider rounded-lg transition">← Back</button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* ════════════════ AUTHENTICATED ════════════════ */
        <>
          {/* ── Top Bar ── */}
          <div className="relative z-30 w-full h-10 bg-black/50 backdrop-blur-md border-b border-white/10 no-print">
            <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-4">
                <AppleLogo className="w-3.5 h-3.5 text-zinc-300 stroke-[2.5]"/>
                <span className="font-extrabold uppercase tracking-wide text-zinc-400">AssetFlow</span>
              </div>
              <div className="flex items-center gap-4 text-white/50">
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 text-[9px] uppercase font-bold tracking-wide">Active: {currentUser.role}</span>
                <span className="font-mono text-[10px] tracking-widest">{currentMenuTime}</span>

                {/* ── Notification Bell ── */}
                <div className="relative" ref={notifBellRef}>
                  <button
                    onClick={() => setNotifDropdownOpen(o => !o)}
                    className="relative p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 top-8 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <span className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2"><Bell className="w-3.5 h-3.5 text-brand"/>Notifications</span>
                        <button onClick={markAllRead} className="text-[9px] text-zinc-500 hover:text-brand font-bold uppercase tracking-wider transition flex items-center gap-1"><CheckCheck className="w-3 h-3"/>Mark all read</button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.slice(0, 8).map(n => {
                          const cfg = notifIconConfig[n.type];
                          return (
                            <button key={n.id} onClick={() => { markRead(n.id); if (n.link) { setActiveTab(n.link as any); setNotifDropdownOpen(false); } }}
                              className={`w-full text-left flex gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.04] transition ${!n.isRead ? 'bg-white/[0.03]' : ''}`}>
                              <div className={`w-7 h-7 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 mt-0.5`}>{cfg.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <span className={`text-[11px] font-bold leading-tight ${!n.isRead ? 'text-white' : 'text-zinc-400'}`}>{n.title}</span>
                                  {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1" />}
                                </div>
                                <p className="text-[10px] text-zinc-500 leading-snug mt-0.5 line-clamp-2">{n.message}</p>
                                <span className="text-[9px] text-zinc-600 font-mono mt-0.5 block">{timeAgo(n.createdAt)}</span>
                              </div>
                            </button>
                          );
                        })}
                        {notifications.length === 0 && <div className="py-8 text-center text-zinc-600 text-xs font-mono">No notifications</div>}
                      </div>
                      <div className="px-4 py-2.5 border-t border-white/5">
                        <button onClick={() => { setActiveTab('notifications'); setNotifDropdownOpen(false); }} className="w-full text-center text-[10px] font-bold text-brand hover:text-brand/80 uppercase tracking-wider transition">View All Notifications →</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">

            {/* ── Sidebar ── */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-6 no-print">
              <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left">
                <div className="flex items-center gap-2.5 mb-6">
                  <Cpu className="w-5 h-5 text-white animate-pulse"/>
                  <div><h1 className="text-sm font-bold tracking-wide uppercase font-mono leading-none">AssetFlow</h1><span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">ERP Engine</span></div>
                </div>
                <div className="space-y-1">
                  {[
                    { id:'dashboard',     label:'Dashboard',           icon:BarChart3,     roles:['Admin','Asset Manager','Department Head','Employee'] },
                    { id:'org',           label:'Organization Setup',   icon:Building2,     roles:['Admin'] },
                    { id:'assets',        label:'Asset Registry',       icon:Laptop,        roles:['Admin','Asset Manager','Department Head','Employee'] },
                    { id:'allocations',   label:'Allocations & Buffer', icon:Clock,         roles:['Admin','Asset Manager','Department Head','Employee'] },
                    { id:'maintenance',   label:'Maintenance',          icon:Wrench,        roles:['Admin','Asset Manager','Department Head','Employee'] },
                    { id:'audit',         label:'Physical Audit (QR)',  icon:ClipboardCheck,roles:['Admin','Asset Manager','Department Head','Employee'] },
                    { id:'logs',          label:'Delta Logs',           icon:History,       roles:['Admin','Asset Manager'] },
                    { id:'products',      label:'Products & Vendors',   icon:Package,       roles:['Admin','Asset Manager'] },
                    { id:'orders',        label:'Orders & BOM',         icon:ShoppingCart,  roles:['Admin','Asset Manager'] },
                    { id:'itemmaster',    label:'Item Master',          icon:Layers,        roles:['Admin','Asset Manager'] },
                    { id:'reports',       label:'Reports',              icon:BarChart2,     roles:['Admin','Asset Manager'] },
                    { id:'notifications', label:'Notifications',        icon:Bell,          roles:['Admin','Asset Manager','Department Head','Employee'] },
                  ].filter(tab => tab.roles.includes(currentUser.role)).map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition relative ${activeTab===tab.id?'bg-brand text-white shadow shadow-brand/20':'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                      <tab.icon className="w-4 h-4 shrink-0"/>
                      <span className="flex-1 text-left">{tab.label}</span>
                      {tab.id === 'notifications' && unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left space-y-3">
                <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold font-mono">Quick Operations</span>
                <div className="flex flex-col gap-2">
                  {(currentUser.role==='Admin'||currentUser.role==='Asset Manager') && (
                    <>
                      <button onClick={()=>setRegisterModalOpen(true)} className="w-full py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"><Plus className="w-3.5 h-3.5"/>Register Asset</button>
                      <button onClick={()=>setAllocationModalOpen(true)} className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"><ArrowRight className="w-3.5 h-3.5 text-brand"/>Allocate Asset</button>
                      <button onClick={()=>setOrderModalOpen(true)} className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"><ShoppingCart className="w-3.5 h-3.5 text-purple-400"/>New Order / BOM</button>
                    </>
                  )}
                  <button onClick={()=>setBookingModalOpen(true)} className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"><Clock className="w-3.5 h-3.5 text-indigo-400"/>Book Resource</button>
                  {(currentUser.role==='Admin'||currentUser.role==='Employee') && (
                    <button onClick={()=>setMaintenanceModalOpen(true)} className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"><Wrench className="w-3.5 h-3.5 text-amber-400"/>Raise Maintenance</button>
                  )}
                </div>
              </div>

              {/* Profile */}
              <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold font-mono">Logged In As</span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="w-8 h-8 rounded-full bg-zinc-850 flex items-center justify-center font-bold text-xs uppercase text-zinc-300 border border-white/10">{currentUser.name.split(' ').map(n=>n[0]).join('')}</div>
                    <div className="flex-1 min-w-0"><h4 className="text-xs font-bold truncate text-white leading-tight">{currentUser.name}</h4><p className="text-[9px] text-zinc-500 truncate leading-tight font-mono mt-0.5">{currentUser.email}</p></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-[10px] border-t border-b border-white/5 py-3">
                  <div className="flex justify-between"><span className="text-zinc-500">Dept:</span><span className="text-zinc-300 font-semibold">{currentUser.department}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Role:</span><span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${currentUser.role==='Admin'?'bg-red-950/60 text-red-400 border border-red-900/30':currentUser.role==='Asset Manager'?'bg-brand/10 text-brand border border-brand/20':currentUser.role==='Department Head'?'bg-purple-950/60 text-purple-400 border border-purple-900/30':'bg-zinc-900 text-zinc-400'}`}>{currentUser.role}</span></div>
                </div>
                <button onClick={handleLogout} className="w-full py-2 border border-red-900/30 hover:border-red-500 bg-red-950/10 hover:bg-red-950/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition">Log Out</button>
              </div>
            </div>

            {/* ── Content Pane ── */}
            <div className="flex-1 min-w-0">

              {/* ════ DASHBOARD ════ */}
              {activeTab==='dashboard' && (
                <div className="space-y-6">
                  <div className="premium-glass p-8 rounded-3xl border border-white/5 text-left relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(400px_circle_at_100%_0%,rgba(61,129,227,0.15),transparent_70%)] pointer-events-none"/>
                    <span className="text-[10px] bg-brand/10 border border-brand/20 text-brand px-3 py-1 rounded-full uppercase tracking-wider font-mono font-bold w-fit block">Live Operations Status</span>
                    <h2 className="text-3xl md:text-5xl font-black mt-4 tracking-tight leading-none uppercase">Asset Lifecycle <br/><span className="bg-gradient-to-r from-brand via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Central Command</span></h2>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[{ label:'Available', value:assets.filter(a=>a.status==='Available').length, color:'text-emerald-400', bg:'bg-emerald-950/20'},{ label:'Allocated', value:assets.filter(a=>a.status==='Allocated').length, color:'text-brand', bg:'bg-brand/10'},{ label:'Servicing', value:assets.filter(a=>a.status==='Under Maintenance').length, color:'text-amber-400', bg:'bg-amber-950/20'},{ label:'Active Bookings', value:bookings.filter(b=>b.status==='Ongoing').length, color:'text-indigo-400', bg:'bg-indigo-950/20'}].map(k=>(
                      <div key={k.label} className={`premium-glass p-5 rounded-2xl border border-white/5 text-left ${k.bg}`}><span className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wide">{k.label}</span><h3 className={`text-3xl font-extrabold font-mono mt-2 ${k.color}`}>{k.value}</h3></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[{ label:'Products', value:products.length, color:'text-purple-400', bg:'bg-purple-950/20'},{ label:'Vendors', value:vendors.length, color:'text-cyan-400', bg:'bg-cyan-950/20'},{ label:'Notifications', value:unreadCount, color:'text-red-400', bg:'bg-red-950/20'}].map(k=>(
                      <div key={k.label} className={`premium-glass p-5 rounded-2xl border border-white/5 text-left ${k.bg}`}><span className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wide">{k.label}</span><h3 className={`text-3xl font-extrabold font-mono mt-2 ${k.color}`}>{k.value}</h3></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 premium-glass p-6 rounded-2xl border border-white/5 text-left">
                      <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-4"><ShieldAlert className="w-5 h-5 text-red-500"/><h3 className="text-sm font-bold uppercase tracking-wider font-mono">Overdue Returns &amp; Warnings</h3></div>
                      <div className="space-y-3">
                        {(currentUser.role==='Admin'||currentUser.role==='Asset Manager'||currentUser.name==='Priya Sharma') && (
                          <div className="p-3 bg-red-950/10 border border-red-900/30 rounded-xl flex items-center justify-between text-xs"><div className="flex flex-col gap-0.5"><span className="text-red-400 font-bold uppercase tracking-wider font-mono text-[9px]">OVERDUE RETURN</span><span className="text-zinc-200">MacBook Pro M3 (AF-0114) with Priya Sharma</span></div><span className="font-mono text-zinc-500 text-[10px]">Expected: 2026-06-30</span></div>
                        )}
                        <div className="p-3 bg-amber-950/10 border border-amber-900/30 rounded-xl flex items-center justify-between text-xs"><div className="flex flex-col gap-0.5"><span className="text-amber-400 font-bold uppercase tracking-wider font-mono text-[9px]">PREDICTIVE MAINTENANCE</span><span className="text-zinc-200">3 Electronic assets due for service calibration</span></div><span className="font-mono text-zinc-500 text-[10px]">Threshold: 180 Days</span></div>
                      </div>
                    </div>
                    <div className="lg:col-span-4 premium-glass p-6 rounded-2xl border border-white/5 text-left flex flex-col justify-between">
                      <div><span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Locks</span><h3 className="text-sm font-bold text-white mt-1 uppercase font-mono">DB Concurrency</h3><p className="text-[11px] text-zinc-500 leading-relaxed mt-2 font-light">Row-Level Locking prevents simultaneous double bookings.</p></div>
                      <div className="pt-4 border-t border-white/5 mt-4 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5"><Check className="w-3.5 h-3.5"/>No overlap errors</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ ORG SETUP ════ */}
              {activeTab==='org' && currentUser.role==='Admin' && (
                <div className="space-y-6">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left">
                    <div className="flex gap-4 border-b border-white/5 pb-4">
                      {[{id:'departments',label:'Departments'},{id:'categories',label:'Asset Categories'},{id:'employees',label:'Employee Directory'}].map(s=>(
                        <button key={s.id} onClick={()=>setOrgSubTab(s.id as any)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition ${orgSubTab===s.id?'bg-white/10 text-white border border-white/10':'text-white/50 hover:text-white'}`}>{s.label}</button>
                      ))}
                    </div>
                    <div className="pt-4 font-mono text-xs">
                      {orgSubTab==='departments' && (<div className="space-y-3"><div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-4">DEPARTMENT</span><span className="col-span-4">HEAD</span><span className="col-span-2">PARENT</span><span className="col-span-2 text-right">STATUS</span></div>{departments.map((d,i)=>(<div key={i} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300"><span className="col-span-4 font-bold text-white">{d.name}</span><span className="col-span-4">{d.head}</span><span className="col-span-2 text-zinc-500">{d.parent}</span><span className="col-span-2 text-right text-emerald-400">{d.status}</span></div>))}</div>)}
                      {orgSubTab==='categories' && (<div className="space-y-3"><div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-4">CATEGORY</span><span className="col-span-4">WARRANTY</span><span className="col-span-4 text-right">CUSTOM FIELD</span></div>{categories.map((c,i)=>(<div key={i} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300"><span className="col-span-4 font-bold text-white">{c.name}</span><span className="col-span-4">{c.warrantyPeriod===0?'Indefinite':`${c.warrantyPeriod} Days`}</span><span className="col-span-4 text-right text-zinc-500">{c.customField||'None'}</span></div>))}</div>)}
                      {orgSubTab==='employees' && (<div className="space-y-3"><div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-4">EMPLOYEE</span><span className="col-span-4">DEPARTMENT</span><span className="col-span-2">ROLE</span><span className="col-span-2 text-right">ACTION</span></div>{employees.map((emp,i)=>(<div key={i} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300"><div className="col-span-4 flex flex-col"><span className="font-bold text-white">{emp.name}</span><span className="text-[9px] text-zinc-500">{emp.email}</span></div><span className="col-span-4">{emp.department}</span><span className="col-span-2"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${emp.role==='Admin'?'bg-red-950/60 text-red-400 border border-red-900/30':emp.role==='Asset Manager'?'bg-brand/10 text-brand border border-brand/20':emp.role==='Department Head'?'bg-purple-950/60 text-purple-400 border border-purple-900/30':'bg-zinc-900 text-zinc-400'}`}>{emp.role.toUpperCase()}</span></span><div className="col-span-2 text-right"><button onClick={()=>handlePromoteRole(emp.email)} className="px-2 py-1 border border-zinc-800 hover:border-brand bg-zinc-950 hover:bg-brand/10 text-[9px] uppercase font-bold rounded transition text-zinc-400 hover:text-white">Elevate</button></div></div>))}</div>)}
                    </div>
                  </div>
                </div>
              )}

              {/* ════ ASSET REGISTRY ════ */}
              {activeTab==='assets' && (
                <div className="space-y-6">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4"><h3 className="text-sm font-bold font-mono uppercase tracking-wide">Registered Assets Directory</h3><span className="text-[10px] text-zinc-500 font-mono">Count: {assets.length} items</span></div>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-2">TAG</span><span className="col-span-3">NAME</span><span className="col-span-3">CATEGORY</span><span className="col-span-2">HOLDER</span><span className="col-span-2 text-right">STATUS</span></div>
                      {assets.map(a=>(
                        <div key={a.tag} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300">
                          <span className="col-span-2 font-bold text-white">{a.tag}</span>
                          <div className="col-span-3 flex flex-col"><span className="font-semibold text-zinc-200">{a.name}</span><span className="text-[9px] text-zinc-500">{a.serial}</span></div>
                          <span className="col-span-3">{a.category}</span>
                          <span className="col-span-2 text-zinc-400">{a.holder}</span>
                          <span className="col-span-2 text-right"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${a.status==='Available'?'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30':a.status==='Allocated'?'bg-brand/10 text-brand border border-brand/20':a.status==='Under Maintenance'?'bg-amber-950/60 text-amber-400 border border-amber-900/30':'bg-zinc-900 text-zinc-500'}`}>{a.status}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════ ALLOCATIONS ════ */}
              {activeTab==='allocations' && (
                <div className="space-y-6 text-left">
                  {pendingHandover && (<div className="premium-glass p-5 rounded-2xl border border-brand/20 bg-brand/5"><div className="flex items-center gap-2 pb-3 border-b border-brand/10 mb-3 text-brand"><ClipboardCheck className="w-5 h-5 animate-pulse"/><h3 className="text-sm font-bold uppercase tracking-wider font-mono">Digital Handover Sign-off Required</h3></div><p className="text-xs text-zinc-300 leading-relaxed">Allocation for [<strong>{pendingHandover.asset.name}</strong>] to [<strong>{pendingHandover.employee}</strong>] staged. Employee must acknowledge condition [<strong>{pendingHandover.asset.condition}</strong>].</p><div className="flex gap-2.5 mt-4"><button onClick={()=>executeAllocation(pendingHandover.asset.tag,pendingHandover.employee,pendingHandover.returnDate)} className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded text-xs font-bold uppercase tracking-wider transition">E-Sign Handover</button><button onClick={()=>setPendingHandover(null)} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded text-xs font-bold uppercase tracking-wider transition">Cancel</button></div></div>)}
                  {conflictAsset && (<div className="premium-glass p-5 rounded-2xl border border-red-500/20 bg-red-950/5"><div className="flex items-center gap-2 pb-3 border-b border-red-950/30 mb-3 text-red-400"><AlertTriangle className="w-5 h-5"/><h3 className="text-sm font-bold uppercase tracking-wider font-mono">Conflict Alert</h3></div><p className="text-xs text-zinc-300">[<strong>{conflictAsset.name}</strong>] is [{conflictAsset.status}] by [{conflictAsset.holder}].</p><div className="flex flex-col gap-2 mt-4 max-w-md font-mono text-xs"><button onClick={()=>{addLog(conflictForm.employee,'REQUEST_TRANSFER',conflictAsset.tag,`Transfer from ${conflictAsset.holder}`);setConflictAsset(null);alert('Transfer request dispatched.');}} className="text-left p-2.5 rounded bg-zinc-950 border border-zinc-900 hover:border-brand/40 text-brand transition">&gt; Option 1. Dispatch Transfer request</button><button onClick={()=>{const alt=assets.find(a=>a.status==='Available'&&a.category===conflictAsset.category);if(alt){setPendingHandover({asset:alt,employee:conflictForm.employee,returnDate:conflictForm.returnDate});setConflictAsset(null);}else alert('No alternatives found.');}} className="text-left p-2.5 rounded bg-zinc-950 border border-zinc-900 hover:border-brand/40 text-brand transition">&gt; Option 2. Allocate alternative asset</button><button onClick={()=>{addLog(conflictForm.employee,'JOIN_WAITLIST',conflictAsset.tag,`Joined queue`);setConflictAsset(null);alert('Joined waitlist.');}} className="text-left p-2.5 rounded bg-zinc-950 border border-zinc-900 hover:border-brand/40 text-brand transition">&gt; Option 3. Join Waitlist Queue</button></div></div>)}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="premium-glass p-5 rounded-2xl border border-white/5"><h3 className="text-xs font-bold font-mono uppercase tracking-wide pb-3 border-b border-white/5 mb-3">Active Reservations</h3><div className="space-y-2 font-mono text-[11px]">{bookings.map(b=>(<div key={b.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-900 flex justify-between items-center"><div className="flex flex-col gap-0.5"><span className="text-zinc-200 font-bold uppercase">{b.resource}</span><span className="text-zinc-500">By: {b.user}</span></div><div className="text-right"><span className="block text-brand">{b.start} - {b.end}</span><span className="text-[9px] px-1.5 py-0.5 bg-indigo-950 text-indigo-400 rounded">+15m Buffer</span></div></div>))}</div></div>
                    <div className="premium-glass p-5 rounded-2xl border border-white/5"><h3 className="text-xs font-bold font-mono uppercase tracking-wide pb-3 border-b border-white/5 mb-3">Buffer Policies</h3><ul className="space-y-3 text-zinc-400 text-xs"><li><strong className="text-zinc-200 uppercase font-mono text-[9px] tracking-wider block">Transition Buffer</strong>15-minute cleaning slot after each shared resource booking.</li><li><strong className="text-zinc-200 uppercase font-mono text-[9px] tracking-wider block">Category Grouping</strong>Book by Group Category rather than single units.</li></ul></div>
                  </div>
                </div>
              )}

              {/* ════ MAINTENANCE ════ */}
              {activeTab==='maintenance' && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4"><h3 className="text-sm font-bold font-mono uppercase tracking-wide">Active Repair Tickets</h3>{(currentUser.role==='Admin'||currentUser.role==='Employee')&&(<button onClick={()=>setMaintenanceModalOpen(true)} className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-black text-[10px] font-bold uppercase tracking-wider font-mono rounded">Raise Request</button>)}</div>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-2">ASSET</span><span className="col-span-4">ISSUE</span><span className="col-span-2">PRIORITY</span><span className="col-span-2">STATUS</span><span className="col-span-2 text-right">ACTION</span></div>
                      {maintenance.map(t=>(<div key={t.id} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300"><span className="col-span-2 font-bold text-white">{t.assetTag}</span><span className="col-span-4 truncate pr-4">{t.description}</span><span className="col-span-2"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${t.priority==='High'?'bg-red-950/60 text-red-400':'bg-zinc-900 text-zinc-500'}`}>{t.priority}</span></span><span className="col-span-2 text-zinc-400">{t.status}</span><div className="col-span-2 text-right">{t.status==='Pending'&&(currentUser.role==='Admin'||currentUser.role==='Asset Manager')&&(<button onClick={()=>approveMaintenance(t.id)} className="px-2 py-1 bg-brand text-white text-[9px] uppercase font-bold rounded hover:bg-brand/90 transition">Approve</button>)}{t.status==='Approved'&&(currentUser.role==='Admin'||currentUser.role==='Asset Manager')&&(<button onClick={()=>resolveMaintenance(t.id)} className="px-2 py-1 bg-emerald-700 text-white text-[9px] uppercase font-bold rounded hover:bg-emerald-600 transition">Resolve</button>)}{t.status==='Resolved'&&(<span className="text-[10px] text-zinc-500 font-bold uppercase">Resolved ✓</span>)}</div></div>))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════ AUDIT ════ */}
              {activeTab==='audit' && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4"><div><h3 className="text-sm font-bold font-mono uppercase tracking-wide">Physical Audit Cycle</h3><span className="text-[10px] text-zinc-500 font-mono block mt-1">Cycle #12 · Auditor: Sarah Jenkins</span></div><span className="px-2.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 text-[9px] font-bold uppercase font-mono">Active Run</span></div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
                      <div className="lg:col-span-7 space-y-3 font-mono text-xs">
                        <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2"><span className="col-span-3">TAG</span><span className="col-span-5">ASSET</span><span className="col-span-4 text-right">STATUS</span></div>
                        {audits[0].items.map(item=>(<div key={item.assetTag} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300"><span className="col-span-3 font-bold text-white">{item.assetTag}</span><span className="col-span-5">{item.name}</span><div className="col-span-4 text-right flex items-center justify-end gap-2"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.auditedStatus==='Verified'?'bg-emerald-950/60 text-emerald-400':item.auditedStatus==='Missing'?'bg-red-950/60 text-red-400':item.auditedStatus==='Damaged'?'bg-amber-950/60 text-amber-400':'bg-zinc-900 text-zinc-500'}`}>{item.auditedStatus}</span><button onClick={()=>handleAuditorScan(item.assetTag)} className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition"><QrCode className="w-3.5 h-3.5"/></button></div></div>))}
                      </div>
                      <div className="lg:col-span-5">
                        {scannedAssetDetails ? (
                          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs space-y-3">
                            <div className="flex items-center gap-2 text-brand"><QrCode className="w-4 h-4 animate-pulse"/><span className="font-bold uppercase text-[10px]">QR Scan — {scannedAssetDetails.tag}</span></div>
                            <div className="space-y-1.5 text-zinc-400"><div className="flex justify-between"><span>Asset:</span><span className="text-white font-bold">{scannedAssetDetails.name}</span></div><div className="flex justify-between"><span>Location:</span><span className="text-zinc-300">{scannedAssetDetails.location}</span></div><div className="flex justify-between"><span>Condition:</span><span className="text-zinc-300">{scannedAssetDetails.condition}</span></div></div>
                            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2"><span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Mark As:</span><button onClick={()=>saveAuditStatus('Verified')} className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase text-[10px] rounded transition">✓ Verified</button><button onClick={()=>saveAuditStatus('Damaged')} className="w-full py-1.5 bg-amber-700 hover:bg-amber-600 text-white font-bold uppercase text-[10px] rounded transition">⚠ Damaged</button><button onClick={()=>saveAuditStatus('Missing')} className="w-full py-1.5 bg-red-700 hover:bg-red-600 text-white font-bold uppercase text-[10px] rounded transition">✗ Missing</button></div>
                          </div>
                        ) : (
                          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-3 h-full min-h-[200px] font-mono text-xs"><QrCode className="w-8 h-8 text-zinc-700"/><span className="text-zinc-600 text-center">Click QR icon to simulate scanning</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ LOGS ════ */}
              {activeTab==='logs' && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4"><h3 className="text-sm font-bold font-mono uppercase tracking-wide">Compliance Delta Logs</h3><span className="text-[10px] text-zinc-500 font-mono">{deltaLogs.length} entries</span></div>
                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 font-mono text-[11px] h-[340px] overflow-y-auto space-y-3">
                      {deltaLogs.map(log=>(<div key={log.id} className="border-l border-zinc-800 pl-3.5 py-0.5 text-left"><div className="flex items-center gap-2"><span className="text-[9px] text-zinc-600">[{log.timestamp}]</span><span className="px-1.5 py-0.5 bg-brand/10 text-brand rounded text-[9px] border border-brand/20 font-bold uppercase">{log.action}</span><span className="text-zinc-400 font-bold text-[10px]">{log.actor}</span></div><div className="text-zinc-500 text-[10px] mt-1 leading-normal font-light">{log.detail}</div></div>))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════ PRODUCTS & VENDORS ════ */}
              {activeTab==='products' && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_0%_100%,rgba(139,92,246,0.12),transparent_70%)] pointer-events-none"/>
                    <div className="flex items-center gap-3 mb-1"><Package className="w-5 h-5 text-purple-400"/><h2 className="text-lg font-black uppercase tracking-tight font-mono">Products &amp; Vendor Catalog</h2></div>
                    <p className="text-xs text-zinc-500 font-mono">Search products to see vendor supply and pricing.</p>
                  </div>
                  {/* Filters */}
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold font-mono uppercase tracking-wider text-zinc-400"><Filter className="w-3.5 h-3.5"/>Filters &amp; Search</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1 relative"><Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/><input type="text" placeholder="Search by name or SKU..." value={productSearch} onChange={e=>setProductSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono outline-none focus:border-brand"/></div>
                      <div><select value={productCategoryFilter} onChange={e=>setProductCategoryFilter(e.target.value)} className="w-full py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono outline-none focus:border-brand">{productCategories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                      <div className="flex flex-wrap gap-2 items-center">
                        {[{key:'all',label:'All'},{key:'under100',label:'Under ₹100'},{key:'100to500',label:'₹100–₹500'},{key:'over500',label:'₹500+'},{key:'custom',label:'Custom'}].map(p=>(
                          <button key={p.key} onClick={()=>setPricePreset(p.key as any)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider border transition ${pricePreset===p.key?'bg-brand text-white border-brand':'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>{p.label}</button>
                        ))}
                      </div>
                    </div>
                    {pricePreset==='custom' && (<div className="flex gap-3 mt-3 items-center"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">₹</span><input type="number" placeholder="Min" value={priceMin} onChange={e=>setPriceMin(e.target.value)} className="w-28 pl-7 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono outline-none focus:border-brand"/></div><span className="text-zinc-600 text-xs">—</span><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">₹</span><input type="number" placeholder="Max" value={priceMax} onChange={e=>setPriceMax(e.target.value)} className="w-28 pl-7 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono outline-none focus:border-brand"/></div></div>)}
                  </div>
                  {/* Product List */}
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4"><h3 className="text-sm font-bold font-mono uppercase tracking-wide">Product Directory</h3><span className="text-[10px] text-zinc-500 font-mono">Showing {filteredProducts.length===0?0:(currentPage-1)*ITEMS_PER_PAGE+1}–{Math.min(currentPage*ITEMS_PER_PAGE,filteredProducts.length)} of {filteredProducts.length}</span></div>
                    {filteredProducts.length===0 ? (<div className="text-center py-12 text-zinc-600 font-mono text-sm">No products match your filters.</div>) : (
                      <div className="space-y-3">
                        {paginatedProducts.map(product=>{
                          const vendorList=getVendorsForProduct(product.id);
                          const isExpanded=expandedProduct===product.id;
                          const cfg=MATERIAL_CATEGORY_CONFIG[product.category as MaterialCategory]||{color:'text-zinc-400',bg:'bg-zinc-900',border:'border-zinc-800',icon:'⚪',chartColor:'#71717a'};
                          const minPrice=getMinPriceForProduct(product.id);
                          return (
                            <div key={product.id} className={`rounded-xl border transition-all duration-200 ${isExpanded?'border-brand/30 bg-brand/5':'border-zinc-800/60 bg-zinc-950/40 hover:border-zinc-700'}`}>
                              <button onClick={()=>setExpandedProduct(isExpanded?null:product.id)} className="w-full flex items-center gap-4 px-4 py-3 text-left">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${cfg.bg} border ${cfg.border}`}>{cfg.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-bold text-white font-mono">{product.name}</span><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{product.category}</span></div>
                                  <div className="flex items-center gap-3 mt-0.5"><span className="text-[10px] text-zinc-500 font-mono">SKU: {product.sku}</span>{minPrice>0&&<span className="text-[10px] text-emerald-400 font-mono font-bold">From ₹{minPrice.toLocaleString()}</span>}<span className="text-[10px] text-purple-400 font-mono">{vendorList.length} vendor{vendorList.length!==1?'s':''}</span></div>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${isExpanded?'rotate-180':''}`}/>
                              </button>
                              {isExpanded && (
                                <div className="px-4 pb-4 border-t border-white/5 mt-1 pt-3">
                                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-bold mb-3">Vendors supplying this product</p>
                                  {vendorList.length===0?<p className="text-xs text-zinc-600 font-mono">No vendors supply this product.</p>:(
                                    <div className="space-y-2">
                                      {vendorList.map(vendor=>{
                                        const vp=getProductVendorEntry(vendor.id,product.id)!;
                                        return (<div key={vendor.id} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition"><div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0"><Store className="w-4 h-4 text-zinc-400"/></div><div className="flex-1 min-w-0"><div className="font-bold text-xs text-white font-mono">{vendor.name}</div><div className="text-[10px] text-zinc-500 font-mono mt-0.5">{vendor.shopName}</div><div className="flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-zinc-600"/><span className="text-[10px] text-zinc-600 font-mono">{vendor.location}</span></div></div><div className="text-right shrink-0"><div className="text-base font-black text-emerald-400 font-mono">₹{vp.price.toLocaleString()}</div><div className="text-[9px] text-zinc-500 font-mono">per {product.unitOfMeasure}</div><div className={`text-[9px] font-bold uppercase mt-1 ${vp.inStock?'text-emerald-400':'text-red-400'}`}>{vp.inStock?'● In Stock':'○ Out of Stock'}</div><div className="text-[9px] text-zinc-600 font-mono">Min: {vp.minOrderQty} {product.unitOfMeasure}</div></div></div>);
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
                    {totalPages>1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 font-mono text-xs">
                        <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronLeft className="w-3.5 h-3.5"/>Prev</button>
                        <div className="flex items-center gap-1">{Array.from({length:totalPages},(_,i)=>i+1).slice(Math.max(0,currentPage-3),currentPage+2).map(page=>(<button key={page} onClick={()=>setCurrentPage(page)} className={`w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold transition ${page===currentPage?'bg-brand text-white':'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}>{page}</button>))}</div>
                        <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">Next<ChevronRight className="w-3.5 h-3.5"/></button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ════ ORDERS & BOM ════ */}
              {activeTab==='orders' && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_100%_0%,rgba(168,85,247,0.12),transparent_70%)] pointer-events-none"/>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><ShoppingCart className="w-5 h-5 text-purple-400"/><h2 className="text-lg font-black uppercase tracking-tight font-mono">Orders &amp; Bill of Materials</h2></div>
                      <button onClick={()=>setOrderModalOpen(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2"><Plus className="w-3.5 h-3.5"/>New Order</button>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-2">Create an order to auto-generate a Bill of Materials. Notifications fire automatically.</p>
                  </div>

                  {activeBOM && (
                    <div id="bom-printable" className="premium-glass rounded-2xl border border-purple-500/20 bg-purple-950/5 overflow-hidden">
                      <div className="p-5 border-b border-purple-900/20 flex items-center justify-between no-print">
                        <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-purple-400"/><span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-300">BOM — {activeBOM.orderNumber}</span></div>
                        <div className="flex items-center gap-2">
                          <button onClick={()=>window.print()} className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-100 transition"><Printer className="w-3.5 h-3.5"/>Print BOM</button>
                          <button onClick={()=>setActiveBOM(null)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition"><X className="w-4 h-4"/></button>
                        </div>
                      </div>
                      <div className="bom-print-area p-6">
                        <div className="print-only-header hidden"><h1 className="bom-company-name">AssetFlow ERP</h1><h2 className="bom-doc-title">Bill of Materials (BOM)</h2></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">{[{label:'Order No.',value:activeBOM.orderNumber},{label:'Date',value:activeBOM.date},{label:'Customer',value:activeBOM.customer},{label:'Status',value:activeBOM.status}].map(f=>(<div key={f.label} className="bom-meta-field"><span className="text-[9px] text-zinc-500 font-mono uppercase font-bold block">{f.label}</span><span className="text-xs text-white font-mono font-bold">{f.value}</span></div>))}</div>
                        {activeBOM.notes&&<div className="mb-5 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 font-mono"><span className="font-bold text-zinc-300">Notes: </span>{activeBOM.notes}</div>}
                        <div className="bom-table-container rounded-xl overflow-hidden border border-zinc-800/50"><table className="w-full text-xs font-mono bom-table"><thead><tr className="bg-zinc-900/80 border-b border-zinc-800"><th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">#</th><th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item</th><th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</th><th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th><th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Qty</th><th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unit ₹</th><th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total</th></tr></thead><tbody>{activeBOM.items.map((item,idx)=>{const cfg=MATERIAL_CATEGORY_CONFIG[item.materialCategory];return(<tr key={idx} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition"><td className="px-4 py-3 text-zinc-500">{idx+1}</td><td className="px-4 py-3 font-bold text-white">{item.productName}</td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{item.materialCategory}</span></td><td className="px-4 py-3 text-zinc-400">{item.vendorName}</td><td className="px-4 py-3 text-right text-zinc-300">{item.quantity}</td><td className="px-4 py-3 text-right text-zinc-300">₹{item.unitPrice.toLocaleString()}</td><td className="px-4 py-3 text-right font-bold text-white">₹{(item.quantity*item.unitPrice).toLocaleString()}</td></tr>);})}</tbody><tfoot><tr className="bg-zinc-900/60"><td colSpan={5} className="px-4 py-3 text-right text-xs font-bold text-zinc-300 uppercase tracking-wider">Grand Total</td><td className="px-4 py-3"></td><td className="px-4 py-3 text-right text-lg font-black text-emerald-400 font-mono">₹{bomTotal(activeBOM).toLocaleString()}</td></tr></tfoot></table></div>
                      </div>
                    </div>
                  )}

                  <div className="premium-glass p-5 rounded-2xl border border-white/5 no-print">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wide pb-4 border-b border-white/5 mb-4">Order History</h3>
                    {orders.length===0?<div className="text-center py-10 text-zinc-600 font-mono text-sm">No orders yet.</div>:(
                      <div className="space-y-3">{orders.map(order=>(<div key={order.id} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition"><div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center shrink-0"><ShoppingCart className="w-4 h-4 text-purple-400"/></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-sm text-white font-mono">{order.orderNumber}</span><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${order.status==='Confirmed'?'bg-emerald-950/40 text-emerald-400 border-emerald-800/40':order.status==='Completed'?'bg-brand/20 text-brand border-brand/30':'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>{order.status}</span></div><div className="flex gap-3 mt-0.5 text-[10px] text-zinc-500 font-mono"><span>{order.customer}</span><span>{order.date}</span><span>{order.items.length} items</span><span className="text-emerald-400">₹{bomTotal(order).toLocaleString()}</span></div></div><button onClick={()=>setActiveBOM(order)} className="px-3 py-1.5 border border-purple-800/40 bg-purple-950/20 text-purple-400 text-[10px] font-bold uppercase font-mono rounded-lg hover:bg-purple-950/40 transition flex items-center gap-1.5"><FileText className="w-3 h-3"/>View BOM</button></div>))}</div>
                    )}
                  </div>
                </div>
              )}

              {/* ════ ITEM MASTER ════ */}
              {activeTab==='itemmaster' && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_50%_100%,rgba(20,184,166,0.1),transparent_70%)] pointer-events-none"/>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Layers className="w-5 h-5 text-teal-400"/><h2 className="text-lg font-black uppercase tracking-tight font-mono">Item Master</h2></div>
                      <button onClick={()=>setItemMasterModalOpen(true)} className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2"><Plus className="w-3.5 h-3.5"/>Add Item</button>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-2">Categorize materials by manufacturing origin. Low stock triggers notifications automatically.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.entries(MATERIAL_CATEGORY_CONFIG) as [MaterialCategory,typeof MATERIAL_CATEGORY_CONFIG[MaterialCategory]][]).map(([cat,cfg])=>(
                      <div key={cat} className={`p-4 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                        <div className="flex items-center gap-2 mb-2"><span className="text-lg">{cfg.icon}</span><span className={`text-xs font-black uppercase font-mono ${cfg.color}`}>{cat}</span></div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-light">{cfg.description}</p>
                        <div className="mt-3 text-[10px] font-mono text-zinc-500">{itemMasters.filter(i=>i.materialCategory===cat).length} items · Low stock &lt; {LOW_STOCK_THRESHOLDS[cat].toLocaleString()} units</div>
                      </div>
                    ))}
                  </div>
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wide pb-4 border-b border-white/5 mb-4">Item Master Records</h3>
                    <div className="space-y-3">
                      {itemMasters.map(item=>{
                        const cfg=MATERIAL_CATEGORY_CONFIG[item.materialCategory];
                        const isLow=item.quantity<LOW_STOCK_THRESHOLDS[item.materialCategory];
                        return (
                          <div key={item.id} className={`p-4 rounded-xl border transition ${isLow?'border-red-800/40 bg-red-950/10':'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'}`}>
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${cfg.bg} border ${cfg.border}`}>{cfg.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-bold text-sm text-white font-mono">{item.name}</span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{item.materialCategory}</span>
                                  {isLow && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-950/60 text-red-400 border border-red-800/40 animate-pulse">⚠ Low Stock</span>}
                                </div>
                                <div className="text-[10px] text-zinc-500 font-mono mb-2">SKU: {item.sku}</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {[{label:'Quantity',value:`${item.quantity.toLocaleString()} units`,icon:<Boxes className="w-3 h-3"/>},{label:'Rate',value:`₹${item.rate.toLocaleString()}/unit`,icon:<Tag className="w-3 h-3"/>},{label:'Location',value:item.materialLocation,icon:<MapPin className="w-3 h-3"/>},{label:'Company',value:item.companyName,icon:<Factory className="w-3 h-3"/>}].map(f=>(<div key={f.label} className="flex items-start gap-1.5"><span className="text-zinc-600 mt-0.5 shrink-0">{f.icon}</span><div><div className="text-[9px] text-zinc-600 font-mono uppercase">{f.label}</div><div className={`text-[11px] font-mono ${isLow&&f.label==='Quantity'?'text-red-400 font-bold':'text-zinc-300'}`}>{f.value}</div></div></div>))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════
                  REPORTS TAB (NEW)
              ════════════════════════════════════════════════ */}
              {activeTab==='reports' && (
                <div className="space-y-6 text-left" id="report-section">
                  {/* Header */}
                  <div className="premium-glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(350px_circle_at_80%_50%,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none"/>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3"><BarChart2 className="w-5 h-5 text-indigo-400"/><h2 className="text-lg font-black uppercase tracking-tight font-mono">Reports &amp; Analytics</h2></div>
                      {/* Date Range */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500 no-print"/>
                        <div className="flex items-center gap-2 no-print">
                          <input type="date" value={reportDateFrom} onChange={e=>setReportDateFrom(e.target.value)} className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono outline-none focus:border-indigo-500"/>
                          <span className="text-zinc-600 text-xs">to</span>
                          <input type="date" value={reportDateTo} onChange={e=>setReportDateTo(e.target.value)} className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono outline-none focus:border-indigo-500"/>
                          {(reportDateFrom||reportDateTo) && <button onClick={()=>{setReportDateFrom('');setReportDateTo('');}} className="text-[10px] text-zinc-500 hover:text-white transition font-mono">✕ Clear</button>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-tab Switcher */}
                  <div className="flex gap-2 flex-wrap no-print">
                    {[{id:'inventory',label:'Inventory / Stock',icon:Boxes},{id:'vendor',label:'Vendor Pricing',icon:Store},{id:'orders',label:'Orders & BOM',icon:ShoppingCart}].map(s=>(
                      <button key={s.id} onClick={()=>setReportSubTab(s.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-mono border transition ${reportSubTab===s.id?'bg-indigo-600 text-white border-indigo-500':'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'}`}>
                        <s.icon className="w-3.5 h-3.5"/>{s.label}
                      </button>
                    ))}
                  </div>

                  {/* ── Inventory / Stock Report ── */}
                  {reportSubTab==='inventory' && (
                    <div className="space-y-5">
                      {/* Export + Print buttons */}
                      <div className="flex gap-2 no-print">
                        <button onClick={exportInventoryCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"><FileDown className="w-3.5 h-3.5"/>Export CSV</button>
                        <button onClick={()=>window.print()} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"><Printer className="w-3.5 h-3.5"/>Print / PDF</button>
                      </div>

                      {/* KPI Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          {label:'Total Items',    value:itemMasters.length,                                               color:'text-white'},
                          {label:'Total Value',    value:`₹${totalInventoryValue.toLocaleString()}`,                       color:'text-emerald-400'},
                          {label:'Low Stock Items',value:inventoryData.filter(i=>i.isLowStock).length,                    color:'text-red-400'},
                          {label:'Categories',     value:Object.keys(MATERIAL_CATEGORY_CONFIG).length,                    color:'text-indigo-400'},
                        ].map(k=>(
                          <div key={k.label} className="premium-glass p-4 rounded-2xl border border-white/5 text-left">
                            <span className="text-[9px] text-zinc-500 font-mono uppercase font-bold tracking-wide block">{k.label}</span>
                            <span className={`text-2xl font-extrabold font-mono mt-1 block ${k.color}`}>{k.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Charts Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="premium-glass p-5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 mb-4"><BarChart2 className="w-4 h-4 text-indigo-400"/><h4 className="text-xs font-bold font-mono uppercase tracking-wider">Stock Quantity by Item</h4></div>
                          <MiniBarChart height={120}
                            data={itemMasters.map(i=>({label:i.name.split(' ').slice(0,2).join(' '),value:i.quantity,color:i.quantity<LOW_STOCK_THRESHOLDS[i.materialCategory]?'#f87171':MATERIAL_CATEGORY_CONFIG[i.materialCategory].chartColor}))}
                          />
                        </div>
                        <div className="premium-glass p-5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 mb-4"><PieChart className="w-4 h-4 text-indigo-400"/><h4 className="text-xs font-bold font-mono uppercase tracking-wider">Items by Category</h4></div>
                          <DonutRing data={[
                            {label:'Raw Material',          value:itemMasters.filter(i=>i.materialCategory==='Raw Material').length,          color:'#38bdf8'},
                            {label:'Semi-Finished',         value:itemMasters.filter(i=>i.materialCategory==='Semi-Finished Material').length, color:'#fbbf24'},
                            {label:'Finished Material',     value:itemMasters.filter(i=>i.materialCategory==='Finished Material').length,      color:'#34d399'},
                          ]}/>
                        </div>
                      </div>

                      {/* Data Table */}
                      <div id="report-print-area" className="premium-glass rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center gap-2 no-print"><Sparkles className="w-4 h-4 text-indigo-400"/><h3 className="text-xs font-bold font-mono uppercase tracking-wider">Inventory Stock Report</h3></div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs font-mono">
                            <thead><tr className="bg-zinc-900/80 border-b border-zinc-800"><th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item</th><th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">SKU</th><th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</th><th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Qty</th><th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Rate (₹)</th><th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Value (₹)</th><th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Location</th><th className="text-center px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Stock</th></tr></thead>
                            <tbody>
                              {inventoryData.map((item,i)=>{
                                const cfg=MATERIAL_CATEGORY_CONFIG[item.materialCategory];
                                return (<tr key={i} className={`border-b border-zinc-800/50 transition ${item.isLowStock?'bg-red-950/10':'hover:bg-white/[0.02]'}`}>
                                  <td className="px-4 py-3 font-bold text-white">{item.name}</td>
                                  <td className="px-4 py-3 text-zinc-500">{item.sku}</td>
                                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{item.materialCategory}</span></td>
                                  <td className={`px-4 py-3 text-right font-bold ${item.isLowStock?'text-red-400':'text-zinc-300'}`}>{item.quantity.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-right text-zinc-300">{item.rate.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-right font-bold text-emerald-400">₹{item.totalValue.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-zinc-400">{item.materialLocation}</td>
                                  <td className="px-4 py-3 text-center">{item.isLowStock?<span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-950/60 text-red-400 border border-red-800/40">⚠ LOW</span>:<span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">OK</span>}</td>
                                </tr>);
                              })}
                            </tbody>
                            <tfoot><tr className="bg-zinc-900/60 border-t border-zinc-700"><td colSpan={5} className="px-4 py-3 text-right font-bold text-zinc-300 uppercase tracking-wider text-[10px]">Total Inventory Value</td><td className="px-4 py-3 text-right text-lg font-black text-emerald-400">₹{totalInventoryValue.toLocaleString()}</td><td colSpan={2}></td></tr></tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Vendor Pricing Report ── */}
                  {reportSubTab==='vendor' && (
                    <div className="space-y-5">
                      <div className="flex gap-2 no-print">
                        <button onClick={exportVendorCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"><FileDown className="w-3.5 h-3.5"/>Export CSV</button>
                        <button onClick={()=>window.print()} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"><Printer className="w-3.5 h-3.5"/>Print / PDF</button>
                      </div>
                      {/* Price Range Chart */}
                      <div className="premium-glass p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-cyan-400"/><h4 className="text-xs font-bold font-mono uppercase tracking-wider">Min Price by Product (₹)</h4></div>
                        <MiniBarChart height={130} defaultColor="#22d3ee"
                          data={vendorPricingData.map(d=>({label:d.product.name.split(' ').slice(0,2).join(' '),value:Math.round(d.minPrice)}))}
                        />
                      </div>
                      {/* Data Table */}
                      <div id="report-print-area" className="premium-glass rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center gap-2 no-print"><Store className="w-4 h-4 text-cyan-400"/><h3 className="text-xs font-bold font-mono uppercase tracking-wider">Vendor Pricing Comparison</h3></div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs font-mono">
                            <thead><tr className="bg-zinc-900/80 border-b border-zinc-800"><th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Product</th><th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th><th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Location</th><th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Price (₹)</th><th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Min</th><th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Max</th><th className="text-center px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Stock</th></tr></thead>
                            <tbody>
                              {vendorPricingData.flatMap((d,gi)=>
                                d.entries.map((e,i)=>(
                                  <tr key={`${gi}-${i}`} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition">
                                    {i===0&&<td className="px-4 py-3 font-bold text-white" rowSpan={d.entries.length}><div>{d.product.name}</div><div className="text-[9px] text-zinc-500 mt-0.5">{d.product.sku}</div></td>}
                                    <td className="px-4 py-3 text-zinc-300">{e.vendorName}</td>
                                    <td className="px-4 py-3 text-zinc-500 text-[10px]">{e.location}</td>
                                    <td className={`px-4 py-3 text-right font-black font-mono ${e.price===d.minPrice?'text-emerald-400':e.price===d.maxPrice?'text-red-400':'text-zinc-300'}`}>₹{e.price.toLocaleString()}</td>
                                    {i===0&&<td className="px-4 py-3 text-right text-emerald-400 font-bold" rowSpan={d.entries.length}>₹{d.minPrice.toLocaleString()}</td>}
                                    {i===0&&<td className="px-4 py-3 text-right text-red-400 font-bold" rowSpan={d.entries.length}>₹{d.maxPrice.toLocaleString()}</td>}
                                    <td className="px-4 py-3 text-center"><span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${e.inStock?'bg-emerald-950/60 text-emerald-400':'bg-red-950/60 text-red-400'}`}>{e.inStock?'Yes':'No'}</span></td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Orders & BOM Report ── */}
                  {reportSubTab==='orders' && (
                    <div className="space-y-5">
                      <div className="flex gap-2 no-print">
                        <button onClick={exportOrdersCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"><FileDown className="w-3.5 h-3.5"/>Export CSV</button>
                        <button onClick={()=>window.print()} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"><Printer className="w-3.5 h-3.5"/>Print / PDF</button>
                      </div>
                      {/* KPI Cards */}
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          {label:'Total Orders',  value:filteredOrders.length,                                                           color:'text-white'},
                          {label:'Total Value',   value:`₹${filteredOrders.reduce((s,o)=>s+bomTotal(o),0).toLocaleString()}`,            color:'text-emerald-400'},
                          {label:'Completed',     value:filteredOrders.filter(o=>o.status==='Completed').length,                         color:'text-brand'},
                        ].map(k=>(
                          <div key={k.label} className="premium-glass p-4 rounded-2xl border border-white/5 text-left">
                            <span className="text-[9px] text-zinc-500 font-mono uppercase font-bold tracking-wide block">{k.label}</span>
                            <span className={`text-2xl font-extrabold font-mono mt-1 block ${k.color}`}>{k.value}</span>
                          </div>
                        ))}
                      </div>
                      {/* Order Value Chart */}
                      <div className="premium-glass p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 mb-4"><BarChart2 className="w-4 h-4 text-purple-400"/><h4 className="text-xs font-bold font-mono uppercase tracking-wider">Order Value Comparison (₹)</h4></div>
                        <MiniBarChart height={120} defaultColor="#a855f7"
                          data={filteredOrders.map(o=>({label:o.orderNumber.replace('PO-2026-','#'),value:bomTotal(o)}))}
                        />
                      </div>
                      {/* Full Orders + BOM Table */}
                      <div id="report-print-area" className="space-y-4">
                        {filteredOrders.length===0?(<div className="premium-glass p-8 rounded-2xl border border-white/5 text-center text-zinc-600 font-mono">No orders match the selected date range.</div>):(
                          filteredOrders.map(order=>(
                            <div key={order.id} className="premium-glass rounded-2xl border border-white/5 overflow-hidden">
                              <div className="p-4 flex items-center justify-between border-b border-white/5 bg-zinc-900/30">
                                <div className="flex items-center gap-3"><ShoppingCart className="w-4 h-4 text-purple-400"/><div><span className="font-bold text-white font-mono text-sm">{order.orderNumber}</span><span className="text-[10px] text-zinc-500 font-mono ml-3">{order.date} · {order.customer}</span></div></div>
                                <div className="flex items-center gap-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${order.status==='Confirmed'?'bg-emerald-950/40 text-emerald-400 border-emerald-800/40':'bg-brand/20 text-brand border-brand/30'}`}>{order.status}</span><span className="font-black text-emerald-400 font-mono text-sm">₹{bomTotal(order).toLocaleString()}</span></div>
                              </div>
                              <table className="w-full text-xs font-mono">
                                <thead><tr className="border-b border-zinc-800/50"><th className="text-left px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase">Item</th><th className="text-left px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase">Category</th><th className="text-left px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase">Vendor</th><th className="text-right px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase">Qty</th><th className="text-right px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase">Unit ₹</th><th className="text-right px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase">Total</th></tr></thead>
                                <tbody>{order.items.map((item,i)=>{const cfg=MATERIAL_CATEGORY_CONFIG[item.materialCategory];return(<tr key={i} className="border-b border-zinc-800/30 hover:bg-white/[0.01] transition"><td className="px-4 py-2 font-bold text-white">{item.productName}</td><td className="px-4 py-2"><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{item.materialCategory}</span></td><td className="px-4 py-2 text-zinc-400">{item.vendorName}</td><td className="px-4 py-2 text-right text-zinc-300">{item.quantity}</td><td className="px-4 py-2 text-right text-zinc-300">₹{item.unitPrice.toLocaleString()}</td><td className="px-4 py-2 text-right font-bold text-white">₹{(item.quantity*item.unitPrice).toLocaleString()}</td></tr>);})}</tbody>
                              </table>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ════════════════════════════════════════════════
                  NOTIFICATIONS TAB (NEW)
              ════════════════════════════════════════════════ */}
              {activeTab==='notifications' && (
                <div className="space-y-6 text-left">
                  {/* Header */}
                  <div className="premium-glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_30%_0%,rgba(239,68,68,0.1),transparent_70%)] pointer-events-none"/>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-red-400"/>
                        <h2 className="text-lg font-black uppercase tracking-tight font-mono">Notification Centre</h2>
                        {unreadCount>0&&<span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black">{unreadCount} unread</span>}
                      </div>
                      <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition">
                        <CheckCheck className="w-3.5 h-3.5"/>Mark All Read
                      </button>
                    </div>
                  </div>

                  {/* Type Legend */}
                  <div className="flex flex-wrap gap-3">
                    {[{type:'alert',label:'Low Stock Alert',color:'text-red-400',bg:'bg-red-950/20',border:'border-red-800/30'},{type:'success',label:'Order Events',color:'text-emerald-400',bg:'bg-emerald-950/20',border:'border-emerald-800/30'},{type:'info',label:'BOM Events',color:'text-sky-400',bg:'bg-sky-950/20',border:'border-sky-800/30'},{type:'warning',label:'Warnings',color:'text-amber-400',bg:'bg-amber-950/20',border:'border-amber-800/30'}].map(t=>{
                      const cnt=notifications.filter(n=>n.type===t.type).length;
                      return (<div key={t.type} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.bg} ${t.border}`}><span className={`text-[10px] font-bold font-mono uppercase ${t.color}`}>{t.label}</span><span className={`text-[10px] font-black ${t.color}`}>{cnt}</span></div>);
                    })}
                  </div>

                  {/* Notification List */}
                  <div className="space-y-2">
                    {notifications.length===0?(<div className="premium-glass p-12 rounded-2xl border border-white/5 text-center"><Bell className="w-10 h-10 text-zinc-700 mx-auto mb-3"/><p className="text-zinc-600 font-mono text-sm">No notifications yet.</p></div>):(
                      notifications.map(n=>{
                        const cfg=notifIconConfig[n.type];
                        return (
                          <div key={n.id} className={`flex gap-4 p-4 rounded-2xl border transition-all ${!n.isRead?'bg-white/[0.03] border-white/10 shadow-sm shadow-white/5':'border-white/[0.03] bg-transparent hover:bg-white/[0.02]'}`}>
                            <div className={`w-9 h-9 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 mt-0.5 border ${n.type==='alert'?'border-red-800/30':n.type==='success'?'border-emerald-800/30':n.type==='info'?'border-sky-800/30':'border-amber-800/30'}`}>
                              {cfg.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className={`text-sm font-bold leading-tight ${!n.isRead?'text-white':'text-zinc-400'}`}>{n.title}</h4>
                                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">{n.message}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[9px] text-zinc-600 font-mono">{timeAgo(n.createdAt)}</span>
                                    <span className="text-[9px] text-zinc-700 font-mono">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                                    {n.link && <button onClick={()=>setActiveTab(n.link as any)} className="text-[9px] text-brand hover:underline font-mono font-bold uppercase tracking-wider">→ View {n.link}</button>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {!n.isRead&&<div className="w-2 h-2 rounded-full bg-brand mt-1"/>}
                                  {!n.isRead&&(<button onClick={()=>markRead(n.id)} className="text-[9px] text-zinc-600 hover:text-white font-mono uppercase tracking-wider border border-zinc-800 hover:border-zinc-600 px-2 py-1 rounded-lg transition">Mark Read</button>)}
                                  {n.isRead&&<span className="text-[9px] text-zinc-700 font-mono uppercase flex items-center gap-1"><Check className="w-3 h-3"/>Read</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </div>
          </main>

          {/* ════════════════════════════════════════════════
              MODALS
          ════════════════════════════════════════════════ */}

          {/* Register Asset */}
          {registerModalOpen&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"><div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono"><div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4"><h3 className="text-sm font-bold uppercase tracking-wider">Register New Asset</h3><button onClick={()=>setRegisterModalOpen(false)}><X className="w-4 h-4"/></button></div><form onSubmit={handleRegisterAsset} className="space-y-4 text-xs"><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Asset Name</label><input type="text" required value={newAsset.name} onChange={e=>setNewAsset(p=>({...p,name:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="e.g. MacBook Pro M3"/></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Category</label><select value={newAsset.category} onChange={e=>setNewAsset(p=>({...p,category:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{categories.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Condition</label><select value={newAsset.condition} onChange={e=>setNewAsset(p=>({...p,condition:e.target.value as any}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"><option>New</option><option>Good</option><option>Fair</option></select></div></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Serial No.</label><input type="text" required value={newAsset.serial} onChange={e=>setNewAsset(p=>({...p,serial:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="S/N ..."/></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Cost (₹)</label><input type="number" required value={newAsset.cost} onChange={e=>setNewAsset(p=>({...p,cost:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="1200"/></div></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Location</label><input type="text" required value={newAsset.location} onChange={e=>setNewAsset(p=>({...p,location:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand" placeholder="HQ - Floor 3"/></div><div className="flex items-center gap-2 pt-2"><input type="checkbox" checked={newAsset.shared} onChange={e=>setNewAsset(p=>({...p,shared:e.target.checked}))} id="sharedAsset" className="accent-brand cursor-pointer h-4 w-4"/><label htmlFor="sharedAsset" className="text-zinc-400 cursor-pointer">Shared / bookable resource</label></div><button type="submit" className="w-full py-2 bg-white text-black font-bold uppercase tracking-wider rounded transition hover:bg-zinc-200 mt-4">Register Asset</button></form></div></div>)}

          {/* Allocate Asset */}
          {allocationModalOpen&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"><div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono"><div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4"><h3 className="text-sm font-bold uppercase tracking-wider">Allocate Asset</h3><button onClick={()=>setAllocationModalOpen(false)}><X className="w-4 h-4"/></button></div><form onSubmit={handleAllocateAsset} className="space-y-4 text-xs"><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Asset Tag</label><select value={allocForm.assetTag} onChange={e=>setAllocForm(p=>({...p,assetTag:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{assets.filter(a=>!a.shared).map(a=><option key={a.tag} value={a.tag}>{a.tag} - {a.name} ({a.status})</option>)}</select></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Employee</label><select value={allocForm.employee} onChange={e=>setAllocForm(p=>({...p,employee:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{employees.map(e=><option key={e.email} value={e.name}>{e.name} ({e.department})</option>)}</select></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Return Date</label><input type="date" value={allocForm.returnDate} onChange={e=>setAllocForm(p=>({...p,returnDate:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"/></div><button type="submit" className="w-full py-2 bg-brand text-white font-bold uppercase tracking-wider rounded transition hover:bg-brand/90 mt-4">Validate Allocation</button></form></div></div>)}

          {/* Book Resource */}
          {bookingModalOpen&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"><div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono"><div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4"><h3 className="text-sm font-bold uppercase tracking-wider">Book Shared Resource</h3><button onClick={()=>setBookingModalOpen(false)}><X className="w-4 h-4"/></button></div><form onSubmit={handleBooking} className="space-y-4 text-xs"><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Resource</label><select value={bookForm.resource} onChange={e=>setBookForm(p=>({...p,resource:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{assets.filter(a=>a.shared).map(a=><option key={a.tag} value={a.name}>{a.name} ({a.location})</option>)}</select></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Employee</label><select value={bookForm.employee} onChange={e=>setBookForm(p=>({...p,employee:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{employees.map(e=><option key={e.email} value={e.name}>{e.name}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Start</label><input type="time" required value={bookForm.start} onChange={e=>setBookForm(p=>({...p,start:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"/></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">End</label><input type="time" required value={bookForm.end} onChange={e=>setBookForm(p=>({...p,end:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"/></div></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Date</label><input type="date" required value={bookForm.date} onChange={e=>setBookForm(p=>({...p,date:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"/></div><button type="submit" className="w-full py-2 bg-brand text-white font-bold uppercase tracking-wider rounded transition hover:bg-brand/90 mt-4">Book Slot</button></form></div></div>)}

          {/* Maintenance */}
          {maintenanceModalOpen&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"><div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono"><div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4"><h3 className="text-sm font-bold uppercase tracking-wider">Raise Maintenance Request</h3><button onClick={()=>setMaintenanceModalOpen(false)}><X className="w-4 h-4"/></button></div><form onSubmit={handleMaintenance} className="space-y-4 text-xs"><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Asset</label><select value={maintForm.assetTag} onChange={e=>setMaintForm(p=>({...p,assetTag:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand">{assets.map(a=><option key={a.tag} value={a.tag}>{a.tag} - {a.name}</option>)}</select></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Issue Description</label><textarea required rows={3} value={maintForm.description} onChange={e=>setMaintForm(p=>({...p,description:e.target.value}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand resize-none" placeholder="Describe the issue..."/></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Priority</label><select value={maintForm.priority} onChange={e=>setMaintForm(p=>({...p,priority:e.target.value as any}))} className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"><option>Low</option><option>Medium</option><option>High</option></select></div><button type="submit" className="w-full py-2 bg-brand text-white font-bold uppercase tracking-wider rounded transition hover:bg-brand/90 mt-4">Submit Ticket</button></form></div></div>)}

          {/* Create Order Modal */}
          {orderModalOpen&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"><div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-2xl text-left font-mono max-h-[90vh] overflow-y-auto"><div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4"><div><h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-purple-400"/>Create New Order</h3><p className="text-[10px] text-zinc-500 mt-0.5">BOM + notifications auto-generated on creation.</p></div><button onClick={()=>setOrderModalOpen(false)}><X className="w-4 h-4"/></button></div><form onSubmit={handleCreateOrder} className="space-y-5 text-xs"><div className="col-span-2 space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Customer / Company *</label><input type="text" required value={newOrder.customer} onChange={e=>setNewOrder(p=>({...p,customer:e.target.value}))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-purple-500" placeholder="e.g. ABC Manufacturing Ltd"/></div><div className="col-span-2 space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Notes</label><textarea rows={2} value={newOrder.notes} onChange={e=>setNewOrder(p=>({...p,notes:e.target.value}))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-purple-500 resize-none" placeholder="Special instructions..."/></div><div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3"><h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Add Line Item</h4><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-zinc-500 uppercase text-[9px] font-bold">Product</label><select value={orderItemForm.productId} onChange={e=>setOrderItemForm(p=>({...p,productId:e.target.value}))} className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-purple-500">{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div className="space-y-1.5"><label className="text-zinc-500 uppercase text-[9px] font-bold">Vendor</label><select value={orderItemForm.vendorId} onChange={e=>setOrderItemForm(p=>({...p,vendorId:e.target.value}))} className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-purple-500">{availableVendorsForItem.length===0?<option>No vendors</option>:availableVendorsForItem.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></div><div className="space-y-1.5"><label className="text-zinc-500 uppercase text-[9px] font-bold">Quantity</label><input type="number" min={1} value={orderItemForm.quantity} onChange={e=>setOrderItemForm(p=>({...p,quantity:Number(e.target.value)}))} className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-purple-500"/></div><div className="space-y-1.5"><label className="text-zinc-500 uppercase text-[9px] font-bold">Unit Price (₹)</label><input type="number" min={0} step="0.01" value={orderItemForm.unitPrice} onChange={e=>setOrderItemForm(p=>({...p,unitPrice:Number(e.target.value)}))} className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-purple-500"/></div></div><button type="button" onClick={addItemToOrder} className="w-full py-2 border border-purple-700/40 bg-purple-950/20 text-purple-400 font-bold uppercase text-[10px] rounded-lg hover:bg-purple-950/40 transition flex items-center justify-center gap-1.5"><Plus className="w-3.5 h-3.5"/>Add to BOM</button></div>{newOrder.items.length>0&&(<div className="space-y-2"><h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">BOM Items ({newOrder.items.length})</h4>{newOrder.items.map((item,idx)=>(<div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800"><div className="flex-1 min-w-0"><span className="font-bold text-white text-xs">{item.productName}</span><div className="text-[10px] text-zinc-500">Vendor: {item.vendorName} · Qty: {item.quantity} · <span className="text-emerald-400 font-bold">₹{(item.quantity*item.unitPrice).toLocaleString()}</span></div></div><button type="button" onClick={()=>removeItemFromOrder(idx)} className="p-1 rounded text-zinc-600 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5"/></button></div>))}<div className="text-right text-xs font-bold text-emerald-400 font-mono pt-1">Total: ₹{newOrder.items.reduce((s,i)=>s+i.quantity*i.unitPrice,0).toLocaleString()}</div></div>)}<button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2"><FileText className="w-4 h-4"/>Confirm Order &amp; Generate BOM</button></form></div></div>)}

          {/* Add Item Master Modal */}
          {itemMasterModalOpen&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"><div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-lg text-left font-mono max-h-[90vh] overflow-y-auto"><div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4"><h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Layers className="w-4 h-4 text-teal-400"/>Add Item Master Record</h3><button onClick={()=>setItemMasterModalOpen(false)}><X className="w-4 h-4"/></button></div><form onSubmit={handleAddItemMaster} className="space-y-4 text-xs"><div className="col-span-2 space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Material Name *</label><input type="text" required value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="e.g. Steel Rod 12mm"/></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">SKU *</label><input type="text" required value={newItem.sku} onChange={e=>setNewItem(p=>({...p,sku:e.target.value}))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="SR-12MM-001"/></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Category *</label><select value={newItem.materialCategory} onChange={e=>setNewItem(p=>({...p,materialCategory:e.target.value as MaterialCategory}))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500"><option value="Raw Material">🔵 Raw Material</option><option value="Semi-Finished Material">🟡 Semi-Finished Material</option><option value="Finished Material">🟢 Finished Material</option></select></div></div><div className={`p-3 rounded-lg border text-[10px] leading-relaxed ${MATERIAL_CATEGORY_CONFIG[newItem.materialCategory].bg} ${MATERIAL_CATEGORY_CONFIG[newItem.materialCategory].border} ${MATERIAL_CATEGORY_CONFIG[newItem.materialCategory].color}`}>{MATERIAL_CATEGORY_CONFIG[newItem.materialCategory].icon} {MATERIAL_CATEGORY_CONFIG[newItem.materialCategory].description} <span className="text-zinc-500 ml-1">(Low stock &lt; {LOW_STOCK_THRESHOLDS[newItem.materialCategory].toLocaleString()} units)</span></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Quantity *</label><input type="number" required min={0} value={newItem.quantity||''} onChange={e=>setNewItem(p=>({...p,quantity:Number(e.target.value)}))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="500"/></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Rate (₹/unit) *</label><input type="number" required min={0} step="0.01" value={newItem.rate||''} onChange={e=>setNewItem(p=>({...p,rate:Number(e.target.value)}))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="80.00"/></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Material Location *</label><input type="text" required value={newItem.materialLocation} onChange={e=>setNewItem(p=>({...p,materialLocation:e.target.value}))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="Warehouse A - Rack 3"/></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Company Name *</label><input type="text" required value={newItem.companyName} onChange={e=>setNewItem(p=>({...p,companyName:e.target.value}))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500" placeholder="Vendor or In-House"/></div></div><div className="space-y-1.5"><label className="text-zinc-400 uppercase text-[9px] font-bold">Description</label><textarea rows={2} value={newItem.description} onChange={e=>setNewItem(p=>({...p,description:e.target.value}))} className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-teal-500 resize-none" placeholder="Additional details..."/></div><button type="submit" className="w-full py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold uppercase tracking-wider rounded-lg transition">Add to Item Master</button></form></div></div>)}

        </>
      )}
    </div>
  );
}
