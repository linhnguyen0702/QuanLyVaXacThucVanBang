import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaShieldAlt, FaUserGraduate, FaUniversity, FaEnvelope, 
  FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaEdit, 
  FaCertificate, FaUsers, FaChartLine 
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import './LoginPage.css';

const LoginPage = () => {
  const [userType, setUserType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic here
    if (userType === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/school/dashboard');
    }
  };

  const handleGoogleLogin = () => {
    // Handle Google OAuth login
    console.log('Google login');
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
                  className={`user-type-btn ${userType === 'student' ? 'active' : ''}`}
                  onClick={() => setUserType('student')}
                >
                  <FaUserGraduate />
                  <span>Sinh viên</span>
                </button>
                <button
                  className={`user-type-btn ${userType === 'school' ? 'active' : ''}`}
                  onClick={() => setUserType('school')}
                >
                  <FaUniversity />
                  <span>Nhà trường</span>
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
                    placeholder="Nhập mật khẩu của bạn"
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
                <a href="/forgot-password" className="forgot-link">
                  Quên mật khẩu?
                </a>
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                <FaLock />
                ĐĂNG NHẬP
              </button>
            </form>

            <div className="divider">
              <span>Hoặc đăng nhập bằng</span>
            </div>

            <button type="button" className="btn btn-google" onClick={handleGoogleLogin}>
              <FcGoogle style={{ fontSize: '20px' }} />
              Đăng nhập bằng Google
            </button>

            <p className="signup-text">
              Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
