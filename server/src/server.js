import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Server Bootstrap
 * Primary Ownership: Member 2 (Backend & Emissions)
 */
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[EcoForge AI] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();
