import React, { useState, useEffect } from 'react';
import { 
  FaList, FaUserGraduate, FaPlus, FaCheckCircle, 
  FaEdit, FaShieldAlt, FaFileAlt, FaBook, FaSpinner,
  FaExclamationTriangle, FaHistory
} from 'react-icons/fa';
import { api } from '../../services/api';

const CHART_MONTH_COUNT = 6;

const getRecentMonths = () => {
  const now = new Date();
  return Array.from({ length: CHART_MONTH_COUNT }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (CHART_MONTH_COUNT - index - 1), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('vi-VN', { month: 'short' })
    };
  });
};

const formatRelativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'Không có thời gian';

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ];
  const [unit, divisor] = units.find(([, size]) => Math.abs(seconds) >= size) || ['second', 1];
  const amount = Math.round(seconds / divisor);
  return new Intl.RelativeTimeFormat('vi', { numeric: 'auto' }).format(amount, unit);
};

const ACTIVITY_LABELS = {
  CREATE_CERTIFICATE: 'Tạo văn bằng',
  UPDATE_CERTIFICATE: 'Cập nhật văn bằng',
  DELETE_CERTIFICATE: 'Xóa văn bằng',
  BLOCKCHAIN_ISSUE: 'Phát hành văn bằng lên Blockchain',
  REVOKE_CERTIFICATE: 'Thu hồi văn bằng',
  CREATE_STUDENT: 'Tạo hồ sơ sinh viên',
  UPDATE_STUDENT: 'Cập nhật hồ sơ sinh viên',
  DELETE_STUDENT: 'Xóa hồ sơ sinh viên',
  CREATE_PROGRAM: 'Tạo chương trình đào tạo',
  UPDATE_PROGRAM: 'Cập nhật chương trình đào tạo',
  DELETE_PROGRAM: 'Xóa chương trình đào tạo'
};

const getActivityIcon = (action) => {
  if (action === 'BLOCKCHAIN_ISSUE') return <FaCheckCircle />;
  if (action.startsWith('CREATE')) return <FaPlus />;
  if (action.startsWith('UPDATE')) return <FaEdit />;
  return <FaShieldAlt />;
};

const SchoolOverview = ({ onNavigate }) => {
  const [certCount, setCertCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [programCount, setProgramCount] = useState(0);
  const [issuanceMonths, setIssuanceMonths] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState('');
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.getStatsSummary();
        if (res && res.success && res.stats) {
          setCertCount(res.stats.totalCertificates || 0);
          setStudentCount(res.stats.totalStudents || 0);
          setProgramCount(res.stats.totalSchools || 0);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadIssuanceTrend = async () => {
      setTrendLoading(true);
      setTrendError('');
      try {
        const response = await api.getIssuanceTrend();
        if (!response?.success || !Array.isArray(response.months)) {
          throw new Error(response?.message || 'Không thể tải dữ liệu phát hành văn bằng.');
        }
        if (isMounted) setIssuanceMonths(response.months);
      } catch (error) {
        console.error('Failed to load certificate issuance trend:', error);
        if (isMounted) setTrendError(error.message || 'Không thể tải dữ liệu phát hành văn bằng.');
      } finally {
        if (isMounted) setTrendLoading(false);
      }
    };

    const loadRecentActivities = async () => {
      setActivityLoading(true);
      setActivityError('');
      try {
        const response = await api.getAuditLogs({ page: 1, limit: 3 });
        if (!response?.success || !Array.isArray(response.logs)) {
          throw new Error(response?.message || 'Không thể tải nhật ký hoạt động.');
        }
        if (isMounted) setActivities(response.logs.slice(0, 3));
      } catch (error) {
        console.error('Failed to load recent dashboard activities:', error);
        if (isMounted) setActivityError(error.message || 'Không thể tải nhật ký hoạt động.');
      } finally {
        if (isMounted) setActivityLoading(false);
      }
    };

    loadIssuanceTrend();
    loadRecentActivities();
    return () => {
      isMounted = false;
    };
  }, []);

  const monthCounts = getRecentMonths().map((month) => ({
    ...month,
    count: Number(issuanceMonths.find((item) => item.month === month.key)?.count) || 0
  }));
  const maxMonthlyCount = Math.max(...monthCounts.map((month) => month.count), 1);

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Dashboard - Tổng quan hệ thống</h2>
          <p>Báo cáo tổng quan dữ liệu văn bằng, sinh viên và hoạt động xác thực.</p>
        </div>
      </div>

      {/* ── QUICK ACTION BUTTONS ── */}
      <div className="sd-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
          Tác vụ truy cập nhanh
        </h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="sd-btn-primary" onClick={() => onNavigate && onNavigate('certificates')}>
            <FaPlus /> Cấp văn bằng mới
          </button>
          <button className="sd-btn-secondary" onClick={() => onNavigate && onNavigate('students')}>
            <FaUserGraduate /> Thêm sinh viên mới
          </button>
          <button className="sd-btn-secondary" onClick={() => onNavigate && onNavigate('verify-certificates')}>
            <FaShieldAlt /> Tra cứu & Xác thực QR
          </button>
          <button className="sd-btn-secondary" onClick={() => onNavigate && onNavigate('reports')}>
            <FaFileAlt /> Trích xuất báo cáo
          </button>
        </div>
      </div>

      {/* ── METRIC STAT CARDS ── */}
      <div className="sd-summary-grid">
        <div 
          className="sd-stat-card" 
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('certificates')}
          title="Bấm để đến trang Quản lý Văn bằng"
        >
          <div className="sd-stat-icon-box blue"><FaList /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Tổng văn bằng đã phát hành</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{certCount.toLocaleString()}</span>
              <span className="sd-stat-badge green">Văn bằng</span>
            </div>
          </div>
        </div>

        <div 
          className="sd-stat-card" 
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('students')}
          title="Bấm để đến trang Quản lý Sinh viên"
        >
          <div className="sd-stat-icon-box green"><FaUserGraduate /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Tổng số sinh viên trong hệ thống</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{studentCount.toLocaleString()}</span>
              <span className="sd-stat-badge green">Hồ sơ </span>
            </div>
          </div>
        </div>

        <div 
          className="sd-stat-card" 
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('program')}
          title="Bấm để đến trang Chương trình đào tạo"
        >
          <div className="sd-stat-icon-box purple"><FaBook /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Cơ sở giáo dục / Trường học</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{programCount.toLocaleString()}</span>
              <span className="sd-stat-badge purple">Đang hoạt động</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CHART & RECENT ACTIVITY LIST ── */}
      <div className="sd-chart-row">
        <div className="sd-card sd-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Biểu đồ tăng trưởng văn bằng cấp phát</h4>
            <button className="sd-btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => onNavigate && onNavigate('stats')}>
              Xem thống kê chi tiết
            </button>
          </div>
          <div className="sd-chart-placeholder" style={{ padding: '16px 20px', borderStyle: 'solid', alignItems: 'stretch' }}>
            {trendLoading ? (
              <div style={{ margin: 'auto' }}><FaSpinner className="wallet-connect-spinner" /> Đang tải biểu đồ...</div>
            ) : trendError ? (
              <div role="alert" style={{ margin: 'auto', color: '#b91c1c', textAlign: 'center' }}>
                <FaExclamationTriangle /> {trendError}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%' }}>
                {monthCounts.every((month) => month.count === 0) && (
                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>
                    Chưa có văn bằng được phát hành trong 6 tháng gần đây.
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '12px', height: '150px', borderBottom: '1px solid #cbd5e1' }}>
                  {monthCounts.map((month) => (
                    <div key={month.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', height: '100%', flex: 1 }}>
                      <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{month.count}</span>
                      <div
                        role="img"
                        aria-label={`${month.label}: ${month.count} văn bằng`}
                        style={{ width: 'min(42px, 70%)', minHeight: month.count ? '6px' : '2px', height: `${Math.max(month.count ? 4 : 1, (month.count / maxMonthlyCount) * 100)}%`, background: '#0f4cf5', borderRadius: '5px 5px 0 0' }}
                      />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{month.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sd-card sd-dashboard-activity-card">
          <div className="sd-dashboard-activity-header">
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Nhật ký hoạt động gần đây</h4>
            <button className="sd-btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => onNavigate && onNavigate('history')}>
              Xem tất cả
            </button>
          </div>
          <div className={`sd-activity-list sd-dashboard-activity-list${activities.length < 3 ? ' is-short' : ''}`}>
            {activityLoading ? (
              <div style={{ color: '#64748b' }}><FaSpinner className="wallet-connect-spinner" /> Đang tải nhật ký...</div>
            ) : activityError ? (
              <div role="alert" style={{ color: '#b91c1c' }}><FaExclamationTriangle /> {activityError}</div>
            ) : activities.length ? activities.map((activity) => (
              <div className="sd-activity-item" key={activity.id}>
                <div className="sd-act-icon blue">{getActivityIcon(activity.action || '')}</div>
                <div className="sd-act-info">
                  <span className="sd-act-desc">
                    <strong>{ACTIVITY_LABELS[activity.action] || activity.action || 'Hoạt động hệ thống'}</strong>
                    {activity.new_value ? `: ${activity.new_value}` : ''}
                  </span>
                  <span className="sd-act-time">
                    {formatRelativeTime(activity.created_at)}
                    {activity.user_name ? ` · ${activity.user_name}` : ''}
                  </span>
                </div>
              </div>
            )) : (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '20px 8px' }}>
                <FaHistory style={{ marginRight: '8px' }} />
                Chưa có hoạt động nào được ghi nhận.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolOverview;
