import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'assetflow_fallback_jwt_secret_key_2026_secure_string_987';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const emailClean = email.trim().toLowerCase();

    // Fetch user from DB
    const userRes = await query('SELECT * FROM employees WHERE LOWER(email) = $1', [emailClean]);
    if (userRes.rowCount === 0) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const user = userRes.rows[0];

    if (user.status === 'Inactive') {
      return res.status(403).json({ error: 'Account deactivated. Please contact an administrator.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Write login audit log
    await query('INSERT INTO delta_logs (actor, action, detail) VALUES ($1, $2, $3)', [
      `${user.name} (${user.role})`,
      'USER_LOGIN',
      'Logged in successfully via secure API.'
    ]);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    const emailClean = email.trim().toLowerCase();

    // Check if user already exists
    const checkUser = await query('SELECT id FROM employees WHERE LOWER(email) = $1', [emailClean]);
    if (checkUser.rowCount! > 0) {
      return res.status(400).json({ error: 'Account already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Set role (admin@assetflow.com gets Admin, others get Employee by default)
    const role = emailClean === 'admin@assetflow.com' ? 'Admin' : 'Employee';

    // Insert user into DB
    const insertRes = await query(
      `INSERT INTO employees (name, email, password_hash, department, role, status)
       VALUES ($1, $2, $3, $4, $5, 'Active') RETURNING id, name, email, role, department, status`,
      [name.trim(), emailClean, passwordHash, department, role]
    );

    const user = insertRes.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create system audit log
    await query('INSERT INTO delta_logs (actor, action, detail) VALUES ($1, $2, $3)', [
      `${user.name} (${user.role})`,
      'USER_SIGNUP',
      `New account created for department [${user.department}].`
    ]);

    return res.status(201).json({
      token,
      user
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ error: 'Server error during account registration.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No active session' });
    }

    // Fetch fresh user state from DB
    const userRes = await query('SELECT id, name, email, role, department, status FROM employees WHERE id = $1', [req.user.id]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    return res.json({ user: userRes.rows[0] });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({ error: 'Server error fetching profile details.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter your email.' });
    }

    const emailClean = email.trim().toLowerCase();
    const userCheck = await query('SELECT id, name FROM employees WHERE LOWER(email) = $1', [emailClean]);
    
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    // In a real application we send an email link. For this demo project, we simulate:
    return res.json({ 
      success: true, 
      message: 'Demo Reset Successful: For demonstration purposes, you can use the password "admin123" to sign in next, or check the database seeding.' 
    });
  } catch (error) {
    console.error('Error during forgotPassword:', error);
    return res.status(500).json({ error: 'Server error executing password recovery.' });
  }
};
