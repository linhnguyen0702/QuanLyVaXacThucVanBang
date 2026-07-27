import React from 'react';
import { FaList, FaUserGraduate, FaDatabase, FaPlus, FaCheckCircle, FaEdit } from 'react-icons/fa';

const SchoolOverview = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Dashboard - Tổng quan</h2>
          <p>Tổng quan hoạt động hệ thống quản lý văn bằng</p>
        </div>
      </div>
      
      <div className="sd-summary-grid">
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box blue"><FaList /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Tổng văn bằng đã cấp</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">3.245.612</span>
              <span className="sd-stat-badge green">+12.4%</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box green"><FaUserGraduate /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Tổng số sinh viên</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">125.482</span>
              <span className="sd-stat-badge green">+8.2%</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box purple"><FaDatabase /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Giao dịch Blockchain</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">4.528.192</span>
              <span className="sd-stat-badge green">+15.1%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sd-chart-row">
        <div className="sd-card sd-chart-card">
          <h4>Biểu đồ thống kê cấp phát văn bằng</h4>
          <div className="sd-chart-placeholder">
            [Biểu đồ đường phát triển - Mock Chart]
          </div>
        </div>
        <div className="sd-card">
          <h4>Hoạt động gần đây</h4>
          <div className="sd-activity-list" style={{ marginTop: '16px' }}>
            <div className="sd-activity-item">
              <div className="sd-act-icon blue"><FaPlus /></div>
              <div className="sd-act-info">
                <span className="sd-act-desc">Đã tạo văn bằng mới cho sinh viên <strong>Nguyễn Văn A</strong></span>
                <span className="sd-act-time">2 phút trước</span>
              </div>
            </div>
            <div className="sd-activity-item">
              <div className="sd-act-icon green"><FaCheckCircle /></div>
              <div className="sd-act-info">
                <span className="sd-act-desc">Giao dịch Blockchain xác thực thành công mã hash <strong>0x7f23...a8c2</strong></span>
                <span className="sd-act-time">10 phút trước</span>
              </div>
            </div>
            <div className="sd-activity-item">
              <div className="sd-act-icon purple"><FaEdit /></div>
              <div className="sd-act-info">
                <span className="sd-act-desc">Cập nhật chương trình đào tạo <strong>Công nghệ thông tin</strong></span>
                <span className="sd-act-time">1 giờ trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolOverview;
