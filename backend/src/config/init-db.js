import bcrypt from 'bcrypt';
import { initDatabase } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize database and create default admin
async function initDB() {
  try {
    const db = initDatabase();
    
    // Hash the admin password
    const adminPassword = process.env.ADMIN_PASSWORD || 'P@t!ent#2025^Secure';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    // Insert or update admin
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO admins (username, password_hash) 
      VALUES (?, ?)
    `);
    
    stmt.run('Nabdh_Admin_27', passwordHash);
    
    console.log('✅ Admin account created/updated successfully');
    console.log('Username: Nabdh_Admin_27');
    console.log('Password:', adminPassword);
    
    db.close();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDB();
