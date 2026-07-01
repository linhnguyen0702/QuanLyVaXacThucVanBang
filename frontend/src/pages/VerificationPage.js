import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  FaBook,
  FaUserGraduate,
  FaUniversity,
  FaQuestionCircle,
  FaHeadset,
  FaChevronRight,
  FaChevronDown,
  FaPhone,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

import "./VerificationPage.css";

const MENU_ITEMS = [
  { path: "/guide", label: "Giới thiệu chung", icon: <FaBook /> },
  { path: "/guide/student", label: "Hướng dẫn cho Sinh viên", icon: <FaUserGraduate /> },
  { path: "/guide/school", label: "Hướng dẫn cho Nhà trường", icon: <FaUniversity /> },
  { path: "/verify", label: "Xác thực văn bằng", icon: <FaQrcode />, active: true },
  { path: "/guide/faq", label: "Câu hỏi thường gặp", icon: <FaQuestionCircle /> },
  { path: "/guide/support", label: "Liên hệ hỗ trợ", icon: <FaHeadset /> },
];

const SIDEBAR_FAQS = [
  {
    q: "Làm sao để biết văn bằng được cấp bởi hệ thống là thật?",
    a: "Mỗi văn bằng được lưu trữ mã hash trên Blockchain Ethereum. Bạn có thể xác thực bất kỳ lúc nào bằng cách quét mã QR hoặc nhập mã xác thực. Thông tin trên Blockchain là bất biến, không thể sửa đổi hay làm giả.",
  },
  {
    q: "Văn bằng, chứng chỉ số có giá trị pháp lý không?",
    a: "Văn bằng số được ký số bởi tổ chức cấp bằng, có đầy đủ giá trị pháp lý theo quy định hiện hành.",
  },
  {
    q: "Tôi có thể tải văn bằng, chứng chỉ số ở đâu?",
    a: "Sau khi đăng nhập với tư cách sinh viên, bạn có thể truy cập phần 'Văn bằng của tôi' trong Dashboard để tải xuống.",
  },
  {
    q: "Nhà tuyển dụng có cần tài khoản để xác thực không?",
    a: "Không cần. Nhà tuyển dụng chỉ cần truy cập trang Xác thực văn bằng công khai để quét mã QR hoặc nhập mã số, đối chiếu tức thì với Blockchain.",
  },
  {
    q: "Làm thế nào để sửa thông tin văn bằng bị sai lệch?",
    a: "Sinh viên cần liên hệ ngay với Phòng Đào tạo của nhà trường để yêu cầu chỉnh sửa. Nhà trường sẽ thu hồi văn bằng cũ và cấp lại bản ghi mới trên Blockchain.",
  },
];

const VerificationPage = () => {
  const [activeTab, setActiveTab] = useState("qr");
  const [certificateCode, setCertificateCode] = useState("");
  const [faqOpen, setFaqOpen] = useState(null);

  const handleVerify = () => {
    console.log(certificateCode);
  };

  return (
    <div className="verification-page">

      {/* ── BANNER (full width) ── */}
      <div className="verification-banner">
        <div className="banner-watermark watermark-left">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="none">
            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 11L11 13L15 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="5" y1="8" x2="19" y2="8" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/>
            <line x1="5" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/>
          </svg>
        </div>
        <div className="banner-watermark watermark-right">
          <svg width="240" height="240" viewBox="0 0 200 200" fill="none">
            <g transform="translate(130, 30)">
              <path d="M30 0L60 15V45L30 60L0 45V15L30 0Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M30 0V60" stroke="currentColor" strokeWidth="1"/>
              <path d="M0 15L30 30L60 15" stroke="currentColor" strokeWidth="1"/>
            </g>
            <g transform="translate(110, 110)">
              <path d="M30 0L60 15V45L30 60L0 45V15L30 0Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M30 0V60" stroke="currentColor" strokeWidth="1"/>
              <path d="M0 15L30 30L60 15" stroke="currentColor" strokeWidth="1"/>
            </g>
            <g transform="translate(40, 70)">
              <path d="M30 0L60 15V45L30 60L0 45V15L30 0Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M30 0V60" stroke="currentColor" strokeWidth="1"/>
              <path d="M0 15L30 30L60 15" stroke="currentColor" strokeWidth="1"/>
            </g>
            <path d="M70 100L130 60" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/>
            <path d="M70 100L110 140" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/>
            <path d="M160 90L140 110" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/>
          </svg>
        </div>
        <div className="banner-content">
          <h1>XÁC THỰC VĂN BẰNG, CHỨNG CHỈ SỐ</h1>
          <p>Kiểm tra tính xác thực của văn bằng, chứng chỉ được cấp trên hệ thống Blockchain</p>
        </div>
      </div>

      {/* ── 3-COLUMN LAYOUT: sidebar | main | guide+notice ── */}
      <div className="vp-layout">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="vp-sidebar">

          {/* Card 1: Mục hướng dẫn — height synced with banner via CSS var */}
          <div className="vp-sidebar-card vp-menu-card">
            <div className="vp-card-hd">MỤC HƯỚNG DẪN</div>
            <ul className="vp-nav-menu">
              {MENU_ITEMS.map((item) => (
                <li key={item.path} className={`vp-nav-item${item.active ? " active" : ""}`}>
                  <Link to={item.path} className="vp-nav-link">
                    <span className="vp-nav-icon">{item.icon}</span>
                    <span className="vp-nav-label">{item.label}</span>
                    <FaChevronRight className="vp-nav-arr" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Câu hỏi nhanh 5 câu */}
          <div className="vp-sidebar-card">
            <div className="vp-card-hd vp-card-hd--row">
              <span>CÂU HỎI NHANH</span>
              <Link to="/guide/faq" className="vp-card-more">Xem tất cả</Link>
            </div>
            <div className="vp-faq-list">
              {SIDEBAR_FAQS.map((f, i) => (
                <div key={i} className={`vp-faq-item${faqOpen === i ? " open" : ""}`}>
                  <button className="vp-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                    <span>{f.q}</span>
                    {faqOpen === i ? <FaChevronDown className="vp-faq-arr" /> : <FaChevronRight className="vp-faq-arr" />}
                  </button>
                  {faqOpen === i && <div className="vp-faq-a">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Liên hệ hỗ trợ */}
          <div className="vp-sidebar-card">
            <div className="vp-card-hd">LIÊN HỆ HỖ TRỢ</div>
            <p className="vp-ct-desc">Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua các kênh bên dưới.</p>
            <div className="vp-ct-body">
              <div className="vp-ct-list">
                <div className="vp-ct-row"><FaPhone className="vp-ct-icon" /><span>0368 251 814</span></div>
                <div className="vp-ct-row"><FaEnvelope className="vp-ct-icon" /><span>linhyang0702@gmail.com</span></div>
                <div className="vp-ct-row"><FaClock className="vp-ct-icon" /><span>T2 – T6: 8:00 – 17:30</span></div>
              </div>
              <div className="vp-ct-avatar">
                <div className="vp-ct-avatar-ring">
                  <div className="vp-ct-avatar-circle">
                    <FaHeadset className="vp-ct-avatar-icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MIDDLE: verify card ── */}
        <div className="vp-main">
          <div className="verify-card">
            <div className="tabs">
              <button className={activeTab === "qr" ? "active" : ""} onClick={() => setActiveTab("qr")}>
                <FaQrcode className="tab-icon" /> Quét mã QR
              </button>
              <button className={activeTab === "code" ? "active" : ""} onClick={() => setActiveTab("code")}>
                <FaKeyboard className="tab-icon" /> Nhập mã xác thực
              </button>
            </div>

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
                <div className="divider"><span>HOẶC</span></div>
                <button className="upload-btn">
                  <FaUpload className="btn-icon" /> Chọn ảnh QR từ thiết bị
                </button>
              </div>
            )}

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
                  <FaSearch className="btn-icon" /> Xác thực ngay
                </button>
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
