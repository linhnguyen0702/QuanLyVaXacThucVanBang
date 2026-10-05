import React, { useState, useEffect } from 'react';
import { 
  FaList, FaUserGraduate, FaPlus, FaCheckCircle, 
  FaEdit, FaShieldAlt, FaFileAlt, FaBook 
} from 'react-icons/fa';
import { api } from '../../services/api';

const SchoolOverview = ({ onNavigate }) => {
  const [certCount, setCertCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [programCount, setProgramCount] = useState(0);

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

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Dashboard - Tổng quan hệ thống</h2>
          <p>Báo cáo tổng quan dữ liệu văn bằng, sinh viên và hoạt động xác thực từ CSDL MySQL</p>
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
              <span className="sd-stat-badge green">Trong Database</span>
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
              <span className="sd-stat-badge green">Hồ sơ CSDL</span>
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
          <div className="sd-chart-placeholder">
            <div style={{ textStyle: 'center' }}>
              <FaShieldAlt style={{ fontSize: '32px', color: '#0f4cf5', marginBottom: '8px' }} />
              <div>Biểu đồ số liệu phát hành theo thời gian (Tháng 10/2026)</div>
            </div>
          </div>
        </div>

        <div className="sd-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Nhật ký hoạt động gần đây</h4>
            <button className="sd-btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => onNavigate && onNavigate('history')}>
              Xem tất cả
            </button>
          </div>
          <div className="sd-activity-list">
            <div className="sd-activity-item" style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('certificates')}>
              <div className="sd-act-icon blue"><FaPlus /></div>
              <div className="sd-act-info">
                <span className="sd-act-desc">Cấp mới văn bằng số hiệu <strong>UNI-2026-0012</strong></span>
                <span className="sd-act-time">Vừa xong</span>
              </div>
            </div>
            <div className="sd-activity-item" style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('verify-certificates')}>
              <div className="sd-act-icon green"><FaCheckCircle /></div>
              <div className="sd-act-info">
                <span className="sd-act-desc">Giao dịch Sepolia mined mã hash <strong>0x8f2a...9f0</strong></span>
                <span className="sd-act-time">10 phút trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolOverview;
