import express from 'express';
import cors from 'cors';
import { getDbStatus } from './config/db.js';
import factoryRoutes from './routes/factoryRoutes.js';
import emissionRoutes from './routes/emissionRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import errorHandler from './middleware/errorHandler.js';

/**
 * Express Application Configuration
 * Primary Ownership: Member 2 (Backend & Emissions)
 */
const app = express();

// Security and utility middlewares
app.use(cors());
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

// Global Error Handling Middleware
app.use(errorHandler);

export default app;
