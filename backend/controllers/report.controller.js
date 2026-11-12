const db = require('../config/database');

const reportTypes = new Set(['issuance', 'blockchain', 'revoked', 'verification']);
const reportFormats = new Set(['CSV', 'PDF']);
const degrees = new Set(['Đại học', 'Cao đẳng', 'Thạc sĩ', 'Tiến sĩ', 'Chứng chỉ']);

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const getFilters = (input = {}) => {
  const { type_key: typeKey, startDate, endDate, department, subFilter, format } = input;

  if (!reportTypes.has(typeKey)) {
    const error = new Error('Loại báo cáo không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
  if (format && !reportFormats.has(format)) {
    const error = new Error('Định dạng báo cáo chỉ hỗ trợ CSV hoặc PDF.');
    error.statusCode = 400;
    throw error;
  }
  if ((startDate && !isValidDate(startDate)) || (endDate && !isValidDate(endDate))) {
    const error = new Error('Ngày lọc không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
  if (!startDate || !endDate) {
    const error = new Error('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
    error.statusCode = 400;
    throw error;
  }
  if (startDate && endDate && startDate > endDate) {
    const error = new Error('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
    error.statusCode = 400;
    throw error;
  }
  if (subFilter && subFilter !== 'Tất cả' && subFilter !== 'Đã xác thực' && !degrees.has(subFilter)) {
    const error = new Error('Bộ lọc trình độ không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  return {
    type_key: typeKey,
    startDate: startDate || '',
    endDate: endDate || '',
    department: (department || '').trim(),
    subFilter: subFilter || 'Tất cả',
    format: format || 'CSV'
  };
};

const getReportRows = async (filters, user) => {
  const isVerification = filters.type_key === 'verification';
  const dateColumn = isVerification
    ? 'vl.verified_at'
    : filters.type_key === 'revoked' ? 'c.updated_at' : 'c.issue_date';
  const conditions = [];
  const params = [];

  if (filters.startDate) {
    conditions.push(`DATE(${dateColumn}) >= ?`);
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push(`DATE(${dateColumn}) <= ?`);
    params.push(filters.endDate);
  }
  if (filters.department && !['Tất cả', 'Tất cả khoa'].includes(filters.department)) {
    conditions.push('(c.major LIKE ? OR st.department LIKE ?)');
    params.push(`%${filters.department}%`, `%${filters.department}%`);
  }
  if (degrees.has(filters.subFilter)) {
    conditions.push('c.degree_type = ?');
    params.push(filters.subFilter);
  }
  if (filters.subFilter === 'Đã xác thực') {
    conditions.push("c.blockchain_tx_hash IS NOT NULL AND c.blockchain_tx_hash <> ''");
  }
  if (filters.type_key === 'issuance') {
    conditions.push("c.status = 'issued'");
  } else if (filters.type_key === 'revoked') {
    conditions.push("c.status = 'revoked'");
  } else if (filters.type_key === 'blockchain') {
    conditions.push("c.status = 'issued'");
  }
  if (user.role === 'school') {
    conditions.push('c.school_id IN (SELECT id FROM schools WHERE user_id = ?)');
    params.push(user.id);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  let query;
  if (isVerification) {
    query = `SELECT vl.verified_at, COALESCE(vl.certificate_code, c.certificate_code) AS certificate_code,
                    c.student_code, c.student_name, c.major, c.degree_type,
                    vl.verification_method, vl.verification_result, s.school_name
             FROM verification_logs vl
             INNER JOIN certificates c ON c.id = vl.certificate_id
             LEFT JOIN students st ON st.id = c.student_id
             LEFT JOIN schools s ON s.id = c.school_id
             ${whereClause}
             ORDER BY vl.verified_at DESC`;
  } else {
    const statusColumns = filters.type_key === 'revoked'
      ? 'c.revoke_reason, c.updated_at AS revoked_at'
      : `c.blockchain_tx_hash, c.certificate_hash,
         CASE WHEN c.blockchain_tx_hash IS NOT NULL AND c.blockchain_tx_hash <> ''
              THEN 'Đã ghi nhận' ELSE 'Chưa ghi nhận' END AS blockchain_status`;
    query = `SELECT c.certificate_code, c.student_code, c.student_name, c.major, c.degree_type,
                    c.education_mode, c.gpa, c.classification, c.issue_date, c.decision_number,
                    c.status, ${statusColumns}, s.school_name, p.program_name
             FROM certificates c
             LEFT JOIN students st ON st.id = c.student_id
             LEFT JOIN schools s ON s.id = c.school_id
             LEFT JOIN programs p ON p.id = c.program_id
             ${whereClause}
             ORDER BY c.issue_date DESC`;
  }

  const [rows] = await db.query(query, params);
  return rows;
};

const reportTypeLabels = {
  issuance: 'Báo cáo phát hành văn bằng',
  blockchain: 'Báo cáo đối soát Blockchain',
  revoked: 'Báo cáo văn bằng thu hồi',
  verification: 'Báo cáo hoạt động xác thực'
};

exports.getReports = async (req, res, next) => {
  try {
    const [reports] = req.user.role === 'school'
      ? await db.query('SELECT * FROM reports WHERE created_by = ? ORDER BY created_at DESC', [req.user.id])
      : await db.query('SELECT * FROM reports ORDER BY created_at DESC');
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

exports.previewReport = async (req, res, next) => {
  try {
    const filters = getFilters(req.body);
    const rows = await getReportRows(filters, req.user);
    res.json({ success: true, count: rows.length, rows });
  } catch (error) {
    next(error);
  }
};

exports.createReport = async (req, res, next) => {
  try {
    const filters = getFilters(req.body);
    const rows = await getReportRows(filters, req.user);
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `Bao_Cao_${filters.type_key.toUpperCase()}_${today}.${filters.format.toLowerCase()}`;
    const fileSize = `${(Buffer.byteLength(JSON.stringify(rows), 'utf8') / 1024).toFixed(1)} KB`;

    const [result] = await db.query(
      `INSERT INTO reports
        (file_name, report_type, type_key, format, creator_name, created_by, record_count, file_size, report_filters)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileName,
        reportTypeLabels[filters.type_key],
        filters.type_key,
        filters.format,
        req.user.full_name,
        req.user.id,
        rows.length,
        fileSize,
        JSON.stringify(filters)
      ]
    );
    const [reports] = await db.query('SELECT * FROM reports WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Tạo báo cáo thành công.',
      report: reports[0],
      count: rows.length,
      rows
    });
  } catch (error) {
    next(error);
  }
};

exports.getReportData = async (req, res, next) => {
  try {
    const [reports] = await db.query(
      `SELECT * FROM reports
       WHERE id = ? ${req.user.role === 'school' ? 'AND created_by = ?' : ''}
       LIMIT 1`,
      req.user.role === 'school' ? [req.params.id, req.user.id] : [req.params.id]
    );
    if (!reports.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo.' });
    }

    const storedFilters = reports[0].report_filters;
    const filters = typeof storedFilters === 'string' ? JSON.parse(storedFilters) : storedFilters;
    if (!filters) {
      return res.status(410).json({
        success: false,
        message: 'Báo cáo cũ chưa lưu bộ lọc nên không thể tải lại dữ liệu.'
      });
    }
    const rows = await getReportRows(getFilters(filters), req.user);
    return res.json({ success: true, count: rows.length, rows, report: reports[0] });
  } catch (error) {
    return next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const [result] = await db.query(
      `DELETE FROM reports
       WHERE id = ? AND (created_by = ? OR ? IN ('admin', 'officer'))`,
      [req.params.id, req.user.id, req.user.role]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo hoặc bạn không có quyền xóa.' });
    }
    return res.json({ success: true, message: 'Đã xóa báo cáo.' });
  } catch (error) {
    return next(error);
  }
};
