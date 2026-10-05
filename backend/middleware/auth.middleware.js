const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware to verify JWT Token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập. Token không tồn tại.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_certificate_verification_2026');

    // Fetch user from DB without password
    const [users] = await db.query(
      'SELECT id, email, full_name, role, phone, department, position, wallet_address, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa.'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn.'
    });
  }
};

// Middleware to grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Tài khoản với vai trò '${req.user ? req.user.role : 'khách'}' không có quyền thực hiện thao tác này.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
