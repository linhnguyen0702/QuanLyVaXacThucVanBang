const db = require('../config/database');
const crypto = require('crypto');

// Helper to generate SHA-256 certificate hash
const generateCertificateHash = (certData) => {
  const content = `${certData.certificate_code}_${certData.student_code}_${certData.issue_date}_${certData.gpa}_${Date.now()}`;
  return '0x' + crypto.createHash('sha256').update(content).digest('hex');
};

// @desc    Get all certificates with filtering, searching & pagination
// @route   GET /api/certificates
// @access  Public / Private
exports.getCertificates = async (req, res, next) => {
  try {
    const { search, status, degree_type, school_id, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT c.*, 
             s.school_name, s.school_code, s.logo_url as school_logo,
             p.program_name, p.program_code
      FROM certificates c
      LEFT JOIN schools s ON c.school_id = s.id
      LEFT JOIN programs p ON c.program_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (c.certificate_code LIKE ? OR c.student_code LIKE ? OR c.student_name LIKE ? OR c.major LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    if (degree_type) {
      query += ` AND c.degree_type = ?`;
      params.push(degree_type);
    }

    if (school_id) {
      query += ` AND c.school_id = ?`;
      params.push(school_id);
    }

    // Count total query
    const countQuery = query.replace('SELECT c.*, \n             s.school_name, s.school_code, s.logo_url as school_logo,\n             p.program_name, p.program_code', 'SELECT COUNT(*) as total');
    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0] ? countRows[0].total : 0;

    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [certificates] = await db.query(query, params);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      certificates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get certificate details by ID or Code
// @route   GET /api/certificates/:id
// @access  Public
exports.getCertificateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT c.*, 
              s.school_name, s.school_code, s.website, s.logo_url as school_logo, s.wallet_address as school_wallet,
              p.program_name, p.program_code, p.education_system,
              st.date_of_birth, st.id_number, st.gender, st.place_of_birth
       FROM certificates c
       LEFT JOIN schools s ON c.school_id = s.id
       LEFT JOIN programs p ON c.program_id = p.id
       LEFT JOIN students st ON c.student_id = st.id
       WHERE c.id = ? OR c.certificate_code = ? OR c.certificate_hash = ?`,
      [id, id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin văn bằng.' });
    }

    res.json({
      success: true,
      certificate: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Issue a new certificate
// @route   POST /api/certificates
// @access  Private (Admin, School, Officer)
exports.createCertificate = async (req, res, next) => {
  try {
    const {
      certificate_code,
      student_id,
      school_id,
      program_id,
      student_code,
      student_name,
      major,
      degree_type,
      education_mode,
      gpa,
      classification,
      issue_date,
      decision_number,
      certificate_hash,
      blockchain_tx_hash,
      blockchain_certificate_id,
      ipfs_hash,
      qr_code_url,
      pdf_url
    } = req.body;

    if (!certificate_code || !student_code || !student_name || !major || !issue_date || !decision_number) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc của văn bằng.' });
    }

    // Auto calculate hash if not supplied
    const finalHash = certificate_hash || generateCertificateHash({
      certificate_code, student_code, issue_date, gpa
    });

    const finalQrCode = qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(finalHash)}`;

    const [result] = await db.query(
      `INSERT INTO certificates 
       (certificate_code, student_id, school_id, program_id, student_code, student_name, major, degree_type, education_mode, gpa, classification, issue_date, decision_number, certificate_hash, blockchain_tx_hash, blockchain_certificate_id, ipfs_hash, qr_code_url, pdf_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'issued')`,
      [
        certificate_code,
        student_id || 1,
        school_id || 1,
        program_id || null,
        student_code,
        student_name,
        major,
        degree_type || 'Đại học',
        education_mode || 'Chính quy',
        gpa || null,
        classification || 'Giỏi',
        issue_date,
        decision_number,
        finalHash,
        blockchain_tx_hash || null,
        blockchain_certificate_id || null,
        ipfs_hash || null,
        finalQrCode,
        pdf_url || null
      ]
    );

    // Update school & program counts
    if (school_id) {
      await db.query('UPDATE schools SET certificate_count = certificate_count + 1 WHERE id = ?', [school_id]);
    }
    if (program_id) {
      await db.query('UPDATE programs SET issued_count = issued_count + 1 WHERE id = ?', [program_id]);
    }

    // Record audit log
    if (req.user) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, ip_address)
         VALUES (?, 'CREATE_CERTIFICATE', 'certificates', ?, ?, ?)`,
        [req.user.id, result.insertId, `Cấp bằng ${certificate_code} cho sinh viên ${student_name}`, req.ip]
      );
    }

    const [newCert] = await db.query('SELECT * FROM certificates WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Cấp phát văn bằng thành công!',
      certificate: newCert[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Mã văn bằng hoặc Mã hash đã tồn tại trên hệ thống.' });
    }
    next(error);
  }
};

// @desc    Update certificate details
// @route   PUT /api/certificates/:id
// @access  Private (Admin, School, Officer)
exports.updateCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      student_name, major, degree_type, education_mode, gpa,
      classification, issue_date, decision_number, blockchain_tx_hash,
      status, revoke_reason
    } = req.body;

    await db.query(
      `UPDATE certificates
       SET student_name = COALESCE(?, student_name),
           major = COALESCE(?, major),
           degree_type = COALESCE(?, degree_type),
           education_mode = COALESCE(?, education_mode),
           gpa = COALESCE(?, gpa),
           classification = COALESCE(?, classification),
           issue_date = COALESCE(?, issue_date),
           decision_number = COALESCE(?, decision_number),
           blockchain_tx_hash = COALESCE(?, blockchain_tx_hash),
           status = COALESCE(?, status),
           revoke_reason = COALESCE(?, revoke_reason)
       WHERE id = ?`,
      [student_name, major, degree_type, education_mode, gpa, classification, issue_date, decision_number, blockchain_tx_hash, status, revoke_reason, id]
    );

    const [updated] = await db.query('SELECT * FROM certificates WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Cập nhật thông tin văn bằng thành công.',
      certificate: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke certificate
// @route   PUT /api/certificates/:id/revoke
// @access  Private (Admin, School)
exports.revokeCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lý do thu hồi văn bằng.' });
    }

    await db.query(
      `UPDATE certificates SET status = 'revoked', revoke_reason = ? WHERE id = ?`,
      [reason, id]
    );

    // Record audit log
    if (req.user) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, ip_address)
         VALUES (?, 'REVOKE_CERTIFICATE', 'certificates', ?, ?, ?)`,
        [req.user.id, id, `Thu hồi văn bằng với lý do: ${reason}`, req.ip]
      );
    }

    res.json({
      success: true,
      message: 'Thu hồi văn bằng thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Private (Admin)
exports.deleteCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [cert] = await db.query('SELECT * FROM certificates WHERE id = ?', [id]);
    if (cert.length === 0) {
      return res.status(404).json({ success: false, message: 'Văn bằng không tồn tại.' });
    }

    await db.query('DELETE FROM certificates WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa văn bằng khỏi hệ thống thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get certificate summary stats
// @route   GET /api/certificates/stats/summary
// @access  Public / Private
exports.getStatsSummary = async (req, res, next) => {
  try {
    const [certStats] = await db.query(`
      SELECT 
        COUNT(*) as total_certificates,
        SUM(CASE WHEN status = 'issued' THEN 1 ELSE 0 END) as total_issued,
        SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) as total_revoked,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as total_pending
      FROM certificates
    `);

    const [schoolStats] = await db.query('SELECT COUNT(*) as total_schools FROM schools');
    const [studentStats] = await db.query('SELECT COUNT(*) as total_students FROM students');
    const [verifyStats] = await db.query('SELECT COUNT(*) as total_verifications FROM verification_logs');

    res.json({
      success: true,
      stats: {
        totalCertificates: certStats[0].total_certificates || 0,
        totalIssued: certStats[0].total_issued || 0,
        totalRevoked: certStats[0].total_revoked || 0,
        totalPending: certStats[0].total_pending || 0,
        totalSchools: schoolStats[0].total_schools || 0,
        totalStudents: studentStats[0].total_students || 0,
        totalVerifications: verifyStats[0].total_verifications || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
