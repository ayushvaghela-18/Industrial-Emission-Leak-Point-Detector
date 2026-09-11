import express from 'express';
import cors from 'cors';
import { getDbStatus } from './config/db.js';
import factoryRoutes from './routes/factoryRoutes.js';
import emissionRoutes from './routes/emissionRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import errorHandler from './middleware/errorHandler.js';

import recommendationRoutes from './routes/recommendationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// AI & Recommendation Routes
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ai', aiRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EcoForge AI Backend Engine',
    database: dbStatus,
  });
});

// Existing Domain Routes
app.use('/api/factories', factoryRoutes);
app.use('/api/emissions', emissionRoutes);
app.use('/api/simulation', simulationRoutes);

// Global Error Handling
app.use(errorHandler);

export default app;