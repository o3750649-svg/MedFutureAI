import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'بيانات غير صالحة',
      errors: errors.array() 
    });
  }
  next();
};

export const loginValidation = [
  body('code')
    .isString()
    .trim()
    .isLength({ min: 10, max: 14 })
    .withMessage('الكود غير صالح'),
  validateRequest
];

export const generateCodeValidation = [
  body('ownerName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('الاسم يجب أن يكون بين 2 و 100 حرف'),
  body('planType')
    .isIn(['monthly', 'yearly'])
    .withMessage('نوع الخطة يجب أن يكون monthly أو yearly'),
  validateRequest
];

export const adminLoginValidation = [
  body('username')
    .isString()
    .trim()
    .isLength({ min: 3 })
    .withMessage('اسم المستخدم غير صالح'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('كلمة المرور غير صالحة'),
  validateRequest
];
