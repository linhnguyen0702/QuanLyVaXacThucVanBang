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
  FaDatabase,
  FaSpinner,
  FaExclamationTriangle,
  FaTimesCircle,
  FaUniversity,
  FaUserGraduate,
  FaCalendarAlt,
  FaExternalLinkAlt
} from "react-icons/fa";
import { api } from "../../services/api";
import "./VerificationPage.css";

const VerificationPage = () => {
  const [activeTab, setActiveTab] = useState("code");
  const [certificateCode, setCertificateCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerify = async () => {
    if (!certificateCode.trim()) {
      setErrorMsg("Vui lòng nhập mã văn bằng, mã sinh viên hoặc chuỗi mã Hash.");
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMsg("");

    try {
      const data = await api.verifyCertificate(certificateCode.trim());
      setLoading(false);

      if (data && data.success) {
        setResult(data);
      } else {
        setErrorMsg(data.message || "Không tìm thấy văn bằng trong cơ sở dữ liệu.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("Không thể kết nối đến máy chủ Backend (http://localhost:5000). Vui lòng đảm bảo Server Backend đang hoạt động.");
    }
  };

  return (
    <div className="verification-page">

      {/* ── BANNER (full width) ── */}
      <div className="verification-banner">
        <div className="banner-watermark watermark-left">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="none">
            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 11L11 13L15 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="banner-content">
          <h1>XÁC THỰC VĂN BẰNG, CHỨNG CHỈ SỐ</h1>
          <p>Kiểm tra tính xác thực trực tiếp từ CSDL nhà trường và hệ thống Blockchain Polygon/Sepolia</p>
        </div>
      </div>

      {/* ── 2-COLUMN LAYOUT ── */}
      <div className="vp-layout">

        {/* ── LEFT/MIDDLE: verify card ── */}
        <div className="vp-main">
          <div className="verify-card">
            <div className="tabs">
              <button className={activeTab === "code" ? "active" : ""} onClick={() => setActiveTab("code")}>
                <FaKeyboard className="tab-icon" /> Nhập mã xác thực
              </button>
              <button className={activeTab === "qr" ? "active" : ""} onClick={() => setActiveTab("qr")}>
                <FaQrcode className="tab-icon" /> Quét mã QR
              </button>
            </div>

            {activeTab === "code" && (
              <div className="code-section">
                <h3 className="code-section-title">Nhập mã xác thực văn bằng</h3>
                <p className="code-section-desc">Vui lòng nhập mã văn bằng (Ví dụ: <strong>UNI-2026-0012</strong>), mã sinh viên (<strong>20201123</strong>) hoặc mã băm Hash để kiểm tra.</p>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="VD: UNI-2026-0012 hoặc 20201123"
                    value={certificateCode}
                    onChange={(e) => setCertificateCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  />
                </div>
                <button className="verify-btn" onClick={handleVerify} disabled={loading}>
                  {loading ? <FaSpinner className="fa-spin" /> : <FaSearch className="btn-icon" />}
                  {loading ? ' Đang kiểm tra CSDL...' : ' Xác thực ngay'}
                </button>
              </div>
            )}

            {activeTab === "qr" && (
              <div className="qr-section">
                <div className="qr-scanner-container">
                  <div className="scanner-bracket top-left"></div>
                  <div className="scanner-bracket top-right"></div>
                  <div className="scanner-bracket bottom-left"></div>
                  <div className="scanner-bracket bottom-right"></div>
                  <div className="qr-scanner-box">
                    <div className="scan-line"></div>
                    <svg className="qr-placeholder-svg" width="120" height="120" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9V5C3 3.89543 3.89543 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M21 9V5C21 3.89543 20.1046 3 19 3H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <rect x="6" y="6" width="4" height="4" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="6" width="4" height="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                <h3 className="qr-instruction-title">Đưa mã QR vào khung quét</h3>
                <p className="qr-instruction-desc">
                  Hệ thống sẽ tự động nhận diện mã băm Hash và đối soát trực tiếp dữ liệu.
                </p>
                <div className="divider"><span>HOẶC</span></div>
                <button className="upload-btn" onClick={() => alert('Vui lòng nhập mã văn bằng ở tab "Nhập mã xác thực" để tra cứu nhanh.')}>
                  <FaUpload className="btn-icon" /> Chọn ảnh QR từ thiết bị
                </button>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMsg && (
              <div style={{
                marginTop: '20px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                padding: '14px 18px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaTimesCircle style={{ fontSize: '20px', flexShrink: 0 }} />
                <div>
                  <strong>Tra cứu thất bại:</strong> {errorMsg}
                </div>
              </div>
            )}

            {/* Verification Result Display */}
            {result && result.certificate && (
              <div style={{
                marginTop: '24px',
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: result.isRevoked ? '#fef2f2' : '#f0fdf4',
                border: `2px solid ${result.isRevoked ? '#ef4444' : '#22c55e'}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  {result.isRevoked ? (
                    <FaExclamationTriangle style={{ fontSize: '32px', color: '#ef4444' }} />
                  ) : (
                    <FaCheckCircle style={{ fontSize: '32px', color: '#22c55e' }} />
                  )}
                  <div>
                    <h3 style={{ margin: 0, color: result.isRevoked ? '#991b1b' : '#15803d', fontSize: '18px' }}>
                      {result.message}
                    </h3>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      Mã tra cứu: <strong>{result.certificate.certificate_code}</strong>
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <div>
                    <span style={{ color: '#6b7280', display: 'block', fontSize: '12px' }}>Họ và tên sinh viên:</span>
                    <strong style={{ color: '#111827', fontSize: '15px' }}>{result.certificate.student_name}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#6b7280', display: 'block', fontSize: '12px' }}>Mã sinh viên:</span>
                    <strong>{result.certificate.student_code}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#6b7280', display: 'block', fontSize: '12px' }}>Trường cấp bằng:</span>
                    <strong>{result.certificate.school_name}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#6b7280', display: 'block', fontSize: '12px' }}>Ngành đào tạo:</span>
                    <strong>{result.certificate.major}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#6b7280', display: 'block', fontSize: '12px' }}>Loại văn bằng / Xếp loại:</span>
                    <strong>{result.certificate.degree_type} - {result.certificate.classification} (GPA: {result.certificate.gpa})</strong>
                  </div>

                  <div>
                    <span style={{ color: '#6b7280', display: 'block', fontSize: '12px' }}>Ngày cấp / Quyết định:</span>
                    <strong>{new Date(result.certificate.issue_date).toLocaleDateString('vi-VN')} ({result.certificate.decision_number})</strong>
                  </div>
                </div>

                {result.blockchainVerification && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', fontSize: '12px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaShieldAlt style={{ color: '#3b82f6' }} />
                      <span><strong>Blockchain Network:</strong> {result.blockchainVerification.network}</span>
                    </div>
                    <div style={{ wordBreak: 'break-all', marginTop: '4px' }}>
                      <strong>Transaction Hash:</strong> {result.blockchainVerification.txHash}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper blue-bg"><FaShieldAlt className="feature-icon" /></div>
                <div className="feature-content">
                  <h4>Bảo mật & Minh bạch</h4>
                  <p>Dữ liệu được lưu trữ trên Blockchain, không thể chỉnh sửa hay giả mạo.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper green-bg"><FaBolt className="feature-icon" /></div>
                <div className="feature-content">
                  <h4>Xác thực tức thì</h4>
                  <p>Kết quả được trả về nhanh chóng, chỉ trong vài giây.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper purple-bg"><FaGraduationCap className="feature-icon" /></div>
                <div className="feature-content">
                  <h4>Tin cậy & Chính xác</h4>
                  <p>Thông tin được xác thực trực tiếp từ nguồn dữ liệu chính thống.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: guide + notice cards ── */}
        <div className="vp-right">
          <div className="guide-card">
            <h3 className="sidebar-title">
              <FaBookOpen className="title-icon" /> Hướng dẫn xác thực
            </h3>
            <div className="steps-container">
              <div className="steps-progress-line"></div>
              <div className="step-item">
                <div className="step-visual">
                  <div className="step-icon-circle"><FaQrcode /></div>
                  <span className="step-number-badge">1</span>
                </div>
                <div className="step-text-content">
                  <h4>Quét QR hoặc nhập mã xác thực</h4>
                  <p>Sử dụng camera để quét mã QR hoặc nhập mã xác thực in trên văn bằng, chứng chỉ.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-visual">
                  <div className="step-icon-circle"><FaDatabase /></div>
                  <span className="step-number-badge">2</span>
                </div>
                <div className="step-text-content">
                  <h4>Hệ thống kiểm tra</h4>
                  <p>Hệ thống sẽ tự động truy xuất dữ liệu trên Blockchain để kiểm tra tính hợp lệ.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-visual">
                  <div className="step-icon-circle"><FaShieldAlt /></div>
                  <span className="step-number-badge">3</span>
                </div>
                <div className="step-text-content">
                  <h4>Hiển thị kết quả</h4>
                  <p>Xem thông tin chi tiết và kết quả xác thực văn bằng, chứng chỉ.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="notice-card">
            <h3 className="sidebar-title">
              <FaBell className="title-icon text-warning" /> Lưu ý
            </h3>
            <ul className="notice-list">
              <li>
                <div className="checkmark-icon-wrapper"><FaCheckCircle /></div>
                <span className="notice-text">Văn bằng hợp lệ phải tồn tại trên hệ thống Blockchain.</span>
              </li>
              <li>
                <div className="checkmark-icon-wrapper"><FaCheckCircle /></div>
                <span className="notice-text">Kết quả xác thực chỉ có giá trị tại thời điểm tra cứu.</span>
              </li>
              <li>
                <div className="checkmark-icon-wrapper"><FaCheckCircle /></div>
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
