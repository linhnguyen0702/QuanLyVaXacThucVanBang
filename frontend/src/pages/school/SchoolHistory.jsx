import React, { useCallback, useEffect, useState } from 'react';
import { FaUser, FaPlus, FaShieldAlt, FaEdit, FaTrash, FaSpinner, FaHistory } from 'react-icons/fa';
import { api } from '../../services/api';
import Pagination from '../../components/Pagination/Pagination';

const PAGE_SIZE = 10;

const ACTION_LABELS = {
  LOGIN: 'Đăng nhập hệ thống',
  CREATE_CERTIFICATE: 'Tạo văn bằng',
  UPDATE_CERTIFICATE: 'Cập nhật văn bằng',
  DELETE_CERTIFICATE: 'Xóa văn bằng',
  BLOCKCHAIN_ISSUE: 'Xác thực văn bằng',
  REVOKE_CERTIFICATE: 'Thu hồi văn bằng',
  CREATE_STUDENT: 'Tạo hồ sơ sinh viên',
  UPDATE_STUDENT: 'Cập nhật hồ sơ sinh viên',
  DELETE_STUDENT: 'Xóa hồ sơ sinh viên',
  CREATE_PROGRAM: 'Tạo chương trình đào tạo',
  UPDATE_PROGRAM: 'Cập nhật chương trình đào tạo',
  DELETE_PROGRAM: 'Xóa chương trình đào tạo',
  CREATE_SCHOOL: 'Thêm cơ sở đào tạo',
  UPDATE_SCHOOL: 'Cập nhật cơ sở đào tạo',
  DELETE_SCHOOL: 'Xóa cơ sở đào tạo',
  UPDATE_USER: 'Cập nhật tài khoản',
  DELETE_USER: 'Xóa tài khoản'
};

const getActionIcon = (action) => {
  if (action.startsWith('CREATE')) return <FaPlus />;
  if (action.startsWith('UPDATE')) return <FaEdit />;
  if (action.startsWith('DELETE') || action.startsWith('REVOKE')) return <FaTrash />;
  if (action.includes('BLOCKCHAIN') || action.includes('CERTIFICATE')) return <FaShieldAlt />;
  return <FaUser />;
};

const formatDateTime = (value) => {
  if (!value) return 'Không có thời gian';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('vi-VN');
};

const SchoolHistory = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getAuditLogs({ page, limit: PAGE_SIZE });
      if (!response || !response.success) {
        throw new Error(response?.message || 'Không thể tải lịch sử hoạt động.');
      }
      setLogs(response.logs || []);
      setTotal(response.total || 0);
    } catch (requestError) {
      console.error('Lỗi khi tải lịch sử hoạt động:', requestError);
      setError(requestError.message || 'Không thể kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Lịch sử hoạt động</h2>
          <p>Nhật ký hoạt động được hiển thị theo quyền của tài khoản.</p>
        </div>
      </div>

      <div className="sd-card">
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
            <FaSpinner className="wallet-connect-spinner" /> Đang tải lịch sử...
          </div>
        ) : error ? (
          <div role="alert" style={{ padding: '24px', textAlign: 'center', color: '#b91c1c' }}>
            {error}
            <button type="button" className="sd-btn-secondary" onClick={fetchLogs} style={{ marginLeft: '12px' }}>
              Thử lại
            </button>
          </div>
        ) : logs.length ? (
          <>
            <div className="sd-activity-list">
              {logs.map((log) => (
                <div className="sd-activity-item" key={log.id}>
                  <div className="sd-act-icon blue">{getActionIcon(log.action || '')}</div>
                  <div className="sd-act-info">
                    <span className="sd-act-desc">
                      <strong>{ACTION_LABELS[log.action] || log.action || 'Hoạt động hệ thống'}</strong>
                      {log.user_name ? ` — ${log.user_name}` : ''}
                      {log.new_value ? `: ${log.new_value}` : ''}
                    </span>
                    <span className="sd-act-time">
                      {formatDateTime(log.created_at)}
                      {log.user_email ? ` · ${log.user_email}` : ''}
                      {log.ip_address ? ` · IP ${log.ip_address}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} total={total} limit={PAGE_SIZE} onPageChange={setPage} />
          </>
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            <FaHistory style={{ marginRight: '8px' }} />
            Chưa có hoạt động nào được ghi nhận.
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolHistory;
