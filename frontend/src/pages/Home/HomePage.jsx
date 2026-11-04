import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
  FaSpinner,
} from "react-icons/fa";
import Footer from "../../components/Footer/Footer";
import CertificateVerificationDialog from "../../components/CertificateVerificationDialog/CertificateVerificationDialog";
import { api } from "../../services/api";
import { decodeQrCodeFromImage } from "../../utils/qrCodeUtils";
import "./HomePage.css";

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

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

const HomePage = () => {
  const [verifyTab, setVerifyTab] = useState("qr");
  const [quickCode, setQuickCode] = useState("");
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState("");
  const [verifyQuery, setVerifyQuery] = useState("");
  const [qrProcessing, setQrProcessing] = useState(false);
  const qrFileInputRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [recentCerts, setRecentCerts] = useState([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [certsError, setCertsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const response = await api.getStatsSummary();
        if (!response?.success || !response.stats) {
          throw new Error(response?.message || "Không thể tải số liệu hệ thống.");
        }
        if (isMounted) setStats(response.stats);
      } catch (error) {
        console.error("Failed to load homepage statistics:", error);
        if (isMounted) {
          setStatsError(error.message || "Không thể tải số liệu hệ thống.");
        }
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    const loadRecentCertificates = async () => {
      try {
        const response = await api.getPublicCertificates({
          status: "issued",
          page: 1,
          limit: 3,
        });
        if (!response?.success || !Array.isArray(response.certificates)) {
          throw new Error(response?.message || "Không thể tải văn bằng mới cấp.");
        }
        if (isMounted) setRecentCerts(response.certificates);
      } catch (error) {
        console.error("Failed to load recent certificates:", error);
        if (isMounted) {
          setCertsError(error.message || "Không thể tải văn bằng mới cấp.");
        }
      } finally {
        if (isMounted) setCertsLoading(false);
      }
    };

    loadStats();
    loadRecentCertificates();

    return () => {
      isMounted = false;
    };
  }, []);

  const statsCards = [
    {
      icon: <FaFileAlt />,
      number: statsLoading ? "..." : stats ? formatNumber(stats.totalIssued) : "—",
      label: "Văn bằng đã cấp",
      subtext: "Tổng số văn bằng đã phát hành",
    },
    {
      icon: <FaShieldAlt />,
      number: statsLoading
        ? "..."
        : stats
          ? `${Number(stats.verificationSuccessRate || 0).toLocaleString("vi-VN")}%`
          : "—",
      label: "Xác thực thành công",
      subtext: stats
        ? `${formatNumber(stats.successfulVerifications)} / ${formatNumber(stats.totalVerifications)} lượt`
        : "Số liệu từ nhật ký xác thực",
    },
    {
      icon: <FaUniversity />,
      number: statsLoading ? "..." : stats ? formatNumber(stats.totalSchools) : "—",
      label: "Đơn vị tham gia",
      subtext: "Tổng số đơn vị trên hệ thống",
    },
    {
      icon: <FaUsers />,
      number: statsLoading
        ? "..."
        : stats
          ? formatNumber(stats.totalBlockchainTransactions)
          : "—",
      label: "Giao dịch trên Blockchain",
      subtext: "Giao dịch có mã xác nhận lưu trữ",
    },
  ];

  const handleVerify = async (value) => {
    const lookupValue = (typeof value === "string" ? value : quickCode).trim();
    setVerifyModalOpen(true);
    setVerifyQuery(lookupValue);
    setVerifyResult(null);
    setVerifyError("");
    if (!lookupValue) {
      setVerifyError("Vui lòng nhập mã văn bằng, mã sinh viên hoặc mã Hash.");
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await api.verifyCertificate(lookupValue);
      if (!response?.success) {
        setVerifyError(response?.message || "Không tìm thấy văn bằng trong hệ thống.");
        return;
      }
      setVerifyResult(response);
    } catch (error) {
      console.error("Homepage certificate verification failed:", error);
      setVerifyError("Không thể kết nối máy chủ để xác thực văn bằng. Vui lòng thử lại.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleQuickVerify = () => handleVerify(quickCode);

  const handleQrImageSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setQrProcessing(true);
    try {
      const lookupValue = await decodeQrCodeFromImage(file);
      setQuickCode(lookupValue);
      await handleVerify(lookupValue);
    } catch (error) {
      setVerifyModalOpen(true);
      setVerifyQuery("Ảnh QR đã chọn");
      setVerifyResult(null);
      setVerifyError(error.message || "Không thể đọc mã QR từ hình ảnh.");
    } finally {
      setQrProcessing(false);
    }
  };

  return (
    <div className="hp-root">
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
                {statsCards.map((s, i) => (
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
              {statsError && (
                <p className="hp-data-message" role="alert">
                  Không thể tải số liệu: {statsError}
                </p>
              )}
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
                  <input
                    ref={qrFileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleQrImageSelected}
                    aria-label="Chọn ảnh mã QR"
                  />
                  <button
                    className="hp-upload-btn"
                    type="button"
                    disabled={qrProcessing || verifyLoading}
                    onClick={() => qrFileInputRef.current?.click()}
                  >
                    {qrProcessing ? <><FaSpinner className="fa-spin" /> Đang đọc mã QR...</> : <><FaUpload /> Tải ảnh lên</>}
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
                    placeholder="Nhập mã văn bằng cần xác thực"
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
                {certsLoading ? (
                  <p className="hp-data-message">Đang tải văn bằng...</p>
                ) : certsError ? (
                  <p className="hp-data-message" role="alert">
                    Không thể tải văn bằng: {certsError}
                  </p>
                ) : recentCerts.length > 0 ? (
                  recentCerts.map((cert) => (
                    <div key={cert.id} className="hp-cert-row">
                      <div className="hp-cert-av">
                        {getInitials(cert.student_name)}
                      </div>
                      <div className="hp-cert-info">
                        <div className="hp-cert-name">
                          {cert.student_name || "Chưa có tên sinh viên"}
                        </div>
                        <div className="hp-cert-deg">
                          {cert.major || cert.degree_type || "Chưa cập nhật ngành học"}
                        </div>
                        <div className="hp-cert-id">
                          Mã VB: {cert.certificate_code}
                        </div>
                      </div>
                      <div className="hp-cert-meta">
                        <span className="hp-cert-badge">
                          {cert.blockchain_tx_hash
                            ? "Đã ghi Blockchain"
                            : "Đã phát hành"}
                        </span>
                        <span className="hp-cert-time">
                          {cert.issue_date
                            ? new Date(cert.issue_date).toLocaleDateString("vi-VN")
                            : "Chưa có ngày cấp"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="hp-data-message">Chưa có văn bằng nào được cấp.</p>
                )}
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
      <CertificateVerificationDialog
        isOpen={verifyModalOpen}
        loading={verifyLoading}
        error={verifyError}
        result={verifyResult}
        query={verifyQuery}
        onClose={() => setVerifyModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
