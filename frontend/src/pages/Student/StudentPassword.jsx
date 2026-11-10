import React, { useState } from 'react';
import {
  FaEye,
  FaEyeSlash,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { api } from '../../services/api';

const StudentPassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const togglePasswordVisibility = (field) => {
    setVisiblePasswords((current) => ({
      ...current,
      [field]: !current[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setToastMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('Mật khẩu mới phải chứa ít nhất 8 ký tự.');
      window.setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu mới không khớp.');
      window.setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    if (newPassword === oldPassword) {
      setErrorMsg('Mật khẩu mới phải khác mật khẩu hiện tại.');
      window.setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.changePassword({
        current_password: oldPassword,
        new_password: newPassword
      });
      if (!response?.success) {
        throw new Error(response?.message || 'Không thể đổi mật khẩu.');
      }

      setToastMsg(response.message || 'Đổi mật khẩu thành công.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      window.setTimeout(() => setToastMsg(''), 3000);
    } catch (error) {
      console.error('Không thể đổi mật khẩu sinh viên:', error);
      setErrorMsg(error.message || 'Không thể kết nối đến máy chủ.');
      window.setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsSubmitting(false);
    }
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
        <form onSubmit={handleSubmit}>
          <div className="std-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="std-form-group">
              <label htmlFor="student-current-password">Mật khẩu hiện tại *</label>
              <div className="std-password-input-wrap">
                <input
                  id="student-current-password"
                  type={visiblePasswords.current ? 'text' : 'password'}
                  className="std-input"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="std-password-visibility"
                  onClick={() => togglePasswordVisibility('current')}
                  aria-label={visiblePasswords.current ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'}
                  aria-pressed={visiblePasswords.current}
                  disabled={isSubmitting}
                >
                  {visiblePasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="std-form-group">
              <label htmlFor="student-new-password">Mật khẩu mới *</label>
              <div className="std-password-input-wrap">
                <input
                  id="student-new-password"
                  type={visiblePasswords.new ? 'text' : 'password'}
                  className="std-input"
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="std-password-visibility"
                  onClick={() => togglePasswordVisibility('new')}
                  aria-label={visiblePasswords.new ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                  aria-pressed={visiblePasswords.new}
                  disabled={isSubmitting}
                >
                  {visiblePasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="std-form-group">
              <label htmlFor="student-confirm-password">Xác nhận mật khẩu mới *</label>
              <div className="std-password-input-wrap">
                <input
                  id="student-confirm-password"
                  type={visiblePasswords.confirm ? 'text' : 'password'}
                  className="std-input"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="std-password-visibility"
                  onClick={() => togglePasswordVisibility('confirm')}
                  aria-label={visiblePasswords.confirm ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
                  aria-pressed={visiblePasswords.confirm}
                  disabled={isSubmitting}
                >
                  {visiblePasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="std-btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaLock /> {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="std-toast success" role="status" aria-live="polite">
          <FaCheckCircle /> {toastMsg}
        </div>
      )}
      {errorMsg && (
        <div className="std-toast error" role="alert" aria-live="assertive">
          <FaExclamationTriangle /> {errorMsg}
        </div>
      )}
    </div>
  );
};

export default StudentPassword;
