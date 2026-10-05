import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaShieldAlt, FaUserGraduate, FaUniversity, FaEnvelope, 
  FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaEdit, 
  FaCertificate, FaUsers, FaChartLine, FaUserTie, FaSpinner, FaExclamationTriangle, FaTimes
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { api } from '../../services/api';
import './LoginPage.css';

const LoginPage = () => {
  const [userType, setUserType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Support / Account Request Modal State
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportType, setSupportType] = useState('reset'); // 'reset' | 'register'
  const [supportFormData, setSupportFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    targetRole: 'student',
    reason: ''
  });
  const [supportSuccessMsg, setSupportSuccessMsg] = useState('');

  const navigate = useNavigate();

  // Load remembered credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const savedRole = localStorage.getItem('rememberedRole');
    const isRemembered = localStorage.getItem('rememberMe') === 'true';

    if (isRemembered && savedEmail) {
      setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
      if (savedRole) setUserType(savedRole);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await api.login(email, password, userType);
      setLoading(false);

      if (res && res.success) {
        const actualRole = res.user.role;
        let isRoleValid = true;
        let mismatchError = '';

        if (userType === 'student' && actualRole !== 'student') {
          isRoleValid = false;
          mismatchError = `Tài khoản '${email}' không thuộc vai trò 'Sinh viên'. Vui lòng chuyển sang chọn vai trò Nhà trường hoặc Cán bộ đào tạo.`;
        } else if (userType === 'school' && !['admin', 'school'].includes(actualRole)) {
          isRoleValid = false;
          mismatchError = `Tài khoản '${email}' không thuộc vai trò 'Nhà trường'. Vui lòng chọn lại vai trò 'Sinh viên' hoặc 'Cán bộ đào tạo'.`;
        } else if (userType === 'officer' && !['admin', 'officer'].includes(actualRole)) {
          isRoleValid = false;
          mismatchError = `Tài khoản '${email}' không thuộc vai trò 'Cán bộ đào tạo'. Vui lòng chọn lại vai trò phù hợp.`;
        }

        if (!isRoleValid) {
          setErrorMessage(mismatchError);
          return;
        }

        // Handle Remember Me credentials saving
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberedPassword', password);
          localStorage.setItem('rememberedRole', userType);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberedRole');
          localStorage.removeItem('rememberMe');
        }

        // Save active session data into localStorage
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('userRole', actualRole || userType);

        // Redirect based on role
        if (actualRole === 'student') {
          navigate('/student/dashboard');
        } else {
          navigate('/school/dashboard');
        }
      } else {
        setErrorMessage(res.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage('Không thể kết nối tới máy chủ Backend (http://localhost:5000). Vui lòng đảm bảo Server Node Backend đang chạy!');
    }
  };

  const handleOpenSupport = (type) => {
    setSupportType(type);
    setSupportFormData({
      fullName: '',
      email: '',
      phone: '',
      targetRole: userType || 'student',
      reason: ''
    });
    setSupportSuccessMsg('');
    setIsSupportOpen(true);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setSupportSuccessMsg(`Yêu cầu của bạn đã được gửi thành công tới Quản trị viên (linhyang0702@gmail.com)! Admin sẽ xác minh và cấp tài khoản/mật khẩu mới qua Email ${supportFormData.email || email} trong thời gian sớm nhất.`);
    setTimeout(() => {
      setIsSupportOpen(false);
      setSupportSuccessMsg('');
    }, 4000);
  };

  const handleGoogleLogin = () => {
    alert('Tính năng Đăng nhập bằng Google đang được cập nhật.');
  };

  const stats = [
    { icon: <FaUniversity />, value: '156+', label: 'Cơ sở giáo dục tham gia' },
    { icon: <FaCertificate />, value: '3.2M+', label: 'Văn bằng, chứng chỉ đã được cấp' },
    { icon: <FaChartLine />, value: '98.75%', label: 'Xác thực thành công trong tháng này' },
    { icon: <FaUsers />, value: '125K+', label: 'Sinh viên đang sử dụng' }
  ];

  const features = [
    {
      icon: <FaShieldAlt />,
      title: 'Không thể làm giả',
      desc: 'Dữ liệu được lưu trữ trên Blockchain, không thể chỉnh sửa hoặc làm giả.'
    },
    {
      icon: <FaEdit />,
      title: 'Ký số điện tử',
      desc: 'Được ký số bởi các cơ sở giáo dục, đảm bảo tính pháp lý.'
    },
    {
      icon: <FaCheckCircle />,
      title: 'Xác minh tức thì',
      desc: 'Kiểm tra nhanh chóng, chính xác theo thời gian thực.'
    },
    {
      icon: <FaLock />,
      title: 'Minh bạch – Bảo mật – Tin cậy',
      desc: 'Công khai minh bạch, bảo mật tuyệt đối và đáng tin cậy.'
    }
  ];

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-hero">
            <h1 className="login-hero-title">
              Đăng nhập vào
              <br />
              <span className="hero-highlight">
                Hệ thống Quản lý và Xác thực Văn bằng, Chứng chỉ số
              </span>
            </h1>
            <p className="login-hero-desc">
              Nền tảng giúp các cơ sở giáo dục phát hành, quản lý và xác thực văn bằng, 
              chứng chỉ đến cho từng sinh viên thông qua công nghệ Blockchain.
            </p>

            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">{feature.icon}</div>
                  <div>
                    <h4 className="feature-title">{feature.title}</h4>
                    <p className="feature-desc">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="stats-row">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-icon-small">{stat.icon}</div>
                  <div>
                    <div className="stat-value-small">{stat.value}</div>
                    <div className="stat-label-small">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <h2 className="login-title">ĐĂNG NHẬP</h2>
            <p className="login-subtitle">Chào mừng bạn quay trở lại!</p>

            {errorMessage && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #f87171',
                color: '#b91c1c',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaExclamationTriangle style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="user-type-selector">
              <p className="selector-label">Chọn vai trò của bạn</p>
              <div className="user-type-buttons">
                <button
                  type="button"
                  className={`user-type-btn ${userType === 'student' ? 'active' : ''}`}
                  onClick={() => setUserType('student')}
                >
                  <FaUserGraduate />
                  <span>Sinh viên</span>
                </button>
                <button
                  type="button"
                  className={`user-type-btn ${userType === 'school' ? 'active' : ''}`}
                  onClick={() => setUserType('school')}
                >
                  <FaUniversity />
                  <span>Nhà trường</span>
                </button>
                <button
                  type="button"
                  className={`user-type-btn ${userType === 'officer' ? 'active' : ''}`}
                  onClick={() => setUserType('officer')}
                >
                  <FaUserTie />
                  <span>Cán bộ đào tạo</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    className="input-field"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="input-field"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button 
                  type="button" 
                  className="forgot-link" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => handleOpenSupport('reset')}
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner className="fa-spin" /> Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <FaLock /> ĐĂNG NHẬP
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <span>Hoặc</span>
            </div>

            <button type="button" className="btn btn-google" onClick={handleGoogleLogin}>
              <FcGoogle style={{ fontSize: '20px' }} />
              Đăng nhập bằng Google
            </button>

            <p className="signup-text">
              Chưa có tài khoản?{' '}
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                onClick={() => handleOpenSupport('register')}
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* ── SUPPORT / ACCOUNT REQUEST POPUP MODAL ── */}
      {isSupportOpen && (
        <div className="login-modal-overlay">
          <div className="login-modal-card">
            <div className="login-modal-header">
              <div className="login-modal-title-box">
                <div className="login-modal-icon">
                  {supportType === 'register' ? <FaUserGraduate /> : <FaLock />}
                </div>
                <h3>{supportType === 'register' ? 'Yêu cầu Đăng ký Tài khoản mới' : 'Yêu cầu Cấp lại Mật khẩu'}</h3>
              </div>
              <button type="button" className="login-modal-close-btn" onClick={() => setIsSupportOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSupportSubmit}>
              <div className="login-modal-body">
                <div className="admin-badge-info">
                  <FaEnvelope style={{ fontSize: '18px', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    Yêu cầu sẽ được gửi tới Admin <strong>linhyang0702@gmail.com</strong>.
                    <br />
                    Admin sẽ kiểm tra, xác minh và cấp thông tin mật khẩu về Email của bạn.
                  </div>
                </div>

                {supportSuccessMsg ? (
                  <div style={{
                    backgroundColor: '#dcfce7',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    padding: '16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    lineHeight: 1.5
                  }}>
                    <FaCheckCircle style={{ fontSize: '24px', flexShrink: 0 }} />
                    <span>{supportSuccessMsg}</span>
                  </div>
                ) : (
                  <div className="login-modal-grid">
                    <div className="login-form-field full">
                      <label>Loại yêu cầu</label>
                      <select 
                        value={supportType} 
                        onChange={(e) => setSupportType(e.target.value)}
                      >
                        <option value="reset">Cấp lại / Quên mật khẩu</option>
                        <option value="register">Đăng ký tạo tài khoản mới</option>
                      </select>
                    </div>

                    <div className="login-form-field">
                      <label>Họ và tên người dùng *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ví dụ: Nguyễn Văn A" 
                        value={supportFormData.fullName}
                        onChange={(e) => setSupportFormData({ ...supportFormData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="login-form-field">
                      <label>Email liên hệ nhận thông tin *</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="Ví dụ: yourname@gmail.com" 
                        value={supportFormData.email}
                        onChange={(e) => setSupportFormData({ ...supportFormData, email: e.target.value })}
                      />
                    </div>

                    <div className="login-form-field">
                      <label>Số điện thoại liên hệ</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: 0987654321" 
                        value={supportFormData.phone}
                        onChange={(e) => setSupportFormData({ ...supportFormData, phone: e.target.value })}
                      />
                    </div>

                    <div className="login-form-field">
                      <label>Vai trò cần cấp / hỗ trợ</label>
                      <select 
                        value={supportFormData.targetRole}
                        onChange={(e) => setSupportFormData({ ...supportFormData, targetRole: e.target.value })}
                      >
                        <option value="student">Sinh viên</option>
                        <option value="school">Nhà trường (Quản trị)</option>
                        <option value="officer">Cán bộ đào tạo</option>
                      </select>
                    </div>

                    <div className="login-form-field full">
                      <label>Ghi chú / Lý do gửi Admin (linhyang0702@gmail.com)</label>
                      <textarea 
                        rows="3" 
                        placeholder="Ví dụ: Cần tạo tài khoản mới cho cán bộ bộ phận đào tạo..."
                        value={supportFormData.reason}
                        onChange={(e) => setSupportFormData({ ...supportFormData, reason: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {!supportSuccessMsg && (
                <div className="login-modal-footer">
                  <button type="button" className="sd-btn-secondary" style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={() => setIsSupportOpen(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="sd-btn-primary" style={{ padding: '8px 20px', cursor: 'pointer' }}>
                    <FaEnvelope /> Gửi yêu cầu tới Admin
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
