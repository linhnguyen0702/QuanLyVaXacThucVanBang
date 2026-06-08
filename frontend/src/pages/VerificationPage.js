import React, { useState } from "react";
import {
  FaQrcode,
  FaKeyboard,
  FaUpload,
  FaBookOpen,
  FaShieldAlt,
  FaBolt,
  FaGraduationCap,
  FaCheckCircle,
  FaSearch,
  FaBell,
  FaDatabase
} from "react-icons/fa";

import "./VerificationPage.css";

const VerificationPage = () => {
  const [activeTab, setActiveTab] = useState("qr");
  const [certificateCode, setCertificateCode] = useState("");

  const handleVerify = () => {
    console.log(certificateCode);
  };

  return (
    <div className="verification-page">
      {/* Banner */}
      <div className="verification-banner">
        {/* Left Shield Watermark */}
        <div className="banner-watermark watermark-left">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 11L11 13L15 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="5" y1="8" x2="19" y2="8" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/>
            <line x1="5" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/>
          </svg>
        </div>

        {/* Right Blockchain Watermark */}
        <div className="banner-watermark watermark-right">
          <svg width="240" height="240" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cube 1 (Top Right) */}
            <g transform="translate(130, 30)">
              <path d="M30 0L60 15V45L30 60L0 45V15L30 0Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M30 0V60" stroke="currentColor" strokeWidth="1"/>
              <path d="M0 15L30 30L60 15" stroke="currentColor" strokeWidth="1"/>
            </g>
            {/* Cube 2 (Bottom Right) */}
            <g transform="translate(110, 110)">
              <path d="M30 0L60 15V45L30 60L0 45V15L30 0Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M30 0V60" stroke="currentColor" strokeWidth="1"/>
              <path d="M0 15L30 30L60 15" stroke="currentColor" strokeWidth="1"/>
            </g>
            {/* Cube 3 (Middle Left) */}
            <g transform="translate(40, 70)">
              <path d="M30 0L60 15V45L30 60L0 45V15L30 0Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M30 0V60" stroke="currentColor" strokeWidth="1"/>
              <path d="M0 15L30 30L60 15" stroke="currentColor" strokeWidth="1"/>
            </g>
            {/* Connection Lines */}
            <path d="M70 100L130 60" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/>
            <path d="M70 100L110 140" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/>
            <path d="M160 90L140 110" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/>
          </svg>
        </div>

        <div className="banner-content">
          <h1>XÁC THỰC VĂN BẰNG, CHỨNG CHỈ SỐ</h1>
          <p>
            Kiểm tra tính xác thực của văn bằng, chứng chỉ được cấp trên hệ thống Blockchain
          </p>
        </div>
      </div>

      <div className="verification-wrapper">
        {/* LEFT COLUMN */}
        <div className="verification-left">
          <div className="verify-card">
            {/* Tabs */}
            <div className="tabs">
              <button
                className={activeTab === "qr" ? "active" : ""}
                onClick={() => setActiveTab("qr")}
              >
                <FaQrcode className="tab-icon" />
                Quét mã QR
              </button>

              <button
                className={activeTab === "code" ? "active" : ""}
                onClick={() => setActiveTab("code")}
              >
                <FaKeyboard className="tab-icon" />
                Nhập mã xác thực
              </button>
            </div>

            {/* QR Section */}
            {activeTab === "qr" && (
              <div className="qr-section">
                <div className="qr-scanner-container">
                  <div className="scanner-bracket top-left"></div>
                  <div className="scanner-bracket top-right"></div>
                  <div className="scanner-bracket bottom-left"></div>
                  <div className="scanner-bracket bottom-right"></div>
                  
                  <div className="qr-scanner-box">
                    <div className="scan-line"></div>
                    <svg className="qr-placeholder-svg" width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9V5C3 3.89543 3.89543 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M21 9V5C21 3.89543 20.1046 3 19 3H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 15V19C3 20.1046 3.89543 21 5 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M21 15V19C21 20.1046 20.1046 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <rect x="6" y="6" width="4" height="4" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="6" width="4" height="4" stroke="currentColor" strokeWidth="2"/>
                      <rect x="6" y="14" width="4" height="4" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="14" width="2" height="2" fill="currentColor"/>
                      <rect x="16" y="16" width="2" height="2" fill="currentColor"/>
                      <rect x="14" y="16" width="2" height="2" fill="currentColor"/>
                      <rect x="16" y="14" width="2" height="2" fill="currentColor"/>
                    </svg>
                  </div>
                </div>

                <h3 className="qr-instruction-title">Đưa mã QR vào khung quét</h3>
                <p className="qr-instruction-desc">
                  Hệ thống sẽ tự động nhận diện và xác thực thông tin văn bằng, chứng chỉ.
                </p>

                <div className="divider">
                  <span>HOẶC</span>
                </div>

                <button className="upload-btn">
                  <FaUpload className="btn-icon" />
                  Chọn ảnh QR từ thiết bị
                </button>
              </div>
            )}

            {/* CODE Section */}
            {activeTab === "code" && (
              <div className="code-section">
                <h3 className="code-section-title">Nhập mã xác thực văn bằng</h3>
                <p className="code-section-desc">Vui lòng nhập chính xác mã xác thực được in trên văn bằng, chứng chỉ để thực hiện kiểm tra.</p>
                
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="VD: UNI2024-000123"
                    value={certificateCode}
                    onChange={(e) => setCertificateCode(e.target.value)}
                  />
                </div>

                <button className="verify-btn" onClick={handleVerify}>
                  <FaSearch className="btn-icon" />
                  Xác thực ngay
                </button>
              </div>
            )}

            {/* Features Grid inside verify-card */}
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper blue-bg">
                  <FaShieldAlt className="feature-icon" />
                </div>
                <div className="feature-content">
                  <h4>Bảo mật & Minh bạch</h4>
                  <p>
                    Dữ liệu được lưu trữ trên Blockchain, không thể chỉnh sửa hay giả mạo.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper green-bg">
                  <FaBolt className="feature-icon" />
                </div>
                <div className="feature-content">
                  <h4>Xác thực tức thì</h4>
                  <p>
                    Kết quả được trả về nhanh chóng, chỉ trong vài giây.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper purple-bg">
                  <FaGraduationCap className="feature-icon" />
                </div>
                <div className="feature-content">
                  <h4>Tin cậy & Chính xác</h4>
                  <p>
                    Thông tin được xác thực trực tiếp từ nguồn dữ liệu chính thống.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="verification-right">
          {/* Guide Card */}
          <div className="guide-card">
            <h3 className="sidebar-title">
              <FaBookOpen className="title-icon" />
              Hướng dẫn xác thực
            </h3>

            <div className="steps-container">
              <div className="steps-progress-line"></div>
              
              <div className="step-item">
                <div className="step-visual">
                  <div className="step-icon-circle">
                    <FaQrcode />
                  </div>
                  <span className="step-number-badge">1</span>
                </div>
                <div className="step-text-content">
                  <h4>Quét QR hoặc nhập mã xác thực</h4>
                  <p>
                    Sử dụng camera để quét mã QR hoặc nhập mã xác thực in trên văn bằng, chứng chỉ.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-visual">
                  <div className="step-icon-circle">
                    <FaDatabase />
                  </div>
                  <span className="step-number-badge">2</span>
                </div>
                <div className="step-text-content">
                  <h4>Hệ thống kiểm tra</h4>
                  <p>
                    Hệ thống sẽ tự động truy xuất dữ liệu trên Blockchain để kiểm tra tính hợp lệ.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-visual">
                  <div className="step-icon-circle">
                    <FaShieldAlt />
                  </div>
                  <span className="step-number-badge">3</span>
                </div>
                <div className="step-text-content">
                  <h4>Hiển thị kết quả</h4>
                  <p>
                    Xem thông tin chi tiết và kết quả xác thực văn bằng, chứng chỉ.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notice Card */}
          <div className="notice-card">
            <h3 className="sidebar-title">
              <FaBell className="title-icon text-warning" />
              Lưu ý
            </h3>

            <ul className="notice-list">
              <li>
                <div className="checkmark-icon-wrapper">
                  <FaCheckCircle />
                </div>
                <span className="notice-text">Văn bằng hợp lệ phải tồn tại trên hệ thống Blockchain.</span>
              </li>
              <li>
                <div className="checkmark-icon-wrapper">
                  <FaCheckCircle />
                </div>
                <span className="notice-text">Kết quả xác thực chỉ có giá trị tại thời điểm tra cứu.</span>
              </li>
              <li>
                <div className="checkmark-icon-wrapper">
                  <FaCheckCircle />
                </div>
                <span className="notice-text">Vui lòng liên hệ đơn vị cấp phát nếu có sai lệch thông tin.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;