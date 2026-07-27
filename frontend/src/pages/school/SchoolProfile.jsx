import React from 'react';
import { FaPlus } from 'react-icons/fa';

const SchoolProfile = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Hồ sơ cá nhân</h2>
          <p>Cập nhật thông tin tài khoản và mật khẩu của bạn</p>
        </div>
      </div>
      
      <div className="sd-card">
        <div className="sd-profile-header">
          <div className="sd-profile-avatar-container">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Avatar" className="sd-profile-avatar" />
            <div className="sd-profile-avatar-upload"><FaPlus /></div>
          </div>
          <div className="sd-profile-name-role">
            <h3>Nguyễn Văn An</h3>
            <p>Quản trị viên hệ thống - Phòng Đào tạo</p>
          </div>
        </div>
        
        <div className="sd-form-grid">
          <div className="sd-form-group">
            <label>Họ và tên</label>
            <input type="text" className="sd-input" defaultValue="Nguyễn Văn An" />
          </div>
          <div className="sd-form-group">
            <label>Địa chỉ Email</label>
            <input type="email" className="sd-input" defaultValue="annv@school.edu.vn" disabled />
          </div>
          <div className="sd-form-group">
            <label>Số điện thoại</label>
            <input type="text" className="sd-input" defaultValue="0368 251 814" />
          </div>
          <div className="sd-form-group">
            <label>Đổi mật khẩu mới</label>
            <input type="password" className="sd-input" placeholder="Nhập mật khẩu mới nếu muốn đổi" />
          </div>
        </div>
        <button className="sd-btn-primary">Cập nhật hồ sơ</button>
      </div>
    </div>
  );
};

export default SchoolProfile;
