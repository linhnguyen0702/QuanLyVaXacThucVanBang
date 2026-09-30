import React, { useState, useRef } from 'react';
import { 
  FaUser, FaLock, FaKey, FaCamera, 
  FaCheck, FaLaptop, FaCopy, FaEdit, FaTimes 
} from 'react-icons/fa';

const SchoolProfile = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const fileInputRef = useRef(null);

  // Account Form State (Saved to localStorage)
  const [accountForm, setAccountForm] = useState(() => {
    const saved = localStorage.getItem('user_profile_data');
    return saved ? JSON.parse(saved) : {
      fullName: localStorage.getItem('userName') || 'Nguyễn Văn An',
      email: 'annv@school.edu.vn',
      phone: '0368 251 814',
      address: 'Số 144 Xuân Thủy, Cầu Giấy, Hà Nội',
      department: 'Phòng Đào tạo',
      position: 'Quản trị viên Hệ thống Văn bằng số',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleStartEdit = (e) => {
    if (e) e.preventDefault();
    setTempAccountForm({ ...accountForm });
    setIsEditingAccount(true);
    showToast('Đã mở khóa các trường. Bạn có thể nhập thông tin chỉnh sửa!');
  };

  const handleCancelEdit = () => {
    setTempAccountForm({ ...accountForm });
    setIsEditingAccount(false);
  };

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    if (!isEditingAccount) return;
    setAccountForm({ ...tempAccountForm });
    localStorage.setItem('user_profile_data', JSON.stringify(tempAccountForm));
    localStorage.setItem('userName', tempAccountForm.fullName);
    setIsEditingAccount(false);
    showToast('Cập nhật hồ sơ thành công!');
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

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      alert('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu mới và nhập lại mật khẩu không khớp!');
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Đổi mật khẩu thành công! Vui lòng bảo mật thông tin.');
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText('0xA3f2d9b7eC81452D819280dEAc429e81');
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
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Địa chỉ ví quản trị cấp bằng Polygon</h4>
            
            <div className="sd-detail-card" style={{ background: '#f0f7ff', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="sd-detail-label">Mạng lưới: Polygon Mainnet</span>
                  <div className="sd-detail-value" style={{ fontSize: '16px', fontFamily: 'monospace', marginTop: '4px' }}>
                    0xA3f2d9b7eC81452D819280dEAc429e81
                  </div>
                </div>
                <button type="button" className="sd-btn-secondary" onClick={handleCopyWallet}>
                  <FaCopy /> {copied ? 'Đã sao chép!' : 'Sao chép'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                Địa chỉ ví này được cấp quyền Ký duyệt điện tử (Digital Signature) trên hợp đồng thông minh. Mỗi bằng tốt nghiệp phát hành sẽ được ký trực tiếp bởi ví quản trị nhà trường.
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
