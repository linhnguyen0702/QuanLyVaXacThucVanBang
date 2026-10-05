import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaDownload, FaCheck, FaSpinner } from 'react-icons/fa';
import { api } from '../../services/api';

const SchoolLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getVerificationLogs();
      if (res && res.success) {
        const mapped = (res.logs || []).map(l => ({
          id: l.id,
          timestamp: l.verified_at ? new Date(l.verified_at).toLocaleString('vi-VN') : 'Mới vừa xong',
          level: l.verification_result ? 'SUCCESS' : 'ERROR',
          eventCode: l.verification_method ? `VERIFY_${l.verification_method.toUpperCase()}` : 'VERIFY_REQUEST',
          details: `Xác thực văn bằng '${l.certificate_code}': ${l.student_name ? 'Sinh viên ' + l.student_name : 'Tra cứu CSDL'}`,
          ip: l.verifier_ip || '127.0.0.1'
        }));
        setLogs(mapped);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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
    if (window.confirm('Bạn có chắc chắn muốn xoá hiển thị nhật ký hệ thống?')) {
      setLogs([]);
      showToast('Đã làm sạch nhật ký.');
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
          <p>Ghi nhận hoạt động tra cứu, xác thực và các sự kiện từ CSDL MySQL</p>
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
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} /> Đang tải dữ liệu nhật ký...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
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
