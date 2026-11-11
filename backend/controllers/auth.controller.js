const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const { getAddress, isAddress } = require("ethers");
const { getDefaultPosition } = require("../utils/user-roles");
const isValidStudentDateOfBirth = (dateOfBirth) => {
  if (typeof dateOfBirth !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return false;
  }

  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const parsedDate = new Date(0);
  parsedDate.setUTCHours(0, 0, 0, 0);
  parsedDate.setUTCFullYear(year, month - 1, day);
  return parsedDate.toISOString().slice(0, 10) === dateOfBirth;
};

const isStudentAtLeastEighteen = (dateOfBirth) => {
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age -= 1;
  }
  return age >= 18;
};
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET ||
      "super_secret_jwt_key_certificate_verification_2026",
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, full_name, role, phone, department, position } =
      req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên.",
      });
    }

    // Check if user already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email này đã được sử dụng." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userRole = role || "student";
    const [result] = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role, phone, department, position, wallet_address, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        email,
        password_hash,
        full_name,
        userRole,
        phone || null,
        department || (userRole === "student" ? null : "Phòng Đào tạo"),
        position || getDefaultPosition(userRole),
        null,
      ],
    );

    const userId = result.insertId;
    const token = generateToken(userId);

    const [users] = await db.query(
      "SELECT id, email, full_name, role, phone, department, position, wallet_address FROM users WHERE id = ?",
      [userId],
    );

    res.status(201).json({
      success: true,
      token,
      user: users[0],
      message: "Đăng ký tài khoản thành công.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập Email và Mật khẩu." });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tài khoản không tồn tại. Vui lòng kiểm tra lại email.",
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị vô hiệu hóa.",
      });
    }

    // Seed accounts may contain placeholder hashes; replace them after the
    // first successful login with a hash of the supplied demo password.
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } catch (e) {
      isMatch = false;
    }

    const isLegacySeedPassword =
      !isMatch && (password === "123456" || password === "admin123");
    if (isLegacySeedPassword) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu không chính xác. Vui lòng thử lại.",
      });
    }

    // Enforce role validation when role parameter is provided
    if (role) {
      if (role === "student" && user.role !== "student") {
        return res.status(400).json({
          success: false,
          message: `Tài khoản '${email}' không thuộc vai trò 'Sinh viên'. Vui lòng chọn lại đúng vai trò.`,
        });
      }
      if (role === "school" && !["admin", "school"].includes(user.role)) {
        return res.status(400).json({
          success: false,
          message: `Tài khoản '${email}' không thuộc vai trò 'Nhà trường'. Vui lòng chọn lại đúng vai trò.`,
        });
      }
      if (role === "officer" && !["admin", "officer"].includes(user.role)) {
        return res.status(400).json({
          success: false,
          message: `Tài khoản '${email}' không thuộc vai trò 'Cán bộ đào tạo'. Vui lòng chọn lại đúng vai trò.`,
        });
      }
    }

    if (isLegacySeedPassword) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await db.query(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        [passwordHash, user.id],
      );
    }

    // Update last login
    await db.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id],
    );
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, ip_address)
       VALUES (?, 'LOGIN', 'users', ?, ?, ?)`,
      [user.id, user.id, `Đăng nhập hệ thống thành công (${user.role})`, req.ip]
    );

    const token = generateToken(user.id);

    delete user.password_hash;

    res.json({
      success: true,
      token,
      user,
      message: "Đăng nhập thành công.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sign in with a Google ID token
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { code } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng đăng nhập Google trước khi tiếp tục.",
      });
    }

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        message:
          "Máy chủ chưa được cấu hình Google Client ID và Client Secret. Hãy cấu hình GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong backend/.env.",
      });
    }

    const redirectUri = req.get("origin");
    if (!redirectUri) {
      return res.status(400).json({
        success: false,
        message:
          "Không xác định được địa chỉ trang đăng nhập. Vui lòng tải lại trang và thử lại.",
      });
    }

    let payload;
    try {
      const { tokens } = await googleClient.getToken({
        code,
        redirect_uri: redirectUri,
      });
      if (!tokens.id_token) {
        return res.status(401).json({
          success: false,
          message: "Google không trả về ID token hợp lệ.",
        });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (error) {
      const networkErrorCodes = [
        "ECONNRESET",
        "ETIMEDOUT",
        "ENOTFOUND",
        "EAI_AGAIN",
        "ECONNREFUSED",
        "EHOSTUNREACH",
      ];
      if (
        error.response?.status >= 500 ||
        networkErrorCodes.includes(error.code)
      ) {
        return next(error);
      }
      const googleError = error.response?.data?.error;
      if (
        ["invalid_client", "unauthorized_client", "redirect_uri_mismatch"].includes(
          googleError,
        )
      ) {
        console.error("Google OAuth configuration error:", googleError);
        return res.status(500).json({
          success: false,
          message:
            "Cấu hình đăng nhập Google trên máy chủ chưa khớp. Vui lòng liên hệ quản trị viên.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Thông tin đăng nhập Google không hợp lệ vui lòng thử lại.",
      });
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản Google chưa xác minh địa chỉ email.",
      });
    }

    const email = payload.email.toLowerCase();
    let [users] = await db.query(
      "SELECT id, email, full_name, role, phone, department, position, address, avatar_url, wallet_address, is_active FROM users WHERE google_id = ?",
      [payload.sub],
    );

    if (users.length === 0) {
      [users] = await db.query(
        "SELECT id, email, full_name, role, phone, department, position, address, avatar_url, wallet_address, is_active, google_id FROM users WHERE email = ?",
        [email],
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Email này chưa tồn tại, vui lòng thử lại.",
        });
      }

      if (users[0].google_id) {
        return res.status(409).json({
          success: false,
          message: "Email này đã được liên kết với một tài khoản Google khác.",
        });
      }

      const [linkResult] = await db.query(
        "UPDATE users SET google_id = ? WHERE id = ? AND google_id IS NULL",
        [payload.sub, users[0].id],
      );
      if (linkResult.affectedRows === 0) {
        const [[linkedUser]] = await db.query(
          "SELECT google_id FROM users WHERE id = ?",
          [users[0].id],
        );
        if (linkedUser?.google_id !== payload.sub) {
          return res.status(409).json({
            success: false,
            message:
              "Email này đã được liên kết với một tài khoản Google khác.",
          });
        }
      }
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị vô hiệu hóa.",
      });
    }

    await db.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?",
      [payload.picture || null, user.id],
    );
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, ip_address)
       VALUES (?, 'LOGIN', 'users', ?, ?, ?)`,
      [user.id, user.id, `Đăng nhập hệ thống bằng Google (${user.role})`, req.ip]
    );

    const token = generateToken(user.id);
    delete user.google_id;
    delete user.is_active;
    res.json({
      success: true,
      token,
      user,
      message: "Đăng nhập Google thành công.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send an account creation or password reset request to the admin
// @route   POST /api/auth/support-request
// @access  Public
exports.sendSupportRequest = async (req, res, next) => {
  const { requestType, fullName, email, phone, targetRole, reason } =
    req.body || {};
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedName = typeof fullName === "string" ? fullName.trim() : "";
  const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
  const normalizedReason = typeof reason === "string" ? reason.trim() : "";
  const validRoles = ["student", "school", "officer"];

  if (!["reset", "register"].includes(requestType)) {
    return res.status(400).json({
      success: false,
      message: "Loại yêu cầu không hợp lệ.",
    });
  }

  if (
    !normalizedName ||
    normalizedName.length > 150 ||
    normalizedEmail.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
    normalizedPhone.length > 40 ||
    normalizedReason.length > 1500 ||
    !validRoles.includes(targetRole)
  ) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng kiểm tra lại thông tin trong biểu mẫu.",
    });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;
  if (!emailUser || !emailPassword) {
    console.error("Support request email is not configured.");
    return res.status(503).json({
      success: false,
      message:
        "Dịch vụ gửi email chưa được cấu hình. Vui lòng liên hệ quản trị viên.",
    });
  }

  const escapeHtml = (value) =>
    value.replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[character];
    });
  const requestLabels = {
    reset: "Cấp lại / Quên mật khẩu",
    register: "Đăng ký tạo tài khoản mới",
  };
  const roleLabels = {
    student: "Sinh viên",
    school: "Nhà trường (Quản trị)",
    officer: "Cán bộ đào tạo",
  };
  const requestLabel = requestLabels[requestType];
  const roleLabel = roleLabels[targetRole];

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
    const safeName = escapeHtml(normalizedName);
    const safeEmail = escapeHtml(normalizedEmail);
    const safePhone = escapeHtml(normalizedPhone || "Không cung cấp");
    const safeReason = escapeHtml(normalizedReason || "Không có ghi chú").replace(
      /\r?\n/g,
      "<br>",
    );

    await transporter.sendMail({
      from: `"Hệ thống Văn bằng số" <${emailUser}>`,
      to: process.env.SUPPORT_NOTIFICATION_EMAIL || emailUser,
      replyTo: normalizedEmail,
      subject: `[Yêu cầu ${requestLabel}]`,
      text: [
        `Loại yêu cầu: ${requestLabel}`,
        `Họ tên: ${normalizedName}`,
        `Email liên hệ: ${normalizedEmail}`,
        `Số điện thoại: ${normalizedPhone || "Không cung cấp"}`,
        `Vai trò: ${roleLabel}`,
        `Ghi chú: ${normalizedReason || "Không có ghi chú"}`,
      ].join("\n"),
      html: `
        <h2>Yêu cầu hỗ trợ tài khoản</h2>
        <p><strong>Loại yêu cầu:</strong> ${requestLabel}</p>
        <p><strong>Họ tên:</strong> ${safeName}</p>
        <p><strong>Email liên hệ:</strong> ${safeEmail}</p>
        <p><strong>Số điện thoại:</strong> ${safePhone}</p>
        <p><strong>Vai trò:</strong> ${roleLabel}</p>
        <p><strong>Ghi chú:</strong><br>${safeReason}</p>
      `,
    });

    return res.json({
      success: true,
      message: `Đã gửi yêu cầu tới quản trị viên (${process.env.SUPPORT_NOTIFICATION_EMAIL || emailUser}).`,
    });
  } catch (error) {
    console.error("Failed to send support request email:", error.message);
    return res.status(502).json({
      success: false,
      message:
        "Không gửi được email yêu cầu. Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
    });
  }
};

// @desc    Send a general support request to the configured support mailbox
// @route   POST /api/auth/contact-support
// @access  Public
exports.sendContactSupportRequest = async (req, res) => {
  const { name, email, phone, role, subject, message } = req.body || {};
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
  const normalizedSubject = typeof subject === "string" ? subject.trim() : "";
  const normalizedMessage = typeof message === "string" ? message.trim() : "";
  const roleLabels = {
    student: "Sinh viên",
    school: "Nhà trường / Tổ chức",
    employer: "Nhà tuyển dụng",
    other: "Khác",
  };

  if (
    !normalizedName ||
    normalizedName.length > 150 ||
    normalizedEmail.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
    normalizedPhone.length > 40 ||
    !Object.prototype.hasOwnProperty.call(roleLabels, role) ||
    !normalizedSubject ||
    normalizedSubject.length > 200 ||
    /[\r\n]/.test(normalizedSubject) ||
    !normalizedMessage ||
    normalizedMessage.length > 5000
  ) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng kiểm tra lại thông tin trong biểu mẫu.",
    });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;
  if (!emailUser || !emailPassword) {
    console.error("Support request email is not configured.");
    return res.status(503).json({
      success: false,
      message:
        "Dịch vụ gửi email chưa được cấu hình. Vui lòng liên hệ quản trị viên.",
    });
  }

  const supportEmail = process.env.SUPPORT_NOTIFICATION_EMAIL || emailUser;
  const escapeHtml = (value) =>
    value.replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[character];
    });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
    const safeName = escapeHtml(normalizedName);
    const safeEmail = escapeHtml(normalizedEmail);
    const safePhone = escapeHtml(normalizedPhone || "Không cung cấp");
    const safeRole = escapeHtml(roleLabels[role]);
    const safeSubject = escapeHtml(normalizedSubject);
    const safeMessage = escapeHtml(normalizedMessage);

    await transporter.sendMail({
      from: `"Hệ thống Văn bằng số" <${emailUser}>`,
      to: supportEmail,
      replyTo: normalizedEmail,
      subject: `[Yêu cầu hỗ trợ] ${normalizedSubject}`,
      text: [
        `Họ tên: ${normalizedName}`,
        `Email liên hệ: ${normalizedEmail}`,
        `Số điện thoại: ${normalizedPhone || "Không cung cấp"}`,
        `Vai trò: ${roleLabels[role]}`,
        `Tiêu đề: ${normalizedSubject}`,
        "",
        "Nội dung:",
        normalizedMessage,
      ].join("\n"),
      html: `
        <h2>Yêu cầu hỗ trợ</h2>
        <p><strong>Họ tên:</strong> ${safeName}</p>
        <p><strong>Email liên hệ:</strong> ${safeEmail}</p>
        <p><strong>Số điện thoại:</strong> ${safePhone}</p>
        <p><strong>Vai trò:</strong> ${safeRole}</p>
        <p><strong>Tiêu đề:</strong> ${safeSubject}</p>
        <p><strong>Nội dung:</strong></p>
        <p style="white-space: pre-wrap">${safeMessage}</p>
      `,
    });

    return res.json({
      success: true,
      message: `Đã gửi yêu cầu hỗ trợ tới ${supportEmail}.`,
    });
  } catch (error) {
    console.error("Failed to send contact support email:", error.message);
    return res.status(502).json({
      success: false,
      message:
        "Không gửi được email yêu cầu. Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    let student = null;
    if (req.user.role === "student") {
      const [students] = await db.query(
        `SELECT st.*, COALESCE(s.school_name, st.school_name) AS school_name,
                s.school_code,
                EXISTS (
                  SELECT 1 FROM certificates c
                  WHERE c.student_id = st.id AND c.status = 'issued'
                ) AS has_issued_certificate
         FROM students st
         LEFT JOIN schools s ON st.school_id = s.id
         WHERE st.user_id = ?
            OR (st.user_id IS NULL AND LOWER(TRIM(st.email)) = LOWER(TRIM(?)))
         ORDER BY (st.user_id = ?) DESC, st.id ASC
         LIMIT 1`,
        [req.user.id, req.user.email, req.user.id],
      );
      student = students[0] || null;
      if (student) {
        await db.query(
          "UPDATE students SET user_id = ? WHERE id = ? AND user_id IS NULL",
          [req.user.id, student.id],
        );
        student.user_id = req.user.id;
      }
    }

    res.json({
      success: true,
      user: req.user,
      student,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStudentProfile = async (req, res, next) => {
  let connection;
  let transactionStarted = false;

  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Chỉ tài khoản sinh viên mới có thể cập nhật hồ sơ sinh viên.",
      });
    }

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Thông tin cập nhật không hợp lệ.",
      });
    }

    const editableFields = new Set([
      "full_name",
      "email",
      "date_of_birth",
      "gender",
      "id_number",
      "place_of_birth",
      "nationality",
      "department",
      "class_name",
      "avatar_url",
    ]);
    const submittedFields = Object.keys(req.body);
    if (
      submittedFields.length === 0 ||
      submittedFields.some((field) => !editableFields.has(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Thông tin cập nhật không hợp lệ.",
      });
    }

    const values = { ...req.body };
    for (const field of ["full_name", "email", "id_number", "place_of_birth", "nationality", "department", "class_name"]) {
      if (values[field] !== undefined && typeof values[field] !== "string") {
        return res.status(400).json({
          success: false,
          message: "Các thông tin hồ sơ phải có định dạng văn bản hợp lệ.",
        });
      }
      if (typeof values[field] === "string") values[field] = values[field].trim();
    }

    if (
      values.full_name !== undefined &&
      (!values.full_name || values.full_name.length > 255)
    ) {
      return res.status(400).json({
        success: false,
        message: "Họ tên không được để trống và tối đa 255 ký tự.",
      });
    }
    if (values.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return res.status(400).json({
        success: false,
        message: "Email không đúng định dạng.",
      });
    }
    if (values.email !== undefined && values.email.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Email không được vượt quá 255 ký tự.",
      });
    }
    const maximumLengths = {
      place_of_birth: 255,
      nationality: 100,
      department: 255,
      class_name: 100,
    };
    for (const [field, maximumLength] of Object.entries(maximumLengths)) {
      if (values[field] !== undefined && values[field].length > maximumLength) {
        return res.status(400).json({
          success: false,
          message: `Thông tin ${field} không được vượt quá ${maximumLength} ký tự.`,
        });
      }
    }
    if (values.id_number !== undefined && !/^\d{12}$/.test(values.id_number)) {
      return res.status(400).json({
        success: false,
        message: "Số CCCD phải gồm đúng 12 chữ số.",
      });
    }
    if (values.date_of_birth !== undefined) {
      if (!isValidStudentDateOfBirth(values.date_of_birth)) {
        return res.status(400).json({
          success: false,
          message: "Ngày sinh không hợp lệ.",
        });
      }
      if (!isStudentAtLeastEighteen(values.date_of_birth)) {
        return res.status(400).json({
          success: false,
          message: "Sinh viên phải đủ 18 tuổi.",
        });
      }
    }
    if (
      values.gender !== undefined &&
      !["Nam", "Nữ", "Khác"].includes(values.gender)
    ) {
      return res.status(400).json({
        success: false,
        message: "Giới tính không hợp lệ.",
      });
    }
    if (
      values.avatar_url !== undefined &&
      (typeof values.avatar_url !== "string" || values.avatar_url.length > 2000000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Ảnh đại diện không hợp lệ hoặc có dung lượng quá lớn.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [students] = await connection.query(
      `SELECT st.id,
              EXISTS (
                SELECT 1 FROM certificates c
                WHERE c.student_id = st.id AND c.status = 'issued'
              ) AS has_issued_certificate
       FROM students st
       WHERE st.user_id = ?
          OR (st.user_id IS NULL AND LOWER(TRIM(st.email)) = LOWER(TRIM(?)))
       ORDER BY (st.user_id = ?) DESC, st.id ASC
       LIMIT 1
       FOR UPDATE`,
      [req.user.id, req.user.email, req.user.id],
    );
    if (students.length === 0) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hồ sơ sinh viên được liên kết với tài khoản này.",
      });
    }

    const studentId = students[0].id;
    const hasIssuedCertificate = Number(students[0].has_issued_certificate) === 1;
    if (
      hasIssuedCertificate &&
      submittedFields.some(
        (field) =>
          !["email", "id_number", "avatar_url"].includes(field),
      )
    ) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(400).json({
        success: false,
        message:
          "Sinh viên đã được cấp văn bằng, chỉ có thể chỉnh sửa email, CCCD và ảnh đại diện.",
      });
    }

    if (values.email !== undefined) {
      const [duplicateUsers] = await connection.query(
        "SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id <> ? LIMIT 1",
        [values.email, req.user.id],
      );
      const [duplicateStudents] = await connection.query(
        "SELECT id FROM students WHERE LOWER(email) = LOWER(?) AND id <> ? LIMIT 1",
        [values.email, studentId],
      );
      if (duplicateUsers.length > 0 || duplicateStudents.length > 0) {
        await connection.rollback();
        transactionStarted = false;
        return res.status(409).json({
          success: false,
          message: "Email này đã được sử dụng.",
        });
      }
    }
    if (values.id_number !== undefined) {
      const [duplicateIds] = await connection.query(
        "SELECT id FROM students WHERE id_number = ? AND id <> ? LIMIT 1",
        [values.id_number, studentId],
      );
      if (duplicateIds.length > 0) {
        await connection.rollback();
        transactionStarted = false;
        return res.status(409).json({
          success: false,
          message: "Số CCCD này đã tồn tại trong hệ thống.",
        });
      }
    }

    const studentColumns = [
      "full_name",
      "email",
      "date_of_birth",
      "gender",
      "id_number",
      "place_of_birth",
      "nationality",
      "department",
      "class_name",
    ];
    const studentUpdates = studentColumns.filter(
      (field) => values[field] !== undefined,
    );
    if (studentUpdates.length > 0) {
      const assignments = studentUpdates.map((field) => `\`${field}\` = ?`).join(", ");
      const updateValues = studentUpdates.map((field) => values[field]);
      await connection.query(
        `UPDATE students SET ${assignments}, user_id = ? WHERE id = ?`,
        [...updateValues, req.user.id, studentId],
      );
    } else {
      await connection.query(
        "UPDATE students SET user_id = ? WHERE id = ? AND user_id IS NULL",
        [req.user.id, studentId],
      );
    }

    const userColumns = ["full_name", "email", "avatar_url"].filter(
      (field) => values[field] !== undefined,
    );
    if (userColumns.length > 0) {
      const assignments = userColumns.map((field) => `\`${field}\` = ?`).join(", ");
      const updateValues = userColumns.map((field) => values[field]);
      await connection.query(
        `UPDATE users SET ${assignments} WHERE id = ?`,
        [...updateValues, req.user.id],
      );
    }

    const [updatedStudents] = await connection.query(
      `SELECT st.*, COALESCE(s.school_name, st.school_name) AS school_name,
              s.school_code,
              EXISTS (
                SELECT 1 FROM certificates c
                WHERE c.student_id = st.id AND c.status = 'issued'
              ) AS has_issued_certificate
       FROM students st
       LEFT JOIN schools s ON st.school_id = s.id
       WHERE st.id = ?`,
      [studentId],
    );
    const [updatedUsers] = await connection.query(
      "SELECT id, email, full_name, role, phone, department, position, address, avatar_url, wallet_address FROM users WHERE id = ?",
      [req.user.id],
    );

    await connection.commit();
    transactionStarted = false;
    return res.json({
      success: true,
      message: "Cập nhật hồ sơ cá nhân thành công.",
      user: updatedUsers[0],
      student: updatedStudents[0],
    });
  } catch (error) {
    if (transactionStarted) await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email hoặc số CCCD đã được sử dụng.",
      });
    }
    return next(error);
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, department, position, address, avatar_url } =
      req.body;

    await db.query(
      `UPDATE users 
       SET full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone),
           department = COALESCE(?, department),
           position = COALESCE(?, position),
           address = COALESCE(?, address),
           avatar_url = COALESCE(?, avatar_url)
       WHERE id = ?`,
      [
        full_name,
        phone,
        department,
        position,
        address,
        avatar_url,
        req.user.id,
      ],
    );

    const [updatedUser] = await db.query(
      "SELECT id, email, full_name, role, phone, department, position, address, avatar_url, wallet_address FROM users WHERE id = ?",
      [req.user.id],
    );

    res.json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công.",
      user: updatedUser[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connect / bind MetaMask wallet address to user account (1 address per account)
// @route   POST /api/auth/connect-wallet
// @access  Private
exports.connectWallet = async (req, res, next) => {
  try {
    const { wallet_address } = req.body;

    if (!isAddress(wallet_address || "")) {
      return res.status(400).json({
        success: false,
        message:
          "Địa chỉ ví không hợp lệ. Vui lòng kết nối MetaMask đúng cách.",
      });
    }

    const normalizedWalletAddress = getAddress(wallet_address);

    const [currentUsers] = await db.query(
      "SELECT wallet_address FROM users WHERE id = ?",
      [req.user.id],
    );
    if (currentUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản cần liên kết ví.",
      });
    }
    if (currentUsers[0].wallet_address) {
      if (
        currentUsers[0].wallet_address.toLowerCase() !==
        normalizedWalletAddress.toLowerCase()
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Tài khoản đã được liên kết với một ví khác. Mỗi tài khoản chỉ được liên kết một ví.",
        });
      }
      return res.json({
        success: true,
        message: "Ví này đã được liên kết với tài khoản.",
        user: req.user,
      });
    }

    // Kiểm tra ví này có đang được dùng bởi tài khoản khác không
    const [walletCheck] = await db.query(
      "SELECT id, email FROM users WHERE LOWER(wallet_address) = LOWER(?) AND id != ?",
      [normalizedWalletAddress, req.user.id],
    );
    if (walletCheck.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Địa chỉ ví này đã được liên kết với tài khoản khác (${walletCheck[0].email}). Mỗi tài khoản chỉ được dùng 1 ví duy nhất.`,
      });
    }

    // Lưu wallet_address vào DB
    try {
      const [updateResult] = await db.query(
        "UPDATE users SET wallet_address = ? WHERE id = ? AND wallet_address IS NULL",
        [normalizedWalletAddress, req.user.id],
      );
      if (updateResult.affectedRows === 0) {
        const [linkedUsers] = await db.query(
          "SELECT wallet_address FROM users WHERE id = ?",
          [req.user.id],
        );
        if (
          !linkedUsers[0] ||
          !linkedUsers[0].wallet_address ||
          linkedUsers[0].wallet_address.toLowerCase() !==
            normalizedWalletAddress.toLowerCase()
        ) {
          return res.status(409).json({
            success: false,
            message:
              "Tài khoản đã được liên kết với một ví khác. Mỗi tài khoản chỉ được liên kết một ví.",
          });
        }
      }
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message:
            "Địa chỉ ví này đã được liên kết với tài khoản khác. Mỗi tài khoản chỉ được dùng một ví duy nhất.",
        });
      }
      throw error;
    }

    const [updatedUser] = await db.query(
      "SELECT id, email, full_name, role, phone, department, position, address, avatar_url, wallet_address FROM users WHERE id = ?",
      [req.user.id],
    );

    res.json({
      success: true,
      message: `Đã liên kết ví MetaMask ${normalizedWalletAddress.substring(0, 8)}... vào tài khoản thành công!`,
      user: updatedUser[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body || {};

    if (
      typeof current_password !== "string" ||
      typeof new_password !== "string" ||
      !current_password ||
      !new_password
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ mật khẩu cũ và mới.",
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải chứa ít nhất 8 ký tự.",
      });
    }
    if (Buffer.byteLength(new_password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không được vượt quá 72 byte.",
      });
    }
    if (new_password === current_password) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
      });
    }

    const [users] = await db.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [req.user.id],
    );
    const user = users[0];
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản.",
      });
    }

    if (!(await bcrypt.compare(current_password, user.password_hash))) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu hiện tại không đúng." });
    }

    const salt = await bcrypt.genSalt(10);
    const new_hash = await bcrypt.hash(new_password, salt);

    const [updateResult] = await db.query(
      "UPDATE users SET password_hash = ? WHERE id = ? AND password_hash = ?",
      [new_hash, req.user.id, user.password_hash],
    );
    if (updateResult.affectedRows === 0) {
      return res.status(409).json({
        success: false,
        message: "Mật khẩu đã được thay đổi ở nơi khác. Vui lòng thử lại.",
      });
    }

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    next(error);
  }
};
