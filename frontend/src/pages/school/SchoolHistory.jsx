import React from 'react';
import { FaUser, FaPlus, FaShieldAlt } from 'react-icons/fa';

const SchoolHistory = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Lịch sử hoạt động</h2>
          <p>Nhật ký hành động của tài khoản quản trị</p>
        </div>
      </div>
      
      <div className="sd-card">
        <div className="sd-activity-list">
          <div className="sd-activity-item">
            <div className="sd-act-icon blue"><FaUser /></div>
            <div className="sd-act-info">
              <span className="sd-act-desc">Admin <strong>Nguyễn Văn An</strong> đăng nhập hệ thống thành công</span>
              <span className="sd-act-time">27/07/2026 14:04:12</span>
            </div>
          </div>
          <div className="sd-activity-item">
            <div className="sd-act-icon green"><FaPlus /></div>
            <div className="sd-act-info">
              <span className="sd-act-desc">Thêm mới chương trình đào tạo <strong>Công nghệ thông tin</strong></span>
              <span className="sd-act-time">27/07/2026 11:32:00</span>
            </div>
          </div>
          <div className="sd-activity-item">
            <div className="sd-act-icon purple"><FaShieldAlt /></div>
            <div className="sd-act-info">
              <span className="sd-act-desc">Kiểm tra kết nối ví và mạng lưới Blockchain Ethereum thành công</span>
              <span className="sd-act-time">26/07/2026 16:45:11</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolHistory;
