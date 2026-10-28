import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  FaShieldAlt, FaUserGraduate, FaUniversity, FaEnvelope, 
  FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaEdit, 
  FaCertificate, FaUsers, FaChartLine, FaUserTie, FaSpinner, FaExclamationTriangle, FaTimes
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { api } from '../../services/api';
import './LoginPage.css';

const GoogleSignInButton = ({ loading, onSuccess, onError }) => {
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'openid email profile',
    onSuccess: (codeResponse) => onSuccess(codeResponse.code),
    onError
  });

  return (
    <button
      type="button"
      className="btn btn-google"
      disabled={loading}
      onClick={() => googleLogin()}
    >
      <FcGoogle style={{ fontSize: '20px' }} />
      {loading ? 'Đang đăng nhập...' : 'Đăng nhập bằng Google'}
    </button>
  );
};

const LoginPage = () => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const connectionErrorMessage = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.';
  const [googleLoading, setGoogleLoading] = useState(false);
  const [userType, setUserType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
  const [supportErrorMsg, setSupportErrorMsg] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);

  const navigate = useNavigate();

  const saveLoginSession = (user, token) => {
    const actualRole = user.role;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', actualRole || userType);
    localStorage.setItem('userName', user.full_name || '');
    localStorage.setItem('user_profile_data', JSON.stringify({
      fullName: user.full_name || 'Nguyễn Văn An',
      email: user.email || '',
      phone: user.phone || '0368 251 814',
      address: user.address || 'Số 144 Xuân Thủy, Cầu Giấy, Hà Nội',
      department: user.department || 'Phòng Đào tạo',
      position: user.position || 'Quản trị viên Hệ thống Văn bằng số',
      avatar: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      wallet: user.wallet_address || ''
    }));

    navigate(actualRole === 'student' ? '/student/dashboard' : '/school/dashboard');
  };

  // Load remembered credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const savedRole = localStorage.getItem('rememberedRole');
    const isRemembered = localStorage.getItem('rememberMe') === 'true';

    if (isRemembered && savedEmail) {
      const emailToRestore = savedEmail === 'admin@school.edu.vn'
        ? 'linhyang0702@gmail.com'
        : savedEmail;
      setEmail(emailToRestore);
      if (emailToRestore !== savedEmail) {
        localStorage.setItem('rememberedEmail', emailToRestore);
      }
      if (savedPassword) setPassword(savedPassword);
      if (savedRole) setUserType(savedRole);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (!errorMessage) return undefined;

    const timeoutId = setTimeout(() => setErrorMessage(''), 5000);
    return () => clearTimeout(timeoutId);
  }, [errorMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
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

        setSuccessMessage(res.message || 'Đăng nhập thành công. Đang chuyển trang...');
        setTimeout(() => saveLoginSession(res.user, res.token), 900);
      } else {
        setErrorMessage(res.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage(connectionErrorMessage);
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
    setSupportErrorMsg('');
    setIsSupportOpen(true);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSupportErrorMsg('');
    setSupportLoading(true);

    try {
      const res = await api.sendSupportRequest({
        requestType: supportType,
        ...supportFormData
      });
      if (!res?.success) {
        setSupportErrorMsg(res?.message || 'Không gửi được yêu cầu. Vui lòng thử lại.');
        return;
      }

      setSupportSuccessMsg(res.message);
      setTimeout(() => {
        setIsSupportOpen(false);
        setSupportSuccessMsg('');
      }, 4000);
    } catch {
      setSupportErrorMsg('Không thể kết nối máy chủ gửi email. Vui lòng thử lại sau.');
    } finally {
      setSupportLoading(false);
    }
  };

  const handleGoogleSuccess = async (code) => {
    setErrorMessage('');
    setSuccessMessage('');
    setGoogleLoading(true);

    try {
      const res = await api.googleLogin(code);
      if (!res?.success) {
        setErrorMessage(res.message || 'Đăng nhập Google không thành công.');
        return;
      }

      const actualRole = res.user.role;
      const roleMatches = userType === 'student'
        ? actualRole === 'student'
        : userType === 'school'
          ? ['admin', 'school'].includes(actualRole)
          : ['admin', 'officer'].includes(actualRole);

      if (!roleMatches) {
        setErrorMessage(`Tài khoản Google này không thuộc vai trò đã chọn (${userType}).`);
        return;
      }

      setSuccessMessage(res.message || 'Đăng nhập Google thành công. Đang chuyển trang...');
      setTimeout(() => saveLoginSession(res.user, res.token), 900);
    } catch (error) {
      setErrorMessage(connectionErrorMessage);
    } finally {
      setGoogleLoading(false);
    }
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

            {googleClientId ? (
              <GoogleSignInButton
                loading={googleLoading}
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMessage('Không thể đăng nhập bằng Google. Vui lòng thử lại.')}
              />
            ) : (
              <button
                type="button"
                className="btn btn-google"
                onClick={() => setErrorMessage('Chưa cấu hình Google Client ID trong frontend/.env.')}
              >
                <FcGoogle style={{ fontSize: '20px' }} />
                Đăng nhập bằng Google
              </button>
            )}

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

                {supportErrorMsg && (
                  <p className="login-support-error" role="alert">
                    {supportErrorMsg}
                  </p>
                )}
              </div>

              {!supportSuccessMsg && (
                <div className="login-modal-footer">
                  <button type="button" className="sd-btn-secondary" style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={() => setIsSupportOpen(false)} disabled={supportLoading}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="sd-btn-primary" style={{ padding: '8px 20px', cursor: 'pointer' }} disabled={supportLoading}>
                    {supportLoading ? <FaSpinner className="fa-spin" /> : <FaEnvelope />}
                    {supportLoading ? 'Đang gửi...' : 'Gửi yêu cầu tới Admin'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="login-toast" role="alert" aria-live="assertive">
          <FaExclamationTriangle className="login-toast-icon" />
          <span>{errorMessage}</span>
          <button
            type="button"
            className="login-toast-close"
            aria-label="Đóng thông báo"
            onClick={() => setErrorMessage('')}
          >
            <FaTimes />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="login-toast login-toast-success" role="status" aria-live="polite">
          <FaCheckCircle className="login-toast-icon" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
