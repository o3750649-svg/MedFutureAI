import bcrypt from 'bcrypt';
import { query } from './database-postgres.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize database and create default admin
async function initDB() {
  try {
    // Get admin credentials from environment
    const adminUsername = process.env.ADMIN_USERNAME || 'Nabd_Admin_27';
    const adminPassword = process.env.ADMIN_PASSWORD || 'P@t!ent#2025^Secure';
    
    // Hash the admin password
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    // Insert or update admin using ON CONFLICT
    await query(`
      INSERT INTO admins (username, password_hash) 
      VALUES ($1, $2)
      ON CONFLICT (username) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash
    `, [adminUsername, passwordHash]);
    
    console.log('✅ Admin account created/updated successfully');
    console.log('Username:', adminUsername);
    console.log('Password:', adminPassword);
    
    // Close the pool connection
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDB();
