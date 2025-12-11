import express from 'express';
import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import { createSession, destroySession } from '../middleware/auth.js';
import { loginValidation, adminLoginValidation } from '../middleware/validation.js';

const router = express.Router();

// User login/verification endpoint
router.post('/verify', loginValidation, async (req, res) => {
  try {
    const { code } = req.body;
    const result = User.verifyAndActivate(code);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          code: result.data.code,
          ownerName: result.data.owner_name,
          expiryDate: result.data.expiry_date
        }
      });
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم. يرجى المحاولة لاحقاً.' 
    });
  }
});

// Admin login endpoint
router.post('/admin/login', adminLoginValidation, async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await Admin.verify(username, password);
    
    if (result.success) {
      const token = createSession(username, 'admin');
      Admin.logAction(username, 'LOGIN', null, 'Admin logged in');
      
      res.json({
        success: true,
        token,
        admin: result.admin
      });
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم. يرجى المحاولة لاحقاً.' 
    });
  }
});

// Admin logout endpoint
router.post('/admin/logout', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token) {
    destroySession(token);
  }
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});

export default router;
