import bcrypt from 'bcrypt';
import { query } from './database-postgres.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize database and create default admin
async function initDB() {
  try {
    // Hash the admin password
    const adminPassword = process.env.ADMIN_PASSWORD || 'P@t!ent#2025^Secure';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    // Insert or update admin using ON CONFLICT
    await query(`
      INSERT INTO admins (username, password_hash) 
      VALUES ($1, $2)
      ON CONFLICT (username) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash
    `, ['Nabdh_Admin_27', passwordHash]);
    
    console.log('✅ Admin account created/updated successfully');
    console.log('Username: Nabdh_Admin_27');
    console.log('Password:', adminPassword);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDB();
