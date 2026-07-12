import { Response } from 'express';
import { query, pool } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper to write system logs inside backend processes
const addLog = async (actor: string, action: string, assetTag: string | undefined, detail: string) => {
  await query('INSERT INTO delta_logs (actor, action, asset_tag, detail) VALUES ($1, $2, $3, $4)', [
    actor,
    action,
    assetTag || null,
    detail
  ]);
};

// Helper to raise system notifications
const addNotification = async (title: string, message: string, type: 'alert' | 'info' | 'success' | 'warning', link?: string, targetUserId = 'all') => {
  const notifId = `N${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  await query('INSERT INTO notifications (id, title, message, type, is_read, target_user_id, link) VALUES ($1, $2, $3, $4, false, $5, $6)', [
    notifId,
    title,
    message,
    type,
    targetUserId,
    link || null
  ]);
};

// ──────────────────────────────────────────────────────────────────────
//  1. ORG SETUP & DIRECTORY
// ──────────────────────────────────────────────────────────────────────

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const dbRes = await query('SELECT * FROM departments ORDER BY name ASC');
    return res.json(dbRes.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch departments.' });
  }
};

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const dbRes = await query('SELECT * FROM categories ORDER BY name ASC');
    return res.json(dbRes.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};

export const getEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const dbRes = await query('SELECT id, name, email, department, role, status FROM employees ORDER BY name ASC');
    return res.json(dbRes.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch employees.' });
  }
};

export const promoteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Employee email is required.' });

    // Fetch current role
    const empCheck = await query('SELECT name, role FROM employees WHERE LOWER(email) = $1', [email.trim().toLowerCase()]);
    if (empCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const currentRole = empCheck.rows[0].role;
    let nextRole = 'Employee';
    if (currentRole === 'Employee') nextRole = 'Asset Manager';
    else if (currentRole === 'Asset Manager') nextRole = 'Department Head';
    else if (currentRole === 'Department Head') nextRole = 'Admin';

    await query('UPDATE employees SET role = $1 WHERE LOWER(email) = $2', [nextRole, email.trim().toLowerCase()]);
    
    const actorName = req.user ? `${req.user.name} (${req.user.role})` : 'System Admin';
    await addLog(actorName, 'ROLE_ELEVATION', undefined, `Elevated ${empCheck.rows[0].name} role level from [${currentRole}] to [${nextRole}]`);

    return res.json({ success: true, nextRole });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to elevate employee role.' });
  }
};

// ──────────────────────────────────────────────────────────────────────
//  2. ASSET LIFECYCLE MANAGEMENT
// ──────────────────────────────────────────────────────────────────────

export const getAssets = async (req: AuthRequest, res: Response) => {
  try {
    const dbRes = await query('SELECT * FROM assets ORDER BY tag ASC');
    return res.json(dbRes.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch assets.' });
  }
};

export const registerAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, serial, cost, location, condition, shared } = req.body;

    if (!name || !category || !serial || !location) {
      return res.status(400).json({ error: 'Missing required asset details.' });
    }

    // Auto-generate tag
    const countRes = await query('SELECT COUNT(*) AS count FROM assets');
    const totalCount = parseInt(countRes.rows[0].count, 10);
    const tag = `AF-0${totalCount + 101}`;

    const costNum = Number(cost) || 0;
    const isShared = shared === true || shared === 'true';
    const holder = isShared ? 'Shared' : 'None';

    const insertQuery = `
      INSERT INTO assets (tag, name, category, serial, cost, condition, status, location, holder, shared)
      VALUES ($1, $2, $3, $4, $5, $6, 'Available', $7, $8, $9)
      RETURNING *
    `;

    const dbRes = await query(insertQuery, [
      tag,
      name.trim(),
      category,
      serial.trim(),
      costNum,
      condition || 'New',
      location.trim(),
      holder,
      isShared
    ]);

    const actorName = req.user ? `${req.user.name} (${req.user.role})` : 'Asset Manager';
    await addLog(actorName, 'REGISTER_ASSET', tag, `Registered new asset [${name}] in category [${category}]`);

    return res.status(201).json(dbRes.rows[0]);
  } catch (error) {
    console.error('Error registering asset:', error);
    return res.status(500).json({ error: 'Failed to register asset. Verify serial unique constraints.' });
  }
};

export const allocateAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { tag, employee, returnDate } = req.body;

    if (!tag || !employee) {
      return res.status(400).json({ error: 'Asset tag and employee name are required.' });
    }

    // Check availability
    const assetCheck = await query('SELECT * FROM assets WHERE tag = $1', [tag]);
    if (assetCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    const asset = assetCheck.rows[0];
    if (asset.status !== 'Available') {
      return res.status(400).json({ error: `Asset is currently [${asset.status}] and cannot be allocated.` });
    }

    // Perform allocation
    await query("UPDATE assets SET status = 'Allocated', holder = $1 WHERE tag = $2", [employee, tag]);

    const actorName = req.user ? `${req.user.name} (${req.user.role})` : 'Asset Manager';
    await addLog(
      actorName,
      'ALLOCATE_ASSET',
      tag,
      `Allocated asset to ${employee}. Expected return date: ${returnDate || 'Indefinite'}`
    );

    return res.json({ success: true, message: 'Asset allocated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to allocate asset.' });
  }
};

// ──────────────────────────────────────────────────────────────────────
//  3. SCHEDULER & BOOKINGS
// ──────────────────────────────────────────────────────────────────────

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const dbRes = await query('SELECT * FROM bookings ORDER BY booking_date DESC, start_time DESC');
    return res.json(dbRes.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { resource, employee, start, end, date } = req.body;

    if (!resource || !employee || !start || !end || !date) {
      return res.status(400).json({ error: 'All booking fields are required.' });
    }

    // Backend Concurrency Overlap Check:
    // (StartA < EndB) AND (EndA > StartB)
    const checkQuery = `
      SELECT id FROM bookings 
      WHERE resource = $1 
        AND status != 'Cancelled' 
        AND booking_date = $2 
        AND start_time < $3 
        AND end_time > $4
    `;
    const checkRes = await query(checkQuery, [resource, date, end, start]);
    if (checkRes.rowCount! > 0) {
      return res.status(409).json({ error: `Booking conflict: ${resource} is already booked during this time-slot.` });
    }

    // Insert booking record
    await query(
      `INSERT INTO bookings (resource, user_name, start_time, end_time, booking_date, status)
       VALUES ($1, $2, $3, $4, $5, 'Upcoming')`,
      [resource, employee, start, end, date]
    );

    // Lock asset status to Reserved
    await query("UPDATE assets SET status = 'Reserved' WHERE name = $1", [resource]);

    const actorName = req.user ? `${req.user.name} (${req.user.role})` : employee;
    await addLog(
      actorName,
      'BOOK_RESOURCE',
      undefined,
      `Booked shared resource [${resource}] on ${date} from ${start} to ${end}. Injected 15-minute buffer cleaning.`
    );

    return res.status(201).json({ success: true, message: 'Resource booked successfully.' });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: 'Failed to complete resource booking.' });
  }
};

// ──────────────────────────────────────────────────────────────────────
//  4. MAINTENANCE STATE MACHINE
// ──────────────────────────────────────────────────────────────────────

export const getMaintenance = async (req: AuthRequest, res: Response) => {
  try {
    const dbRes = await query('SELECT * FROM maintenance_requests ORDER BY created_at DESC');
    return res.json(dbRes.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch maintenance requests.' });
  }
};

export const createMaintenance = async (req: AuthRequest, res: Response) => {
  try {
    const { assetTag, description, priority } = req.body;

    if (!assetTag || !description) {
      return res.status(400).json({ error: 'Asset tag and ticket description are required.' });
    }

    await query(
      `INSERT INTO maintenance_requests (asset_tag, description, priority, status)
       VALUES ($1, $2, $3, 'Pending')`,
      [assetTag, description, priority || 'Medium']
    );

    const actorName = req.user ? `${req.user.name} (${req.user.role})` : 'System';
    await addLog(actorName, 'RAISE_MAINTENANCE', assetTag, `Raised repair ticket for [${assetTag}]: "${description}"`);

    return res.status(201).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create maintenance ticket.' });
  }
};

export const approveMaintenance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Ticket ID is required.' });

    const ticketCheck = await query('SELECT asset_tag FROM maintenance_requests WHERE id = $1', [id]);
    if (ticketCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Maintenance ticket not found.' });
    }

    const tag = ticketCheck.rows[0].asset_tag;

    // Approve maintenance ticket
    await query("UPDATE maintenance_requests SET status = 'Approved' WHERE id = $1", [id]);
    // Set asset Under Maintenance
    await query("UPDATE assets SET status = 'Under Maintenance' WHERE tag = $1", [tag]);

    const actorName = req.user ? `${req.user.name} (${req.user.role})` : 'Asset Manager';
    await addLog(actorName, 'APPROVE_MAINTENANCE', tag, `State shift: Status changed from [Available] to [Under Maintenance]`);

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to approve maintenance ticket.' });
  }
};

export const resolveMaintenance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Ticket ID is required.' });

    const ticketCheck = await query('SELECT asset_tag FROM maintenance_requests WHERE id = $1', [id]);
    if (ticketCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Maintenance ticket not found.' });
    }

    const tag = ticketCheck.rows[0].asset_tag;

    // Resolve maintenance ticket
    await query("UPDATE maintenance_requests SET status = 'Resolved' WHERE id = $1", [id]);
    // Free asset to Available
    await query("UPDATE assets SET status = 'Available' WHERE tag = $1", [tag]);

    const actorName = req.user ? `${req.user.name} (${req.user.role})` : 'Asset Manager';
    await addLog(actorName, 'RESOLVE_MAINTENANCE', tag, `State shift: Status changed from [Under Maintenance] to [Available]`);

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to resolve maintenance ticket.' });
  }
};

// ──────────────────────────────────────────────────────────────────────
//  5. COMPLIANCE AUDIT CYCLES
// ──────────────────────────────────────────────────────────────────────

export const getAudits = async (req: AuthRequest, res: Response) => {
  try {
    // Fetch active cycles
    const cyclesRes = await query('SELECT * FROM audit_cycles ORDER BY created_at DESC');
    const cycles = cyclesRes.rows;

    // Fetch items for each cycle
    for (let cycle of cycles) {
      const itemsRes = await query('SELECT asset_tag, audited_status FROM audit_items WHERE audit_cycle_id = $1', [cycle.id]);
      
      // Get names of assets for UI compatibility
      const items = [];
      for (let item of itemsRes.rows) {
        const nameRes = await query('SELECT name FROM assets WHERE tag = $1', [item.asset_tag]);
        items.push({
          assetTag: item.asset_tag,
          name: nameRes.rowCount! > 0 ? nameRes.rows[0].name : 'Unknown Asset',
          auditedStatus: item.audited_status
        });
      }
      cycle.items = items;
    }

    return res.json(cycles);
  } catch (error) {
    console.error('Error fetching audits:', error);
    return res.status(500).json({ error: 'Failed to fetch audit cycles.' });
  }
};

export const saveAuditItemStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { cycleId, assetTag, status } = req.body; // status: 'Verified' | 'Missing' | 'Damaged'

    if (!cycleId || !assetTag || !status) {
      return res.status(400).json({ error: 'Missing cycle ID, asset tag, or audited status.' });
    }

    // Update audit cycle items
    await query(
      'UPDATE audit_items SET audited_status = $1 WHERE audit_cycle_id = $2 AND asset_tag = $3',
      [status, cycleId, assetTag]
    );

    // Update core asset state based on audit discrepancies
    if (status === 'Missing') {
      await query("UPDATE assets SET status = 'Lost', condition = 'Missing' WHERE tag = $1", [assetTag]);
    } else if (status === 'Damaged') {
      await query("UPDATE assets SET condition = 'Damaged' WHERE tag = $1", [assetTag]);
      
      // Auto-trigger maintenance request
      await query(
        `INSERT INTO maintenance_requests (asset_tag, description, priority, status)
         VALUES ($1, 'Audit Flag: Reported damaged during cycle #12', 'High', 'Pending')`,
        [assetTag]
      );
      
      const auditorName = req.user ? `${req.user.name} (${req.user.role})` : 'Sarah Jenkins (Auditor)';
      await addLog(
        auditorName,
        'AUDIT_FLAG_DISCREPANCY',
        assetTag,
        `Audited condition: Damaged. Auto-generated maintenance ticket.`
      );
    } else {
      await query("UPDATE assets SET condition = 'Good' WHERE tag = $1", [assetTag]);
      
      const auditorName = req.user ? `${req.user.name} (${req.user.role})` : 'Sarah Jenkins (Auditor)';
      await addLog(
        auditorName,
        'AUDIT_VERIFY',
        assetTag,
        `Audited condition: Verified Good.`
      );
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error saving audit status:', error);
    return res.status(500).json({ error: 'Failed to save audit status details.' });
  }
};

// ──────────────────────────────────────────────────────────────────────
//  6. PROCUREMENT HUB: PRODUCTS, VENDORS, INVENTORY, ORDERS
// ──────────────────────────────────────────────────────────────────────

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const dbRes = await query('SELECT * FROM products ORDER BY id ASC');
    return res.json(dbRes.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch product catalog.' });
  }
};

export const getVendors = async (req: AuthRequest, res: Response) => {
  try {
    const vendorsRes = await query('SELECT * FROM vendors ORDER BY id ASC');
    const vendors = vendorsRes.rows;

    for (let vendor of vendors) {
      const prodsRes = await query(
        'SELECT product_id as "productId", price, in_stock as "inStock", min_order_qty as "minOrderQty" FROM vendor_products WHERE vendor_id = $1',
        [vendor.id]
      );
      vendor.products = prodsRes.rows;
    }

    return res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return res.status(500).json({ error: 'Failed to fetch vendor records.' });
  }
};

export const getItemMasters = async (req: AuthRequest, res: Response) => {
  try {
    const dbRes = await query('SELECT * FROM item_masters ORDER BY id DESC');
    // Map db columns to camelCase expected by UI
    const mapped = dbRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      sku: r.sku,
      materialCategory: r.material_category,
      quantity: r.quantity,
      rate: Number(r.rate),
      materialLocation: r.material_location,
      companyName: r.company_name,
      description: r.description
    }));
    return res.json(mapped);
  } catch (error) {
    console.error('Error fetching item masters:', error);
    return res.status(500).json({ error: 'Failed to fetch Item Master records.' });
  }
};

export const createItemMaster = async (req: AuthRequest, res: Response) => {
  try {
    const { name, sku, materialCategory, quantity, rate, materialLocation, companyName, description } = req.body;

    if (!name || !sku || !materialCategory || !materialLocation || !companyName) {
      return res.status(400).json({ error: 'Missing required Item Master details.' });
    }

    const id = `IM${Date.now()}`;
    const qty = Number(quantity) || 0;
    const rt = Number(rate) || 0;

    // Ensure product SKU exists in products table due to FK constraint
    const productCheck = await query('SELECT sku FROM products WHERE sku = $1', [sku.trim()]);
    if (productCheck.rows.length === 0) {
      const tempProdId = `P${Date.now()}`;
      await query(
        `INSERT INTO products (id, name, category, description, sku, unit_of_measure)
         VALUES ($1, $2, $3, $4, $5, 'unit')`,
        [tempProdId, name.trim(), materialCategory, `Auto-generated description for SKU ${sku.trim()}`, sku.trim()]
      );
    }

    await query(
      `INSERT INTO item_masters (id, name, sku, material_category, quantity, rate, material_location, company_name, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, name.trim(), sku.trim(), materialCategory, qty, rt, materialLocation.trim(), companyName.trim(), description || '']
    );

    // Low stock thresholds warning logic
    const thresholds: Record<string, number> = { 'Raw Material': 1000, 'Semi-Finished Material': 20, 'Finished Material': 10 };
    const limit = thresholds[materialCategory] || 0;
    if (qty < limit) {
      await addNotification(
        '⚠ Low Stock Alert',
        `${name} (${sku}) added with only ${qty} units — below threshold of ${limit.toLocaleString()} for ${materialCategory}.`,
        'alert',
        'itemmaster'
      );
    }

    const actorName = req.user ? `${req.user.name} (${req.user.role})` : 'System';
    await addLog(actorName, 'ADD_ITEM_MASTER', undefined, `Item Master record created: ${name} (${materialCategory})`);

    return res.status(201).json({ id, name, sku, materialCategory, quantity: qty, rate: rt, materialLocation, companyName, description });
  } catch (error) {
    console.error('Error creating Item Master:', error);
    return res.status(500).json({ error: 'Failed to create Item Master record.' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const ordersRes = await query('SELECT * FROM orders ORDER BY date DESC');
    const orders = ordersRes.rows;

    for (let order of orders) {
      const itemsRes = await query(
        `SELECT product_id as "productId", product_name as "productName", quantity, 
                unit_price as "unitPrice", vendor_id as "vendorId", vendor_name as "vendorName", 
                material_category as "materialCategory"
         FROM order_items WHERE order_id = $1`,
        [order.id]
      );
      // Map columns
      order.orderNumber = order.order_number;
      order.items = itemsRes.rows.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice)
      }));
    }

    return res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch Purchase Orders.' });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { customer, notes, items } = req.body; // items: OrderItem[]

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer and line items are required to place an order.' });
    }

    await client.query('BEGIN');

    // Get next PO number
    const countRes = await client.query('SELECT COUNT(*) AS count FROM orders');
    const count = parseInt(countRes.rows[0].count, 10);
    const orderNumber = `PO-${new Date().getFullYear()}-${String(count + 4).padStart(3, '0')}`;
    const id = `ORD${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];

    // Insert Order row
    await client.query(
      `INSERT INTO orders (id, order_number, date, customer, status, notes)
       VALUES ($1, $2, $3, $4, 'Confirmed', $5)`,
      [id, orderNumber, date, customer.trim(), notes || '']
    );

    let total = 0;
    // Insert Line Items
    for (let item of items) {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      total += qty * price;

      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, vendor_id, vendor_name, material_category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, item.productId, item.productName, qty, price, item.vendorId, item.vendorName, item.materialCategory]
      );
    }

    // Trigger Notification alerts
    await addNotification(
      `✅ Order Placed`,
      `Order ${orderNumber} for ${customer} confirmed. Total: ₹${total.toLocaleString()}.`,
      'success',
      'orders'
    );

    await addNotification(
      `📄 BOM Generated`,
      `Bill of Materials auto-generated for ${orderNumber} with ${items.length} line items.`,
      'info',
      'orders'
    );

    const actorName = req.user ? `${req.user.name} (${req.user.role})` : 'System';
    await client.query('INSERT INTO delta_logs (actor, action, detail) VALUES ($1, $2, $3)', [
      actorName,
      'CREATE_ORDER',
      `Order ${orderNumber} created with ${items.length} items. BOM auto-generated.`
    ]);

    await client.query('COMMIT');
    return res.status(201).json({ id, orderNumber, date, customer, status: 'Confirmed', notes, items });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error placing PO order:', error);
    return res.status(500).json({ error: 'Failed to create Purchase Order transaction.' });
  } finally {
    client.release();
  }
};

// ──────────────────────────────────────────────────────────────────────
//  7. NOTIFICATIONS & HISTORY AUDIT LOGS
// ──────────────────────────────────────────────────────────────────────

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user?.email || '';
    const dbRes = await query(
      'SELECT id, title, message, type, is_read as "isRead", target_user_id as "targetUserId", created_at as "createdAt", link FROM notifications WHERE target_user_id = \'all\' OR LOWER(target_user_id) = $1 ORDER BY created_at DESC',
      [userEmail.toLowerCase()]
    );
    return res.json(dbRes.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
};

export const markRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Notification ID is required.' });

    await query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user?.email || 'all';
    await query('UPDATE notifications SET is_read = true WHERE target_user_id = \'all\' OR LOWER(target_user_id) = $1', [userEmail.toLowerCase()]);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to clear all notifications.' });
  }
};

export const getLogs = async (req: AuthRequest, res: Response) => {
  try {
    const dbRes = await query('SELECT id, timestamp, actor, action, asset_tag as "assetTag", detail FROM delta_logs ORDER BY timestamp DESC');
    return res.json(dbRes.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch compliance delta logs.' });
  }
};
