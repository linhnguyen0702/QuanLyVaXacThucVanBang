import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaUniversity,
  FaUserGraduate,
  FaBriefcase,
  FaShieldAlt,
  FaCube,
  FaLock,
  FaQrcode,
  FaSearch,
  FaUsers,
  FaArrowRight,
  FaUpload,
  FaChevronRight,
  FaFileAlt,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./HomePage.css";

const stats = [
  {
    icon: <FaFileAlt />,
    number: "125.648",
    label: "Văn bằng đã cấp",
    subtext: "+1,248 trong tháng này",
  },
  {
    icon: <FaShieldAlt />,
    number: "98.75%",
    label: "Xác thực thành công",
    subtext: "+2.5% so với tháng trước",
  },
  {
    icon: <FaUniversity />,
    number: "156",
    label: "Đơn vị tham gia",
    subtext: "+8 đơn vị mới",
  },
  {
    icon: <FaUsers />,
    number: "3.2M+",
    label: "Giao dịch trên Blockchain",
    subtext: "+145,231 trong tháng này",
  },
];

const workflow = [
  {
    num: "1",
    icon: <FaUniversity />,
    title: "Nhà trường",
    desc: "Tạo và ký số văn bằng",
  },
  { num: "2", icon: <FaCube />, title: "Ghi lên Blockchain", desc: "" },
  {
    num: "3",
    icon: <FaUserGraduate />,
    title: "Sinh viên",
    desc: "Nhận văn bằng số / NFT",
  },
  {
    num: "4",
    icon: <FaBriefcase />,
    title: "Nhà tuyển dụng",
    desc: "Xác thực nhanh chóng",
  },
];

const guides = [
  {
    num: "1",
    icon: <FaQrcode />,
    title: "Quét mã QR",
    desc: "Sử dụng ứng dụng quét mã QR trên văn bằng",
  },
  {
    num: "2",
    icon: <FaSearch />,
    title: "Kiểm tra thông tin",
    desc: "Đối chiếu thông tin hiển thị với văn bằng gốc",
  },
  {
    num: "3",
    icon: <FaShieldAlt />,
    title: "Kết quả xác thực",
    desc: "Hệ thống trả về kết quả ngay lập tức",
  },
];

const newCerts = [
  {
    name: "Nguyễn Thị Minh Châu",
    degree: "Kỹ sư Công nghệ thông tin",
    id: "Mã VB: UNI2024/000123",
    time: "2 giờ trước",
    initials: "NT",
  },
  {
    name: "Trần Văn Đức",
    degree: "Cử nhân Quản trị kinh doanh",
    id: "Mã VB: UNI2024/000124",
    time: "5 giờ trước",
    initials: "TV",
  },
  {
    name: "Lê Thị Hải Yến",
    degree: "Thạc sĩ Kiểm toán",
    id: "Mã VB: UNI2024/000125",
    time: "1 ngày trước",
    initials: "LT",
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [verifyTab, setVerifyTab] = useState("qr");
  const [quickCode, setQuickCode] = useState("");

  const handleQuickVerify = () => {
    if (quickCode.trim()) navigate("/verify");
  };

  return (
    <div className="hp-root">
      <Navbar />

      <div className="hp-body">
        <div className="hp-container">
          <div className="hp-top-grid">
            <div className="hp-left-stack">
              <div className="hp-hero">
                <div className="hp-hero-inner">
                  <div className="hp-hero-text">
                    <h1 className="hp-hero-h1">
                      Minh bạch – Bảo mật – Tin cậy
                    </h1>
                    <h2 className="hp-hero-h2">
                      Xác thực văn bằng trên Blockchain
                    </h2>
                    <p className="hp-hero-desc">
                      Công nghệ Blockchain giúp xác thực văn bằng, chứng chỉ
                      nhanh chóng, chính xác và không thể làm giả.
                    </p>
                    <div className="hp-hero-btns">
                      <Link to="/verify" className="hp-btn-white">
                        <FaCheckCircle /> Xác thực ngay
                      </Link>
                      <Link to="/guide" className="hp-btn-outline">
                        Tìm hiểu thêm
                      </Link>
                    </div>
                  </div>

                  <div className="hp-hero-shield">
                    <div className="hp-shield-wrap">
                      <div className="hp-ring hp-ring1"></div>
                      <div className="hp-ring hp-ring2"></div>
                      <div className="hp-ring hp-ring3"></div>
                      <div className="hp-shield-core">
                        <FaShieldAlt className="hp-shield-outline" />
                        <FaLock className="hp-shield-lock" />
                      </div>
                      <span className="hp-dot hp-dot1"></span>
                      <span className="hp-dot hp-dot2"></span>
                      <span className="hp-dot hp-dot3"></span>
                      <span className="hp-dot hp-dot4"></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hp-stats-row">
                {stats.map((s, i) => (
                  <div key={i} className="hp-stat">
                    <div className="hp-stat-icon">{s.icon}</div>
                    <div className="hp-stat-body">
                      <div className="hp-stat-num">{s.number}</div>
                      <div className="hp-stat-label">{s.label}</div>
                      <div className="hp-stat-sub">{s.subtext}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hp-verify-card">
              <h3 className="hp-verify-title">XÁC THỰC VĂN BẰNG</h3>

              <div className="hp-vtabs">
                <button
                  className={`hp-vtab${verifyTab === "qr" ? " hp-vtab--active" : ""}`}
                  onClick={() => setVerifyTab("qr")}
                >
                  Quét mã QR
                </button>
                <button
                  className={`hp-vtab${verifyTab === "code" ? " hp-vtab--active" : ""}`}
                  onClick={() => setVerifyTab("code")}
                >
                  Nhập mã xác thực
                </button>
              </div>

              {verifyTab === "qr" ? (
                <div className="hp-qr-panel">
                  <p className="hp-qr-hint">
                    Quét mã QR trên văn bằng để kiểm tra tính xác thực
                  </p>
                  <div className="hp-qr-frame">
                    <FaQrcode className="hp-qr-icon" />
                  </div>
                  <p className="hp-qr-or">Hoặc tải ảnh mã QR lên</p>
                  <button className="hp-upload-btn">
                    <FaUpload /> Tải ảnh lên
                  </button>
                </div>
              ) : (
                <div className="hp-code-panel">
                  <p className="hp-qr-hint">
                    Nhập mã xác thực được in trên văn bằng
                  </p>
                  <input
                    type="text"
                    className="hp-code-input"
                    placeholder="VD: UNI2024/000123"
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleQuickVerify()}
                  />
                  <button className="hp-verify-btn" onClick={handleQuickVerify}>
                    <FaSearch /> Xác thực
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════
              ROW 3: Three cards
          ══════════════════════════════════ */}
          <div className="hp-cards-row">
            {/* Card 1: Văn bằng mới cấp */}
            <div className="hp-card">
              <div className="hp-card-hd">
                <span className="hp-card-ttl">VĂN BẰNG MỚI CẤP</span>
                <Link to="/certificates" className="hp-see-all">
                  Xem tất cả <FaChevronRight />
                </Link>
              </div>
              <div className="hp-certs">
                {newCerts.map((cert, i) => (
                  <div key={i} className="hp-cert-row">
                    <div className="hp-cert-av">{cert.initials}</div>
                    <div className="hp-cert-info">
                      <div className="hp-cert-name">{cert.name}</div>
                      <div className="hp-cert-deg">{cert.degree}</div>
                      <div className="hp-cert-id">{cert.id}</div>
                    </div>
                    <div className="hp-cert-meta">
                      <span className="hp-cert-badge">Đã ghi Blockchain</span>
                      <span className="hp-cert-time">{cert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Quy trình hoạt động */}
            <div className="hp-card">
              <div className="hp-card-hd">
                <span className="hp-card-ttl">QUY TRÌNH HOẠT ĐỘNG</span>
              </div>
              <div className="hp-workflow">
                {workflow.map((step, i) => (
                  <div key={i} className="hp-wf-cell">
                    <div className="hp-wf-step">
                      <div className="hp-wf-icon-wrap">
                        <span className="hp-wf-num">{step.num}</span>
                        <div className="hp-wf-icon">{step.icon}</div>
                      </div>
                      <div className="hp-wf-title">{step.title}</div>
                      {step.desc && (
                        <div className="hp-wf-desc">{step.desc}</div>
                      )}
                    </div>
                    {i < workflow.length - 1 && (
                      <div className="hp-wf-arrow">
                        <FaArrowRight />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="hp-wf-note">
                <FaShieldAlt className="hp-wf-note-icon" />
                <p>
                  Mỗi văn bằng đều có mã định danh duy nhất và được lưu trữ trên
                  Blockchain, không thể sửa đổi hoặc làm giả.
                </p>
              </div>
            </div>

            {/* Card 3: Hướng dẫn xác thực */}
            <div className="hp-card">
              <div className="hp-card-hd">
                <span className="hp-card-ttl">HƯỚNG DẪN XÁC THỰC</span>
                <Link to="/guide" className="hp-see-all">
                  Xem chi tiết <FaChevronRight />
                </Link>
              </div>
              <div className="hp-guides">
                {guides.map((g, i) => (
                  <div key={i} className="hp-guide-row">
                    <div className="hp-guide-num">{g.num}</div>
                    <div className="hp-guide-icon">{g.icon}</div>
                    <div className="hp-guide-text">
                      <div className="hp-guide-title">{g.title}</div>
                      <div className="hp-guide-desc">{g.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* end hp-cards-row */}
        </div>
        {/* end hp-container */}
      </div>
      {/* end hp-body */}

      <Footer />
    </div>
  );
};

export default HomePage;
