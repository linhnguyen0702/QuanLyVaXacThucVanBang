const db = require('../config/database');
const { getPagination } = require('../utils/pagination');

// @desc    Get list of all schools
// @route   GET /api/schools
// @access  Public
exports.getSchools = async (req, res, next) => {
  try {
    const { search, school_type } = req.query;
    const pagination = getPagination(req.query);

    let query = 'SELECT * FROM schools WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (school_name LIKE ? OR school_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (school_type) {
      query += ' AND school_type = ?';
      params.push(school_type);
    }

    query += ' ORDER BY created_at DESC';

    let total;
    let verifiedTotal;
    if (pagination.requested) {
      const countQuery = `
        SELECT COUNT(*) AS total,
               COALESCE(SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END), 0) AS verified_total
        FROM schools WHERE 1=1
        ${search ? 'AND (school_name LIKE ? OR school_code LIKE ?)' : ''}
        ${school_type ? 'AND school_type = ?' : ''}
      `;
      const [countRows] = await db.query(countQuery, params);
      total = countRows[0] ? countRows[0].total : 0;
      verifiedTotal = countRows[0] ? countRows[0].verified_total : 0;
      query += ' LIMIT ? OFFSET ?';
      params.push(pagination.limit, pagination.offset);
    }

    const [schools] = await db.query(query, params);
    if (total === undefined) total = schools.length;
    if (verifiedTotal === undefined) {
      verifiedTotal = schools.filter((school) => school.is_verified).length;
    }

    res.json({
      success: true,
      count: total,
      total,
      verifiedTotal,
      page: pagination.page,
      limit: pagination.limit,
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

    if (req.user) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, ip_address)
         VALUES (?, 'CREATE_SCHOOL', 'schools', ?, ?, ?)`,
        [req.user.id, result.insertId, `Thêm cơ sở đào tạo ${school_name} (${school_code})`, req.ip]
      );
    }

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

    if (req.user) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, ip_address)
         VALUES (?, 'UPDATE_SCHOOL', 'schools', ?, ?, ?)`,
        [req.user.id, id, `Cập nhật cơ sở đào tạo ${school_name} (${school_code})`, req.ip]
      );
    }

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
    const [schools] = await db.query('SELECT school_name, school_code FROM schools WHERE id = ?', [id]);
    await db.query('DELETE FROM schools WHERE id = ?', [id]);
    if (req.user && schools.length > 0) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, ip_address)
         VALUES (?, 'DELETE_SCHOOL', 'schools', ?, ?, ?)`,
        [req.user.id, id, `Xóa cơ sở đào tạo ${schools[0].school_name} (${schools[0].school_code})`, req.ip]
      );
    }
    res.json({ success: true, message: 'Xóa cơ sở giáo dục thành công.' });
  } catch (error) {
    next(error);
  }
};
