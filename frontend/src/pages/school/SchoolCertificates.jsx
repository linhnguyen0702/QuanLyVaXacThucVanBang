import React from 'react';
import { FaPlus, FaSearch, FaEye, FaEdit } from 'react-icons/fa';

const SchoolCertificates = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Quản lý văn bằng</h2>
          <p>Danh sách văn bằng, chứng chỉ đã được cấp phát trên Blockchain</p>
        </div>
        <button className="sd-btn-primary">
          <FaPlus /> Cấp văn bằng mới
        </button>
      </div>
      
      <div className="sd-data-card">
        <div className="sd-filter-bar">
          <div className="sd-filter-left">
            <div className="sd-search-box">
              <FaSearch className="sd-search-icon" />
              <input type="text" className="sd-search-input" placeholder="Tìm tên sinh viên, số hiệu..." />
            </div>
            <select className="sd-select">
              <option value="">Tất cả loại bằng</option>
              <option value="Đại học">Đại học</option>
              <option value="Thạc sĩ">Thạc sĩ</option>
            </select>
          </div>
          <div className="sd-filter-right">
            <button className="sd-btn-secondary">Xuất báo cáo</button>
          </div>
        </div>
        
        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Số hiệu</th>
                <th>Sinh viên</th>
                <th>Chương trình</th>
                <th>Ngày cấp</th>
                <th>Khóa</th>
                <th>Trạng thái Blockchain</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="sd-td-bold">UNI-2026-0012</td>
                <td>
                  <div className="sd-td-bold">Trần Thị B</div>
                  <div className="sd-td-subtext">MSSV: 20201123</div>
                </td>
                <td>Công nghệ thông tin</td>
                <td>25/07/2026</td>
                <td>K65</td>
                <td><span className="sd-badge green">Đã xác thực</span></td>
                <td className="sd-actions">
                  <button className="sd-action-btn"><FaEye /></button>
                  <button className="sd-action-btn"><FaEdit /></button>
                </td>
              </tr>
              <tr>
                <td className="sd-td-bold">UNI-2026-0013</td>
                <td>
                  <div className="sd-td-bold">Lê Văn C</div>
                  <div className="sd-td-subtext">MSSV: 20203492</div>
                </td>
                <td>Kỹ thuật phần mềm</td>
                <td>24/07/2026</td>
                <td>K65</td>
                <td><span className="sd-badge green">Đã xác thực</span></td>
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

export default SchoolCertificates;
