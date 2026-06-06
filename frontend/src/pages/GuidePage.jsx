import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaSearch, FaChevronRight, FaChevronDown, FaUserGraduate,
  FaUniversity, FaQrcode, FaQuestionCircle, FaPhone, FaEnvelope,
  FaClock, FaShieldAlt, FaUserPlus, FaSignInAlt, FaList,
  FaCheckCircle, FaDownload, FaHeadset, FaBook
} from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './GuidePage.css'

const FAQS = [
  {
    q: 'Làm sao để biết văn bằng được cấp bởi hệ thống là thật?',
    a: 'Mỗi văn bằng được lưu trữ mã hash trên Blockchain Ethereum. Bạn có thể xác thực bất kỳ lúc nào bằng cách quét mã QR hoặc nhập mã xác thực. Thông tin trên Blockchain là bất biến, không thể sửa đổi hay làm giả.'
  },
  {
    q: 'Văn bằng, chứng chỉ số có giá trị pháp lý không?',
    a: 'Văn bằng số được ký số bởi tổ chức cấp bằng, có đầy đủ giá trị pháp lý theo quy định hiện hành. Chữ ký số đảm bảo tính xác thực và toàn vẹn của văn bằng.'
  },
  {
    q: 'Tôi có thể tải văn bằng, chứng chỉ số ở đâu?',
    a: 'Sau khi đăng nhập với tư cách sinh viên, bạn có thể truy cập phần "Văn bằng của tôi" trong Dashboard để tải xuống văn bằng dưới dạng PDF có chứa mã QR xác thực.'
  },
  {
    q: 'Quên tài khoản thì phải làm sao?',
    a: 'Bạn có thể sử dụng chức năng "Quên mật khẩu" trên trang đăng nhập. Hệ thống sẽ gửi email hướng dẫn khôi phục tài khoản. Nếu không nhớ email, hãy liên hệ trực tiếp với đơn vị quản lý hệ thống.'
  },
  {
    q: 'Thông tin của tôi có được bảo mật không?',
    a: 'Hoàn toàn. Chúng tôi chỉ lưu trữ mã hash (dấu vân tay số) của văn bằng trên Blockchain công khai, không lưu thông tin cá nhân. Dữ liệu chi tiết được mã hóa và lưu trữ an toàn trên hệ thống của chúng tôi.'
  }
]

const MENU_ITEMS = [
  { icon: <FaBook />, label: 'Giới thiệu chung', active: true },
  { icon: <FaUserGraduate />, label: 'Hướng dẫn cho Sinh viên' },
  { icon: <FaUniversity />, label: 'Hướng dẫn cho Nhà trường' },
  { icon: <FaQrcode />, label: 'Xác thực văn bằng' },
  { icon: <FaQuestionCircle />, label: 'Câu hỏi thường gặp' },
  { icon: <FaHeadset />, label: 'Liên hệ hỗ trợ' }
]

const QUICK_GUIDES = [
  {
    icon: <FaUserGraduate />,
    title: '1. Dành cho Sinh viên',
    desc: 'Hướng dẫn tra cứu, xem và tải văn bằng, chứng chỉ số.',
    link: '#student'
  },
  {
    icon: <FaUniversity />,
    title: '2. Dành cho Nhà trường',
    desc: 'Hướng dẫn cấp, quản lý và ký số văn bằng, chứng chỉ.',
    link: '#school'
  },
  {
    icon: <FaQrcode />,
    title: '3. Xác thực văn bằng',
    desc: 'Hướng dẫn xác thực văn bằng, chứng chỉ nhanh chóng.',
    link: '#verify'
  },
  {
    icon: <FaQuestionCircle />,
    title: '4. Câu hỏi thường gặp',
    desc: 'Giải đáp các thắc mắc thường gặp khi sử dụng hệ thống.',
    link: '#faq'
  }
]

const WORKFLOW_STEPS = [
  { icon: <FaUserPlus />, number: '1', title: 'Đăng ký tài khoản', desc: 'Liên hệ quản trị hệ thống để được cấp đăng nhập vào hệ thống.' },
  { icon: <FaSignInAlt />, number: '2', title: 'Đăng nhập hệ thống', desc: 'Sử dụng tài khoản được cấp để đăng nhập vào hệ thống.' },
  { icon: <FaList />, number: '3', title: 'Quản lý / Tra cứu', desc: 'Sinh viên tra cứu văn bằng, Nhà trường quản lý và cấp văn bằng.' },
  { icon: <FaCheckCircle />, number: '4', title: 'Xác thực thông tin', desc: 'Kiểm tra tính xác thực của văn bằng, chứng chỉ trên Blockchain.' },
  { icon: <FaDownload />, number: '5', title: 'Tải văn bằng', desc: 'Tải văn bằng, chứng chỉ và thiết bị khi cần thiết.' }
]

const GuidePage = () => {
  const [openFAQ, setOpenFAQ] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="guide-page">
      <Navbar />

      <div className="guide-main">
        <div className="guide-outer">
          <div className="guide-grid">
            {/* Left: Content */}
            <div className="guide-content">
              {/* Hero */}
              <div className="guide-hero">
                <div className="guide-hero-text">
                  <h1 className="guide-hero-title">HƯỚNG DẪN SỬ DỤNG</h1>
                  <p className="guide-hero-desc">
                    Tìm hiểu cách sử dụng hệ thống Quản lý và Xác thực Văn bằng, Chứng chỉ số
                  </p>
                  <div className="guide-search-box">
                    <FaSearch className="guide-search-icon" />
                    <input
                      type="text"
                      className="guide-search-input"
                      placeholder="Tìm kiếm hướng dẫn..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="guide-hero-image">
                  <div className="guide-hero-icon-wrap">
                    <FaBook className="guide-hero-icon" />
                    <div className="guide-hero-glow"></div>
                  </div>
                </div>
              </div>

              {/* Quick Guide Cards */}
              <section className="guide-section">
                <h2 className="guide-section-title">HƯỚNG DẪN NHANH</h2>
                <div className="quick-guide-grid">
                  {QUICK_GUIDES.map((g, idx) => (
                    <div key={idx} className="quick-guide-card">
                      <div className="quick-guide-icon">{g.icon}</div>
                      <div className="quick-guide-title">{g.title}</div>
                      <div className="quick-guide-desc">{g.desc}</div>
                      <a href={g.link} className="quick-guide-link">
                        Xem hướng dẫn <FaChevronRight />
                      </a>
                    </div>
                  ))}
                </div>
              </section>

              {/* Workflow Steps */}
              <section className="guide-section">
                <h2 className="guide-section-title">QUY TRÌNH SỬ DỤNG HỆ THỐNG</h2>
                <div className="workflow-steps">
                  {WORKFLOW_STEPS.map((step, idx) => (
                    <div key={idx} className="workflow-item">
                      <div className="workflow-item-icon">
                        {step.icon}
                        <div className="workflow-item-number">{step.number}</div>
                      </div>
                      <div className="workflow-item-content">
                        <div className="workflow-item-title">{step.title}</div>
                        <div className="workflow-item-desc">{step.desc}</div>
                      </div>
                      {idx < WORKFLOW_STEPS.length - 1 && (
                        <div className="workflow-arrow-right"><FaChevronRight /></div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right: Sidebar */}
            <div className="guide-sidebar">
              {/* Menu */}
              <div className="sidebar-panel">
                <h3 className="sidebar-panel-title">MỤC HƯỚNG DẪN</h3>
                <ul className="sidebar-menu">
                  {MENU_ITEMS.map((item, idx) => (
                    <li key={idx} className={`sidebar-menu-item ${item.active ? 'active' : ''}`}>
                      <span className="sidebar-menu-icon">{item.icon}</span>
                      <span className="sidebar-menu-label">{item.label}</span>
                      <FaChevronRight className="sidebar-menu-arrow" />
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQ */}
              <div className="sidebar-panel" id="faq">
                <div className="sidebar-panel-header">
                  <h3 className="sidebar-panel-title">CÂU HỎI THƯỜNG GẶP</h3>
                  <a href="#" className="sidebar-panel-link">Xem tất cả</a>
                </div>
                <div className="faq-list">
                  {FAQS.map((faq, idx) => (
                    <div
                      key={idx}
                      className={`faq-item ${openFAQ === idx ? 'open' : ''}`}
                    >
                      <button
                        className="faq-question"
                        onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                      >
                        <span>{faq.q}</span>
                        {openFAQ === idx ? <FaChevronDown /> : <FaChevronRight />}
                      </button>
                      {openFAQ === idx && (
                        <div className="faq-answer">{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="sidebar-panel contact-panel">
                <h3 className="sidebar-panel-title">LIÊN HỆ HỖ TRỢ</h3>
                <p className="contact-desc">
                  Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua các kênh bên dưới.
                </p>
                <div className="contact-items">
                  <div className="contact-item">
                    <FaPhone className="contact-icon" />
                    <span>1900 1234</span>
                  </div>
                  <div className="contact-item">
                    <FaEnvelope className="contact-icon" />
                    <span>hotro@vanbangso.edu.vn</span>
                  </div>
                  <div className="contact-item">
                    <FaClock className="contact-icon" />
                    <span>Thứ 2 – Thứ 6: 8:00 – 17:30</span>
                  </div>
                </div>
                <div className="support-avatar">
                  <div className="support-avatar-icon">
                    <FaHeadset />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default GuidePage
