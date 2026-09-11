import express from 'express';
import cors from 'cors';
import { getDbStatus } from './config/db.js';
import factoryRoutes from './routes/factoryRoutes.js';
import emissionRoutes from './routes/emissionRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import errorHandler from './middleware/errorHandler.js';

import recommendationRoutes from './routes/recommendationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

/**
 * Express Application Configuration
 * Primary Ownership: Member 2 (Backend & Emissions)
 */
const app = express();

// Allowed origins for local frontend development
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, tests) or matching frontend origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`Blocked by CORS policy: Origin '${origin}' not permitted`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Security and utility middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Health & Status Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EcoForge AI Backend Engine',
    database: dbStatus,
  });
});

// Mount Domain Routes
app.use('/api/factories', factoryRoutes);
app.use('/api/emissions', emissionRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

export default app;
