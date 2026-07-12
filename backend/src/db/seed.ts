import { pool } from './index.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seeding process...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Clear existing data
    console.log('🧹 Clearing old tables...');
    await client.query('TRUNCATE TABLE delta_logs, notifications, order_items, orders, item_masters, vendor_products, vendors, products, audit_items, audit_cycles, maintenance_requests, bookings, assets, categories, employees, departments RESTART IDENTITY CASCADE;');

    // 2. Seed Departments
    console.log('🏢 Seeding departments...');
    await client.query(`
      INSERT INTO departments (name, head, parent, status) VALUES
      ('Engineering', 'Marcus Brody', 'None', 'Active'),
      ('Design', 'Raj Patel', 'Engineering', 'Active'),
      ('Operations', 'Alex Mercer', 'None', 'Active'),
      ('Audit & Compliance', 'Sarah Jenkins', 'Operations', 'Active');
    `);

    // 3. Seed Categories
    console.log('🏷️ Seeding categories...');
    await client.query(`
      INSERT INTO categories (name, warranty_period, custom_field) VALUES
      ('Electronics', 365, 'CPU / RAM specs'),
      ('Furniture', 1095, 'Material type'),
      ('Vehicles', 730, 'License Plate'),
      ('Office Spaces', 0, 'Capacity');
    `);

    // 4. Seed Employees (Hashed Passwords)
    console.log('👥 Seeding employees...');
    const salt = await bcrypt.genSalt(10);
    const passAdmin = await bcrypt.hash('admin123', salt);
    const passAlex = await bcrypt.hash('alex123', salt);
    const passMarcus = await bcrypt.hash('marcus123', salt);
    const passPriya = await bcrypt.hash('priya123', salt);
    const passRaj = await bcrypt.hash('raj123', salt);
    const passSarah = await bcrypt.hash('sarah123', salt);

    await client.query(`
      INSERT INTO employees (name, email, password_hash, department, role, status) VALUES
      ('Rishikesh Singh', 'admin@assetflow.com', $1, 'Operations', 'Admin', 'Active'),
      ('Alex Mercer', 'alex@assetflow.com', $2, 'Operations', 'Asset Manager', 'Active'),
      ('Marcus Brody', 'marcus@assetflow.com', $3, 'Operations', 'Department Head', 'Active'),
      ('Priya Sharma', 'priya@assetflow.com', $4, 'Engineering', 'Employee', 'Active'),
      ('Raj Patel', 'raj@assetflow.com', $5, 'Design', 'Employee', 'Active'),
      ('Sarah Jenkins', 'sarah@assetflow.com', $6, 'Audit & Compliance', 'Employee', 'Active');
    `, [passAdmin, passAlex, passMarcus, passPriya, passRaj, passSarah]);

    // 5. Seed Assets
    console.log('💻 Seeding core assets...');
    await client.query(`
      INSERT INTO assets (tag, name, category, serial, cost, condition, status, location, holder, shared) VALUES
      ('AF-0114', 'MacBook Pro M3', 'Electronics', 'S/N 83B4F83', 2500.00, 'New', 'Allocated', 'HQ - Floor 3', 'Priya Sharma', false),
      ('AF-0341', 'Dell XPS 15', 'Electronics', 'S/N 29A4D19', 1800.00, 'Good', 'Available', 'HQ - Floor 2', 'None', false),
      ('AF-0883', 'Herman Miller Aeron', 'Furniture', 'S/N 12B8C73', 1200.00, 'Good', 'Available', 'HQ - Room A1', 'None', false),
      ('AF-1002', 'Conference Room B2', 'Office Spaces', 'LOC-B2', 0.00, 'New', 'Available', 'HQ - Floor 1', 'Shared', true),
      ('AF-0220', 'Tesla Model 3', 'Vehicles', 'PLATE-AURA', 42000.00, 'Good', 'Available', 'Garage A', 'Shared', true);
    `);

    // 6. Seed Bookings
    console.log('📅 Seeding bookings...');
    await client.query(`
      INSERT INTO bookings (resource, user_name, start_time, end_time, booking_date, status) VALUES
      ('Conference Room B2', 'Raj Patel', '09:00:00', '10:00:00', '2026-07-12', 'Ongoing');
    `);

    // 7. Seed Maintenance
    console.log('🔧 Seeding maintenance tickets...');
    await client.query(`
      INSERT INTO maintenance_requests (asset_tag, description, priority, status) VALUES
      ('AF-0341', 'Keyboard double space defect', 'Medium', 'Pending');
    `);

    // 8. Seed Audit Cycles & Items
    console.log('📋 Seeding compliance audits...');
    const cycleRes = await client.query(`
      INSERT INTO audit_cycles (scope, auditor, date_range, status) VALUES
      ('Engineering Department', 'Sarah Jenkins', '2026-07-10 - 2026-07-15', 'Active') RETURNING id;
    `);
    const cycleId = cycleRes.rows[0].id;

    await client.query(`
      INSERT INTO audit_items (audit_cycle_id, asset_tag, audited_status) VALUES
      ($1, 'AF-0114', 'Unchecked'),
      ($1, 'AF-0341', 'Unchecked'),
      ($1, 'AF-0883', 'Unchecked');
    `, [cycleId]);

    // 9. Seed Procurement - Products
    console.log('📦 Seeding products catalog...');
    await client.query(`
      INSERT INTO products (id, name, category, description, sku, unit_of_measure) VALUES
      ('P001', 'Steel Rod 12mm', 'Raw Material', 'High tensile steel rod', 'SR-12MM-001', 'kg'),
      ('P002', 'Copper Wire 2.5mm', 'Raw Material', 'Electrical grade copper wire', 'CW-25MM-002', 'meter'),
      ('P003', 'Industrial Bearing 6205', 'Semi-Finished Material', 'Deep groove ball bearing', 'IB-6205-003', 'unit'),
      ('P004', 'Motor Drive PCB', 'Semi-Finished Material', 'Partially assembled motor PCB', 'PCB-MD-004', 'unit'),
      ('P005', 'Hydraulic Pump Assembly', 'Finished Material', 'Complete hydraulic pump', 'HPA-V2-005', 'unit'),
      ('P006', 'Stainless Sheet 2mm', 'Raw Material', '304 grade stainless steel sheet', 'SS-2MM-006', 'sqft'),
      ('P007', 'Pneumatic Cylinder 50mm', 'Finished Material', 'Ready-to-install pneumatic cylinder', 'PC-50MM-007', 'unit'),
      ('P008', 'Gear Assembly Kit', 'Semi-Finished Material', 'Partially machined gear set', 'GAK-V1-008', 'set'),
      ('P009', 'Aluminium Ingot 99%', 'Raw Material', 'Primary aluminium ingot', 'AI-99P-009', 'kg'),
      ('P010', 'Electric Motor 2HP', 'Finished Material', 'Single phase induction motor', 'EM-2HP-010', 'unit'),
      ('P011', 'PVC Granules', 'Raw Material', 'Virgin grade PVC resin granules', 'PVC-GR-011', 'kg'),
      ('P012', 'Control Panel Box', 'Finished Material', 'IP65 rated control panel enclosure', 'CPB-IP65-012', 'unit');
    `);

    // 10. Seed Procurement - Vendors
    console.log('🏬 Seeding vendors directory...');
    await client.query(`
      INSERT INTO vendors (id, name, shop_name, location, contact_email, contact_phone) VALUES
      ('V001', 'Ravi Steels Pvt Ltd', 'Ravi Metal Works', 'MIDC Phase II, Pune - 411019', 'ravi@ravisteels.com', '+91-9876541001'),
      ('V002', 'Arjun Electricals', 'AE Electrical Supplies', 'Industrial Area, Nashik - 422001', 'supply@arjunelec.in', '+91-9876541002'),
      ('V003', 'Precision Bearings Co.', 'PBC Warehouse', 'Bhosari MIDC, Pune - 411026', 'orders@pbc.co.in', '+91-9876541003'),
      ('V004', 'Suresh Hydraulics', 'SH Fluid Power', 'Chakan Industrial Zone, Pune - 410501', 'sales@sureshhydraulics.com', '+91-9876541004'),
      ('V005', 'Polymer Solutions Ltd', 'PSL Depot', 'Talegaon MIDC, Pune - 412106', 'polymer@psl.in', '+91-9876541005'),
      ('V006', 'MegaMetal Traders', 'MegaMetal Yard', 'Hadapsar, Pune - 411028', 'trade@megametal.in', '+91-9876541006');
    `);

    // 11. Seed Vendor-Products Pricing mapping
    console.log('💰 Seeding vendor pricing catalogs...');
    await client.query(`
      INSERT INTO vendor_products (vendor_id, product_id, price, in_stock, min_order_qty) VALUES
      ('V001', 'P001', 82.50, true, 100),
      ('V001', 'P006', 145.00, true, 50),
      ('V001', 'P009', 210.00, false, 200),
      ('V002', 'P002', 58.00, true, 500),
      ('V002', 'P004', 1250.00, true, 10),
      ('V002', 'P010', 4800.00, true, 1),
      ('V003', 'P003', 320.00, true, 20),
      ('V003', 'P008', 2100.00, true, 5),
      ('V004', 'P005', 18500.00, true, 1),
      ('V004', 'P007', 3200.00, true, 2),
      ('V005', 'P011', 95.00, true, 500),
      ('V005', 'P012', 6800.00, false, 1),
      ('V006', 'P001', 79.00, true, 200),
      ('V006', 'P006', 138.00, true, 100),
      ('V006', 'P009', 205.00, true, 500);
    `);

    // 12. Seed Item Master (Inventory levels)
    console.log('📦 Seeding Item Master (Inventory levels)...');
    await client.query(`
      INSERT INTO item_masters (id, name, sku, material_category, quantity, rate, material_location, company_name, description) VALUES
      ('IM001', 'Steel Rod 12mm', 'SR-12MM-001', 'Raw Material', 500, 80.00, 'Warehouse A - Rack 3', 'In-House Production', 'Primary raw material for fabrication'),
      ('IM002', 'Motor Drive PCB', 'PCB-MD-004', 'Semi-Finished Material', 25, 1200.00, 'Assembly Bay - Zone 2', 'Arjun Electricals', 'Requires final component soldering in-house'),
      ('IM003', 'Hydraulic Pump Assembly', 'HPA-V2-005', 'Finished Material', 8, 18000.00, 'Store Room B - Shelf 1', 'Suresh Hydraulics', 'Fully vendor-manufactured, ready for dispatch'),
      ('IM004', 'Copper Wire 2.5mm', 'CW-25MM-002', 'Raw Material', 2000, 56.00, 'Warehouse A - Rack 7', 'In-House Drawn', 'Electrical wiring raw stock'),
      ('IM005', 'Gear Assembly Kit', 'GAK-V1-008', 'Semi-Finished Material', 15, 2000.00, 'Assembly Bay - Zone 4', 'Precision Bearings Co.', 'Requires final balancing and heat treatment in-house');
    `);

    // 13. Seed Purchase Orders
    console.log('📄 Seeding Purchase Orders...');
    await client.query(`
      INSERT INTO orders (id, order_number, date, customer, status, notes) VALUES
      ('ORD001', 'PO-2026-001', '2026-07-10', 'ABC Manufacturing Ltd', 'Confirmed', 'Urgent delivery required'),
      ('ORD002', 'PO-2026-002', '2026-07-08', 'XYZ Engineering Works', 'Confirmed', ''),
      ('ORD003', 'PO-2026-003', '2026-07-05', 'Delta Auto Parts', 'Completed', 'Monthly standing order');
    `);

    // 14. Seed Order Items
    console.log('📄 Seeding Order Line Items...');
    await client.query(`
      INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, vendor_id, vendor_name, material_category) VALUES
      ('ORD001', 'P001', 'Steel Rod 12mm', 500, 82.50, 'V001', 'Ravi Steels Pvt Ltd', 'Raw Material'),
      ('ORD001', 'P003', 'Industrial Bearing 6205', 50, 320.00, 'V003', 'Precision Bearings Co.', 'Semi-Finished Material'),
      ('ORD002', 'P005', 'Hydraulic Pump Assembly', 3, 18500.00, 'V004', 'Suresh Hydraulics', 'Finished Material'),
      ('ORD003', 'P002', 'Copper Wire 2.5mm', 1000, 58.00, 'V002', 'Arjun Electricals', 'Raw Material'),
      ('ORD003', 'P010', 'Electric Motor 2HP', 5, 4800.00, 'V002', 'Arjun Electricals', 'Finished Material');
    `);

    // 15. Seed Notifications
    console.log('🔔 Seeding notification history...');
    await client.query(`
      INSERT INTO notifications (id, title, message, type, is_read, target_user_id, created_at, link) VALUES
      ('N001', '⚠ Low Stock Alert', 'Steel Rod 12mm (SR-12MM-001) has only 500 units — below threshold of 1,000 for Raw Materials.', 'alert', false, 'all', NOW() - INTERVAL '2 hours', 'itemmaster'),
      ('N002', '✅ Order Placed', 'Order PO-2026-001 for ABC Manufacturing Ltd confirmed. Total: ₹57,250.', 'success', false, 'all', NOW() - INTERVAL '5 hours', 'orders'),
      ('N003', '📄 BOM Generated', 'Bill of Materials auto-generated for PO-2026-001 with 2 line items totalling ₹57,250.', 'info', true, 'all', NOW() - INTERVAL '5 hours', 'orders'),
      ('N004', '⚠ Low Stock Alert', 'Gear Assembly Kit (GAK-V1-008) has only 15 units — below threshold of 20 for Semi-Finished Materials.', 'alert', false, 'all', NOW() - INTERVAL '24 hours', 'itemmaster'),
      ('N005', '✅ Order Placed', 'Order PO-2026-002 for XYZ Engineering Works confirmed. Total: ₹55,500.', 'success', true, 'all', NOW() - INTERVAL '30 hours', 'orders'),
      ('N006', '⚠ Low Stock Alert', 'Hydraulic Pump Assembly (HPA-V2-005) has only 8 units — below threshold of 10 for Finished Materials.', 'alert', false, 'all', NOW() - INTERVAL '48 hours', 'itemmaster');
    `);

    // 16. Seed Compliance Logs
    console.log('📜 Seeding Compliance Delta Logs...');
    await client.query(`
      INSERT INTO delta_logs (timestamp, actor, action, detail) VALUES
      (NOW() - INTERVAL '10 hours', 'System Seed Engine', 'INITIALIZE_DB', 'Pre-populated core assets, employee directory, and departments.'),
      (NOW() - INTERVAL '9 hours', 'Marcus Brody (Admin)', 'ROLE_ELEVATION', 'Priya Sharma promoted to Asset Manager permissions.');
    `);

    await client.query('COMMIT');
    console.log('🎉 Seeding successfully completed! All tables are populated.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding transaction aborted due to error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
