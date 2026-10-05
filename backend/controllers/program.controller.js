const db = require('../config/database');

// @desc    Get all training programs
// @route   GET /api/programs
// @access  Public
exports.getPrograms = async (req, res, next) => {
  try {
    const { school_id, search, department, status } = req.query;

    let query = `
      SELECT p.*, s.school_name, s.school_code
      FROM programs p
      LEFT JOIN schools s ON p.school_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (school_id) {
      query += ` AND p.school_id = ?`;
      params.push(school_id);
    }

    if (search) {
      query += ` AND (p.program_name LIKE ? OR p.program_code LIKE ? OR p.department LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (department) {
      query += ` AND p.department = ?`;
      params.push(department);
    }

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY p.created_at DESC`;

    const [programs] = await db.query(query, params);

    res.json({
      success: true,
      count: programs.length,
      programs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new program
// @route   POST /api/programs
// @access  Private (Admin, School)
exports.createProgram = async (req, res, next) => {
  try {
    const {
      school_id, program_code, program_name, sub_name, department, education_system, duration, status
    } = req.body;

    if (!program_code || !program_name || !department) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền mã chương trình, tên chương trình và khoa quản lý.' });
    }

    const [result] = await db.query(
      `INSERT INTO programs (school_id, program_code, program_name, sub_name, department, education_system, duration, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        school_id || 1,
        program_code,
        program_name,
        sub_name || 'Chương trình chuẩn',
        department,
        education_system || 'Đại học chính quy',
        duration || '4 năm',
        status || 'active'
      ]
    );

    const [newProg] = await db.query('SELECT * FROM programs WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Tạo chương trình đào tạo mới thành công.',
      program: newProg[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Mã chương trình đào tạo đã tồn tại.' });
    }
    next(error);
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private (Admin, School)
exports.updateProgram = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { program_name, sub_name, department, education_system, duration, status } = req.body;

    await db.query(
      `UPDATE programs
       SET program_name = COALESCE(?, program_name),
           sub_name = COALESCE(?, sub_name),
           department = COALESCE(?, department),
           education_system = COALESCE(?, education_system),
           duration = COALESCE(?, duration),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [program_name, sub_name, department, education_system, duration, status, id]
    );

    const [updated] = await db.query('SELECT * FROM programs WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Cập nhật chương trình đào tạo thành công.',
      program: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private (Admin, School)
exports.deleteProgram = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM programs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Xóa chương trình đào tạo thành công.' });
  } catch (error) {
    next(error);
  }
};
