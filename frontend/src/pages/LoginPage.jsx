import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaUniversity,
  FaGoogle,
  FaUser,
  FaCheckCircle,
  FaPenAlt,
  FaBolt,
  FaCubes,
} from "react-icons/fa";
import Footer from "../components/Footer";
import "./LoginPage.css";

const FEATURES = [
  {
    icon: <FaShieldAlt />,
    title: "Không thể làm giả",
    desc: "Dữ liệu được lưu trữ trên Blockchain, không thể chỉnh sửa hoặc làm giả.",
  },
  {
    icon: <FaPenAlt />,
    title: "Ký số điện tử",
    desc: "Được ký số bởi tổ chức cấp bằng, đảm bảo tính pháp lý.",
  },
  {
    icon: <FaBolt />,
    title: "Xác minh tức thì",
    desc: "Kiểm tra nhanh chóng, chính xác theo thời gian thực.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Minh bạch – Bảo mật – Tin cậy",
    desc: "Công khai minh bạch, bảo mật tuyệt đối và đáng tin cậy.",
  },
];

const STATS = [
  { number: "156+", label: "Cơ sở giáo dục tham gia" },
  { number: "3.2M+", label: "Văn bằng, chứng chỉ đã được cấp" },
  { number: "98.75%", label: "Xác thực thành công trong tháng này" },
  { number: "125K+", label: "Sinh viên đang sử dụng" },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin đăng nhập.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === "student") {
        navigate("/student");
      } else {
        navigate("/school");
      }
    }, 1400);
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <div className="login-header-inner">
          <Link to="/" className="login-logo">
            <div className="login-logo-icon">
              <FaShieldAlt />
            </div>
            <div className="login-logo-text">
              <span className="login-logo-title">
                HỆ THỐNG QUẢN LÝ & XÁC THỰC
              </span>
              <span className="login-logo-subtitle">
                VĂN BẰNG, CHỨNG CHỈ SỐ
              </span>
            </div>
          </Link>
          <nav className="login-nav">
            <Link to="/" className="login-nav-link">
              Trang chủ
            </Link>
            <Link to="/verify" className="login-nav-link">
              Xác thực văn bằng
            </Link>
            <Link to="/guide" className="login-nav-link">
              Hướng dẫn
            </Link>
            <Link to="/about" className="login-nav-link">
              Giới thiệu
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="login-main">
        <div className="login-container">
          {/* Left: Info */}
          <div className="login-left">
            <div className="login-left-content">
              <p className="login-left-label">Đăng nhập vào</p>
              <h1 className="login-left-title">
                Hệ thống Quản lý và
                <br />
                Xác thực Văn bằng,
                <br />
                Chứng chỉ số
              </h1>
              <p className="login-left-desc">
                Nền tảng giúp các cơ sở giáo dục phát hành, quản lý và xác thực
                văn bằng điện tử thông qua công nghệ Blockchain.
              </p>

              <div className="login-features">
                {FEATURES.map((f, idx) => (
                  <div key={idx} className="login-feature-item">
                    <div className="login-feature-icon">{f.icon}</div>
                    <div>
                      <div className="login-feature-title">{f.title}</div>
                      <div className="login-feature-desc">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="login-stats">
                {STATS.map((s, idx) => (
                  <div key={idx} className="login-stat">
                    <div className="login-stat-number">{s.number}</div>
                    <div className="login-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Shield */}
            <div className="login-hero-visual">
              <div className="login-shield-wrap">
                <FaShieldAlt className="login-shield-icon" />
                <FaCubes className="login-cube-icon" />
                <div className="login-shield-ring ring1"></div>
                <div className="login-shield-ring ring2"></div>
                <div className="login-shield-glow"></div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="login-right">
            <div className="login-form-card">
              <h2 className="login-form-title">ĐĂNG NHẬP</h2>
              <p className="login-form-welcome">Chào mừng bạn quay trở lại!</p>

              {/* Role Selector */}
              <div className="role-selector">
                <button
                  className={`role-btn ${role === "student" ? "active" : ""}`}
                  onClick={() => setRole("student")}
                  type="button"
                >
                  <FaUserGraduate />
                  <span>Sinh viên</span>
                </button>
                <button
                  className={`role-btn ${role === "school" ? "active" : ""}`}
                  onClick={() => setRole("school")}
                  type="button"
                >
                  <FaUniversity />
                  <span>Nhà trường</span>
                </button>
              </div>

              {/* Form */}
              <form className="login-form" onSubmit={handleLogin}>
                {error && <div className="login-error">{error}</div>}

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="form-input-wrap">
                    <FaEnvelope className="form-input-icon" />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Nhập email của bạn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <div className="form-input-wrap">
                    <FaLock className="form-input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="Nhập mật khẩu của bạn"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="form-pwd-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="remember-label">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="remember-check"
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <a href="#" className="forgot-link">
                    Quên mật khẩu?
                  </a>
                </div>

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-loading"></span>
                  ) : (
                    <>
                      <FaLock /> ĐĂNG NHẬP
                    </>
                  )}
                </button>

                <div className="divider">
                  <span>Hoặc đăng nhập bằng</span>
                </div>

                <button type="button" className="google-login-btn">
                  <FaGoogle />
                  <span>Đăng nhập bằng Google</span>
                </button>

                <div className="login-register">
                  <span>Chưa có tài khoản?</span>
                  <a href="#" className="register-link">
                    {" "}
                    Đăng ký ngay
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
