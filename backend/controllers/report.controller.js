const db = require('../config/database');

// @desc    Get all exported reports
// @route   GET /api/reports
// @access  Private / Public
exports.getReports = async (req, res, next) => {
  try {
    const [reports] = await db.query('SELECT * FROM reports ORDER BY created_at DESC');
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new report entry
// @route   POST /api/reports
// @access  Private (Admin, School, Officer)
exports.createReport = async (req, res, next) => {
  try {
    const { file_name, report_type, type_key, format, creator_name, record_count, file_size, file_url } = req.body;

    const [result] = await db.query(
      `INSERT INTO reports (file_name, report_type, type_key, format, creator_name, record_count, file_size, file_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        file_name || `Bao_Cao_${Date.now()}.${(format || 'XLSX').toLowerCase()}`,
        report_type || 'Báo cáo hệ thống',
        type_key || 'issuance',
        format || 'XLSX',
        creator_name || (req.user ? req.user.full_name : 'Hệ thống'),
        record_count || 0,
        file_size || '1.2 MB',
        file_url || null
      ]
    );

    const [newReport] = await db.query('SELECT * FROM reports WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Xuất báo cáo thành công.',
      report: newReport[0]
    });
  } catch (error) {
    next(error);
  }
};
