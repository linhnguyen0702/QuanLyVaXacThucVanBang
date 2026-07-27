import React from 'react';

const SchoolRoles = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Vai trò & Phân quyền</h2>
          <p>Quản lý các nhóm vai trò và phân quyền chi tiết cho hệ thống</p>
        </div>
      </div>
      
      <div className="sd-data-card">
        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Vai trò</th>
                <th>Xem văn bằng</th>
                <th>Cấp phát mới</th>
                <th>Cấu hình hệ thống</th>
                <th>Xem nhật ký</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="sd-td-bold">Quản trị viên (Admin)</td>
                <td><span className="sd-badge green">Cho phép</span></td>
                <td><span className="sd-badge green">Cho phép</span></td>
                <td><span className="sd-badge green">Cho phép</span></td>
                <td><span className="sd-badge green">Cho phép</span></td>
              </tr>
              <tr>
                <td className="sd-td-bold">Cán bộ đào tạo</td>
                <td><span className="sd-badge green">Cho phép</span></td>
                <td><span className="sd-badge green">Cho phép</span></td>
                <td><span className="sd-badge red">Từ chối</span></td>
                <td><span className="sd-badge red">Từ chối</span></td>
              </tr>
              <tr>
                <td className="sd-td-bold">Nhân viên tra cứu</td>
                <td><span className="sd-badge green">Cho phép</span></td>
                <td><span className="sd-badge red">Từ chối</span></td>
                <td><span className="sd-badge red">Từ chối</span></td>
                <td><span className="sd-badge red">Từ chối</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SchoolRoles;
