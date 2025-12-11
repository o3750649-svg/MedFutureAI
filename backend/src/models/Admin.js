import bcrypt from 'bcrypt';
import { getDatabase } from '../config/database.js';

export class Admin {
  static async verify(username, password) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM admins WHERE username = ?
    `);
    
    const admin = stmt.get(username);
    
    if (!admin) {
      return { success: false, message: 'بيانات الدخول غير صحيحة' };
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValid) {
      return { success: false, message: 'بيانات الدخول غير صحيحة' };
    }

    // Update last login
    const updateStmt = db.prepare(`
      UPDATE admins SET last_login = ? WHERE username = ?
    `);
    updateStmt.run(new Date().toISOString(), username);

    return { success: true, admin: { username: admin.username } };
  }

  static logAction(adminUsername, action, targetCode = null, details = null) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO audit_logs (admin_username, action, target_code, details)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(adminUsername, action, targetCode, details);
  }

  static getAuditLogs(limit = 100) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM audit_logs 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    
    return stmt.all(limit);
  }
}
