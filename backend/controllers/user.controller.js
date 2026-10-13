const db = require("../config/database");
const { getDefaultPosition } = require("../utils/user-roles");

// @desc    Get list of all users
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    let query =
      "SELECT id, email, full_name, role, phone, department, position, wallet_address, is_active, last_login, created_at FROM users WHERE 1=1";
    const params = [];

    if (role) {
      query += " AND role = ?";
      params.push(role);
    }

    if (search) {
      query += " AND (email LIKE ? OR full_name LIKE ? OR department LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += " ORDER BY created_at DESC";

    const [users] = await db.query(query, params);

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get roles list & permissions
// @route   GET /api/roles
// @access  Public / Private
exports.getRoles = async (req, res, next) => {
  try {
    const [roles] = await db.query(`
      SELECT r.*, rp.view_cert, rp.create_cert, rp.edit_config, rp.view_logs
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
    `);

    res.json({
      success: true,
      roles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status / role
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role, is_active, full_name, phone, department, position } =
      req.body;
    const [currentUsers] = await db.query(
      "SELECT role, email FROM users WHERE id = ?",
      [id],
    );

    if (currentUsers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng." });
    }

    const nextEmail = email === undefined ? null : email.trim();
    if (nextEmail !== null && !nextEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email không được để trống." });
    }

    if (
      nextEmail &&
      nextEmail.toLowerCase() !== currentUsers[0].email.toLowerCase()
    ) {
      const [existingUsers] = await db.query(
        "SELECT id FROM users WHERE email = ? AND id <> ?",
        [nextEmail, id],
      );
      if (existingUsers.length > 0) {
        return res
          .status(409)
          .json({ success: false, message: "Email này đã được sử dụng." });
      }
    }

    const roleChanged = role && role !== currentUsers[0].role;
    const nextPosition =
      position ?? (roleChanged ? getDefaultPosition(role) : null);

    await db.query(
      `UPDATE users
         SET email = COALESCE(?, email),
           role = COALESCE(?, role),
           is_active = COALESCE(?, is_active),
           full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone),
           department = COALESCE(?, department),
           position = COALESCE(?, position)
       WHERE id = ?`,
      [
        nextEmail,
        role,
        is_active,
        full_name,
        phone,
        department,
        nextPosition,
        id,
      ],
    );

    const [updated] = await db.query(
      "SELECT id, email, full_name, role, phone, department, position, is_active FROM users WHERE id = ?",
      [id],
    );

    res.json({
      success: true,
      message: "Cập nhật người dùng thành công.",
      user: updated[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "Xóa tài khoản thành công." });
  } catch (error) {
    next(error);
  }
};
