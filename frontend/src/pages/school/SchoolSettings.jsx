import React from 'react';

const SchoolSettings = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Cài đặt hệ thống</h2>
          <p>Cấu hình các thông số vận hành của hệ thống</p>
        </div>
      </div>
      
      <div className="sd-card">
        <div className="sd-settings-list">
          <div className="sd-setting-item">
            <input type="checkbox" defaultChecked id="set-blockchain" />
            <div className="sd-setting-details">
              <label htmlFor="set-blockchain"><h5>Tự động đồng bộ Blockchain</h5></label>
              <p>Mỗi khi phát hành văn bằng số, hệ thống sẽ tự động gửi giao dịch lên mạng Polygon.</p>
            </div>
          </div>
          <div className="sd-setting-item">
            <input type="checkbox" defaultChecked id="set-notify" />
            <div className="sd-setting-details">
              <label htmlFor="set-notify"><h5>Gửi thông báo qua Email cho sinh viên</h5></label>
              <p>Sinh viên sẽ nhận được email hướng dẫn truy xuất văn bằng khi có chứng chỉ mới được phát hành.</p>
            </div>
          </div>
          <div className="sd-setting-item">
            <input type="checkbox" id="set-maintenance" />
            <div className="sd-setting-details">
              <label htmlFor="set-maintenance"><h5>Chế độ bảo trì hệ thống</h5></label>
              <p>Tạm thời khoá tất cả các cổng truy cập ngoại trừ tài khoản Quản trị cấp cao.</p>
            </div>
          </div>
        </div>
        <button className="sd-btn-primary" style={{ marginTop: '24px' }}>Lưu cấu hình</button>
      </div>
    </div>
  );
};

export default SchoolSettings;
