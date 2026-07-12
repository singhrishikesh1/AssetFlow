import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import erpRoutes from './routes/erp.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // In production, restrict this to your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', erpRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'AssetFlow API Engine'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 AssetFlow Backend API Server running on port ${PORT}`);
  console.log(`🔗 Health check available at http://localhost:${PORT}/api/health`);
});
