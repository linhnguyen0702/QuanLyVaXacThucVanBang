import { useState } from "react";
import {
  FaSearch,
  FaChevronRight,
  FaChevronDown,
  FaUserGraduate,
  FaUniversity,
  FaQrcode,
  FaQuestionCircle,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaHeadset,
  FaBook,
  FaUserPlus,
  FaSignInAlt,
  FaList,
  FaCheckCircle,
  FaDownload,
  FaFileAlt,
  FaShieldAlt,
} from "react-icons/fa";
import "./GuidePage.css";

const MENU_ITEMS = [
  { icon: <FaBook />, label: "Giới thiệu chung", active: true },
  { icon: <FaUserGraduate />, label: "Hướng dẫn cho Sinh viên" },
  { icon: <FaUniversity />, label: "Hướng dẫn cho Nhà trường" },
  { icon: <FaQrcode />, label: "Xác thực văn bằng" },
  { icon: <FaQuestionCircle />, label: "Câu hỏi thường gặp" },
  { icon: <FaHeadset />, label: "Liên hệ hỗ trợ" },
];

const QUICK_GUIDES = [
  {
    icon: <FaUserGraduate />,
    title: "1. Dành cho Sinh viên",
    desc: "Hướng dẫn tra cứu, xem và tải văn bằng, chứng chỉ số.",
    link: "#student",
  },
  {
    icon: <FaUniversity />,
    title: "2. Dành cho Nhà trường",
    desc: "Hướng dẫn cấp, quản lý và ký số văn bằng, chứng chỉ.",
    link: "#school",
  },
  {
    icon: <FaQrcode />,
    title: "3. Xác thực văn bằng",
    desc: "Hướng dẫn xác thực văn bằng, chứng chỉ nhanh chóng.",
    link: "#verify",
  },
  {
    icon: <FaQuestionCircle />,
    title: "4. Câu hỏi thường gặp",
    desc: "Giải đáp các thắc mắc thường gặp khi sử dụng hệ thống.",
    link: "#faq",
  },
];

const FAQS = [
  { q: "Làm sao để biết văn bằng được cấp bởi hệ thống là thật?" },
  { q: "Văn bằng, chứng chỉ số có giá trị pháp lý không?" },
  { q: "Tôi có thể tải văn bằng, chứng chỉ số ở đâu?" },
  { q: "Quên tài khoản thì phải làm sao?" },
  { q: "Thông tin của tôi có được bảo mật không?" },
];

const FAQ_ANSWERS = [
  "Mỗi văn bằng được lưu trữ mã hash trên Blockchain Ethereum. Bạn có thể xác thực bất kỳ lúc nào bằng cách quét mã QR hoặc nhập mã xác thực. Thông tin trên Blockchain là bất biến, không thể sửa đổi hay làm giả.",
  "Văn bằng số được ký số bởi tổ chức cấp bằng, có đầy đủ giá trị pháp lý theo quy định hiện hành.",
  'Sau khi đăng nhập với tư cách sinh viên, bạn có thể truy cập phần "Văn bằng của tôi" trong Dashboard.',
  'Bạn có thể sử dụng chức năng "Quên mật khẩu" trên trang đăng nhập. Hệ thống sẽ gửi email hướng dẫn khôi phục.',
  "Hoàn toàn. Chúng tôi chỉ lưu trữ mã hash của văn bằng trên Blockchain công khai, không lưu thông tin cá nhân.",
];

const WORKFLOW = [
  {
    icon: <FaUserPlus />,
    num: "1",
    title: "Đăng ký tài khoản",
    desc: "Liên hệ quản trị hệ thống để được cấp đăng nhập vào hệ thống.",
  },
  {
    icon: <FaSignInAlt />,
    num: "2",
    title: "Đăng nhập hệ thống",
    desc: "Sử dụng tài khoản được cấp để đăng nhập vào hệ thống.",
  },
  {
    icon: <FaList />,
    num: "3",
    title: "Quản lý / Tra cứu",
    desc: "Sinh viên tra cứu văn bằng, Nhà trường quản lý và cấp văn bằng.",
  },
  {
    icon: <FaShieldAlt />,
    num: "4",
    title: "Xác thực thông tin",
    desc: "Kiểm tra tính xác thực của văn bằng, chứng chỉ trên Blockchain.",
  },
  {
    icon: <FaDownload />,
    num: "5",
    title: "Tải văn bằng",
    desc: "Tải văn bằng, chứng chỉ và thiết bị khi cần thiết.",
  },
];

export default function GuidePage() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [search, setSearch] = useState("");

  return (
    <div className="gp-root">
      <div className="gp-body">
        <div className="gp-container">
          {/* ── TWO-COLUMN LAYOUT ── */}
          <div className="gp-layout">
            {/* ══════════════════════════════════════
                LEFT COLUMN
            ══════════════════════════════════════ */}
            <div className="gp-left">
              {/* HERO BANNER */}
              <div className="gp-hero">
                {/* Decorative circles */}
                <span className="gp-hero-circle gp-hero-circle--1" />
                <span className="gp-hero-circle gp-hero-circle--2" />

                <div className="gp-hero-text">
                  <h1 className="gp-hero-title">HƯỚNG DẪN SỬ DỤNG</h1>
                  <p className="gp-hero-sub">
                    Tìm hiểu cách sử dụng hệ thống Quản lý và Xác thực Văn bằng,
                    Chứng chỉ số
                  </p>
                  <div className="gp-search">
                    <input
                      type="text"
                      className="gp-search-input"
                      placeholder="Tìm kiếm hướng dẫn..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="gp-search-btn" aria-label="Tìm kiếm">
                      <FaSearch />
                    </button>
                  </div>
                </div>

                {/* Right decorative image: glowing book + shield */}
                <div className="gp-hero-visual" aria-hidden="true">
                  <div className="gp-hero-glow" />
                  <div className="gp-hero-book">
                    <FaBook className="gp-hero-book-icon" />
                  </div>
                  <div className="gp-hero-shield">
                    <FaShieldAlt className="gp-hero-shield-icon" />
                    <span className="gp-hero-shield-q">?</span>
                  </div>
                </div>
              </div>

              {/* HƯỚNG DẪN NHANH */}
              <section className="gp-section">
                <h2 className="gp-section-heading">HƯỚNG DẪN NHANH</h2>
                <div className="gp-qg-grid">
                  {QUICK_GUIDES.map((g, i) => (
                    <div key={i} className="gp-qg-card">
                      <div className="gp-qg-icon-wrap">
                        <span className="gp-qg-icon">{g.icon}</span>
                      </div>
                      <div className="gp-qg-title">{g.title}</div>
                      <div className="gp-qg-desc">{g.desc}</div>
                      <a href={g.link} className="gp-qg-btn">
                        Xem hướng dẫn{" "}
                        <FaChevronRight className="gp-qg-btn-arrow" />
                      </a>
                    </div>
                  ))}
                </div>
              </section>

              {/* QUY TRÌNH SỬ DỤNG */}
              <section className="gp-section">
                <h2 className="gp-section-heading">
                  QUY TRÌNH SỬ DỤNG HỆ THỐNG
                </h2>
                <div className="gp-workflow">
                  {WORKFLOW.map((s, i) => (
                    <div key={i} className="gp-wf-item">
                      {/* Icon + number badge */}
                      <div className="gp-wf-icon-wrap">
                        <div className="gp-wf-icon">{s.icon}</div>
                        <div className="gp-wf-num">{s.num}</div>
                      </div>
                      <div className="gp-wf-title">{s.title}</div>
                      <div className="gp-wf-desc">{s.desc}</div>

                      {/* Dashed arrow connector */}
                      {i < WORKFLOW.length - 1 && (
                        <div className="gp-wf-arrow" aria-hidden="true">
                          <span className="gp-wf-arrow-line" />
                          <FaChevronRight className="gp-wf-arrow-chevron" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ══════════════════════════════════════
                RIGHT SIDEBAR
            ══════════════════════════════════════ */}
            <aside className="gp-sidebar">
              {/* MỤC HƯỚNG DẪN */}
              <div className="gp-card">
                <div className="gp-card-header">MỤC HƯỚNG DẪN</div>
                <ul className="gp-menu">
                  {MENU_ITEMS.map((m, i) => (
                    <li
                      key={i}
                      className={`gp-menu-item${m.active ? " active" : ""}`}
                    >
                      <span className="gp-menu-icon">{m.icon}</span>
                      <span className="gp-menu-label">{m.label}</span>
                      <FaChevronRight className="gp-menu-chevron" />
                    </li>
                  ))}
                </ul>
              </div>

              {/* CÂU HỎI THƯỜNG GẶP */}
              <div className="gp-card" id="faq">
                <div className="gp-card-header gp-card-header--row">
                  <span>CÂU HỎI THƯỜNG GẶP</span>
                  <a href="#" className="gp-card-more">
                    Xem tất cả
                  </a>
                </div>
                <div className="gp-faq">
                  {FAQS.map((f, i) => (
                    <div
                      key={i}
                      className={`gp-faq-item${openFAQ === i ? " open" : ""}`}
                    >
                      <button
                        className="gp-faq-q"
                        onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                      >
                        <span>{f.q}</span>
                        {openFAQ === i ? (
                          <FaChevronDown className="gp-faq-chevron" />
                        ) : (
                          <FaChevronRight className="gp-faq-chevron" />
                        )}
                      </button>
                      {openFAQ === i && (
                        <div className="gp-faq-a">{FAQ_ANSWERS[i]}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* LIÊN HỆ HỖ TRỢ */}
              <div className="gp-card gp-contact-card">
                <div className="gp-card-header">LIÊN HỆ HỖ TRỢ</div>
                <p className="gp-contact-desc">
                  Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua các
                  kênh bên dưới.
                </p>
                <div className="gp-contact-list">
                  <div className="gp-contact-row">
                    <FaPhone className="gp-contact-icon" />
                    <span>1900 1234</span>
                  </div>
                  <div className="gp-contact-row">
                    <FaEnvelope className="gp-contact-icon" />
                    <span>hotro@vanbangso.edu.vn</span>
                  </div>
                  <div className="gp-contact-row">
                    <FaClock className="gp-contact-icon" />
                    <span>Thứ 2 – Thứ 6: 8:00 – 17:30</span>
                  </div>
                </div>
                <div className="gp-contact-avatar">
                  <FaHeadset className="gp-contact-avatar-icon" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
