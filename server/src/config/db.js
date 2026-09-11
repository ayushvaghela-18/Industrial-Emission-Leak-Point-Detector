import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoforge_ai';

  try {
    // Attempt connection with a short timeout so app starts without blocking indefinitely if DB is offline
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[EcoForge AI] MongoDB Connected to ${uri}`);
  } catch (err) {
    isConnected = false;
    console.warn(`[EcoForge AI] MongoDB Connection Notice: Could not connect to ${uri}. (${err.message}). Activating in-memory store fallback for zero-downtime demo.`);
  }
};

export const getDbStatus = () => ({
  isConnected: mongoose.connection.readyState === 1 || isConnected,
  readyState: mongoose.connection.readyState,
  mode: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory-fallback',
});

export default connectDB;
