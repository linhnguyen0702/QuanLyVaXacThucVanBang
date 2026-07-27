import React from 'react';
import { FaPlus, FaSearch, FaEye, FaEdit } from 'react-icons/fa';

const SchoolStudents = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Quản lý sinh viên</h2>
          <p>Danh sách sinh viên và trạng thái cấp bằng</p>
        </div>
        <button className="sd-btn-primary">
          <FaPlus /> Thêm sinh viên
        </button>
      </div>
      
      <div className="sd-data-card">
        <div className="sd-filter-bar">
          <div className="sd-filter-left">
            <div className="sd-search-box">
              <FaSearch className="sd-search-icon" />
              <input type="text" className="sd-search-input" placeholder="Tìm theo tên, MSSV..." />
            </div>
          </div>
        </div>
        
        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Khoa / Ngành</th>
                <th>Lớp</th>
                <th>Trạng thái tốt nghiệp</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="sd-td-bold">20201123</td>
                <td className="sd-td-bold">Trần Thị B</td>
                <td>tranthib@school.edu.vn</td>
                <td>Công nghệ thông tin</td>
                <td>CNTT-01 K65</td>
                <td><span className="sd-badge green">Đã cấp bằng</span></td>
                <td className="sd-actions">
                  <button className="sd-action-btn"><FaEye /></button>
                  <button className="sd-action-btn"><FaEdit /></button>
                </td>
              </tr>
              <tr>
                <td className="sd-td-bold">20203492</td>
                <td className="sd-td-bold">Lê Văn C</td>
                <td>levanc@school.edu.vn</td>
                <td>Khoa học máy tính</td>
                <td>KHMT-02 K65</td>
                <td><span className="sd-badge orange">Chờ duyệt cấp bằng</span></td>
                <td className="sd-actions">
                  <button className="sd-action-btn"><FaEye /></button>
                  <button className="sd-action-btn"><FaEdit /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SchoolStudents;
