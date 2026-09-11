import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded regardless of current working directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

let isConnected = false;

/**
 * MongoDB Atlas / Local Connection Manager
 * Primary Ownership: Member 2 (Backend Architecture)
 * 
 * SECURITY: Never log, print, or expose connection strings, credentials, or secrets.
 */
export const connectDB = async () => {
  // Prevent duplicate connections
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (mongoose.connection.readyState === 2) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    isConnected = false;
    console.warn('[EcoForge AI] No MONGODB_URI found. Activating in-memory store fallback for zero-downtime demo.');
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[EcoForge AI] MongoDB connected successfully');
  } catch (err) {
    isConnected = false;
    console.warn('[EcoForge AI] MongoDB connection failed. Activating in-memory store fallback for zero-downtime demo.');
  }
};

export const getDbStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  mode: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory-fallback',
});

export default connectDB;
