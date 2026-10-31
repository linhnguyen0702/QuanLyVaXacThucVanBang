const db = require("../config/database");
const { getDefaultPosition } = require("../utils/user-roles");
const { getPagination } = require("../utils/pagination");

// @desc    Get list of all users
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const pagination = getPagination(req.query);

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

    let total;
    if (pagination.requested) {
      const countQuery = `
        SELECT COUNT(*) AS total FROM users WHERE 1=1
        ${role ? "AND role = ?" : ""}
        ${search ? "AND (email LIKE ? OR full_name LIKE ? OR department LIKE ?)" : ""}
      `;
      const [countRows] = await db.query(countQuery, params);
      total = countRows[0] ? countRows[0].total : 0;
      query += " LIMIT ? OFFSET ?";
      params.push(pagination.limit, pagination.offset);
    }

    const [users] = await db.query(query, params);
    if (total === undefined) total = users.length;

    res.json({
      success: true,
      count: total,
      total,
      page: pagination.page,
      limit: pagination.limit,
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

    if (req.user) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, ip_address)
         VALUES (?, 'UPDATE_USER', 'users', ?, ?, ?)`,
        [req.user.id, id, `Cập nhật tài khoản ${updated[0].email} (${updated[0].role})`, req.ip],
      );
    }

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
    const [users] = await db.query('SELECT email, full_name FROM users WHERE id = ?', [id]);
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    if (req.user && users.length > 0) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, ip_address)
         VALUES (?, 'DELETE_USER', 'users', ?, ?, ?)`,
        [req.user.id, id, `Xóa tài khoản ${users[0].email} - ${users[0].full_name}`, req.ip],
      );
    }
    res.json({ success: true, message: "Xóa tài khoản thành công." });
  } catch (error) {
    next(error);
  }
};
