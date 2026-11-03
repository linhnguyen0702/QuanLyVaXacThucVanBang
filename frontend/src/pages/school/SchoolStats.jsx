import React, { useCallback, useEffect, useState } from 'react';
import {
  FaChartPie,
  FaUserGraduate,
  FaCertificate,
  FaShieldAlt,
  FaCheckCircle,
  FaDownload,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import { api } from '../../services/api';

const COLORS = ['#0f4cf5', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];
const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN');
const formatPercent = (value) => `${Number(value || 0).toLocaleString('vi-VN')}%`;

const escapeCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const SchoolStats = () => {
  const [stats, setStats] = useState(null);
  const [majors, setMajors] = useState([]);
  const [degreeTypes, setDegreeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getDashboardStats();
      if (
        !response?.success ||
        !response.stats ||
        !Array.isArray(response.majors) ||
        !Array.isArray(response.degreeTypes)
      ) {
        throw new Error(response?.message || 'Dữ liệu thống kê trả về không hợp lệ.');
      }
      setStats(response.stats);
      setMajors(response.majors);
      setDegreeTypes(response.degreeTypes);
    } catch (requestError) {
      console.error('Failed to load school dashboard statistics:', requestError);
      setError(requestError.message || 'Không thể tải dữ liệu thống kê.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const downloadStats = () => {
    if (!stats) return;

    const rows = [
      ['Nhóm', 'Chỉ số', 'Giá trị'],
      ['Tổng quan', 'Văn bằng đã phát hành', stats.totalIssued],
      ['Tổng quan', 'Giao dịch Blockchain', stats.blockchainTransactions],
      ['Tổng quan', 'Sinh viên đã được cấp văn bằng', stats.studentsWithIssued],
      ['Xác thực', 'Tổng lượt xác thực', stats.totalVerifications],
      ['Xác thực', 'Lượt xác thực thành công', stats.successfulVerifications],
      ['Xác thực', 'Tỷ lệ xác thực thành công (%)', stats.verificationSuccessRate],
      ...majors.map((item) => ['Theo ngành', item.name, item.count]),
      ...degreeTypes.map((item) => ['Theo trình độ', item.name, item.count])
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `thong-ke-van-bang-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const issuedCount = Number(stats?.totalIssued) || 0;

  if (loading) {
    return (
      <div className="sd-view">
        <div className="sd-page-header">
          <div className="sd-page-title-area">
            <h2>Thống kê văn bằng &amp; Số liệu hệ thống</h2>
            <p>Báo cáo số liệu phát hành văn bằng và lượt xác thực từ hệ thống.</p>
          </div>
        </div>
        <div className="sd-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <FaSpinner className="wallet-connect-spinner" /> Đang tải dữ liệu thống kê...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-view">
        <div className="sd-page-header">
          <div className="sd-page-title-area">
            <h2>Thống kê văn bằng &amp; Số liệu hệ thống</h2>
            <p>Báo cáo số liệu phát hành văn bằng và lượt xác thực từ hệ thống.</p>
          </div>
        </div>
        <div className="sd-card" role="alert" style={{ padding: '28px', textAlign: 'center', color: '#b91c1c' }}>
          <FaExclamationTriangle style={{ marginRight: '8px' }} />
          {error}
          <button type="button" className="sd-btn-secondary" onClick={loadStats} style={{ marginLeft: '12px' }}>
            Thử tải lại
          </button>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      icon: <FaCertificate />,
      color: 'blue',
      label: 'Văn bằng đã phát hành',
      value: formatNumber(stats.totalIssued),
      badge: `${formatNumber(stats.blockchainTransactions)} giao dịch Blockchain`,
      badgeColor: 'green'
    },
    {
      icon: <FaShieldAlt />,
      color: 'green',
      label: 'Tỷ lệ xác thực thành công',
      value: formatPercent(stats.verificationSuccessRate),
      badge: `${formatNumber(stats.successfulVerifications)} / ${formatNumber(stats.totalVerifications)} lượt`,
      badgeColor: 'green'
    },
    {
      icon: <FaUserGraduate />,
      color: 'orange',
      label: 'Sinh viên đã được cấp văn bằng',
      value: formatNumber(stats.studentsWithIssued),
      badge: 'Theo hồ sơ văn bằng đã cấp',
      badgeColor: 'orange'
    },
    {
      icon: <FaCheckCircle />,
      color: 'purple',
      label: 'Tổng lượt tra cứu & xác thực',
      value: formatNumber(stats.totalVerifications),
      badge: 'Theo nhật ký xác thực',
      badgeColor: 'purple'
    }
  ];

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Thống kê văn bằng &amp; Số liệu hệ thống</h2>
          <p>Báo cáo số liệu phát hành văn bằng và lượt xác thực từ hệ thống.</p>
        </div>
        <button type="button" className="sd-btn-secondary" onClick={downloadStats}>
          <FaDownload /> Xuất số liệu thống kê
        </button>
      </div>

      <div className="sd-stats-row">
        {metrics.map((metric) => (
          <div className="sd-stat-card" key={metric.label}>
            <div className={`sd-stat-icon-box ${metric.color}`}>{metric.icon}</div>
            <div className="sd-stat-content">
              <span className="sd-stat-label">{metric.label}</span>
              <div className="sd-stat-val-row">
                <span className="sd-stat-value">{metric.value}</span>
                <span className={`sd-stat-badge ${metric.badgeColor}`}>{metric.badge}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sd-summary-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="sd-card">
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaChartPie style={{ color: '#0f4cf5' }} /> Phân bố văn bằng đã phát hành theo ngành
          </h3>
          {majors.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {majors.map((major, index) => {
                const count = Number(major.count) || 0;
                const percentage = issuedCount ? (count / issuedCount) * 100 : 0;
                return (
                  <div key={major.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      <span>{major.name}</span>
                      <span>{formatNumber(count)} văn bằng ({formatPercent(percentage)})</span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', background: COLORS[index % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '24px 8px' }}>
              Chưa có văn bằng đã phát hành để thống kê theo ngành.
            </p>
          )}
        </div>

        <div className="sd-card">
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
            Phân bố theo trình độ
          </h3>
          {degreeTypes.length ? (
            <div className="sd-stats-degree-list">
              {degreeTypes.map((degree, index) => {
                const count = Number(degree.count) || 0;
                const percentage = issuedCount ? (count / issuedCount) * 100 : 0;
                return (
                  <div className="sd-stats-degree-item" key={degree.name}>
                    <div className="sd-stats-degree-heading">
                      <span className="sd-stats-degree-name">{degree.name}</span>
                      <span className="sd-stats-degree-count">{formatNumber(count)} văn bằng</span>
                    </div>
                    <div className="sd-stats-degree-summary">
                      <div
                        className="sd-stats-degree-track"
                        role="img"
                        aria-label={`${degree.name}: ${formatNumber(count)} văn bằng, ${formatPercent(percentage)}`}
                      >
                        <span
                          className="sd-stats-degree-fill"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                      <span className="sd-stats-degree-percent">{formatPercent(percentage)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '24px 8px' }}>
              Chưa có văn bằng đã phát hành để thống kê theo trình độ.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolStats;
