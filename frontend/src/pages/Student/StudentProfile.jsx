import React, { useState } from 'react';
import { FaPlus, FaSave, FaCheckCircle } from 'react-icons/fa';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
];

const StudentProfile = ({ profileData = {}, onUpdateProfile = () => {} }) => {
  const [email, setEmail] = useState(profileData.email || '');
  const [phone, setPhone] = useState(profileData.phone || '');
  const [avatar, setAvatar] = useState(profileData.avatar || PRESET_AVATARS[0]);
  const [showPresets, setShowPresets] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (url) => {
    setAvatar(url);
    setShowPresets(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({ email, phone, avatar });
    showToast('Cập nhật hồ sơ cá nhân thành công!');
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="std-view">
      <div className="std-page-header">
        <div className="std-page-title-area">
          <h2>Hồ sơ cá nhân</h2>
          <p>Xem thông tin học tập và cập nhật thông tin liên hệ của bạn.</p>
        </div>
      </div>

      <div className="std-profile-wrapper">
        {/* Left: Avatar & quick info */}
        <div className="std-profile-avatar-card">
          <div className="std-profile-avatar-container">
            <img src={avatar} alt="Avatar" className="std-profile-avatar" />
            <label className="std-profile-avatar-upload" htmlFor="avatar-file-input">
              <FaPlus />
            </label>
            <input 
              id="avatar-file-input" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleAvatarChange} 
            />
          </div>
          
          <div className="std-profile-name">{profileData.name}</div>
          <div className="std-profile-id">MSSV: {profileData.id}</div>
          <div className="std-profile-role">Sinh viên</div>

          <button 
            className="std-btn-secondary" 
            style={{ marginTop: '20px', fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setShowPresets(!showPresets)}
          >
            Chọn ảnh mẫu có sẵn
          </button>

          {showPresets && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
              {PRESET_AVATARS.map((url, index) => (
                <img 
                  key={index} 
                  src={url} 
                  alt={`preset-${index}`} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: avatar === url ? '2px solid #4f46e5' : '1px solid #e2e8f0' }}
                  onClick={() => selectPreset(url)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Personal Info Form */}
        <div className="std-card" style={{ marginBottom: 0 }}>
          <form onSubmit={handleSubmit}>
            <div className="std-form-grid">
              <div className="std-form-group">
                <label>Họ và tên</label>
                <input type="text" className="std-input" value={profileData.name} disabled />
              </div>
              
              <div className="std-form-group">
                <label>Mã số sinh viên (MSSV)</label>
                <input type="text" className="std-input" value={profileData.id} disabled />
              </div>

              <div className="std-form-group">
                <label>Lớp học</label>
                <input type="text" className="std-input" value={profileData.class} disabled />
              </div>

              <div className="std-form-group">
                <label>Ngành học</label>
                <input type="text" className="std-input" value={profileData.major} disabled />
              </div>

              <div className="std-form-group">
                <label>Khoa đào tạo</label>
                <input type="text" className="std-input" value={profileData.department} disabled style={{ gridColumn: 'span 2' }} />
              </div>

              <div className="std-form-group">
                <label>Địa chỉ Email liên hệ *</label>
                <input 
                  type="email" 
                  className="std-input" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                />
              </div>

              <div className="std-form-group">
                <label>Số điện thoại liên hệ *</label>
                <input 
                  type="text" 
                  className="std-input" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="std-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaSave /> Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="std-toast success">
          <FaCheckCircle /> {toastMsg}
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
