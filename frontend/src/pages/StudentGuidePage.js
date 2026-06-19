import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronRight,
  FaClock,
  FaDownload,
  FaEnvelope,
  FaFileAlt,
  FaGraduationCap,
  FaHeadset,
  FaInfoCircle,
  FaListAlt,
  FaLock,
  FaPhoneAlt,
  FaQrcode,
  FaQuestionCircle,
  FaShareAlt,
  FaShieldAlt,
  FaSignInAlt,
  FaUniversity,
  FaUserGraduate,
  FaBook,
} from "react-icons/fa";
import "./StudentGuidePage.css";

const guideMenu = [
  { icon: <FaBook />, label: "Giới thiệu chung", to: "/guide" },
  {
    icon: <FaUserGraduate />,
    label: "Hướng dẫn cho Sinh viên",
    to: "/guide/student",
  },
  {
    icon: <FaUniversity />,
    label: "Hướng dẫn cho Nhà trường",
    href: "#school",
  },
  { icon: <FaQrcode />, label: "Xác thực văn bằng", to: "/verify" },
  { icon: <FaQuestionCircle />, label: "Câu hỏi thường gặp", href: "#faq" },
  { icon: <FaHeadset />, label: "Liên hệ hỗ trợ", href: "#support" },
];

const studentSteps = [
  {
    icon: <FaSignInAlt />,
    title: "Đăng nhập tài khoản",
    description:
      "Đăng nhập vào hệ thống bằng tài khoản được nhà trường cung cấp.",
  },
  {
    icon: <FaListAlt />,
    title: "Xem danh sách văn bằng",
    description:
      "Tại mục “Danh sách văn bằng”, sinh viên có thể xem tất cả văn bằng, chứng chỉ đã được cấp.",
  },
  {
    icon: <FaFileAlt />,
    title: "Xem chi tiết văn bằng",
    description:
      "Nhấn vào văn bằng để xem thông tin chi tiết, gồm: thông tin văn bằng, mã định danh, thời gian cấp và nhà trường cấp.",
  },
  {
    icon: <FaDownload />,
    title: "Tải văn bằng (Bản PDF)",
    description:
      "Tải văn bằng, chứng chỉ số về thiết bị dưới dạng tệp PDF có chữ ký số của nhà trường.",
  },
  {
    icon: <FaQrcode />,
    title: "Chia sẻ văn bằng",
    description:
      "Sử dụng mã QR hoặc đường link chia sẻ để gửi cho nhà tuyển dụng hay các bên cần xác thực.",
  },
];

const faqs = [
  {
    question: "Làm sao để biết văn bằng được cấp bởi hệ thống là thật?",
    answer:
      "Quét mã QR hoặc nhập mã xác thực trên trang Xác thực văn bằng. Hệ thống sẽ đối chiếu dữ liệu đã được lưu trên Blockchain.",
  },
  {
    question: "Văn bằng, chứng chỉ số có giá trị pháp lý không?",
    answer:
      "Văn bằng số được nhà trường phát hành và ký số, có giá trị sử dụng theo quy định hiện hành của đơn vị cấp.",
  },
  {
    question: "Tôi có thể tải văn bằng, chứng chỉ số ở đâu?",
    answer:
      "Sau khi đăng nhập, mở danh sách văn bằng, chọn văn bằng cần xem và nhấn nút tải bản PDF.",
  },
  {
    question: "Quên tài khoản thì phải làm sao?",
    answer:
      "Liên hệ nhà trường hoặc bộ phận hỗ trợ để được kiểm tra và cấp lại thông tin đăng nhập.",
  },
  {
    question: "Thông tin của tôi có được bảo mật không?",
    answer:
      "Thông tin cá nhân được kiểm soát quyền truy cập; Blockchain chỉ lưu dữ liệu phục vụ đối chiếu và xác thực.",
  },
];

const renderGuideLink = (item, className, children) =>
  item.to ? (
    <Link className={className} to={item.to}>
      {children}
    </Link>
  ) : (
    <a className={className} href={item.href || "#student-process"}>
      {children}
    </a>
  );

function StudentGuidePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const location = useLocation();
  const bannerImage = `${process.env.PUBLIC_URL}/bannerhuongdansv.png`;

  const activeHref = (href) => location.pathname === href;

  return (
    <main className="student-guide">
      <div className="student-guide__container">
        <div className="student-guide__layout">
          <div className="student-guide__main">
            <section
              className="student-guide__hero"
              style={{
                backgroundImage: `url(${bannerImage})`,
                backgroundPosition: "right center",
                backgroundSize: "66% auto",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="student-guide__hero-copy">
                <div className="student-guide__hero-icon">
                  <FaGraduationCap />
                </div>
                <div>
                  <h1>HƯỚNG DẪN SỬ DỤNG</h1>
                  <p>
                    Tìm hiểu cách tra cứu, quản lý và sử dụng văn bằng, chứng
                    chỉ số được cấp trên hệ thống một cách hiệu quả.
                  </p>
                </div>
              </div>
            </section>

            <section className="student-guide__process" id="student-process">
              <h2>QUY TRÌNH TRA CỨU VÀ SỬ DỤNG VĂN BẰNG, CHỨNG CHỈ SỐ</h2>

              <div className="student-guide__steps">
                {studentSteps.map((step, index) => (
                  <article className="student-guide__step" key={step.title}>
                    <span className="student-guide__step-number">
                      {index + 1}
                    </span>
                    <h3>{step.title}</h3>
                    <div className="student-guide__step-visual">
                      <span className="student-guide__visual-window">
                        {step.icon}
                      </span>
                      {index === 0 && (
                        <FaLock className="student-guide__mini-icon" />
                      )}
                      {index === 4 && (
                        <FaShareAlt className="student-guide__mini-icon" />
                      )}
                    </div>
                    <p>{step.description}</p>

                    {index < studentSteps.length - 1 && (
                      <FaChevronRight
                        className="student-guide__step-arrow"
                        aria-hidden="true"
                      />
                    )}
                  </article>
                ))}
              </div>

              <div className="student-guide__notice">
                <div className="student-guide__notice-head">
                  <div className="student-guide__notice-icon">
                    <FaShieldAlt />
                  </div>
                  <h3>Lưu ý quan trọng</h3>
                </div>
                <ul>
                  <li>
                    Văn bằng, chứng chỉ số do nhà trường cấp trên hệ thống có
                    giá trị tương đương văn bằng bản giấy.
                  </li>
                  <li>
                    Thông tin văn bằng được lưu trữ và bảo mật bằng công nghệ
                    Blockchain, không thể tự ý sửa đổi hoặc làm giả.
                  </li>
                  <li>
                    Nếu phát hiện sai sót, vui lòng liên hệ nhà trường để được
                    hỗ trợ.
                  </li>
                </ul>
              </div>
            </section>
          </div>

          <aside className="student-guide__sidebar">
            <div className="gp-card gp-card--stretch">
              <div className="gp-card-hd">MỤC HƯỚNG DẪN</div>
              <ul className="gp-nav-menu">
                {guideMenu.map((item) => (
                  <li
                    key={item.label}
                    className={`gp-nav-item${activeHref(item.to || item.href) ? " active" : ""}`}
                  >
                    {renderGuideLink(
                      item,
                      "gp-nav-link",
                      <>
                        <span className="gp-nav-icon">{item.icon}</span>
                        <span className="gp-nav-label">{item.label}</span>
                        <FaChevronRight className="gp-nav-arr" />
                      </>,
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="gp-card" id="faq">
              <div className="gp-card-hd gp-card-hd--row">
                <span>CÂU HỎI THƯỜNG GẶP</span>
                <a href="#faq" className="gp-card-more">
                  Xem tất cả
                </a>
              </div>
              <div className="gp-faq">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;

                  return (
                    <div
                      key={faq.question}
                      className={`gp-faq-item${isOpen ? " open" : ""}`}
                    >
                      <button
                        type="button"
                        className="gp-faq-q"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.question}</span>
                        {isOpen ? (
                          <FaChevronDown className="gp-faq-arr" />
                        ) : (
                          <FaChevronRight className="gp-faq-arr" />
                        )}
                      </button>
                      {isOpen && <div className="gp-faq-a">{faq.answer}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="gp-card gp-card--stretch" id="support">
              <div className="gp-card-hd">LIÊN HỆ HỖ TRỢ</div>
              <p className="gp-ct-desc">
                Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua các kênh
                bên dưới.
              </p>
              <div className="gp-ct-body">
                <div className="gp-ct-list">
                  <div className="gp-ct-row">
                    <FaPhoneAlt className="gp-ct-icon" />
                    <span>0368 251 814</span>
                  </div>
                  <div className="gp-ct-row">
                    <FaEnvelope className="gp-ct-icon" />
                    <span>linhyang0702@gmail.com</span>
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
          </aside>
        </div>
      </div>
    </main>
  );
}

export default StudentGuidePage;
