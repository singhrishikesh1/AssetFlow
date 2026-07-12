import { Router } from 'express';
import { login, signup, getMe, forgotPassword } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/forgot', forgotPassword);
router.get('/me', authenticateToken as any, getMe as any);

export default router;
