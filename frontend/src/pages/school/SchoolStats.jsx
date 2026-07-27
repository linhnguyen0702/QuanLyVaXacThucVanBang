import React from 'react';

const SchoolStats = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Thống kê văn bằng</h2>
          <p>Thống kê chi tiết số liệu văn bằng đã được lưu trữ và cấp phát</p>
        </div>
      </div>
      
      <div className="sd-card">
        <h4>Báo cáo số lượng văn bằng theo ngành</h4>
        <div className="sd-chart-placeholder" style={{ height: '350px' }}>
          [Biểu đồ thống kê theo khoa/ngành]
        </div>
      </div>
    </div>
  );
};

export default SchoolStats;
