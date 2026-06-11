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
  FaDownload,
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
    a: 'Sau khi đăng nhập với tư cách sinh viên, bạn có thể truy cập phần "Văn bằng của tôi" trong Dashboard để tải xuống.',
  },
  {
    q: "Quên tài khoản thì phải làm sao?",
    a: 'Bạn có thể sử dụng chức năng "Quên mật khẩu" trên trang đăng nhập. Hệ thống sẽ gửi email hướng dẫn khôi phục tài khoản.',
  },
  {
    q: "Thông tin của tôi có được bảo mật không?",
    a: "Hoàn toàn. Chúng tôi chỉ lưu trữ mã hash của văn bằng trên Blockchain công khai, không lưu thông tin cá nhân.",
  },
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
  const bannerImage = `${process.env.PUBLIC_URL}/pannerhuongdan.png`;

  return (
    <div className="gp-root">
      <div className="gp-body">
        <div className="gp-container">
          {/* ══════════════════════════════════════════
              FLAT GRID  2 cột × 3 hàng
              Hàng 1: Hero            | Mục hướng dẫn
              Hàng 2: Hướng dẫn nhanh| Câu hỏi TX gặp
              Hàng 3: Quy trình       | Liên hệ hỗ trợ
          ══════════════════════════════════════════ */}
          <div className="gp-grid">
            {/* ─────── HÀNG 1 ─────── */}

            {/* [1,1] HERO BANNER */}
            <div
              className="gp-hero"
              style={{
                backgroundImage: `url(${bannerImage})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="gp-hero-text">
                <h1 className="gp-hero-title">HƯỚNG DẪN SỬ DỤNG</h1>
                <p className="gp-hero-sub">
                  Tìm hiểu cách sử dụng hệ thống Quản lý và Xác thực Văn bằng,
                  Chứng chỉ số
                </p>
                <div className="gp-search">
                  <input
                    className="gp-search-input"
                    type="text"
                    placeholder="Tìm kiếm hướng dẫn..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="gp-search-btn" aria-label="search">
                    <FaSearch />
                  </button>
                </div>
              </div>
            </div>

            {/* [1,2] MỤC HƯỚNG DẪN */}
            <div className="gp-card gp-card--stretch">
              <div className="gp-card-hd">MỤC HƯỚNG DẪN</div>
              <ul className="gp-nav-menu">
                {MENU_ITEMS.map((m, i) => (
                  <li
                    key={i}
                    className={`gp-nav-item${m.active ? " active" : ""}`}
                  >
                    <span className="gp-nav-icon">{m.icon}</span>
                    <span className="gp-nav-label">{m.label}</span>
                    <FaChevronRight className="gp-nav-arr" />
                  </li>
                ))}
              </ul>
            </div>

            {/* ─────── HÀNG 2 ─────── */}

            {/* [2,1] HƯỚNG DẪN NHANH */}
            <section className="gp-section gp-section--stretch" id="student">
              <h2 className="gp-section-heading">HƯỚNG DẪN NHANH</h2>
              <div className="gp-qg-grid">
                {QUICK_GUIDES.map((g, i) => (
                  <div key={i} className="gp-qg-card">
                    <div className="gp-qg-icon-ring">
                      <span className="gp-qg-icon">{g.icon}</span>
                    </div>
                    <div className="gp-qg-title">{g.title}</div>
                    <div className="gp-qg-desc">{g.desc}</div>
                    <a href={g.link} className="gp-qg-btn">
                      Xem hướng dẫn <FaChevronRight className="gp-qg-btn-arr" />
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* [2,2] CÂU HỎI THƯỜNG GẶP */}
            <div className="gp-card gp-card--stretch" id="faq">
              <div className="gp-card-hd gp-card-hd--row">
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
                        <FaChevronDown className="gp-faq-arr" />
                      ) : (
                        <FaChevronRight className="gp-faq-arr" />
                      )}
                    </button>
                    {openFAQ === i && <div className="gp-faq-a">{f.a}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* ─────── HÀNG 3 ─────── */}

            {/* [3,1] QUY TRÌNH SỬ DỤNG */}
            <section className="gp-section gp-section--stretch" id="verify">
              <h2 className="gp-section-heading">QUY TRÌNH SỬ DỤNG HỆ THỐNG</h2>
              <div className="gp-workflow">
                {WORKFLOW.map((s, i) => (
                  <div key={i} className="gp-wf-col">
                    <div className="gp-wf-icon-wrap">
                      <div className="gp-wf-icon">{s.icon}</div>
                      <div className="gp-wf-num">{s.num}</div>
                    </div>
                    <div className="gp-wf-title">{s.title}</div>
                    <div className="gp-wf-desc">{s.desc}</div>
                    {i < WORKFLOW.length - 1 && (
                      <div className="gp-wf-connector" aria-hidden="true">
                        <span className="gp-wf-dashes" />
                        <FaChevronRight className="gp-wf-arr" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* [3,2] LIÊN HỆ HỖ TRỢ */}
            <div className="gp-card gp-card--stretch">
              <div className="gp-card-hd">LIÊN HỆ HỖ TRỢ</div>
              <p className="gp-ct-desc">
                Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua các kênh
                bên dưới.
              </p>
              <div className="gp-ct-body">
                <div className="gp-ct-list">
                  <div className="gp-ct-row">
                    <FaPhone className="gp-ct-icon" />
                    <span>1900 1234</span>
                  </div>
                  <div className="gp-ct-row">
                    <FaEnvelope className="gp-ct-icon" />
                    <span>hotro@vanbangso.edu.vn</span>
                  </div>
                  <div className="gp-ct-row">
                    <FaClock className="gp-ct-icon" />
                    <span>Thứ 2 – Thứ 6: 8:00 – 17:30</span>
                  </div>
                </div>
                <div className="gp-ct-avatar">
                  <div className="gp-ct-avatar-ring">
                    <div className="gp-ct-avatar-circle">
                      <FaHeadset className="gp-ct-avatar-icon" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /gp-grid */}
        </div>
      </div>
    </div>
  );
}
