import { getDatabase } from '../config/database.js';

export class User {
  static generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 2) code += '-';
    }
    return code;
  }

  static create(ownerName, planType) {
    const db = getDatabase();
    const code = this.generateCode();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (code, owner_name, plan_type, generated_at)
      VALUES (?, ?, ?, ?)
    `);

    try {
      stmt.run(code, ownerName, planType, now);
      return { success: true, code };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        // Retry with a new code
        return this.create(ownerName, planType);
      }
      throw error;
    }
  }

  static findByCode(code) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM users WHERE code = ?
    `);
    return stmt.get(code.trim().toUpperCase());
  }

  static verifyAndActivate(code) {
    const db = getDatabase();
    const normalizedCode = code.trim().toUpperCase();
    const user = this.findByCode(normalizedCode);
    const now = new Date();

    if (!user) {
      return { success: false, message: 'الكود غير صحيح أو غير مسجل في النظام.' };
    }

    // Check if banned
    if (user.status === 'banned') {
      return { 
        success: false, 
        message: 'تم حظر هذا الحساب لمخالفة شروط الاستخدام. يرجى التواصل مع الإدارة.' 
      };
    }

    // First time activation
    if (!user.is_used) {
      const expiry = new Date();
      if (user.plan_type === 'monthly') {
        expiry.setDate(expiry.getDate() + 30);
      } else {
        expiry.setFullYear(expiry.getFullYear() + 1);
      }

      const stmt = db.prepare(`
        UPDATE users 
        SET is_used = 1, 
            status = 'active', 
            expiry_date = ?, 
            last_login = ?,
            updated_at = ?
        WHERE code = ?
      `);

      stmt.run(expiry.toISOString(), now.toISOString(), now.toISOString(), normalizedCode);
      
      return { 
        success: true, 
        data: this.findByCode(normalizedCode)
      };
    }

    // Check expiry
    if (user.expiry_date && new Date(user.expiry_date) < now) {
      // Auto-freeze if expired
      if (user.status !== 'frozen') {
        const stmt = db.prepare(`
          UPDATE users SET status = 'frozen', updated_at = ? WHERE code = ?
        `);
        stmt.run(now.toISOString(), normalizedCode);
      }
      return { 
        success: false, 
        message: 'انتهت صلاحية اشتراكك. حالة الحساب: مجمد. يرجى التجديد لاستعادة الوصول.' 
      };
    }

    // Check if frozen
    if (user.status === 'frozen') {
      return { 
        success: false, 
        message: 'هذا الحساب مجمد مؤقتاً. يرجى التواصل مع الدعم الفني.' 
      };
    }

    // Update last login
    const stmt = db.prepare(`
      UPDATE users SET last_login = ?, updated_at = ? WHERE code = ?
    `);
    stmt.run(now.toISOString(), now.toISOString(), normalizedCode);

    return { 
      success: true, 
      data: this.findByCode(normalizedCode)
    };
  }

  static getAll() {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM users ORDER BY generated_at DESC
    `);
    return stmt.all();
  }

  static updateStatus(code, status) {
    const db = getDatabase();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE users SET status = ?, updated_at = ? WHERE code = ?
    `);
    stmt.run(status, now, code);
  }

  static ban(code) {
    this.updateStatus(code, 'banned');
  }

  static unban(code) {
    const user = this.findByCode(code);
    if (!user) return;

    const now = new Date();
    const status = (user.expiry_date && new Date(user.expiry_date) < now) 
      ? 'frozen' 
      : 'active';
    
    this.updateStatus(code, status);
  }

  static renew(code) {
    const user = this.findByCode(code);
    if (!user) return;

    const db = getDatabase();
    const now = new Date();
    const newExpiry = new Date();

    if (user.plan_type === 'monthly') {
      newExpiry.setDate(newExpiry.getDate() + 30);
    } else {
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    }

    const stmt = db.prepare(`
      UPDATE users 
      SET expiry_date = ?, status = 'active', updated_at = ?
      WHERE code = ?
    `);

    stmt.run(newExpiry.toISOString(), now.toISOString(), code);
  }

  static delete(code) {
    const db = getDatabase();
    const stmt = db.prepare(`DELETE FROM users WHERE code = ?`);
    stmt.run(code);
  }
}
