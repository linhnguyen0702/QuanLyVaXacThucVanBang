import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaShieldAlt, FaBell, FaChevronDown, FaBars, FaTimes,
  FaChartPie, FaGraduationCap, FaUser, FaLock, FaSignOutAlt 
} from 'react-icons/fa';
import './StudentDashboard.css';

// Sub-components
import StudentOverview from './StudentOverview';
import StudentCertificates from './StudentCertificates';
import StudentNotifications from './StudentNotifications';
import StudentProfile from './StudentProfile';
import StudentPassword from './StudentPassword';

// Initial Mock Data
const INITIAL_CERTIFICATES = [
  {
    id: "UNI-2026-0012",
    type: "Bằng Tốt Nghiệp Đại Học",
    title: "Cử nhân Công nghệ thông tin",
    school: "Trường Đại học Bách Khoa",
    gpa: "3.62 / 4.0 (Xuất sắc)",
    issueDate: "25/07/2026",
    status: "blockchain",
    txHash: "0x7f23a8c2d5e9b7eC81452D819280dEAc429ef993cc65319e75c8d0e5124b892a",
    blockNumber: "14890251",
    blockchainTime: "25/07/2026 14:32:08",
    qrCode: "UNI20260012"
  },
  {
    id: "CERT-2026-098",
    type: "Chứng Chỉ Tiếng Anh",
    title: "IELTS Academic (7.5)",
    school: "Trung tâm Khảo thí Quốc tế IDP",
    gpa: "Band 7.5",
    issueDate: "12/06/2026",
    status: "blockchain",
    txHash: "0x3f5da1e2d9b6e987c8a817293de7c4892fb671a938cde99281a8b273ce99120e",
    blockNumber: "14758209",
    blockchainTime: "12/06/2026 09:15:43",
    qrCode: "CERT2026098"
  },
  {
    id: "CERT-2026-115",
    type: "Chứng chỉ Kỹ năng",
    title: "Chứng nhận Lập trình Web nâng cao",
    school: "Viện Đào tạo Công nghệ thông tin",
    gpa: "Hoàn thành xuất sắc",
    issueDate: "05/08/2026",
    status: "approve",
    txHash: "",
    blockNumber: "",
    blockchainTime: "",
    qrCode: "CERT2026115"
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "N1",
    title: "Văn bằng tốt nghiệp được phê duyệt",
    desc: "Chúc mừng! Văn bằng Cử nhân Công nghệ thông tin của bạn đã được Trường Đại học Bách Khoa phê duyệt thành công.",
    time: "15 ngày trước",
    type: "approve",
    unread: false
  },
  {
    id: "N2",
    title: "Ghi nhận Blockchain thành công",
    desc: "Mã hash văn bằng tốt nghiệp UNI-2026-0012 đã được ghi nhận trên Blockchain Polygon Mainnet thành công.",
    time: "15 ngày trước",
    type: "blockchain",
    unread: false
  },
  {
    id: "N3",
    title: "Cấp chứng chỉ khóa học mới",
    desc: "Chứng nhận khóa học 'Lập trình Web nâng cao' của bạn đã được Viện Đào tạo Công nghệ thông tin phê duyệt cấp phát.",
    time: "5 ngày trước",
    type: "approve",
    unread: true
  },
  {
    id: "N4",
    title: "Chứng chỉ IELTS được liên kết",
    desc: "Hệ thống đã cập nhật thành công chữ ký số và mã QR xác thực cho chứng chỉ tiếng Anh IELTS Academic của bạn.",
    time: "2 tháng trước",
    type: "issue",
    unread: false
  }
];

const INITIAL_PROFILE = {
  name: "Nguyễn Văn An",
  id: "20201123",
  class: "CNTT-01 K65",
  major: "Công nghệ thông tin",
  department: "Khoa Công nghệ thông tin & Truyền thông",
  email: "annv@student.edu.vn",
  phone: "0368 251 814",
  avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150"
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);

  // Shared States initialized from localStorage
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('student_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [certificates] = useState(() => {
    const saved = localStorage.getItem('student_certificates');
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('student_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // State coordination for linking overview shortcuts to details modal in certificates tab
  const [selectedCert, setSelectedCert] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('student_profile', JSON.stringify(profileData));
  }, [profileData]);

  useEffect(() => {
    localStorage.setItem('student_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('student_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Notifications logic
  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleClearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleUpdateProfile = (updatedFields) => {
    setProfileData(prev => ({ ...prev, ...updatedFields }));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <StudentOverview 
            certificates={certificates}
            notifications={notifications}
            setActiveTab={setActiveTab}
            setSelectedCert={(cert) => {
              setSelectedCert(cert);
              setActiveTab('certificates');
            }}
            setShowCertModal={setShowCertModal}
          />
        );
      case 'certificates':
        return (
          <StudentCertificates 
            certificates={certificates}
            selectedCert={selectedCert}
            showCertModal={showCertModal}
            setShowCertModal={setShowCertModal}
            setSelectedCert={setSelectedCert}
          />
        );
      case 'notifications':
        return (
          <StudentNotifications 
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearNotification={handleClearNotification}
          />
        );
      case 'profile':
        return (
          <StudentProfile 
            profileData={profileData}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'password':
        return <StudentPassword />;
      default:
        return <div>Tab không hợp lệ.</div>;
    }
  };

  return (
    <div className="std-layout">
      {/* ── SIDEBAR ── */}
      <aside className={`std-sidebar ${collapsed ? 'collapsed' : ''} ${menuActive ? 'active' : ''}`}>
        <div className="std-sidebar-header">
          <div className="std-logo-icon">
            <FaShieldAlt />
          </div>
          <div className="std-logo-text">
            Cổng Sinh Viên<br />
            <span style={{ fontSize: '10px', color: '#818cf8' }}>Xác thực văn bằng</span>
          </div>
          {menuActive && (
            <button className="std-collapse-btn" style={{ marginLeft: 'auto', color: 'white' }} onClick={() => setMenuActive(false)}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="std-sidebar-content">
          <div className="std-menu-group">
            <div className="std-group-title">Chính</div>
            <div 
              className={`std-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setMenuActive(false); }}
            >
              <span className="std-menu-icon"><FaChartPie /></span>
              <span className="std-menu-label">Dashboard</span>
            </div>
            
            <div 
              className={`std-menu-item ${activeTab === 'certificates' ? 'active' : ''}`}
              onClick={() => { setActiveTab('certificates'); setMenuActive(false); }}
            >
              <span className="std-menu-icon"><FaGraduationCap /></span>
              <span className="std-menu-label">Văn bằng của tôi</span>
            </div>

            <div 
              className={`std-menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => { setActiveTab('notifications'); setMenuActive(false); }}
            >
              <span className="std-menu-icon" style={{ position: 'relative' }}>
                <FaBell />
                {!collapsed && unreadCount > 0 && (
                  <span style={{ 
                    position: 'absolute', top: '-4px', right: '-4px', 
                    backgroundColor: '#ef4444', width: '6px', height: '6px', borderRadius: '50%' 
                  }}></span>
                )}
              </span>
              <span className="std-menu-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Thông báo
                {unreadCount > 0 && (
                  <span style={{ 
                    fontSize: '10px', backgroundColor: '#ef4444', color: 'white', 
                    padding: '1px 5px', borderRadius: '10px', fontWeight: 'bold' 
                  }}>
                    {unreadCount}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="std-menu-group">
            <div className="std-group-title">Tài khoản</div>
            <div 
              className={`std-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => { setActiveTab('profile'); setMenuActive(false); }}
            >
              <span className="std-menu-icon"><FaUser /></span>
              <span className="std-menu-label">Hồ sơ cá nhân</span>
            </div>

            <div 
              className={`std-menu-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => { setActiveTab('password'); setMenuActive(false); }}
            >
              <span className="std-menu-icon"><FaLock /></span>
              <span className="std-menu-label">Đổi mật khẩu</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="std-main">
        {/* Header */}
        <header className="std-header">
          <div className="std-header-left">
            {/* Desktop toggle */}
            <button className="std-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              <FaBars />
            </button>
            {/* Mobile menu trigger */}
            <button 
              className="std-collapse-btn" 
              style={{ display: 'none' }} // Style overrides standard styling, but handled via CSS media queries
              onClick={() => setMenuActive(true)}
            >
              <FaBars />
            </button>
          </div>

          <div className="std-header-right">
            <div className="std-notify-menu-container" style={{ position: 'relative' }}>
              <button className="std-notify-btn" onClick={() => { setShowNotifyDropdown(!showNotifyDropdown); setShowUserDropdown(false); }}>
                <FaBell />
                {unreadCount > 0 && <span className="std-notify-badge">{unreadCount}</span>}
              </button>

              {showNotifyDropdown && (
                <div className="sd-notif-dropdown">
                  <div className="sd-notif-dropdown-header">
                    <span className="sd-notif-dropdown-title">Thông báo mới</span>
                    {unreadCount > 0 && (
                      <button className="sd-notif-dropdown-clear" onClick={handleMarkAllAsRead}>
                        Đọc tất cả
                      </button>
                    )}
                  </div>
                  <div className="sd-notif-dropdown-list">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 3).map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`sd-notif-dropdown-item ${notif.unread ? 'unread' : ''}`}
                          onClick={() => {
                            handleMarkAsRead(notif.id);
                            setShowNotifyDropdown(false);
                            setActiveTab('notifications');
                          }}
                        >
                          <div>
                            <div className="sd-notif-dropdown-item-title">{notif.title}</div>
                            <div className="sd-notif-dropdown-item-desc">{notif.desc}</div>
                            <div className="sd-notif-dropdown-item-time">{notif.time}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                        Không có thông báo mới.
                      </div>
                    )}
                  </div>
                  <div className="sd-notif-dropdown-footer">
                    <button 
                      className="sd-notif-dropdown-viewall" 
                      onClick={() => {
                        setShowNotifyDropdown(false);
                        setActiveTab('notifications');
                      }}
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="std-user-menu-container">
              <div className="std-user-menu" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                <img 
                  src={profileData.avatar} 
                  alt="Avatar" 
                  className="std-user-avatar" 
                />
                <div className="std-user-info">
                  <span className="std-user-name">{profileData.name}</span>
                  <span className="std-user-role">Sinh viên</span>
                </div>
                <FaChevronDown className="std-user-chevron" />
              </div>

              {showUserDropdown && (
                <div className="std-dropdown">
                  <div className="std-dropdown-item" onClick={() => { setActiveTab('profile'); setShowUserDropdown(false); }}>
                    <FaUser className="std-menu-icon" />
                    <span>Hồ sơ cá nhân</span>
                  </div>
                  <div className="std-dropdown-item" onClick={() => { setActiveTab('password'); setShowUserDropdown(false); }}>
                    <FaLock className="std-menu-icon" />
                    <span>Đổi mật khẩu</span>
                  </div>
                  <div className="std-dropdown-divider"></div>
                  <div className="std-dropdown-item logout" onClick={() => { navigate('/login'); setShowUserDropdown(false); }}>
                    <FaSignOutAlt className="std-menu-icon" />
                    <span>Đăng xuất</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="std-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
