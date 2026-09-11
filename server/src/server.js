import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Server Bootstrap
 * Primary Ownership: Member 2 (Backend & Emissions)
 */
app.listen(PORT, () => {
  console.log(`[EcoForge AI] Server running on port ${PORT}`);
});
