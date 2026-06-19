import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCheckCircle,
  FaQuestionCircle,
  FaInfoCircle,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Trang chủ", icon: <FaHome /> },
    { path: "/verify", label: "Xác thực văn bằng", icon: <FaCheckCircle /> },
    { path: "/guide", label: "Hướng dẫn", icon: <FaQuestionCircle /> },
    { path: "/introduction", label: "Giới thiệu", icon: <FaInfoCircle /> },
  ];

  const isActive = (path) =>
    path === "/guide"
      ? location.pathname === "/guide" ||
        location.pathname.startsWith("/guide/")
      : location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Logo" className="navbar-logo-image" />
          <div className="logo-text">
            <span className="logo-title">HỆ THỐNG QUẢN LÝ & XÁC THỰC</span>
            <span className="logo-subtitle">VĂN BẰNG, CHỨNG CHỈ SỐ</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${isActive(link.path) ? "active" : ""}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Login Button */}
        <Link to="/login" className="navbar-login-btn">
          <FaUser />
          <span>Đăng nhập</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <ul>
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`mobile-nav-link ${isActive(link.path) ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                className="mobile-login-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaUser />
                <span>Đăng nhập</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
