const db = require('../config/database');

// @desc    Get system audit logs
// @route   GET /api/logs/audit
// @access  Private (Admin)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const [logs] = await db.query(`
      SELECT al.*, u.full_name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system verification logs
// @route   GET /api/logs/verification
// @access  Private / Public
exports.getVerificationLogs = async (req, res, next) => {
  try {
    const [logs] = await db.query(`
      SELECT vl.*, c.student_name, c.major
      FROM verification_logs vl
      LEFT JOIN certificates c ON vl.certificate_id = c.id
      ORDER BY vl.verified_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};
