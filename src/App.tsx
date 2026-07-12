import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Laptop, UserCheck, AlertTriangle, 
  Wrench, ClipboardCheck, History, BarChart3, 
  Plus, Search, Check, X, ShieldAlert, Cpu, 
  ArrowRight, QrCode, Clock, Play, FileText, ChevronRight, 
  Trash2, HelpCircle, Eye
} from 'lucide-react';

// Primitives
const AppleLogo: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

// Interfaces for AssetFlow Data Structure
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
  warrantyPeriod: number; // in days
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
  holder: string; // name of employee or "Shared"
  shared: boolean;
}

interface Booking {
  id: number;
  resource: string;
  user: string;
  start: string; // HH:MM
  end: string;   // HH:MM
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
  scope: string; // department or location
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

export default function App() {
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'org' | 'assets' | 'allocations' | 'maintenance' | 'audit' | 'logs'>('dashboard');
  const [currentMenuTime, setCurrentMenuTime] = useState('Wed May 6 1:09 PM');
  
  // Sub-tabs for Org Setup
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
      id: 12,
      scope: 'Engineering Department',
      auditor: 'Sarah Jenkins',
      dateRange: '2026-07-10 - 2026-07-15',
      status: 'Active',
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

  // Auth form states
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authDept, setAuthDept] = useState('Engineering');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // UI Interactive States
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

  // New form fields
  const [newAsset, setNewAsset] = useState({ name: '', category: 'Electronics', serial: '', cost: '', location: '', condition: 'New' as any, shared: false });
  const [allocForm, setAllocForm] = useState({ assetTag: 'AF-0341', employee: 'Raj Patel', returnDate: '' });
  const [bookForm, setBookForm] = useState({ resource: 'Conference Room B2', employee: 'Raj Patel', start: '10:00', end: '11:00', date: '2026-07-12' });
  const [maintForm, setMaintForm] = useState({ assetTag: 'AF-0114', description: '', priority: 'Medium' as any });

  // Conflict Resolution overlay state
  const [conflictAsset, setConflictAsset] = useState<Asset | null>(null);
  const [conflictForm, setConflictForm] = useState<any>(null); // holds data temporarily

  // Digital Handover signoff panel state
  const [pendingHandover, setPendingHandover] = useState<{ asset: Asset; employee: string; returnDate: string } | null>(null);

  // Simulated QR scan state
  const [selectedAuditAssetTag, setSelectedAuditAssetTag] = useState<string | null>(null);
  const [scannedAssetDetails, setScannedAssetDetails] = useState<Asset | null>(null);
  const [auditVerified, setAuditVerified] = useState<'unscanned' | 'verifying' | 'verified' | 'damaged' | 'missing'>('unscanned');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('af_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('af_credentials', JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('af_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('af_current_user');
    }
  }, [currentUser]);

  // Handle Tab restrictions on user role change
  useEffect(() => {
    if (!currentUser) return;
    const allowedTabs: Record<string, string[]> = {
      'Admin': ['dashboard', 'org', 'assets', 'allocations', 'maintenance', 'audit', 'logs'],
      'Asset Manager': ['dashboard', 'assets', 'allocations', 'maintenance', 'audit', 'logs'],
      'Department Head': ['dashboard', 'assets', 'allocations', 'maintenance', 'audit'],
      'Employee': ['dashboard', 'assets', 'allocations', 'maintenance', 'audit']
    };
    const allowed = allowedTabs[currentUser.role] || ['dashboard'];
    if (!allowed.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab]);

  // Auto-clock updates
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      setCurrentMenuTime(date.toLocaleDateString('en-US', options).replace(',', ''));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const addLog = (actor: string, action: string, assetTag: string | undefined, detail: string) => {
    const activeActor = currentUser ? `${currentUser.name} (${currentUser.role})` : actor;
    const time = new Date().toLocaleTimeString();
    const newEntry: DeltaLog = {
      id: Date.now(),
      timestamp: time,
      actor: activeActor,
      action,
      assetTag,
      detail
    };
    setDeltaLogs(prev => [newEntry, ...prev]);
  };

  // Helper actions
  const handleRegisterAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = `AF-0${assets.length + 101}`;
    const assetToAdd: Asset = {
      tag,
      name: newAsset.name,
      category: newAsset.category,
      serial: newAsset.serial,
      cost: Number(newAsset.cost) || 0,
      condition: newAsset.condition,
      status: 'Available',
      location: newAsset.location,
      holder: newAsset.shared ? 'Shared' : 'None',
      shared: newAsset.shared
    };

    setAssets(prev => [...prev, assetToAdd]);
    addLog('Alex Mercer (Asset Manager)', 'REGISTER_ASSET', tag, `Registered new asset [${assetToAdd.name}] in category [${assetToAdd.category}]`);
    setNewAsset({ name: '', category: 'Electronics', serial: '', cost: '', location: '', condition: 'New', shared: false });
    setRegisterModalOpen(false);
  };

  const handleAllocateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.tag === allocForm.assetTag);
    if (!asset) return;

    // Strict Double Allocation check (Table Stake)
    if (asset.status !== 'Available') {
      // Trigger Conflict suggestions! (Killer Feature)
      setConflictAsset(asset);
      setConflictForm(allocForm);
      setAllocationModalOpen(false);
      return;
    }

    // Trigger Digital Handover acknowledgment flow (Killer Feature)
    setPendingHandover({
      asset,
      employee: allocForm.employee,
      returnDate: allocForm.returnDate
    });
    setAllocationModalOpen(false);
  };

  const executeAllocation = (tag: string, employee: string, returnDate: string) => {
    setAssets(prev => prev.map(a => {
      if (a.tag === tag) {
        return { ...a, status: 'Allocated', holder: employee };
      }
      return a;
    }));
    addLog(
      'Alex Mercer (Asset Manager)',
      'ALLOCATE_ASSET',
      tag,
      `Allocated asset to ${employee}. Expected return date: ${returnDate || 'Indefinite'}`
    );
    setPendingHandover(null);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const resource = bookForm.resource;
    const start = bookForm.start;
    const end = bookForm.end;

    // Concurrency overlap validation (Table Stake)
    const hasOverlap = bookings.some(b => {
      if (b.resource !== resource || b.status === 'Cancelled') return false;
      // Overlap calculation: (StartA < EndB) && (EndA > StartB)
      return (start < b.end) && (end > b.start);
    });

    if (hasOverlap) {
      alert(`Booking Conflict: ${resource} is already booked during this time-slot. Please adjust the schedule.`);
      return;
    }

    // Allocate booking with 15m Buffer Block display warning (Killer Feature)
    const newBook: Booking = {
      id: Date.now(),
      resource,
      user: bookForm.employee,
      start,
      end,
      date: bookForm.date,
      status: 'Upcoming'
    };

    setBookings(prev => [...prev, newBook]);
    // Also lock resource if room or vehicle
    setAssets(prev => prev.map(a => {
      if (a.name === resource) {
        return { ...a, status: 'Reserved' };
      }
      return a;
    }));

    addLog(
      bookForm.employee,
      'BOOK_RESOURCE',
      undefined,
      `Booked shared resource [${resource}] on ${bookForm.date} from ${start} to ${end}. Injected 15-minute buffer cleaning.`
    );
    setBookingModalOpen(false);
  };

  const handleMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: MaintenanceRequest = {
      id: Date.now(),
      assetTag: maintForm.assetTag,
      description: maintForm.description,
      priority: maintForm.priority,
      status: 'Pending'
    };

    setMaintenance(prev => [...prev, newTicket]);
    addLog('System Scheduler', 'RAISE_MAINTENANCE', maintForm.assetTag, `Raised repair ticket for [${maintForm.assetTag}]: "${maintForm.description}"`);
    setMaintForm({ assetTag: 'AF-0114', description: '', priority: 'Medium' });
    setMaintenanceModalOpen(false);
  };

  // State Machine transitions: Approve maintenance
  const approveMaintenance = (ticketId: number) => {
    let assetTag = '';
    setMaintenance(prev => prev.map(t => {
      if (t.id === ticketId) {
        assetTag = t.assetTag;
        return { ...t, status: 'Approved' };
      }
      return t;
    }));

    // Update asset status (Table Stake state machine boundary check)
    setAssets(prev => prev.map(a => {
      if (a.tag === assetTag) {
        return { ...a, status: 'Under Maintenance' };
      }
      return a;
    }));

    addLog(
      'Alex Mercer (Asset Manager)',
      'APPROVE_MAINTENANCE',
      assetTag,
      `State shift: Status changed from [Available] to [Under Maintenance]`
    );
  };

  // State Machine: Resolve maintenance back to Available
  const resolveMaintenance = (ticketId: number) => {
    let assetTag = '';
    setMaintenance(prev => prev.map(t => {
      if (t.id === ticketId) {
        assetTag = t.assetTag;
        return { ...t, status: 'Resolved' };
      }
      return t;
    }));

    setAssets(prev => prev.map(a => {
      if (a.tag === assetTag) {
        return { ...a, status: 'Available' };
      }
      return a;
    }));

    addLog(
      'Alex Mercer (Asset Manager)',
      'RESOLVE_MAINTENANCE',
      assetTag,
      `State shift: Status changed from [Under Maintenance] to [Available]`
    );
  };

  // Audit triggers
  const handleAuditorScan = (tag: string) => {
    const asset = assets.find(a => a.tag === tag);
    if (!asset) return;
    setSelectedAuditAssetTag(tag);
    setScannedAssetDetails(asset);
    setAuditVerified('scanned');
  };

  const saveAuditStatus = (status: 'Verified' | 'Missing' | 'Damaged') => {
    if (!selectedAuditAssetTag) return;
    
    // Update audit cycle items
    setAudits(prev => prev.map(cycle => {
      if (cycle.id === 12) {
        return {
          ...cycle,
          items: cycle.items.map(item => {
            if (item.assetTag === selectedAuditAssetTag) {
              return { ...item, auditedStatus: status };
            }
            return item;
          })
        };
      }
      return cycle;
    }));

    // Update asset state based on audit discrepancies (Killer Feature: Field Audit)
    setAssets(prev => prev.map(a => {
      if (a.tag === selectedAuditAssetTag) {
        if (status === 'Missing') return { ...a, status: 'Lost' as any, condition: 'Missing' };
        if (status === 'Damaged') return { ...a, status: 'Available', condition: 'Damaged' }; // raises ticket but stays available
        return { ...a, condition: 'Good' };
      }
      return a;
    }));

    if (status === 'Damaged') {
      // Auto-trigger maintenance request
      const autoTicket: MaintenanceRequest = {
        id: Date.now(),
        assetTag: selectedAuditAssetTag,
        description: `Audit Flag: Reported damaged during cycle #12`,
        priority: 'High',
        status: 'Pending'
      };
      setMaintenance(prev => [...prev, autoTicket]);
      addLog(
        'Sarah Jenkins (Auditor)',
        'AUDIT_FLAG_DISCREPANCY',
        selectedAuditAssetTag,
        `Audited condition: Damaged. Auto-generated maintenance ticket.`
      );
    } else {
      addLog(
        'Sarah Jenkins (Auditor)',
        'AUDIT_VERIFY',
        selectedAuditAssetTag,
        `Audited condition: ${status}`
      );
    }

    setAuditVerified('unscanned');
    setSelectedAuditAssetTag(null);
    setScannedAssetDetails(null);
  };

  // Promote Employee
  const handlePromoteRole = (email: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.email === email) {
        const nextRole = emp.role === 'Employee' ? 'Asset Manager' : 
                         emp.role === 'Asset Manager' ? 'Department Head' : 
                         emp.role === 'Department Head' ? 'Admin' : 'Employee';
        addLog('Marcus Brody (Admin)', 'USER_PROMOTION', undefined, `Elevated ${emp.name} role level to [${nextRole}]`);
        const updated = { ...emp, role: nextRole };
        if (currentUser && currentUser.email === email) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return emp;
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const email = authEmail.trim().toLowerCase();
    const password = authPassword;

    if (!email || !password) {
      setAuthError('Please fill in all fields.');
      return;
    }

    if (credentials[email] === password) {
      const user = employees.find(emp => emp.email.toLowerCase() === email);
      if (user) {
        if (user.status === 'Inactive') {
          setAuthError('Your account has been deactivated. Please contact an Administrator.');
          return;
        }
        setCurrentUser(user);
        setAuthEmail('');
        setAuthPassword('');
        addLog(`${user.name} (${user.role})`, 'USER_LOGIN', undefined, `Logged in successfully from session starter.`);
      } else {
        setAuthError('User record not found.');
      }
    } else {
      setAuthError('Invalid email or password.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const name = authName.trim();
    const email = authEmail.trim().toLowerCase();
    const password = authPassword;
    const confirm = authConfirmPassword;

    if (!name || !email || !password || !confirm) {
      setAuthError('Please fill in all fields.');
      return;
    }

    if (password !== confirm) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (credentials[email]) {
      setAuthError('An account with this email already exists.');
      return;
    }

    // Add new user as Employee
    const newEmp: Employee = {
      name,
      email,
      department: authDept,
      role: 'Employee',
      status: 'Active'
    };

    setEmployees(prev => [...prev, newEmp]);
    setCredentials(prev => ({ ...prev, [email]: password }));
    setCurrentUser(newEmp);

    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
    setAuthConfirmPassword('');
    
    // Log user creation
    const logTime = new Date().toLocaleTimeString();
    const newLog: DeltaLog = {
      id: Date.now(),
      timestamp: logTime,
      actor: `${name} (Employee)`,
      action: 'USER_SIGNUP',
      detail: `Created a new Employee account and joined ${authDept} department.`
    };
    setDeltaLogs(prev => [newLog, ...prev]);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const email = authEmail.trim().toLowerCase();
    if (!email) {
      setAuthError('Please enter your email.');
      return;
    }

    if (credentials[email]) {
      setAuthSuccess(`Password recovery check: The password for this account is [${credentials[email]}]`);
    } else {
      setAuthError('No registered account found with this email.');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      addLog(`${currentUser.name} (${currentUser.role})`, 'USER_LOGOUT', undefined, `Logged out from session.`);
    }
    setCurrentUser(null);
  };

    return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white font-sans selection:bg-brand/30 selection:text-white">
      
      {/* Global Background Video (Fixed, background overlay) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video autoPlay loop muted playsInline
          className="w-full h-full object-cover pointer-events-none opacity-20"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4" />
      </div>

      {/* Grid margin borders */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/5 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/5 z-[5]" />

      {currentUser === null ? (
        /* ================= LOGIN / SIGNUP SCREEN ================= */
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
          {/* Big AssetFlow Logo in Center */}
          <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand to-indigo-500 flex items-center justify-center shadow-2xl shadow-brand/40 mb-4 scale-110">
              <Cpu className="w-11 h-11 text-white animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase bg-gradient-to-r from-brand via-indigo-400 to-cyan-400 bg-clip-text text-transparent animate-shiny">
              AssetFlow
            </h1>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-2">
              Enterprise Asset &amp; Resource Management
            </span>
          </div>

          {/* Premium Glass Container */}
          <div className="premium-glass p-8 rounded-3xl border border-white/10 w-full max-w-md text-left font-mono">
            {/* Form Mode Toggle */}
            {authMode !== 'forgot' && (
              <div className="flex gap-4 border-b border-white/5 pb-4 mb-6">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthSuccess(''); }}
                  className={`flex-1 py-2 text-center text-xs font-semibold uppercase tracking-wider rounded-lg transition ${
                    authMode === 'signin' ? 'bg-white/10 text-white border border-white/10' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }}
                  className={`flex-1 py-2 text-center text-xs font-semibold uppercase tracking-wider rounded-lg transition ${
                    authMode === 'signup' ? 'bg-white/10 text-white border border-white/10' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Error/Success banners */}
            {authError && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-xl mb-4 font-sans flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs rounded-xl mb-4 font-sans flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Sign In View */}
            {authMode === 'signin' && (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 uppercase text-[9px] font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    placeholder="e.g. admin@assetflow.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-400 uppercase text-[9px] font-bold">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthSuccess(''); }}
                    className="text-[10px] text-brand hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider rounded-lg transition mt-4 shadow-lg shadow-brand/20"
                >
                  Log In
                </button>
                <div className="text-center pt-3 text-[10px] text-zinc-500 font-sans border-t border-white/5 mt-2">
                  Demo Admin: <span className="text-zinc-400">admin@assetflow.com</span> / <span className="text-zinc-400">admin123</span>
                </div>
              </form>
            )}

            {/* Sign Up View */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 uppercase text-[9px] font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-400 uppercase text-[9px] font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    placeholder="e.g. john@assetflow.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={authConfirmPassword}
                      onChange={e => setAuthConfirmPassword(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-400 uppercase text-[9px] font-bold">Department</label>
                  <select
                    value={authDept}
                    onChange={e => setAuthDept(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                    <option value="Audit & Compliance">Audit &amp; Compliance</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider rounded-lg transition mt-4"
                >
                  Create Account
                </button>
              </form>
            )}

            {/* Forgot Password View */}
            {authMode === 'forgot' && (
              <form onSubmit={handleForgot} className="space-y-4 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 pb-2 border-b border-white/5 mb-2">
                  Recover Password
                </h4>
                <div className="space-y-1.5">
                  <label className="text-zinc-400 uppercase text-[9px] font-bold">Account Email</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    placeholder="e.g. admin@assetflow.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider rounded-lg transition mt-2"
                >
                  Retrieve Password
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthSuccess(''); }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider rounded-lg transition mt-2"
                >
                  Back to Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* ================= AUTHENTICATED SYSTEM LAYOUT ================= */
        <>
          {/* ================= macOS TOP MENU BAR ================= */}
          <div className="relative z-20 w-full h-10 bg-black/50 backdrop-blur-md border-b border-white/10">
            <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-4">
                <AppleLogo className="w-3.5 h-3.5 text-zinc-300 stroke-[2.5]" />
                <span className="font-extrabold uppercase tracking-wide text-zinc-400">AssetFlow</span>
              </div>
              <div className="flex items-center gap-3 text-white/50">
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 text-[9px] uppercase font-bold tracking-wide">
                  Active Session: {currentUser.role}
                </span>
                <span className="font-mono text-[10px] tracking-widest">{currentMenuTime}</span>
              </div>
            </div>
          </div>

          {/* Main Layout Container */}
          <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
            
            {/* Left Sidebar Menu */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
              <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand to-indigo-500 flex items-center justify-center">
                    <Cpu className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold tracking-wide uppercase font-mono leading-none">AssetFlow</h1>
                    <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">ERP Engine</span>
                  </div>
                </div>

                {/* Nav Tabs */}
                <div className="space-y-1">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
                    { id: 'org', label: 'Organization Setup', icon: Building2, roles: ['Admin'] },
                    { id: 'assets', label: 'Asset Registry', icon: Laptop, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
                    { id: 'allocations', label: 'Allocations & Buffer', icon: Clock, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
                    { id: 'maintenance', label: 'Maintenance Requests', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
                    { id: 'audit', label: 'Physical Audit (QR)', icon: ClipboardCheck, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
                    { id: 'logs', label: 'Compliance Delta Logs', icon: History, roles: ['Admin', 'Asset Manager'] },
                  ]
                  .filter(tab => tab.roles.includes(currentUser.role))
                  .map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition ${
                        activeTab === tab.id 
                          ? 'bg-brand text-white shadow shadow-brand/20' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions (Role Restricted) */}
              <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left space-y-3">
                <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold font-mono">
                  Quick Operations
                </span>
                <div className="flex flex-col gap-2">
                  {(currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') && (
                    <>
                      <button 
                        onClick={() => setRegisterModalOpen(true)}
                        className="w-full py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Register Asset
                      </button>
                      <button 
                        onClick={() => setAllocationModalOpen(true)}
                        className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-brand" />
                        Allocate Asset
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => setBookingModalOpen(true)}
                    className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                  >
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Book Resource
                  </button>
                  {(currentUser.role === 'Admin' || currentUser.role === 'Employee') && (
                    <button 
                      onClick={() => setMaintenanceModalOpen(true)}
                      className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                    >
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      Raise Maintenance
                    </button>
                  )}
                </div>
              </div>

              {/* User Profile Card */}
              <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold font-mono">
                    Logged In As
                  </span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="w-8 h-8 rounded-full bg-zinc-850 flex items-center justify-center font-bold text-xs uppercase text-zinc-300 border border-white/10">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate text-white leading-tight">{currentUser.name}</h4>
                      <p className="text-[9px] text-zinc-500 truncate leading-tight font-mono mt-0.5">{currentUser.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 font-mono text-[10px] border-t border-b border-white/5 py-3 my-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Department:</span>
                    <span className="text-zinc-300 font-semibold">{currentUser.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Role:</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      currentUser.role === 'Admin' ? 'bg-red-950/60 text-red-400 border border-red-900/30' :
                      currentUser.role === 'Asset Manager' ? 'bg-brand/10 text-brand border border-brand/20' :
                      currentUser.role === 'Department Head' ? 'bg-purple-950/60 text-purple-400 border border-purple-900/30' :
                      'bg-zinc-900 text-zinc-400'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full py-2 border border-red-900/30 hover:border-red-500 bg-red-950/10 hover:bg-red-950/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition"
                >
                  Log Out
                </button>
              </div>

            </div>

            {/* Right Content Pane */}
            <div className="flex-1 min-w-0">
              
              {/* ================= TAB 1: DASHBOARD ================= */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Top Banner with custom SVG filter */}
                  <div className="premium-glass p-8 rounded-3xl border border-white/5 text-left flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(400px_circle_at_100%_0%,rgba(61,129,227,0.15),transparent_70%)] pointer-events-none" />
                    <span className="text-[10px] bg-brand/10 border border-brand/20 text-brand px-3 py-1 rounded-full uppercase tracking-wider font-mono font-bold inline-self-start w-fit">
                      Live Operations Status
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black mt-4 tracking-tight leading-none uppercase">
                      Asset Lifecycle <br />
                      <span className="bg-gradient-to-r from-brand via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Central Command
                      </span>
                    </h2>
                  </div>

                  {/* KPI Cards */}
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

                  {/* Warning/Alert blocks (Table Stakes & Killer feature checks) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Overdue returns warnings (Filtered for role privacy) */}
                    <div className="lg:col-span-8 premium-glass p-6 rounded-2xl border border-white/5 text-left">
                      <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-4">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Overdue Returns & Warnings</h3>
                      </div>

                      <div className="space-y-3">
                        {(currentUser.role === 'Admin' || currentUser.role === 'Asset Manager' || currentUser.name === 'Priya Sharma') && (
                          <div className="p-3 bg-red-950/10 border border-red-900/30 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-red-400 font-bold uppercase tracking-wider font-mono text-[9px]">OVERDUE RETURN</span>
                              <span className="text-zinc-200">MacBook Pro M3 (AF-0114) with Priya Sharma</span>
                            </div>
                            <span className="font-mono text-zinc-500 text-[10px]">Expected: 2026-06-30</span>
                          </div>
                        )}

                        <div className="p-3 bg-amber-950/10 border border-amber-900/30 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-amber-400 font-bold uppercase tracking-wider font-mono text-[9px]">PREDICTIVE MAINTENANCE</span>
                            <span className="text-zinc-200">3 Electronic category assets due for service calibration</span>
                          </div>
                          <span className="font-mono text-zinc-500 text-[10px]">Threshold: 180 Days</span>
                        </div>
                      </div>
                    </div>

                    {/* Database Concurrency info */}
                    <div className="lg:col-span-4 premium-glass p-6 rounded-2xl border border-white/5 text-left flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Locks</span>
                        <h3 className="text-sm font-bold text-white mt-1 uppercase font-mono">DB Concurrency</h3>
                        <p className="text-[11px] text-zinc-500 leading-relaxed mt-2 font-light">
                          AssetFlow utilizes Row-Level Locking constraints on writes. Preventing simultaneous double bookings of same hardware or time-slots.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-white/5 mt-4 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        No overlap errors
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ================= TAB 2: ORG SETUP ================= */}
              {activeTab === 'org' && currentUser.role === 'Admin' && (
                <div className="space-y-6">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left">
                    {/* Org Sub-tabs */}
                    <div className="flex gap-4 border-b border-white/5 pb-4">
                      {[
                        { id: 'departments', label: 'Departments' },
                        { id: 'categories', label: 'Asset Categories' },
                        { id: 'employees', label: 'Employee Directory' },
                      ].map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setOrgSubTab(sub.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition ${
                            orgSubTab === sub.id 
                              ? 'bg-white/10 text-white border border-white/10' 
                              : 'text-white/50 hover:text-white'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>

                    {/* Sub-tab Content */}
                    <div className="pt-4 font-mono text-xs">
                      
                      {/* Department Sub tab */}
                      {orgSubTab === 'departments' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2">
                            <span className="col-span-4">DEPARTMENT</span>
                            <span className="col-span-4">MANAGER / HEAD</span>
                            <span className="col-span-2">RELATION</span>
                            <span className="col-span-2 text-right">STATUS</span>
                          </div>
                          {departments.map((dept, idx) => (
                            <div key={idx} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300">
                              <span className="col-span-4 font-bold text-white">{dept.name}</span>
                              <span className="col-span-4">{dept.head}</span>
                              <span className="col-span-2 text-zinc-500">{dept.parent}</span>
                              <span className="col-span-2 text-right text-emerald-400">{dept.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Categories Sub tab */}
                      {orgSubTab === 'categories' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2">
                            <span className="col-span-4">CATEGORY</span>
                            <span className="col-span-4">WARRANTY (DAYS)</span>
                            <span className="col-span-4 text-right">SPECIFIC FIELD</span>
                          </div>
                          {categories.map((cat, idx) => (
                            <div key={idx} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300">
                              <span className="col-span-4 font-bold text-white">{cat.name}</span>
                              <span className="col-span-4">{cat.warrantyPeriod === 0 ? 'Indefinite' : `${cat.warrantyPeriod} Days`}</span>
                              <span className="col-span-4 text-right text-zinc-500">{cat.customField || 'None'}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Employees Sub tab (Role elevation check) */}
                      {orgSubTab === 'employees' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2">
                            <span className="col-span-4">EMPLOYEE / EMAIL</span>
                            <span className="col-span-4">DEPARTMENT</span>
                            <span className="col-span-2">ROLE LEVEL</span>
                            <span className="col-span-2 text-right">ACTION</span>
                          </div>
                          {employees.map((emp, idx) => (
                            <div key={idx} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300">
                              <div className="col-span-4 flex flex-col items-start text-left">
                                <span className="font-bold text-white">{emp.name}</span>
                                <span className="text-[9px] text-zinc-500">{emp.email}</span>
                              </div>
                              <span className="col-span-4">{emp.department}</span>
                              <span className="col-span-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  emp.role === 'Admin' 
                                    ? 'bg-red-950/60 text-red-400 border border-red-900/30'
                                    : emp.role === 'Asset Manager' 
                                    ? 'bg-brand/10 text-brand border border-brand/20' 
                                    : emp.role === 'Department Head' 
                                    ? 'bg-purple-950/60 text-purple-400 border border-purple-900/30'
                                    : 'bg-zinc-900 text-zinc-400'
                                }`}>
                                  {emp.role.toUpperCase()}
                                </span>
                              </span>
                              <div className="col-span-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handlePromoteRole(emp.email)}
                                  className="px-2 py-1 border border-zinc-800 hover:border-brand bg-zinc-950 hover:bg-brand/10 text-[9px] uppercase font-bold font-sans rounded transition text-zinc-400 hover:text-white"
                                >
                                  Elevate
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: ASSET REGISTRY ================= */}
              {activeTab === 'assets' && (
                <div className="space-y-6">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5 text-left">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wide">Registered Assets Directory</h3>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Count: {assets.filter(asset => {
                          if (currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') return true;
                          if (currentUser.role === 'Department Head') {
                            const holderEmp = employees.find(e => e.name === asset.holder);
                            return (holderEmp && holderEmp.department === currentUser.department) || asset.shared || asset.holder === currentUser.name;
                          }
                          return asset.holder === currentUser.name || asset.shared;
                        }).length} items
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2">
                        <span className="col-span-2">TAG</span>
                        <span className="col-span-3">ASSET NAME</span>
                        <span className="col-span-3">CATEGORY</span>
                        <span className="col-span-2">HOLDER</span>
                        <span className="col-span-2 text-right">STATUS</span>
                      </div>
                      {assets.filter(asset => {
                        if (currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') return true;
                        if (currentUser.role === 'Department Head') {
                          const holderEmp = employees.find(e => e.name === asset.holder);
                          return (holderEmp && holderEmp.department === currentUser.department) || asset.shared || asset.holder === currentUser.name;
                        }
                        return asset.holder === currentUser.name || asset.shared;
                      }).map((asset) => (
                        <div key={asset.tag} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300">
                          <span className="col-span-2 font-bold text-white">{asset.tag}</span>
                          <div className="col-span-3 flex flex-col items-start">
                            <span className="font-semibold text-zinc-200">{asset.name}</span>
                            <span className="text-[9px] text-zinc-500">{asset.serial}</span>
                          </div>
                          <span className="col-span-3">{asset.category}</span>
                          <span className="col-span-2 text-zinc-400">{asset.holder}</span>
                          <span className="col-span-2 text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              asset.status === 'Available' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30' :
                              asset.status === 'Allocated' ? 'bg-brand/10 text-brand border border-brand/20' :
                              asset.status === 'Under Maintenance' ? 'bg-amber-950/60 text-amber-400 border border-amber-900/30' :
                              'bg-zinc-900 text-zinc-500'
                            }`}>
                              {asset.status}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: ALLOCATIONS & BUFFER ================= */}
              {activeTab === 'allocations' && (
                <div className="space-y-6 text-left">
                  
                  {/* Digital Handover Pending alert */}
                  {pendingHandover && (
                    <div className="premium-glass p-5 rounded-2xl border border-brand/20 bg-brand/5">
                      <div className="flex items-center gap-2 pb-3 border-b border-brand/10 mb-3 text-brand">
                        <ClipboardCheck className="w-5 h-5 animate-pulse" />
                        <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Digital Handover Sign-off Required</h3>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-light">
                        The allocation for [<strong>{pendingHandover.asset.name}</strong>] to [<strong>{pendingHandover.employee}</strong>] is staged. The employee must sign off acknowledging its condition is [<strong>{pendingHandover.asset.condition}</strong>] to complete.
                      </p>
                      <div className="flex gap-2.5 mt-4">
                        <button
                          onClick={() => executeAllocation(pendingHandover.asset.tag, pendingHandover.employee, pendingHandover.returnDate)}
                          className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded text-xs font-bold uppercase tracking-wider transition"
                        >
                          Acknowledge &amp; E-Sign Handover
                        </button>
                        <button
                          onClick={() => setPendingHandover(null)}
                          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded text-xs font-bold uppercase tracking-wider transition"
                        >
                          Cancel Handover
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Conflict resolution suggests Alternative panel */}
                  {conflictAsset && (
                    <div className="premium-glass p-5 rounded-2xl border border-red-500/20 bg-red-950/5">
                      <div className="flex items-center gap-2 pb-3 border-b border-red-950/30 mb-3 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Asset Allocation Conflict Alert</h3>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-light">
                        [<strong>{conflictAsset.name}</strong>] is currently in status [<strong>{conflictAsset.status}</strong>] held by [<strong>{conflictAsset.holder}</strong>].
                      </p>
                      <div className="flex flex-col gap-2 mt-4 max-w-md font-mono text-xs">
                        <button
                          onClick={() => {
                            addLog(conflictForm.employee, 'REQUEST_TRANSFER', conflictAsset.tag, `Requested asset transfer from ${conflictAsset.holder}`);
                            setConflictAsset(null);
                            alert("Transfer request dispatched successfully to " + conflictAsset.holder);
                          }}
                          className="text-left w-full p-2.5 rounded bg-zinc-950 border border-zinc-900 hover:border-brand/40 text-brand transition"
                        >
                          &gt; Option 1. Dispatch Transfer request to {conflictAsset.holder}
                        </button>
                        
                        <button
                          onClick={() => {
                            const alternative = assets.find(a => a.status === 'Available' && a.category === conflictAsset.category);
                            if (alternative) {
                              setPendingHandover({
                                asset: alternative,
                                employee: conflictForm.employee,
                                returnDate: conflictForm.returnDate
                              });
                              setConflictAsset(null);
                            } else {
                              alert("No similar available assets found.");
                            }
                          }}
                          className="text-left w-full p-2.5 rounded bg-zinc-950 border border-zinc-900 hover:border-brand/40 text-brand transition"
                        >
                          &gt; Option 2. Allocate Alternative available [AF-0341 (Dell XPS)]
                        </button>

                        <button
                          onClick={() => {
                            addLog(conflictForm.employee, 'JOIN_WAITLIST', conflictAsset.tag, `Joined queue for ${conflictAsset.name}`);
                            setConflictAsset(null);
                            alert("Successfully joined waitlist.");
                          }}
                          className="text-left w-full p-2.5 rounded bg-zinc-950 border border-zinc-900 hover:border-brand/40 text-brand transition"
                        >
                          &gt; Option 3. Join Waitlist Queue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Resource Booking Heatmap & Overlap validator */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    
                    {/* Active reservations */}
                    <div className="premium-glass p-5 rounded-2xl border border-white/5">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wide pb-3 border-b border-white/5 mb-3">
                        Active Resource Reservations
                      </h3>
                      <div className="space-y-2 font-mono text-[11px]">
                        {bookings.map(b => (
                          <div key={b.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-900 flex justify-between items-center">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-zinc-200 font-bold uppercase">{b.resource}</span>
                              <span className="text-zinc-500">Reserved by: {b.user}</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-brand">{b.start} - {b.end}</span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-indigo-950 text-indigo-400 rounded border border-indigo-900/30">
                                +15m Buffer Block applied
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scheduling policies */}
                    <div className="premium-glass p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wide pb-3 border-b border-white/5 mb-3">
                          Scheduling & Buffer Policies
                        </h3>
                        <ul className="space-y-3 font-light text-zinc-400 text-xs">
                          <li>
                            <strong className="text-zinc-200 uppercase font-mono text-[9px] tracking-wider block">Transition Buffer</strong>
                            All shared resource allocations automatically lock a 15-minute cleaning slot afterwards to prevent scheduling conflicts.
                          </li>
                          <li>
                            <strong className="text-zinc-200 uppercase font-mono text-[9px] tracking-wider block">Category Grouping</strong>
                            Allows booking by Group Category (e.g. "Book any available vehicle") rather than targeting single specific units.
                          </li>
                        </ul>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ================= TAB 5: MAINTENANCE & AUDITS ================= */}
              {activeTab === 'maintenance' && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wide">Active Repair Tickets</h3>
                      {(currentUser.role === 'Admin' || currentUser.role === 'Employee') && (
                        <button 
                          onClick={() => setMaintenanceModalOpen(true)}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-black text-[10px] font-bold uppercase tracking-wider font-mono rounded"
                        >
                          Raise Request
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2">
                        <span className="col-span-2">ASSET</span>
                        <span className="col-span-4">ISSUE DESCRIPTION</span>
                        <span className="col-span-2">PRIORITY</span>
                        <span className="col-span-2">STATUS</span>
                        <span className="col-span-2 text-right">ACTION</span>
                      </div>
                      {maintenance.map((ticket) => (
                        <div key={ticket.id} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300">
                          <span className="col-span-2 font-bold text-white">{ticket.assetTag}</span>
                          <span className="col-span-4 truncate pr-4">{ticket.description}</span>
                          <span className="col-span-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              ticket.priority === 'High' ? 'bg-red-950/60 text-red-400' : 'bg-zinc-900 text-zinc-500'
                            }`}>
                              {ticket.priority}
                            </span>
                          </span>
                          <span className="col-span-2 text-zinc-400">{ticket.status}</span>
                          <div className="col-span-2 text-right">
                            {ticket.status === 'Pending' && (currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') && (
                              <button
                                onClick={() => approveMaintenance(ticket.id)}
                                className="px-2 py-1 bg-brand text-white text-[9px] uppercase font-bold rounded hover:bg-brand/90 transition"
                              >
                                Approve
                              </button>
                            )}
                            {ticket.status === 'Approved' && (currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') && (
                              <button
                                onClick={() => resolveMaintenance(ticket.id)}
                                className="px-2 py-1 bg-emerald-700 text-white text-[9px] uppercase font-bold rounded hover:bg-emerald-600 transition"
                              >
                                Resolve
                              </button>
                            )}
                            {ticket.status === 'Resolved' && (
                              <span className="text-[10px] text-zinc-500 font-bold uppercase">Resolved ✓</span>
                            )}
                            {ticket.status !== 'Resolved' && !(currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') && (
                              <span className="text-[10px] text-zinc-500 font-semibold uppercase">{ticket.status}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 6: AUDIT RUNNER ================= */}
              {activeTab === 'audit' && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <div>
                        <h3 className="text-sm font-bold font-mono uppercase tracking-wide">Physical Walkthrough Audit Cycle</h3>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-1">Active Cycle: #12 · Auditor: Sarah Jenkins</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 text-[9px] font-bold uppercase tracking-wider font-mono">
                        Active Run
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
                      
                      {/* Asset list checklists */}
                      <div className="lg:col-span-7 space-y-3 font-mono text-xs">
                        <div className="grid grid-cols-12 text-[10px] font-bold text-zinc-500 border-b border-white/5 pb-2 px-2">
                          <span className="col-span-3">TAG</span>
                          <span className="col-span-5">ASSET</span>
                          <span className="col-span-4 text-right">AUDIT STATUS</span>
                        </div>
                        {audits[0].items.map((item) => (
                          <div key={item.assetTag} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-white/[0.02] rounded transition text-zinc-300">
                            <span className="col-span-3 font-bold text-white">{item.assetTag}</span>
                            <span className="col-span-5">{item.name}</span>
                            <div className="col-span-4 text-right flex items-center justify-end gap-1.5">
                              {item.auditedStatus === 'Unchecked' ? (
                                <button
                                  onClick={() => handleAuditorScan(item.assetTag)}
                                  className="px-2 py-1 bg-zinc-950 border border-zinc-800 hover:border-brand rounded text-[9px] uppercase font-bold text-zinc-500 hover:text-white transition"
                                >
                                  Scan QR
                                </button>
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  item.auditedStatus === 'Verified' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30' :
                                  item.auditedStatus === 'Damaged' ? 'bg-amber-950/60 text-amber-400 border border-amber-900/30' :
                                  'bg-red-950/60 text-red-400 border border-red-900/30'
                                }`}>
                                  {item.auditedStatus}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* QR scanner mockup box */}
                      <div className="lg:col-span-5 flex flex-col justify-center">
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex flex-col justify-center min-h-[160px] text-center font-mono">
                          {auditVerified === 'unscanned' && (
                            <div className="space-y-2">
                              <QrCode className="w-10 h-10 text-zinc-500 mx-auto animate-pulse" />
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                                Auditor Scanner Mock
                              </span>
                            </div>
                          )}

                          {auditVerified === 'verifying' && (
                            <div className="space-y-2">
                              <div className="h-6 w-6 border border-t-transparent border-brand rounded-full animate-spin mx-auto" />
                              <span className="text-[9px] text-zinc-600 block animate-pulse">Running Scan...</span>
                            </div>
                          )}

                          {auditVerified === 'scanned' && scannedAssetDetails && (
                            <div className="space-y-3 text-left">
                              <div className="border-b border-white/5 pb-1.5 flex justify-between items-center text-[10px]">
                                <span className="font-bold text-white">{scannedAssetDetails.name}</span>
                                <span className="text-zinc-500">{scannedAssetDetails.tag}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5 pt-1">
                                <button
                                  onClick={() => saveAuditStatus('Verified')}
                                  className="py-1 bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 rounded text-[9px] uppercase font-bold"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => saveAuditStatus('Damaged')}
                                  className="py-1 bg-amber-950/20 text-amber-400 border border-amber-900/40 rounded text-[9px] uppercase font-bold"
                                >
                                  Damage
                                </button>
                                <button
                                  onClick={() => saveAuditStatus('Missing')}
                                  className="py-1 bg-red-950/20 text-red-400 border border-red-900/40 rounded text-[9px] uppercase font-bold"
                                >
                                  Missing
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 7: DELTA LOGS ================= */}
              {activeTab === 'logs' && (currentUser.role === 'Admin' || currentUser.role === 'Asset Manager') && (
                <div className="space-y-6 text-left">
                  <div className="premium-glass p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wide">
                        Compliance Delta Logs (Detailed Audit history)
                      </h3>
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-bold">
                        Database log files
                      </span>
                    </div>

                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 font-mono text-[11px] h-[340px] overflow-y-auto space-y-3">
                      {deltaLogs.map(log => (
                        <div key={log.id} className="border-l border-zinc-800 pl-3.5 py-0.5 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-zinc-600">[{log.timestamp}]</span>
                            <span className="px-1.5 py-0.5 bg-brand/10 text-brand rounded text-[9px] border border-brand/20 font-bold uppercase tracking-wider">
                              {log.action}
                            </span>
                            <span className="text-zinc-400 font-bold text-[10px]">{log.actor}</span>
                          </div>
                          <div className="text-zinc-500 text-[10px] mt-1 leading-normal font-light">
                            {log.detail}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </main>

          {/* ================= MODAL WINDOWS ================= */}

          {/* Register Asset Modal */}
          {registerModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider">Register New Asset</h3>
                  <button onClick={() => setRegisterModalOpen(false)}><X className="w-4 h-4" /></button>
                </div>
                
                <form onSubmit={handleRegisterAsset} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Asset Name</label>
                    <input 
                      type="text" 
                      required
                      value={newAsset.name}
                      onChange={e => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                      placeholder="e.g. MacBook Pro M3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 uppercase text-[9px] font-bold">Category</label>
                      <select 
                        value={newAsset.category}
                        onChange={e => setNewAsset(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                      >
                        {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 uppercase text-[9px] font-bold">Condition</label>
                      <select 
                        value={newAsset.condition}
                        onChange={e => setNewAsset(prev => ({ ...prev, condition: e.target.value as any }))}
                        className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                      >
                        <option value="New">New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 uppercase text-[9px] font-bold">Serial Number</label>
                      <input 
                        type="text" 
                        required
                        value={newAsset.serial}
                        onChange={e => setNewAsset(prev => ({ ...prev, serial: e.target.value }))}
                        className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                        placeholder="S/N 83B..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 uppercase text-[9px] font-bold">Acquisition Cost ($)</label>
                      <input 
                        type="number" 
                        required
                        value={newAsset.cost}
                        onChange={e => setNewAsset(prev => ({ ...prev, cost: e.target.value }))}
                        className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                        placeholder="1200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Location</label>
                    <input 
                      type="text" 
                      required
                      value={newAsset.location}
                      onChange={e => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                      placeholder="HQ - Floor 3"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox"
                      checked={newAsset.shared}
                      onChange={e => setNewAsset(prev => ({ ...prev, shared: e.target.checked }))}
                      id="sharedAsset"
                      className="rounded bg-zinc-950 border-zinc-850 accent-brand cursor-pointer h-4 w-4"
                    />
                    <label htmlFor="sharedAsset" className="text-zinc-400 cursor-pointer">
                      Shared / bookable resource (Conference Room, Vehicles)
                    </label>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-white text-black font-bold uppercase tracking-wider rounded transition hover:bg-zinc-200 mt-4"
                  >
                    Register Asset
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Allocate Asset Modal */}
          {allocationModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider">Allocate Asset</h3>
                  <button onClick={() => setAllocationModalOpen(false)}><X className="w-4 h-4" /></button>
                </div>
                
                <form onSubmit={handleAllocateAsset} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Select Asset Tag</label>
                    <select 
                      value={allocForm.assetTag}
                      onChange={e => setAllocForm(prev => ({ ...prev, assetTag: e.target.value }))}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    >
                      {assets.filter(a => !a.shared).map(a => (
                        <option key={a.tag} value={a.tag}>
                          {a.tag} - {a.name} ({a.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Allocate to Employee</label>
                    <select 
                      value={allocForm.employee}
                      onChange={e => setAllocForm(prev => ({ ...prev, employee: e.target.value }))}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    >
                      {employees.map(emp => (
                        <option key={emp.email} value={emp.name}>{emp.name} ({emp.department})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Expected Return Date</label>
                    <input 
                      type="date"
                      value={allocForm.returnDate}
                      onChange={e => setAllocForm(prev => ({ ...prev, returnDate: e.target.value }))}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-brand text-white font-bold uppercase tracking-wider rounded transition hover:bg-brand/90 mt-4"
                  >
                    Validate Allocation
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Book Resource Modal */}
          {bookingModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider">Book Shared Resource</h3>
                  <button onClick={() => setBookingModalOpen(false)}><X className="w-4 h-4" /></button>
                </div>
                
                <form onSubmit={handleBooking} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Select Resource</label>
                    <select 
                      value={bookForm.resource}
                      onChange={e => setBookForm(prev => ({ ...prev, resource: e.target.value }))}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    >
                      {assets.filter(a => a.shared).map(a => (
                        <option key={a.tag} value={a.name}>{a.name} ({a.location})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Booked By Employee</label>
                    <select 
                      value={bookForm.employee}
                      onChange={e => setBookForm(prev => ({ ...prev, employee: e.target.value }))}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    >
                      {employees.map(emp => (
                        <option key={emp.email} value={emp.name}>{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 uppercase text-[9px] font-bold">Start Time</label>
                      <input 
                        type="time" 
                        required
                        value={bookForm.start}
                        onChange={e => setBookForm(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 uppercase text-[9px] font-bold">End Time</label>
                      <input 
                        type="time" 
                        required
                        value={bookForm.end}
                        onChange={e => setBookForm(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Booking Date</label>
                    <input 
                      type="date" 
                      required
                      value={bookForm.date}
                      onChange={e => setBookForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-brand text-white font-bold uppercase tracking-wider rounded transition hover:bg-brand/90 mt-4"
                  >
                    Book Slot
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Raise Maintenance Modal */}
          {maintenanceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="premium-glass p-6 rounded-2xl border border-white/10 w-full max-w-md text-left font-mono">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider">Raise Maintenance Request</h3>
                  <button onClick={() => setMaintenanceModalOpen(false)}><X className="w-4 h-4" /></button>
                </div>
                
                <form onSubmit={handleMaintenance} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Select Asset</label>
                    <select 
                      value={maintForm.assetTag}
                      onChange={e => setMaintForm(prev => ({ ...prev, assetTag: e.target.value }))}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    >
                      {assets.map(a => (
                        <option key={a.tag} value={a.tag}>{a.tag} - {a.name} ({a.status})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Describe Physical Issue</label>
                    <textarea 
                      required
                      rows={3}
                      value={maintForm.description}
                      onChange={e => setMaintForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand resize-none"
                      placeholder="e.g. Display backlight flickering, battery heating up..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-400 uppercase text-[9px] font-bold">Priority</label>
                    <select 
                      value={maintForm.priority}
                      onChange={e => setMaintForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-2 rounded bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-brand"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-brand text-white font-bold uppercase tracking-wider rounded transition hover:bg-brand/90 mt-4"
                  >
                    Submit Repair Ticket
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
