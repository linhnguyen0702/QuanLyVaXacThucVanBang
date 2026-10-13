const ROLE_POSITIONS = {
  admin: "Quản trị viên Hệ thống Văn bằng số",
  school: "Quản lý trường",
  officer: "Cán bộ nhập liệu",
  viewer: "Nhân viên tra cứu",
  student: "Sinh viên",
};

const getDefaultPosition = (role) => ROLE_POSITIONS[role] || "Cán bộ";

module.exports = { getDefaultPosition };
