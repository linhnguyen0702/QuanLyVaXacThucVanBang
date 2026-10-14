import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUser, FaLock, FaKey, FaCamera, 
  FaCheck, FaLaptop, FaCopy, FaEdit, FaTimes 
} from 'react-icons/fa';
import { api } from '../../services/api';

const SchoolProfile = ({ onUserUpdated }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const fileInputRef = useRef(null);

  const getCurrentUser = () => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  // Account Form State (Saved to localStorage & synchronized with logged-in user)
  const [accountForm, setAccountForm] = useState(() => {
    const loggedUser = getCurrentUser();
    let savedProfile = null;
    try {
      const saved = localStorage.getItem('user_profile_data');
      if (saved) savedProfile = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    const email = (loggedUser && loggedUser.email) || (savedProfile && savedProfile.email && savedProfile.email !== 'annv@school.edu.vn' ? savedProfile.email : 'admin@school.edu.vn');
    const fullName = (savedProfile && savedProfile.fullName) || (loggedUser && loggedUser.full_name) || localStorage.getItem('userName') || 'Nguyễn Văn An';
    const phone = (savedProfile && savedProfile.phone) || (loggedUser && loggedUser.phone) || '0368 251 814';
    const address = (savedProfile && savedProfile.address) || (loggedUser && loggedUser.address) || 'Số 144 Xuân Thủy, Cầu Giấy, Hà Nội';
    const department = (savedProfile && savedProfile.department) || (loggedUser && loggedUser.department) || 'Phòng Đào tạo';
    const position = (savedProfile && savedProfile.position) || (loggedUser && loggedUser.position) || 'Quản trị viên Hệ thống Văn bằng số';
    const avatar = (savedProfile && savedProfile.avatar) || (loggedUser && loggedUser.avatar_url) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
    const wallet = (loggedUser && loggedUser.wallet_address) || '';

    return {
      fullName,
      email,
      phone,
      address,
      department,
      position,
      avatar,
      wallet
    };
  });

  // Edit Buffer State
  const [tempAccountForm, setTempAccountForm] = useState({ ...accountForm });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Synchronize with logged in user whenever component mounts
  useEffect(() => {
    try {
      const u = getCurrentUser();
      if (u && u.email) {
        setAccountForm(prev => {
          const updated = {
            ...prev,
            email: u.email,
            fullName: prev.fullName || u.full_name || 'Nguyễn Văn An',
            phone: prev.phone || u.phone || '0368 251 814',
            department: prev.department || u.department || 'Phòng Đào tạo',
            position: prev.position || u.position || 'Quản trị viên Hệ thống Văn bằng số',
            wallet: u.wallet_address || ''
          };
          localStorage.setItem('user_profile_data', JSON.stringify(updated));
          return updated;
        });
        setTempAccountForm(prev => ({
          ...prev,
          email: u.email,
          fullName: prev.fullName || u.full_name || 'Nguyễn Văn An',
          phone: prev.phone || u.phone || '0368 251 814',
          department: prev.department || u.department || 'Phòng Đào tạo',
          position: prev.position || u.position || 'Quản trị viên Hệ thống Văn bằng số',
          wallet: u.wallet_address || ''
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleStartEdit = (e) => {
    if (e) e.preventDefault();
    setTempAccountForm({ ...accountForm });
    setIsEditingAccount(true);
    showToast('Bạn có thể nhập thông tin chỉnh sửa!');
  };

  const handleCancelEdit = () => {
    setTempAccountForm({ ...accountForm });
    setIsEditingAccount(false);
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (!isEditingAccount) return;

    try {
      // 1. Gửi dữ liệu cập nhật trực tiếp vào cơ sở dữ liệu MySQL
      const res = await api.updateProfile({
        full_name: tempAccountForm.fullName,
        phone: tempAccountForm.phone,
        department: tempAccountForm.department,
        position: tempAccountForm.position,
        address: tempAccountForm.address,
        avatar_url: tempAccountForm.avatar
      });

      let updatedUser = null;
      if (res && res.success && res.user) {
        updatedUser = res.user;
      } else {
        const oldUser = getCurrentUser() || {};
        updatedUser = {
          ...oldUser,
          full_name: tempAccountForm.fullName,
          phone: tempAccountForm.phone,
          department: tempAccountForm.department,
          position: tempAccountForm.position,
          address: tempAccountForm.address,
          avatar_url: tempAccountForm.avatar
        };
      }

      // 2. Cập nhật bộ nhớ phiên đăng nhập (localStorage)
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('userName', updatedUser.full_name || tempAccountForm.fullName);
      localStorage.setItem('user_profile_data', JSON.stringify({
        fullName: updatedUser.full_name || tempAccountForm.fullName,
        email: updatedUser.email || tempAccountForm.email,
        phone: updatedUser.phone || tempAccountForm.phone,
        address: updatedUser.address || tempAccountForm.address,
        department: updatedUser.department || tempAccountForm.department,
        position: updatedUser.position || tempAccountForm.position,
        avatar: updatedUser.avatar_url || tempAccountForm.avatar,
        wallet: updatedUser.wallet_address || ''
      }));

      // 3. Cập nhật state hiển thị của hồ sơ
      setAccountForm({
        fullName: updatedUser.full_name || tempAccountForm.fullName,
        email: updatedUser.email || tempAccountForm.email,
        phone: updatedUser.phone || tempAccountForm.phone,
        address: updatedUser.address || tempAccountForm.address,
        department: updatedUser.department || tempAccountForm.department,
        position: updatedUser.position || tempAccountForm.position,
        avatar: updatedUser.avatar_url || tempAccountForm.avatar,
        wallet: updatedUser.wallet_address || ''
      });

      // 4. Đồng bộ thanh Header và thông báo toàn cục
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
      window.dispatchEvent(new Event('user_profile_updated'));

      setIsEditingAccount(false);
      showToast('Cập nhật hồ sơ thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật hồ sơ:', err);
      showToast('Không thể kết nối máy chủ để lưu vào CSDL!');
    }
  };

  // Avatar file upload simulation
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAccountForm(prev => ({ ...prev, avatar: reader.result }));
        if (!isEditingAccount) setIsEditingAccount(true);
        showToast('Đã chọn ảnh đại diện mới!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      alert('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu mới và nhập lại mật khẩu không khớp!');
      return;
    }
    try {
      const res = await api.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });

      if (res && res.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showToast('Đổi mật khẩu thành công và đã lưu vào CSDL!');
      } else {
        alert(res.message || 'Mật khẩu hiện tại không chính xác.');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  const handleCopyWallet = () => {
    const w = accountForm.wallet;
    if (!w) return;
    navigator.clipboard.writeText(w);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Hồ sơ cá nhân</h2>
          <p>Cập nhật thông tin tài khoản và mật khẩu của bạn</p>
        </div>
      </div>

      {/* Hidden File Input for Avatar */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleAvatarFileChange} 
      />

      {/* Main Profile Card */}
      <div className="sd-card">
        
        {/* Avatar & Header Profile Info */}
        <div className="sd-profile-header">
          <div className="sd-profile-avatar-container">
            <img 
              src={isEditingAccount ? tempAccountForm.avatar : accountForm.avatar} 
              alt="Avatar" 
              className="sd-profile-avatar" 
            />
            <div 
              className="sd-profile-avatar-upload" 
              title="Đổi ảnh đại diện" 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <FaCamera />
            </div>
          </div>
          <div className="sd-profile-name-role">
            <h3>{isEditingAccount ? tempAccountForm.fullName : accountForm.fullName}</h3>
            <p>{isEditingAccount ? tempAccountForm.position : accountForm.position} - {isEditingAccount ? tempAccountForm.department : accountForm.department}</p>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px' }}>
          <button 
            type="button"
            className={`sd-btn-secondary ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
            style={{ backgroundColor: activeTab === 'account' ? '#0f4cf5' : '#ffffff', color: activeTab === 'account' ? '#ffffff' : '#475569' }}
          >
            <FaUser /> Thông tin cá nhân
          </button>
          <button 
            type="button"
            className={`sd-btn-secondary ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
            style={{ backgroundColor: activeTab === 'security' ? '#0f4cf5' : '#ffffff', color: activeTab === 'security' ? '#ffffff' : '#475569' }}
          >
            <FaLock /> Bảo mật & Mật khẩu
          </button>
          <button 
            type="button"
            className={`sd-btn-secondary ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
            style={{ backgroundColor: activeTab === 'wallet' ? '#0f4cf5' : '#ffffff', color: activeTab === 'wallet' ? '#ffffff' : '#475569' }}
          >
            <FaKey /> Ví Blockchain
          </button>
        </div>

        {/* Tab 1: Account Information */}
        {activeTab === 'account' && (
          <form onSubmit={handleAccountSubmit}>
            <div className="sd-form-grid">
              <div className="sd-form-group">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  className="sd-input" 
                  disabled={!isEditingAccount}
                  value={isEditingAccount ? tempAccountForm.fullName : accountForm.fullName} 
                  onChange={(e) => setTempAccountForm({...tempAccountForm, fullName: e.target.value})} 
                  style={{ backgroundColor: isEditingAccount ? '#ffffff' : '#f8fafc', borderColor: isEditingAccount ? '#0f4cf5' : '#cbd5e1' }}
                />
              </div>
              <div className="sd-form-group">
                <label>Địa chỉ Email</label>
                <input 
                  type="email" 
                  className="sd-input" 
                  disabled 
                  value={accountForm.email} 
                  style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>
              <div className="sd-form-group">
                <label>Số điện thoại</label>
                <input 
                  type="text" 
                  className="sd-input" 
                  disabled={!isEditingAccount}
                  value={isEditingAccount ? tempAccountForm.phone : accountForm.phone} 
                  onChange={(e) => setTempAccountForm({...tempAccountForm, phone: e.target.value})} 
                  style={{ backgroundColor: isEditingAccount ? '#ffffff' : '#f8fafc', borderColor: isEditingAccount ? '#0f4cf5' : '#cbd5e1' }}
                />
              </div>
              <div className="sd-form-group">
                <label>Bộ phận công tác</label>
                <input 
                  type="text" 
                  className="sd-input" 
                  disabled={!isEditingAccount}
                  value={isEditingAccount ? tempAccountForm.department : accountForm.department} 
                  onChange={(e) => setTempAccountForm({...tempAccountForm, department: e.target.value})} 
                  style={{ backgroundColor: isEditingAccount ? '#ffffff' : '#f8fafc', borderColor: isEditingAccount ? '#0f4cf5' : '#cbd5e1' }}
                />
              </div>
              <div className="sd-form-group full-width">
                <label>Địa chỉ công tác</label>
                <input 
                  type="text" 
                  className="sd-input" 
                  disabled={!isEditingAccount}
                  value={isEditingAccount ? tempAccountForm.address : accountForm.address} 
                  onChange={(e) => setTempAccountForm({...tempAccountForm, address: e.target.value})} 
                  style={{ backgroundColor: isEditingAccount ? '#ffffff' : '#f8fafc', borderColor: isEditingAccount ? '#0f4cf5' : '#cbd5e1' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              {!isEditingAccount ? (
                <button type="button" className="sd-btn-primary" onClick={handleStartEdit}>
                  <FaEdit /> Chỉnh sửa hồ sơ
                </button>
              ) : (
                <>
                  <button type="submit" className="sd-btn-primary">
                    <FaCheck /> Cập nhật hồ sơ
                  </button>
                  <button type="button" className="sd-btn-secondary" onClick={handleCancelEdit}>
                    <FaTimes /> Hủy
                  </button>
                </>
              )}
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <div>
            <form onSubmit={handlePasswordSubmit}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Đổi mật khẩu truy cập</h4>
              <div className="sd-form-grid">
                <div className="sd-form-group full-width">
                  <label>Mật khẩu hiện tại *</label>
                  <input 
                    type="password" 
                    className="sd-input" 
                    required 
                    placeholder="••••••••"
                    value={passwordForm.currentPassword} 
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                  />
                </div>
                <div className="sd-form-group">
                  <label>Mật khẩu mới *</label>
                  <input 
                    type="password" 
                    className="sd-input" 
                    required 
                    placeholder="Tối thiểu 8 ký tự"
                    value={passwordForm.newPassword} 
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                  />
                </div>
                <div className="sd-form-group">
                  <label>Xác nhận mật khẩu mới *</label>
                  <input 
                    type="password" 
                    className="sd-input" 
                    required 
                    placeholder="Nhập lại mật khẩu mới"
                    value={passwordForm.confirmPassword} 
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                  />
                </div>
              </div>
              <button type="submit" className="sd-btn-primary" style={{ marginTop: '16px' }}>
                <FaLock /> Đổi mật khẩu
              </button>
            </form>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaLaptop /> Lịch sử thiết bị & Phiên đăng nhập
              </h4>
              <div className="sd-table-container">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Thiết bị / Trình duyệt</th>
                      <th>Địa chỉ IP</th>
                      <th>Thời gian</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="sd-td-bold">Chrome 128 (Windows 11)</td>
                      <td>192.168.1.45</td>
                      <td>Hôm nay, 14:05</td>
                      <td><span className="sd-badge green">Phiên hiện tại</span></td>
                    </tr>
                    <tr>
                      <td className="sd-td-bold">Safari (iPhone 15 Pro)</td>
                      <td>14.162.18.90</td>
                      <td>Hôm qua, 09:12</td>
                      <td><span className="sd-badge gray">Đã kết thúc</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Wallet Connection */}
        {activeTab === 'wallet' && (
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Ví Blockchain đã liên kết</h4>
            
            <div className="sd-detail-card" style={{ background: '#f0f7ff', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="sd-detail-label">Mạng lưới: Ethereum Sepolia</span>
                  <div className="sd-detail-value" style={{ fontSize: '16px', fontFamily: 'monospace', marginTop: '4px' }}>
                    {accountForm.wallet || 'Chưa kết nối ví'}
                  </div>
                </div>
                <button type="button" className="sd-btn-secondary" onClick={handleCopyWallet}>
                  <FaCopy /> {copied ? 'Đã sao chép!' : 'Sao chép'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                Địa chỉ ví đã liên kết cố định với tài khoản này. Mỗi tài khoản chỉ có thể sử dụng một địa chỉ ví.
              </p>
            </div>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="sd-toast success">
          <FaCheck /> {toastMessage}
        </div>
      )}
    </div>
  );
};

export default SchoolProfile;
