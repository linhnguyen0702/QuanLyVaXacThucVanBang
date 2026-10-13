const db = require('../config/database');

// @desc    Get list of all schools
// @route   GET /api/schools
// @access  Public
exports.getSchools = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = 'SELECT * FROM schools WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (school_name LIKE ? OR school_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [schools] = await db.query(query, params);

    res.json({
      success: true,
      count: schools.length,
      schools
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single school by ID
// @route   GET /api/schools/:id
// @access  Public
exports.getSchoolById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT * FROM schools WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin cơ sở giáo dục.' });
    }

    res.json({
      success: true,
      school: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new school
// @route   POST /api/schools
// @access  Private (Admin)
exports.createSchool = async (req, res, next) => {
  try {
    const {
      school_name, school_code, school_type, establishment_year,
      license_number, website, logo_url, description, wallet_address
    } = req.body;

    if (!school_name || !school_code) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Tên trường và Mã trường.' });
    }

    // Kiểm tra trùng mã trường
    const [existCode] = await db.query('SELECT id FROM schools WHERE school_code = ?', [school_code]);
    if (existCode.length > 0) {
      return res.status(400).json({ success: false, message: 'Mã trường đã tồn tại trên hệ thống. Vui lòng chọn mã khác.' });
    }

    // Kiểm tra trùng tên trường
    const [existName] = await db.query('SELECT id FROM schools WHERE school_name = ?', [school_name]);
    if (existName.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên trường đã tồn tại trên hệ thống. Vui lòng kiểm tra lại.' });
    }

    // Kiểm tra trùng số giấy phép hoạt động
    if (license_number) {
      const [existLicense] = await db.query('SELECT id FROM schools WHERE license_number = ?', [license_number]);
      if (existLicense.length > 0) {
        return res.status(400).json({ success: false, message: 'Số giấy phép hoạt động này đã được sử dụng bởi cơ sở khác. Vui lòng kiểm tra lại.' });
      }
    }

    const [result] = await db.query(
      `INSERT INTO schools (school_name, school_code, school_type, establishment_year, license_number, website, logo_url, description, wallet_address, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        school_name, school_code, school_type || 'university', establishment_year || 2000,
        license_number || null, website || null, logo_url || null, description || null, wallet_address || null
      ]
    );

    const [newSchool] = await db.query('SELECT * FROM schools WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Thêm mới cơ sở giáo dục thành công.',
      school: newSchool[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Mã trường hoặc địa chỉ ví đã tồn tại.' });
    }
    next(error);
  }
};

// @desc    Update school info
// @route   PUT /api/schools/:id
// @access  Private (Admin)
exports.updateSchool = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      school_name, school_code, school_type, establishment_year, license_number,
      website, logo_url, description, wallet_address, is_verified
    } = req.body;

    if (!school_name || !school_code) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Tên trường và Mã trường.' });
    }

    // Kiểm tra trùng mã trường (ngoại trừ bản ghi hiện tại)
    const [existCode] = await db.query('SELECT id FROM schools WHERE school_code = ? AND id != ?', [school_code, id]);
    if (existCode.length > 0) {
      return res.status(400).json({ success: false, message: 'Mã trường đã tồn tại trên hệ thống. Vui lòng chọn mã khác.' });
    }

    // Kiểm tra trùng tên trường (ngoại trừ bản ghi hiện tại)
    const [existName] = await db.query('SELECT id FROM schools WHERE school_name = ? AND id != ?', [school_name, id]);
    if (existName.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên trường đã tồn tại trên hệ thống. Vui lòng kiểm tra lại.' });
    }

    // Kiểm tra trùng số giấy phép hoạt động (ngoại trừ bản ghi hiện tại)
    if (license_number) {
      const [existLicense] = await db.query('SELECT id FROM schools WHERE license_number = ? AND id != ?', [license_number, id]);
      if (existLicense.length > 0) {
        return res.status(400).json({ success: false, message: 'Số giấy phép hoạt động này đã được sử dụng bởi cơ sở khác. Vui lòng kiểm tra lại.' });
      }
    }

    const [updateResult] = await db.query(
      `UPDATE schools
       SET school_name = ?,
           school_code = ?,
           school_type = ?,
           establishment_year = ?,
           license_number = ?,
           website = ?,
           logo_url = ?,
           description = ?,
           wallet_address = ?
       WHERE id = ?`,
      [
        school_name,
        school_code,
        school_type || 'university',
        establishment_year || null,
        license_number || null,
        website || null,
        logo_url || null,
        description || null,
        wallet_address || null,
        id
      ]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở giáo dục.' });
    }

    const [updated] = await db.query('SELECT * FROM schools WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Cập nhật cơ sở giáo dục thành công.',
      school: updated[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Mã trường đã tồn tại.' });
    }
    next(error);
  }
};

// @desc    Delete school
// @route   DELETE /api/schools/:id
// @access  Private (Admin)
exports.deleteSchool = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM schools WHERE id = ?', [id]);
    res.json({ success: true, message: 'Xóa cơ sở giáo dục thành công.' });
  } catch (error) {
    next(error);
  }
};
