import React, { useState } from 'react';
import { FaSearch, FaTrash, FaDownload, FaCheck } from 'react-icons/fa';

const INITIAL_LOGS = [
  {
    id: 1,
    timestamp: '2026-09-30 14:05:32',
    level: 'INFO',
    eventCode: 'API_REQ_SUCCESS',
    details: 'GET /api/v1/certificates?page=1 - Code 200 OK',
    ip: '192.168.1.45'
  },
  {
    id: 2,
    timestamp: '2026-09-30 14:02:11',
    level: 'SUCCESS',
    eventCode: 'BC_TX_MINED',
    details: 'Polygon block #1284723 mined transaction Hash 0xa3f2d9b7eC81452D819280dEAc429e81',
    ip: 'System Process'
  },
  {
    id: 3,
    timestamp: '2026-09-30 13:58:00',
    level: 'WARN',
    eventCode: 'METAMASK_DISCONNECT',
    details: 'User account 0xA3f2... manually disconnected from the wallet session',
    ip: '192.168.1.102'
  },
  {
    id: 4,
    timestamp: '2026-09-29 18:22:15',
    level: 'ERROR',
    eventCode: 'AUTH_FAILED',
    details: 'Failed login attempt for user user_unknown@school.edu.vn - Invalid password',
    ip: '113.190.23.11'
  },
  {
    id: 5,
    timestamp: '2026-09-29 16:10:00',
    level: 'SUCCESS',
    eventCode: 'CERT_ISSUED',
    details: 'Certificate UNI-2026-0012 issued for student Trần Thị B (MSSV: 20201123)',
    ip: '192.168.1.45'
  }
];

const SchoolLogs = () => {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'SUCCESS':
        return <span className="sd-badge green">SUCCESS</span>;
      case 'INFO':
        return <span className="sd-badge blue">INFO</span>;
      case 'WARN':
        return <span className="sd-badge orange">WARN</span>;
      case 'ERROR':
        return <span className="sd-badge red">ERROR</span>;
      default:
        return <span className="sd-badge gray">{level}</span>;
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Bạn có chắc chắn muốn xoá toàn bộ nhật ký hệ thống?')) {
      setLogs([]);
      showToast('Đã xoá sạch nhật ký hệ thống.');
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.eventCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.ip.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === '' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Nhật ký hệ thống & Audit Logs</h2>
          <p>Ghi nhận các sự kiện máy chủ, hoạt động người dùng và trạng thái hợp đồng thông minh</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="sd-btn-secondary" onClick={() => showToast('Đã xuất file log hệ thống!')}>
            <FaDownload /> Xuất Log
          </button>
          <button className="sd-btn-danger" onClick={handleClearLogs}>
            <FaTrash /> Xóa nhật ký
          </button>
        </div>
      </div>

      <div className="sd-data-card">
        <div className="sd-filter-bar">
          <div className="sd-filter-left">
            <div className="sd-search-box">
              <FaSearch className="sd-search-icon" />
              <input 
                type="text" 
                className="sd-search-input" 
                placeholder="Tìm sự kiện, mã lỗi, IP..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="sd-select" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              <option value="">Tất cả mức độ</option>
              <option value="INFO">INFO</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
        </div>

        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Mức độ</th>
                <th>Mã sự kiện</th>
                <th>Nội dung sự kiện</th>
                <th>Địa chỉ IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.timestamp}</td>
                    <td>{getLevelBadge(log.level)}</td>
                    <td className="sd-td-bold" style={{ fontFamily: 'monospace' }}>{log.eventCode}</td>
                    <td>{log.details}</td>
                    <td className="sd-td-subtext" style={{ fontFamily: 'monospace' }}>{log.ip}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Không tìm thấy nhật ký phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toastMessage && (
        <div className="sd-toast success">
          <FaCheck /> {toastMessage}
        </div>
      )}
    </div>
  );
};

export default SchoolLogs;
