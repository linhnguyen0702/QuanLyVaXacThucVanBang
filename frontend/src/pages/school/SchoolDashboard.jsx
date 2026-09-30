import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaShieldAlt, FaBell, FaChevronDown, FaBars, FaTimes,
  FaChartPie, FaList, FaUserGraduate, FaBook, FaHistory,
  FaFileAlt, FaCog, FaDatabase, FaUser, FaLock, FaSignOutAlt
} from 'react-icons/fa';
import './SchoolDashboard.css';

// Sub-components
import SchoolOverview from './SchoolOverview';
import SchoolCertificates from './SchoolCertificates';
import SchoolStudents from './SchoolStudents';
import SchoolPrograms from './SchoolPrograms';
import SchoolVerifyCertificates from './SchoolVerifyCertificates';
import SchoolStats from './SchoolStats';
import SchoolHistory from './SchoolHistory';
import SchoolReports from './SchoolReports';
import SchoolUsers from './SchoolUsers';
import SchoolRoles from './SchoolRoles';
import SchoolSettings from './SchoolSettings';
import SchoolLogs from './SchoolLogs';
import SchoolProfile from './SchoolProfile';
import SchoolNotifications from './SchoolNotifications';
import AdminSchools from './AdminSchools';
import { FaUniversity } from 'react-icons/fa';

const MENU_GROUPS = [
  {
    title: 'Tổng quan',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <FaChartPie /> }
    ]
  },
  {
    title: 'Quản lý',
    items: [
      { id: 'certificates', label: 'Văn bằng', icon: <FaList /> },
      { id: 'students', label: 'Sinh viên', icon: <FaUserGraduate /> },
      { id: 'program', label: 'Chương trình đào tạo', icon: <FaBook /> },
      { id: 'schools', label: 'Quản lý Trường học', icon: <FaUniversity /> },
      { id: 'verify-certificates', label: 'Xác thực văn bằng', icon: <FaShieldAlt /> }
    ]
  },
  {
    title: 'Báo cáo',
    items: [
      { id: 'stats', label: 'Thống kê', icon: <FaChartPie /> },
      { id: 'history', label: 'Lịch sử hoạt động', icon: <FaHistory /> },
      { id: 'reports', label: 'Báo cáo', icon: <FaFileAlt /> }
    ]
  },
  {
    title: 'Hệ thống',
    items: [
      { id: 'users', label: 'Quản lý người dùng', icon: <FaUserGraduate /> },
      { id: 'roles', label: 'Vai trò & Phân quyền', icon: <FaShieldAlt /> },
      { id: 'settings', label: 'Cài đặt hệ thống', icon: <FaCog /> },
      { id: 'logs', label: 'Nhật ký hệ thống', icon: <FaDatabase /> },
      { id: 'notifications', label: 'Thông báo', icon: <FaBell /> },
      { id: 'profile', label: 'Hồ sơ cá nhân', icon: <FaUser /> }
    ]
  }
];

// Let's dynamically map menu group icons for consistency with sidebars
const getMenuIcon = (id) => {
  return null; // The icons will be set by the layout render
};

const INITIAL_SCHOOL_NOTIFICATIONS = [
  {
    id: "SN1",
    title: "Yêu cầu duyệt cấp bằng mới",
    desc: "Khoa Công nghệ thông tin gửi danh sách 12 sinh viên đủ điều kiện tốt nghiệp lớp CNTT-01 K65 để phê duyệt.",
    time: "2 giờ trước",
    type: "issue",
    unread: true
  },
  {
    id: "SN2",
    title: "Giao dịch Blockchain hoàn tất",
    desc: "Đã ghi nhận thành công mã băm văn bằng tốt nghiệp cho 45 sinh viên lớp CNTT-01 lên Blockchain Polygon.",
    time: "1 ngày trước",
    type: "blockchain",
    unread: true
  },
  {
    id: "SN3",
    title: "Cảnh báo bảo mật ví MetaMask",
    desc: "Đã kết nối ví MetaMask mới (địa chỉ 0xA3f2...9b7e) với tư cách Cán bộ đào tạo Lê Hoài Nam.",
    time: "3 ngày trước",
    type: "alert",
    unread: true
  },
  {
    id: "SN4",
    title: "Sao lưu cơ sở dữ liệu",
    desc: "Hệ thống đã tự động sao lưu toàn bộ dữ liệu văn bằng và nhật ký hệ thống định kỳ tuần này.",
    time: "5 ngày trước",
    type: "blockchain",
    unread: false
  }
];

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('school_notifications');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('school_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleClearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadNotifsCount = notifications.filter(n => n.unread).length;

  const userRole = localStorage.getItem('userRole') || 'school';
  const isOfficer = userRole === 'officer';

  // Filter menu groups based on role
  const filteredMenuGroups = MENU_GROUPS.map(group => {
    if (isOfficer && group.title === 'Hệ thống') {
      return {
        ...group,
        items: group.items.filter(item => !['users', 'roles', 'settings', 'logs'].includes(item.id))
      };
    }
    return group;
  });

  const handleCopyWallet = () => {
    navigator.clipboard.writeText('0xA3f2d9b7eC81452D819280dEAc429e');
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SchoolOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case 'certificates':
        return <SchoolCertificates onNavigate={(tab) => setActiveTab(tab)} />;
      case 'students':
        return <SchoolStudents onNavigate={(tab) => setActiveTab(tab)} />;
      case 'program':
        return <SchoolPrograms onNavigate={(tab) => setActiveTab(tab)} />;
      case 'schools':
        return <AdminSchools onNavigate={(tab) => setActiveTab(tab)} />;
      case 'verify-certificates':
        return <SchoolVerifyCertificates onNavigate={(tab) => setActiveTab(tab)} />;
      case 'stats':
        return <SchoolStats onNavigate={(tab) => setActiveTab(tab)} />;
      case 'history':
        return <SchoolHistory onNavigate={(tab) => setActiveTab(tab)} />;
      case 'reports':
        return <SchoolReports onNavigate={(tab) => setActiveTab(tab)} />;
      case 'users':
        return <SchoolUsers onNavigate={(tab) => setActiveTab(tab)} />;
      case 'roles':
        return <SchoolRoles onNavigate={(tab) => setActiveTab(tab)} />;
      case 'settings':
        return <SchoolSettings onNavigate={(tab) => setActiveTab(tab)} />;
      case 'logs':
        return <SchoolLogs onNavigate={(tab) => setActiveTab(tab)} />;
      case 'profile':
        return <SchoolProfile onNavigate={(tab) => setActiveTab(tab)} />;
      case 'notifications':
        return (
          <SchoolNotifications 
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearNotification={handleClearNotification}
          />
        );
      default:
        return <div>Tab không hợp lệ.</div>;
    }
  };

  return (
    <div className="sd-layout">
      {/* ── SIDEBAR ── */}
      <aside className={`sd-sidebar ${collapsed ? 'collapsed' : ''} ${menuActive ? 'active' : ''}`}>
        <div className="sd-sidebar-header">
          <div className="sd-logo-icon">
            <FaShieldAlt />
          </div>
          <div className="sd-logo-text">
            Quy chế & Xác thực<br />
            <span style={{ fontSize: '10px', color: '#64748b' }}>Văn bằng số</span>
          </div>
          {menuActive && (
            <button className="sd-collapse-btn" style={{ marginLeft: 'auto' }} onClick={() => setMenuActive(false)}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="sd-sidebar-content">
          {filteredMenuGroups.map((group, gIdx) => (
            <div key={gIdx} className="sd-menu-group">
              <div className="sd-group-title">{group.title}</div>
              {group.items.map((item) => (
                <div 
                  key={item.id}
                  className={`sd-menu-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMenuActive(false);
                  }}
                >
                  <span className="sd-menu-icon">{item.icon}</span>
                  <span className="sd-menu-label">{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Blockchain Status Box */}
        <div className="sd-blockchain-card">
          <div className="sd-bc-header">
            <div className="sd-bc-logo"><FaShieldAlt /></div>
            <div>
              <div className="sd-bc-title">Blockchain</div>
              <div className="sd-bc-status">
                <span className="sd-bc-dot"></span>
                <span>Đã kết nối</span>
              </div>
            </div>
          </div>
          <div className="sd-bc-details">
            <div className="sd-bc-detail-row">
              <span>Mạng lưới:</span>
              <span className="sd-bc-detail-val">Polygon Mainnet</span>
            </div>
            <div className="sd-bc-detail-row">
              <span>Địa chỉ ví:</span>
              <span className="sd-bc-detail-val" style={{ cursor: 'pointer' }} onClick={handleCopyWallet} title="Bấm để sao chép">
                {copiedWallet ? 'Đã copy!' : '0xA3f2...9b7e'}
              </span>
            </div>
          </div>
          <button className="sd-bc-btn">Xem chi tiết</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="sd-main">
        {/* Header */}
        <header className="sd-header">
          <div className="sd-header-left">
            <button className="sd-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              <FaBars />
            </button>
            <button className="sd-btn-secondary" style={{ display: 'none' }} onClick={() => setMenuActive(true)}>
              <FaBars />
            </button>
          </div>

          <div className="sd-header-right">
            <div className="sd-notify-menu-container" style={{ position: 'relative' }}>
              <button className="sd-notify-btn" onClick={() => { setShowNotifyDropdown(!showNotifyDropdown); setShowUserDropdown(false); }}>
                <FaBell />
                {unreadNotifsCount > 0 && <span className="sd-notify-badge">{unreadNotifsCount}</span>}
              </button>

              {showNotifyDropdown && (
                <div className="sd-notif-dropdown">
                  <div className="sd-notif-dropdown-header">
                    <span className="sd-notif-dropdown-title">Thông báo mới</span>
                    {unreadNotifsCount > 0 && (
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
            
            <div className="sd-user-menu-container">
              <div className="sd-user-menu" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                <img 
                  src={isOfficer ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
                  alt="Avatar" 
                  className="sd-user-avatar" 
                />
                <div className="sd-user-info">
                  <span className="sd-user-name">{isOfficer ? 'Lê Hoài Nam' : 'Nguyễn Văn An'}</span>
                  <span className="sd-user-role">{isOfficer ? 'Cán bộ đào tạo' : 'Quản trị viên'}</span>
                </div>
                <FaChevronDown className="sd-user-chevron" />
              </div>

              {showUserDropdown && (
                <div className="sd-dropdown">
                  <div className="sd-dropdown-item" onClick={() => { setActiveTab('profile'); setShowUserDropdown(false); }}>
                    <FaUser className="sd-menu-icon" />
                    <span>Hồ sơ cá nhân</span>
                  </div>
                  <div className="sd-dropdown-item" onClick={() => { setActiveTab('profile'); setShowUserDropdown(false); }}>
                    <FaLock className="sd-menu-icon" />
                    <span>Đổi mật khẩu</span>
                  </div>
                  {!isOfficer && (
                    <div className="sd-dropdown-item" onClick={() => { setActiveTab('settings'); setShowUserDropdown(false); }}>
                      <FaCog className="sd-menu-icon" />
                      <span>Cài đặt</span>
                    </div>
                  )}
                  <div className="sd-dropdown-divider"></div>
                  <div className="sd-dropdown-item logout" onClick={() => { navigate('/login'); setShowUserDropdown(false); }}>
                    <FaSignOutAlt className="sd-menu-icon" />
                    <span>Đăng xuất</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="sd-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
