const db = require('../config/database');

// @desc    Get all students
// @route   GET /api/students
// @access  Private / Public
exports.getStudents = async (req, res, next) => {
  try {
    const { search, school_id, status, department } = req.query;

    let query = `
      SELECT st.*, COALESCE(st.school_name, s.school_name) AS school_name, s.school_code
      FROM students st
      LEFT JOIN schools s ON st.school_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (st.student_code LIKE ? OR st.full_name LIKE ? OR st.email LIKE ? OR st.id_number LIKE ? OR st.school_name LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (school_id) {
      query += ` AND st.school_id = ?`;
      params.push(school_id);
    }

    if (status) {
      query += ` AND st.graduation_status = ?`;
      params.push(status);
    }

    if (department) {
      query += ` AND st.department = ?`;
      params.push(department);
    }

    query += ` ORDER BY st.created_at DESC`;

    const [students] = await db.query(query, params);

    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student by ID or Student Code
// @route   GET /api/students/:id
// @access  Public / Private
exports.getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT st.*, COALESCE(st.school_name, s.school_name) AS school_name, s.school_code
       FROM students st
       LEFT JOIN schools s ON st.school_id = s.id
       WHERE st.id = ? OR st.student_code = ? OR st.email = ?`,
      [id, id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin sinh viên.' });
    }

    res.json({
      success: true,
      student: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new student
// @route   POST /api/students
// @access  Private (Admin, School, Officer)
exports.createStudent = async (req, res, next) => {
  try {
    const {
      school_id, school_name, student_code, full_name, email, date_of_birth,
      gender, id_number, place_of_birth, nationality, department, class_name, graduation_status
    } = req.body;

    if (!student_code || !full_name || !email || !id_number || !date_of_birth) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đủ thông tin sinh viên bắt buộc (MSSV, Họ tên, Email, Ngày sinh, Số CCCD).' });
    }

    const trimmedCode = String(student_code).trim();
    const trimmedEmail = String(email).trim();
    const trimmedIdNumber = String(id_number).trim();

    // 1. Kiểm tra định dạng Email (email thường hoặc edu)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email không đúng định dạng email thường hoặc email edu.' 
      });
    }

    // 2. Kiểm tra định dạng CCCD (phải đủ đúng 12 chữ số)
    const cccdRegex = /^\d{12}$/;
    if (!cccdRegex.test(trimmedIdNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Số CCCD không đủ 12 chữ số hoặc không đúng định dạng CCCD.' 
      });
    }

    // 3. Kiểm tra trùng mã số sinh viên (MSSV)
    const [existingCode] = await db.query(
      'SELECT id FROM students WHERE student_code = ?',
      [trimmedCode]
    );
    if (existingCode.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'kiểm tra lại mã số sinh viên' 
      });
    }

    // Kiểm tra trùng Email
    const [existingEmail] = await db.query(
      'SELECT id FROM students WHERE email = ?',
      [trimmedEmail]
    );
    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã tồn tại trong hệ thống.'
      });
    }

    // Kiểm tra trùng CCCD
    const [existingCccd] = await db.query(
      'SELECT id FROM students WHERE id_number = ?',
      [trimmedIdNumber]
    );
    if (existingCccd.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Số CCCD này đã tồn tại trong hệ thống.'
      });
    }

    // Resolve school_id by school_name if needed
    let resolvedSchoolId = school_id;
    if (school_name && !school_id) {
      const [matchedSchool] = await db.query(
        'SELECT id FROM schools WHERE school_name LIKE ? OR school_code = ? LIMIT 1',
        [`%${school_name.trim()}%`, school_name.trim()]
      );
      if (matchedSchool.length > 0) {
        resolvedSchoolId = matchedSchool[0].id;
      }
    }

    const [result] = await db.query(
      `INSERT INTO students (school_id, school_name, student_code, full_name, email, date_of_birth, gender, id_number, place_of_birth, nationality, department, class_name, graduation_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resolvedSchoolId || 1,
        school_name || 'Trường Đại học Công nghệ',
        trimmedCode,
        full_name.trim(),
        trimmedEmail,
        date_of_birth,
        gender || 'Nam',
        trimmedIdNumber,
        place_of_birth || null,
        nationality || 'Việt Nam',
        department || 'Công nghệ thông tin',
        class_name || 'K65',
        graduation_status || 'eligible'
      ]
    );

    const [newStudent] = await db.query(
      `SELECT st.*, COALESCE(st.school_name, s.school_name) AS school_name, s.school_code FROM students st LEFT JOIN schools s ON st.school_id = s.id WHERE st.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm mới sinh viên thành công.',
      student: newStudent[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage && error.sqlMessage.includes('id_number')) {
        return res.status(400).json({ success: false, message: 'Số CCCD này đã tồn tại trong hệ thống.' });
      }
      if (error.sqlMessage && error.sqlMessage.includes('email')) {
        return res.status(400).json({ success: false, message: 'Email này đã tồn tại trong hệ thống.' });
      }
      return res.status(400).json({ success: false, message: 'kiểm tra lại mã số sinh viên' });
    }
    next(error);
  }
};

// @desc    Update student info
// @route   PUT /api/students/:id
// @access  Private (Admin, School, Officer)
exports.updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      school_id, school_name, full_name, email, date_of_birth, gender, id_number,
      place_of_birth, nationality, department, class_name, graduation_status
    } = req.body;

    let resolvedSchoolId = school_id;
    if (school_name && !school_id) {
      const [matchedSchool] = await db.query(
        'SELECT id FROM schools WHERE school_name LIKE ? OR school_code = ? LIMIT 1',
        [`%${school_name.trim()}%`, school_name.trim()]
      );
      if (matchedSchool.length > 0) {
        resolvedSchoolId = matchedSchool[0].id;
      }
    }

    await db.query(
      `UPDATE students
       SET school_id = COALESCE(?, school_id),
           school_name = COALESCE(?, school_name),
           full_name = COALESCE(?, full_name),
           email = COALESCE(?, email),
           date_of_birth = COALESCE(?, date_of_birth),
           gender = COALESCE(?, gender),
           id_number = COALESCE(?, id_number),
           place_of_birth = COALESCE(?, place_of_birth),
           nationality = COALESCE(?, nationality),
           department = COALESCE(?, department),
           class_name = COALESCE(?, class_name),
           graduation_status = COALESCE(?, graduation_status)
       WHERE id = ?`,
      [resolvedSchoolId, school_name, full_name, email, date_of_birth, gender, id_number, place_of_birth, nationality, department, class_name, graduation_status, id]
    );

    const [updated] = await db.query(
      `SELECT st.*, COALESCE(st.school_name, s.school_name) AS school_name, s.school_code FROM students st LEFT JOIN schools s ON st.school_id = s.id WHERE st.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Cập nhật sinh viên thành công.',
      student: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin, School)
exports.deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ success: true, message: 'Xóa sinh viên thành công.' });
  } catch (error) {
    next(error);
  }
};
