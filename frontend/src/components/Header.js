import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaQuestionCircle,
  FaInfoCircle,
  FaUser,
  FaHome,
} from "react-icons/fa";
import "./Header.css";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <FaShieldAlt />
          </div>
          <div className="logo-text">
            <div className="logo-title">HỆ THỐNG QUẢN LÝ & XÁC THỰC</div>
            <div className="logo-subtitle">VĂN BẰNG, CHỨNG CHỈ SỐ</div>
          </div>
        </Link>

        <nav className="nav-menu">
          <Link to="/" className={`nav-link${isActive("/") ? " active" : ""}`}>
            <FaHome className="nav-icon" />
            <span>Trang chủ</span>
          </Link>
          <Link
            to="/verification"
            className={`nav-link${isActive("/verification") ? " active" : ""}`}
          >
            <FaCheckCircle className="nav-icon" />
            <span>Xác thực văn bằng</span>
          </Link>
          <Link
            to="/guide"
            className={`nav-link${isActive("/guide") ? " active" : ""}`}
          >
            <FaQuestionCircle className="nav-icon" />
            <span>Hướng dẫn</span>
          </Link>
          <Link
            to="/introduction"
            className={`nav-link${isActive("/introduction") ? " active" : ""}`}
          >
            <FaInfoCircle className="nav-icon" />
            <span>Giới thiệu</span>
          </Link>
        </nav>

        <button className="btn-login" onClick={handleLogin}>
          <FaUser />
          <span>Đăng nhập</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
