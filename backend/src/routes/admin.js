import express from 'express';
import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import { requireAuth } from '../middleware/auth.js';
import { generateCodeValidation } from '../middleware/validation.js';

const router = express.Router();

// All admin routes require authentication
router.use(requireAuth);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = User.getAll();
    res.json({
      success: true,
      data: users.map(u => ({
        code: u.code,
        ownerName: u.owner_name,
        type: u.plan_type,
        status: u.status,
        isUsed: u.is_used === 1,
        generatedAt: u.generated_at,
        expiryDate: u.expiry_date,
        lastLogin: u.last_login
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في جلب البيانات' 
    });
  }
});

// Generate new code
router.post('/generate-code', generateCodeValidation, async (req, res) => {
  try {
    const { ownerName, planType } = req.body;
    const result = User.create(ownerName, planType);
    
    Admin.logAction(
      req.user.username, 
      'GENERATE_CODE', 
      result.code, 
      `Generated ${planType} code for ${ownerName}`
    );
    
    res.json({
      success: true,
      code: result.code
    });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في إنشاء الكود' 
    });
  }
});

// Ban user
router.post('/ban/:code', async (req, res) => {
  try {
    const { code } = req.params;
    User.ban(code);
    
    Admin.logAction(
      req.user.username, 
      'BAN_USER', 
      code, 
      'User banned'
    );
    
    res.json({ success: true, message: 'تم حظر المستخدم بنجاح' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في حظر المستخدم' 
    });
  }
});

// Unban user
router.post('/unban/:code', async (req, res) => {
  try {
    const { code } = req.params;
    User.unban(code);
    
    Admin.logAction(
      req.user.username, 
      'UNBAN_USER', 
      code, 
      'User unbanned'
    );
    
    res.json({ success: true, message: 'تم فك حظر المستخدم بنجاح' });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في فك حظر المستخدم' 
    });
  }
});

// Renew subscription
router.post('/renew/:code', async (req, res) => {
  try {
    const { code } = req.params;
    User.renew(code);
    
    Admin.logAction(
      req.user.username, 
      'RENEW_SUBSCRIPTION', 
      code, 
      'Subscription renewed'
    );
    
    res.json({ success: true, message: 'تم تجديد الاشتراك بنجاح' });
  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في تجديد الاشتراك' 
    });
  }
});

// Delete user
router.delete('/user/:code', async (req, res) => {
  try {
    const { code } = req.params;
    User.delete(code);
    
    Admin.logAction(
      req.user.username, 
      'DELETE_USER', 
      code, 
      'User deleted permanently'
    );
    
    res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في حذف المستخدم' 
    });
  }
});

// Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = Admin.getAuditLogs(100);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في جلب السجلات' 
    });
  }
});

export default router;
