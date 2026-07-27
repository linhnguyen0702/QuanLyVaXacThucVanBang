import React from 'react';
import { FaDownload } from 'react-icons/fa';

const SchoolReports = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Báo cáo hệ thống</h2>
          <p>Xuất các báo cáo dạng PDF, Excel phục vụ lưu trữ</p>
        </div>
      </div>
      
      <div className="sd-card">
        <div className="sd-form-grid">
          <div className="sd-form-group">
            <label>Loại báo cáo</label>
            <select className="sd-select">
              <option>Báo cáo văn bằng đã phát hành</option>
              <option>Báo cáo sinh viên tốt nghiệp</option>
            </select>
          </div>
          <div className="sd-form-group">
            <label>Định dạng xuất</label>
            <select className="sd-select">
              <option>Microsoft Excel (.xlsx)</option>
              <option>Portable Document Format (.pdf)</option>
            </select>
          </div>
        </div>
        <button className="sd-btn-primary"><FaDownload /> Tạo và Tải báo cáo</button>
      </div>
    </div>
  );
};

export default SchoolReports;
