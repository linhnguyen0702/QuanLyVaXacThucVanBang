import React, { useState } from 'react';
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
import SchoolStats from './SchoolStats';
import SchoolHistory from './SchoolHistory';
import SchoolReports from './SchoolReports';
import SchoolUsers from './SchoolUsers';
import SchoolRoles from './SchoolRoles';
import SchoolSettings from './SchoolSettings';
import SchoolLogs from './SchoolLogs';
import SchoolProfile from './SchoolProfile';

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
      { id: 'program', label: 'Chương trình đào tạo', icon: <FaBook /> }
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
      { id: 'profile', label: 'Hồ sơ cá nhân', icon: <FaUser /> }
    ]
  }
];

// Let's dynamically map menu group icons for consistency with sidebars
const getMenuIcon = (id) => {
  return null; // The icons will be set by the layout render
};

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText('0xA3f2d9b7eC81452D819280dEAc429e');
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SchoolOverview />;
      case 'certificates':
        return <SchoolCertificates />;
      case 'students':
        return <SchoolStudents />;
      case 'program':
        return <SchoolPrograms />;
      case 'stats':
        return <SchoolStats />;
      case 'history':
        return <SchoolHistory />;
      case 'reports':
        return <SchoolReports />;
      case 'users':
        return <SchoolUsers />;
      case 'roles':
        return <SchoolRoles />;
      case 'settings':
        return <SchoolSettings />;
      case 'logs':
        return <SchoolLogs />;
      case 'profile':
        return <SchoolProfile />;
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
          {MENU_GROUPS.map((group, gIdx) => (
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
            <button className="sd-notify-btn">
              <FaBell />
              <span className="sd-notify-badge">3</span>
            </button>
            
            <div className="sd-user-menu-container">
              <div className="sd-user-menu" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
                  alt="Avatar" 
                  className="sd-user-avatar" 
                />
                <div className="sd-user-info">
                  <span className="sd-user-name">Nguyễn Văn An</span>
                  <span className="sd-user-role">Quản trị viên</span>
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
                  <div className="sd-dropdown-item" onClick={() => { setActiveTab('settings'); setShowUserDropdown(false); }}>
                    <FaCog className="sd-menu-icon" />
                    <span>Cài đặt</span>
                  </div>
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
