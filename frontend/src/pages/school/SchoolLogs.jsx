import React from 'react';

const SchoolLogs = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Nhật ký hệ thống</h2>
          <p>Các sự kiện kỹ thuật của hệ thống máy chủ và hợp đồng thông minh</p>
        </div>
      </div>
      
      <div className="sd-data-card">
        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Mức độ</th>
                <th>Mã lỗi/Sự kiện</th>
                <th>Nội dung sự kiện</th>
                <th>Địa chỉ IP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>27/07/2026 14:05:32</td>
                <td><span className="sd-log-info">INFO</span></td>
                <td>API_REQ_SUCCESS</td>
                <td>GET /api/v1/certificates?page=1 - Code 200</td>
                <td>192.168.1.45</td>
              </tr>
              <tr>
                <td>27/07/2026 14:02:11</td>
                <td><span className="sd-log-success">SUCCESS</span></td>
                <td>BC_TX_MINED</td>
                <td>Polygon block #1284723 mined transaction Hash 0xa3f2...</td>
                <td>System Process</td>
              </tr>
              <tr>
                <td>27/07/2026 13:58:00</td>
                <td><span className="sd-log-warn">WARN</span></td>
                <td>METAMASK_DISCONNECT</td>
                <td>User account 0x... manually disconnected from the wallet</td>
                <td>192.168.1.102</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SchoolLogs;
