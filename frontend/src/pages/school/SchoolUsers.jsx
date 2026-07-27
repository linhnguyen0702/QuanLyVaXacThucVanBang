import React from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const SchoolUsers = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Quản lý người dùng</h2>
          <p>Danh sách các cán bộ, nhân viên được cấp quyền truy cập hệ thống</p>
        </div>
        <button className="sd-btn-primary">
          <FaPlus /> Thêm người dùng
        </button>
      </div>
      
      <div className="sd-data-card">
        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Tên người dùng</th>
                <th>Email</th>
                <th>Bộ phận</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="sd-td-bold">Nguyễn Văn An</td>
                <td>annv@school.edu.vn</td>
                <td>Phòng Đào tạo</td>
                <td><span className="sd-badge purple">Quản trị viên</span></td>
                <td><span className="sd-badge green">Hoạt động</span></td>
                <td className="sd-actions">
                  <button className="sd-action-btn"><FaEdit /></button>
                  <button className="sd-action-btn"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td className="sd-td-bold">Phạm Thị D</td>
                <td>dpt@school.edu.vn</td>
                <td>Phòng Đào tạo</td>
                <td><span className="sd-badge orange">Cán bộ nhập liệu</span></td>
                <td><span className="sd-badge green">Hoạt động</span></td>
                <td className="sd-actions">
                  <button className="sd-action-btn"><FaEdit /></button>
                  <button className="sd-action-btn"><FaTrash /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SchoolUsers;
