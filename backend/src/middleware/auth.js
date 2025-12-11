// Simple session-based authentication middleware
// In production, use JWT tokens or proper session management

const activeSessions = new Map();

export function generateSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function createSession(username, type = 'admin') {
  const token = generateSessionToken();
  activeSessions.set(token, {
    username,
    type,
    createdAt: Date.now()
  });
  return token;
}

export function validateSession(token) {
  const session = activeSessions.get(token);
  if (!session) return null;
  
  // Session expires after 8 hours
  const eightHours = 8 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > eightHours) {
    activeSessions.delete(token);
    return null;
  }
  
  return session;
}

export function destroySession(token) {
  activeSessions.delete(token);
}

export function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'غير مصرح - يرجى تسجيل الدخول' 
    });
  }
  
  const session = validateSession(token);
  
  if (!session) {
    return res.status(401).json({ 
      success: false, 
      message: 'انتهت صلاحية الجلسة - يرجى تسجيل الدخول مجدداً' 
    });
  }
  
  req.user = session;
  next();
}
