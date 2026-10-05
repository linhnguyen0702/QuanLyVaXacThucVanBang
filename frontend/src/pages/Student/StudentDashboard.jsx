import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaShieldAlt, FaBell, FaChevronDown, FaBars, FaTimes,
  FaChartPie, FaGraduationCap, FaUser, FaLock, FaSignOutAlt 
} from 'react-icons/fa';
import { api } from '../../services/api';
import './StudentDashboard.css';

// Sub-components
import StudentOverview from './StudentOverview';
import StudentCertificates from './StudentCertificates';
import StudentNotifications from './StudentNotifications';
import StudentProfile from './StudentProfile';
import StudentPassword from './StudentPassword';

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
  }
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);

  // User profile state loaded from logged-in user or localStorage
  const [profileData, setProfileData] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      return {
        name: u.full_name || "Sinh viên",
        id: u.student_code || "20201123",
        class: u.class_name || "CNTT-01 K65",
        major: u.department || "Công nghệ thông tin",
        department: u.department || "Khoa Công nghệ thông tin",
        email: u.email || "student@school.edu.vn",
        phone: u.phone || "0368 251 814",
        avatar: u.avatar_url || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150"
      };
    }
    return {
      name: "Trần Thị B",
      id: "20201123",
      class: "CNTT-01 K65",
      major: "Công nghệ thông tin",
      department: "Khoa Công nghệ thông tin",
      email: "tranthib@school.edu.vn",
      phone: "0368 251 814",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150"
    };
  });

  const [certificates, setCertificates] = useState([]);

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedCert, setSelectedCert] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  // Fetch student certificates from Backend API
  useEffect(() => {
    const fetchStudentCerts = async () => {
      try {
        const res = await api.getCertificates();
        if (res && res.success && res.certificates) {
          const mapped = res.certificates.map(c => ({
            id: c.certificate_code,
            type: `Bằng Tốt Nghiệp ${c.degree_type || 'Đại học'}`,
            title: `Cử nhân ${c.major}`,
            school: c.school_name || "Trường Đại học Công nghệ",
            gpa: `${c.gpa || '3.65'} (${c.classification || 'Xuất sắc'})`,
            issueDate: c.issue_date ? new Date(c.issue_date).toLocaleDateString('vi-VN') : '25/07/2026',
            status: c.status === 'issued' ? 'blockchain' : 'approve',
            txHash: c.blockchain_tx_hash || '0x7f23a8c2d5e9b7eC81452D819280dEAc429ef993cc65319e75c8d0e5124b892a',
            blockNumber: '14890251',
            blockchainTime: c.issue_date ? new Date(c.issue_date).toLocaleString('vi-VN') : '25/07/2026',
            qrCode: c.certificate_code
          }));
          setCertificates(mapped);
        }
      } catch (err) {
        console.error('Failed to load student certificates:', err);
      }
    };
    fetchStudentCerts();
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
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
            <button className="std-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
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
                  <div className="std-dropdown-item logout" onClick={handleLogout}>
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
