import React from 'react';
import { FaGraduationCap, FaLink, FaBell, FaArrowRight, FaCheckCircle, FaClock } from 'react-icons/fa';

const StudentOverview = ({ 
  certificates = [], 
  notifications = [], 
  setActiveTab, 
  setSelectedCert,
  setShowCertModal
}) => {
  // Calculations
  const totalCerts = certificates.length;
  const blockchainCerts = certificates.filter(c => c.status === 'blockchain').length;
  const unreadNotifs = notifications.filter(n => n.unread).length;
  
  // Recent certificates (max 2)
  const recentCerts = certificates.slice(0, 2);
  // Recent notifications (max 3)
  const recentNotifs = notifications.slice(0, 3);

  const handleViewCert = (cert) => {
    setSelectedCert(cert);
    setShowCertModal(true);
  };

  return (
    <div className="std-view">
      <div className="std-page-header">
        <div className="std-page-title-area">
          <h2>Tổng quan Dashboard</h2>
          <p>Chào mừng bạn trở lại! Dưới đây là tóm tắt hoạt động văn bằng chứng chỉ số của bạn.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="std-stats-row">
        <div className="std-stat-card" onClick={() => setActiveTab('certificates')} style={{ cursor: 'pointer' }}>
          <div className="std-stat-icon-box indigo"><FaGraduationCap /></div>
          <div className="std-stat-content">
            <span className="std-stat-label">Tổng văn bằng / chứng chỉ</span>
            <div className="std-stat-val-row">
              <span className="std-stat-value">{totalCerts}</span>
            </div>
          </div>
        </div>

        <div className="std-stat-card" onClick={() => setActiveTab('certificates')} style={{ cursor: 'pointer' }}>
          <div className="std-stat-icon-box emerald"><FaCheckCircle /></div>
          <div className="std-stat-content">
            <span className="std-stat-label">Đã ghi Blockchain</span>
            <div className="std-stat-val-row">
              <span className="std-stat-value">{blockchainCerts}</span>
              <span className="std-stat-badge emerald">100% bảo mật</span>
            </div>
          </div>
        </div>

        <div className="std-stat-card" onClick={() => setActiveTab('notifications')} style={{ cursor: 'pointer' }}>
          <div className="std-stat-icon-box amber"><FaBell /></div>
          <div className="std-stat-content">
            <span className="std-stat-label">Thông báo mới chưa đọc</span>
            <div className="std-stat-val-row">
              <span className="std-stat-value">{unreadNotifs}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Grid layout */}
      <div className="std-overview-grid">
        {/* Left column: Recent certificates */}
        <div className="std-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Văn bằng gần đây</h3>
            <button 
              className="std-btn-secondary" 
              onClick={() => setActiveTab('certificates')}
              style={{ padding: '6px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Xem tất cả <FaArrowRight style={{ fontSize: '10px' }} />
            </button>
          </div>

          <div className="std-certs-grid" style={{ gridTemplateColumns: '1fr' }}>
            {recentCerts.map((cert) => (
              <div 
                key={cert.id} 
                className="std-cert-card" 
                style={{ height: 'auto', minHeight: '140px', padding: '16px' }}
              >
                <div className="std-cert-header">
                  <span className="std-cert-type">{cert.type}</span>
                  <span className="std-cert-id">{cert.id}</span>
                </div>
                <div className="std-cert-body" style={{ margin: '8px 0' }}>
                  <h4 className="std-cert-name" style={{ fontSize: '15px', marginBottom: '2px' }}>{cert.title}</h4>
                  <p className="std-cert-school" style={{ fontSize: '12.5px' }}>{cert.school}</p>
                </div>
                <div className="std-cert-footer" style={{ marginTop: '8px', paddingTo: '8px' }}>
                  {cert.status === 'blockchain' ? (
                    <span className="std-badge green">
                      <FaCheckCircle /> Đã ghi Blockchain
                    </span>
                  ) : (
                    <span className="std-badge amber">
                      <FaClock /> Đã phê duyệt, chờ ghi Blockchain
                    </span>
                  )}
                  <button 
                    className="std-btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => handleViewCert(cert)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Recent notifications */}
        <div className="std-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Thông báo mới</h3>
            <button 
              className="std-btn-secondary" 
              onClick={() => setActiveTab('notifications')}
              style={{ padding: '6px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Tất cả <FaArrowRight style={{ fontSize: '10px' }} />
            </button>
          </div>

          <div className="std-activity-list" style={{ marginTop: '0' }}>
            {recentNotifs.map((notif) => (
              <div 
                key={notif.id} 
                className="std-activity-item"
                onClick={() => setActiveTab('notifications')}
              >
                <div className={`std-act-icon ${
                  notif.type === 'blockchain' ? 'green' : notif.type === 'approve' ? 'purple' : 'blue'
                }`}>
                  {notif.type === 'blockchain' ? <FaLink /> : notif.type === 'approve' ? <FaCheckCircle /> : <FaBell />}
                </div>
                <div className="std-act-info">
                  <span className="std-act-desc" style={{ 
                    fontSize: '12.5px', 
                    fontWeight: notif.unread ? '700' : '500',
                    color: notif.unread ? '#0f172a' : '#475569' 
                  }}>
                    {notif.title}
                  </span>
                  <span className="std-act-time" style={{ fontSize: '10px' }}>{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
