import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaShieldAlt, FaBell, FaChevronDown, FaBars, FaTimes,
  FaChartPie, FaList, FaUserGraduate, FaBook, FaHistory,
  FaFileAlt, FaCog, FaDatabase, FaUser, FaLock, FaSignOutAlt, FaUniversity
} from 'react-icons/fa';
import './SchoolDashboard.css';
import { WalletConnectButton } from '../../components/WalletConnection/WalletConnection';
import { api } from '../../services/api';

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

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const saved = localStorage.getItem('user');
        if (saved) setCurrentUser(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('user_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('user_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.getNotifications();
      if (!response || !response.success) {
        throw new Error(response?.message || 'Không thể tải thông báo.');
      }
      setNotifications(response.notifications || []);
      setNotificationError('');
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      setNotificationError(error.message || 'Không thể kết nối máy chủ để tải thông báo.');
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const timer = window.setInterval(fetchNotifications, 60000);
    return () => window.clearInterval(timer);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await api.markNotificationRead(id);
      if (!response || !response.success) throw new Error(response?.message || 'Không thể cập nhật thông báo.');
      setNotificationError('');
      setNotifications((current) => current.map((notification) => (
        notification.id === id ? { ...notification, unread: false } : notification
      )));
    } catch (error) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
      setNotificationError(error.message || 'Không thể cập nhật thông báo.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await api.markAllNotificationsRead();
      if (!response || !response.success) throw new Error(response?.message || 'Không thể cập nhật thông báo.');
      setNotificationError('');
      setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })));
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
      setNotificationError(error.message || 'Không thể cập nhật thông báo.');
    }
  };

  const handleClearNotification = async (id) => {
    try {
      const response = await api.dismissNotification(id);
      if (!response || !response.success) throw new Error(response?.message || 'Không thể ẩn thông báo.');
      setNotificationError('');
      setNotifications((current) => current.filter((notification) => notification.id !== id));
    } catch (error) {
      console.error('Lỗi khi ẩn thông báo:', error);
      setNotificationError(error.message || 'Không thể ẩn thông báo.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const unreadNotifsCount = notifications.filter(n => n.unread).length;
  const userRole = (currentUser && currentUser.role) || localStorage.getItem('userRole') || 'school';
  const isOfficer = userRole === 'officer';

  const filteredMenuGroups = MENU_GROUPS.map(group => {
    if (isOfficer && group.title === 'Hệ thống') {
      return {
        ...group,
        items: group.items.filter(item => !['users', 'roles', 'settings', 'logs'].includes(item.id))
      };
    }
    return group;
  });

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
        return <SchoolVerifyCertificates onNavigate={(tab) => setActiveTab(tab)} walletAddress={currentUser && currentUser.wallet_address} />;
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
        return <SchoolProfile onNavigate={(tab) => setActiveTab(tab)} onUserUpdated={(u) => setCurrentUser(u)} />;
      case 'notifications':
        return (
          <SchoolNotifications 
            notifications={notifications}
            error={notificationError}
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

        <WalletConnectButton user={currentUser} onWalletConnected={setCurrentUser} />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="sd-main">
        {/* Header */}
        <header className="sd-header">
          <div className="sd-header-left">
            <button className="sd-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
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
                    {notificationError && (
                      <div role="alert" style={{ padding: '10px', color: '#b91c1c', fontSize: '12px' }}>
                        {notificationError}
                      </div>
                    )}
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
                            <div className="sd-notif-dropdown-item-time">
                              {notif.time ? new Date(notif.time).toLocaleString('vi-VN') : ''}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                        Không có thông báo mới.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="sd-user-menu-container">
              <div className="sd-user-menu" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                <img 
                  src={(currentUser && currentUser.avatar_url) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
                  alt="Avatar" 
                  className="sd-user-avatar" 
                />
                <div className="sd-user-info">
                  <span className="sd-user-name">{(currentUser && currentUser.full_name) || 'Nguyễn Văn An'}</span>
                  <span className="sd-user-role">
                    {userRole === 'admin' ? 'Quản trị viên' : userRole === 'officer' ? 'Cán bộ đào tạo' : 'Quản lý nhà trường'}
                  </span>
                </div>
                <FaChevronDown className="sd-user-chevron" />
              </div>

              {showUserDropdown && (
                <div className="sd-dropdown">
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '8px 8px 0 0' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                      {(currentUser && currentUser.full_name) || 'Nguyễn Văn An'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      {(currentUser && currentUser.email) || 'linhyang0702@gmail.com'}
                    </div>
                  </div>
                  <div className="sd-dropdown-item" onClick={() => { setActiveTab('profile'); setShowUserDropdown(false); }}>
                    <FaUser className="sd-menu-icon" />
                    <span>Hồ sơ cá nhân</span>
                  </div>
                  <div className="sd-dropdown-item" onClick={() => { setActiveTab('settings'); setShowUserDropdown(false); }}>
                    <FaCog className="sd-menu-icon" />
                    <span>Cài đặt</span>
                  </div>
                  <div className="sd-dropdown-divider"></div>
                  <div className="sd-dropdown-item logout" onClick={handleLogout}>
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
