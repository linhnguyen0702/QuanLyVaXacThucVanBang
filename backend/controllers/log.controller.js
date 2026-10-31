const db = require('../config/database');
const { getPagination } = require('../utils/pagination');

// @desc    Get role-scoped audit logs
// @route   GET /api/logs/audit
// @access  Private (Admin, School, Officer)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const pagination = getPagination(req.query);
    const whereClause = req.user.role === 'school'
      ? `WHERE al.user_id = ?
         OR (al.entity_type = 'certificates' AND al.entity_id IN (
           SELECT c.id FROM certificates c
           WHERE c.school_id IN (SELECT id FROM schools WHERE user_id = ?)
         ))
         OR (al.entity_type = 'students' AND al.entity_id IN (
           SELECT st.id FROM students st
           WHERE st.school_id IN (SELECT id FROM schools WHERE user_id = ?)
         ))
         OR (al.entity_type = 'programs' AND al.entity_id IN (
           SELECT p.id FROM programs p
           WHERE p.school_id IN (SELECT id FROM schools WHERE user_id = ?)
         ))
         OR (al.entity_type = 'schools' AND al.entity_id IN (
           SELECT s.id FROM schools s WHERE s.user_id = ?
         ))`
      : '';
    const params = req.user.role === 'school'
      ? [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
      : [];

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM audit_logs al
       ${whereClause}`,
      params
    );
    const total = countRows[0] ? countRows[0].total : 0;
    const [logs] = await db.query(
      `SELECT al.*, u.full_name as user_name, u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pagination.limit, pagination.offset]
    );

    res.json({
      success: true,
      count: total,
      total,
      page: pagination.page,
      limit: pagination.limit,
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
