import React from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaPrint,
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img src="/logo.png" alt="Logo" className="footer-logo-image" />
              <div className="footer-logo-text">
                <div className="footer-logo-title">
                  HỆ THỐNG QUẢN LÝ & XÁC THỰC
                </div>
                <div className="footer-logo-subtitle">
                  VĂN BẰNG, CHỨNG CHỈ SỐ
                </div>
              </div>
            </div>
            <p className="footer-copyright">
              © 2026. Bản quyền thuộc về Hệ thống.
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Liên kết nhanh</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Trang chủ</Link>
              </li>
              <li>
                <Link to="/verification">Xác thực văn bằng</Link>
              </li>
              <li>
                <Link to="/guide">Hướng dẫn</Link>
              </li>
              <li>
                <Link to="/introduction">Giới thiệu</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Hỗ trợ</h3>
            <ul className="footer-links">
              <li>
                <Link to="/faq">Câu hỏi thường gặp</Link>
              </li>
              <li>
                <Link to="/guide">Hướng dẫn sử dụng</Link>
              </li>
              <li>
                <Link to="/contact">Liên hệ hỗ trợ</Link>
              </li>
              <li>
                <Link to="/privacy">Chính sách bảo mật</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Kết nối với chúng tôi</h3>
            <div className="social-links">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaYoutube />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaLinkedinIn />
              </a>
              <a href="#" className="social-link">
                <FaPrint />
              </a>
            </div>
            <div className="blockchain-badge">
              <FaCheckCircle />
              <div>
                <div className="badge-title">Đã xác thực bởi</div>
                <div className="badge-subtitle">Blockchain</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
