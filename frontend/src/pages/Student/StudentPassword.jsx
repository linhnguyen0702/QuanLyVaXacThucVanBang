import React, { useState } from 'react';
import { FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const StudentPassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    // Success simulation
    setToastMsg('Thay đổi mật khẩu thành công!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="std-view">
      <div className="std-page-header">
        <div className="std-page-title-area">
          <h2>Đổi mật khẩu</h2>
          <p>Thay đổi mật khẩu đăng nhập tài khoản của bạn để nâng cao tính bảo mật.</p>
        </div>
      </div>

      <div className="std-card" style={{ maxWidth: '600px' }}>
        {errorMsg && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fee2e2', 
            color: '#ef4444', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaExclamationTriangle /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="std-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="std-form-group">
              <label>Mật khẩu hiện tại *</label>
              <input 
                type="password" 
                className="std-input" 
                placeholder="Nhập mật khẩu hiện tại"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="std-form-group">
              <label>Mật khẩu mới *</label>
              <input 
                type="password" 
                className="std-input" 
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="std-form-group">
              <label>Xác nhận mật khẩu mới *</label>
              <input 
                type="password" 
                className="std-input" 
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="std-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaLock /> Cập nhật mật khẩu
            </button>
          </div>
        </form>
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

export default StudentPassword;
