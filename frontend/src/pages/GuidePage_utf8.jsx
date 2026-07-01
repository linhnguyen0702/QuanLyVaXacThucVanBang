import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  FaKeyboard,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaListAlt,
  FaCube,
  FaLock,
  FaShareAlt,
  FaGraduationCap,
  FaFileAlt,
} from "react-icons/fa";
import "./GuidePage.css";
import "./StudentGuidePage.css";

const MENU_ITEMS = [
  { id: "general", icon: <FaBook />, label: "Giới thiệu chung" },
  { id: "student", icon: <FaUserGraduate />, label: "Hướng dẫn cho Sinh viên" },
  { id: "school", icon: <FaUniversity />, label: "Hướng dẫn cho Nhà trường" },
  { id: "verify", icon: <FaQrcode />, label: "Xác thực văn bằng" },
  { id: "faq", icon: <FaQuestionCircle />, label: "Câu hỏi thường gặp" },
  { id: "support", icon: <FaHeadset />, label: "Liên hệ hỗ trợ" },
];

const QUICK_GUIDES = [
  {
    icon: <FaUserGraduate />,
    title: "1. Dành cho Sinh viên",
    desc: "Hướng dẫn tra cứu, xem và tải văn bằng, chứng chỉ số.",
    tabId: "student",
  },
  {
    icon: <FaUniversity />,
    title: "2. Dành cho Nhà trường",
    desc: "Hướng dẫn cấp, quản lý và ký số văn bằng, chứng chỉ.",
    tabId: "school",
  },
  {
    icon: <FaQrcode />,
    title: "3. Xác thực văn bằng",
    desc: "Hướng dẫn xác thực văn bằng, chứng chỉ nhanh chóng.",
    tabId: "verify",
  },
  {
    icon: <FaQuestionCircle />,
    title: "4. Câu hỏi thường gặp",
    desc: "Giải đáp các thắc mắc thường gặp khi sử dụng hệ thống.",
    tabId: "faq",
  },
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
    a: "Không cần. Nhà tuyển dụng hoặc bất kỳ bên thứ ba nào chỉ cần truy cập trang 'Xác thực văn bằng' công khai để quét mã QR hoặc nhập mã số văn bằng trực tiếp để đối chiếu tức thì với Blockchain.",
  },
  {
    q: "Làm thế nào để sửa thông tin văn bằng bị sai lệch?",
    a: "Sinh viên cần liên hệ ngay với Phòng Đào tạo của nhà trường để yêu cầu chỉnh sửa. Nhà trường sẽ thực hiện thu hồi văn bằng cũ và cấp lại một bản ghi mới trên Blockchain.",
  },
];

const ALL_FAQS = [
  {
    category: "legal",
    question: "Văn bằng, chứng chỉ số trên hệ thống này có giá trị pháp lý không?",
    answer: "Có. Văn bằng số được ký bằng chữ ký số hợp pháp của cơ sở đào tạo (Nhà trường), đảm bảo tính toàn vẹn và chống chối bỏ theo quy định của Luật Giao dịch điện tử. Văn bằng số này có giá trị sử dụng tương đương với văn bằng bản giấy truyền thống."
  },
  {
    category: "tech",
    question: "Làm sao để biết văn bằng được cấp bởi hệ thống là thật?",
    answer: "Mỗi văn bằng được lưu trữ một mã hash duy nhất trên Blockchain Ethereum. Khi thực hiện xác thực (quét QR hoặc nhập mã), hệ thống sẽ tính toán mã hash của văn bằng hiện tại và so sánh trực tiếp với mã hash gốc đã được ghi nhận trên Blockchain. Nếu hai mã này khớp nhau và trạng thái hợp lệ, văn bằng được xác nhận là thật."
  },
  {
    category: "user",
    question: "Tôi có thể tải văn bằng, chứng chỉ số của mình ở đâu?",
    answer: "Sau khi đăng nhập vào hệ thống bằng tài khoản sinh viên được nhà trường cấp, bạn hãy truy cập vào mục 'Văn bằng của tôi' trên thanh menu. Tại đây, danh sách các văn bằng của bạn sẽ hiện ra, và bạn có thể nhấn vào biểu tượng Tải xuống (Download) để tải về tệp PDF văn bằng có chứa chữ ký số."
  },
  {
    category: "tech",
    question: "Cơ sở giáo dục (Nhà trường) cần chuẩn bị gì để tham gia hệ thống?",
    answer: "Nhà trường cần đăng ký tài khoản quản trị trên hệ thống, được cấp địa chỉ ví Blockchain (Ethereum) đã được phê duyệt làm đại diện hợp pháp trên Smart Contract. Đồng thời, nhà trường cần chuẩn bị khóa bí mật của ví để thực hiện ký số và thanh toán phí gas cho các giao dịch ghi dữ liệu lên Blockchain."
  },
  {
    category: "user",
    question: "Nếu phát hiện thông tin trên văn bằng số bị sai thì phải làm thế nào?",
    answer: "Sinh viên cần liên hệ ngay với Phòng Đào tạo của nhà trường để yêu cầu chỉnh sửa. Nhà trường sẽ thực hiện thu hồi (revoke) văn bằng cũ trên Blockchain và cấp phát một văn bằng mới có mã định danh và mã băm mới đã được hiệu chỉnh thông tin chính xác."
  },
  {
    category: "tech",
    question: "Mạng lưới Blockchain công khai có làm lộ thông tin cá nhân của tôi không?",
    answer: "Hoàn toàn không. Công nghệ Blockchain trong hệ thống chỉ lưu trữ mã băm mật mã (cryptographic hash) của văn bằng và mã định danh giao dịch, không lưu thông tin cá nhân chi tiết dưới dạng văn bản rõ. Thông tin cá nhân chi tiết của bạn được lưu trữ bảo mật tại cơ sở dữ liệu riêng tư của nhà trường và hệ thống, chỉ hiển thị khi có yêu cầu truy xuất và xác thực hợp lệ."
  },
  {
    category: "user",
    question: "Nhà tuyển dụng có cần tài khoản để xác thực văn bằng không?",
    answer: "Không cần. Nhà tuyển dụng hoặc bất kỳ bên thứ ba nào chỉ cần truy cập trang 'Xác thực văn bằng' công khai của hệ thống để quét mã QR trên bằng hoặc nhập mã số văn bằng trực tiếp để nhận kết quả xác minh tức thì từ Blockchain."
  }
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

const STUDENT_STEPS = [
  {
    icon: <FaSignInAlt />,
    title: "Đăng nhập tài khoản",
    description: "Đăng nhập vào hệ thống bằng tài khoản email được nhà trường cung cấp khi tốt nghiệp.",
  },
  {
    icon: <FaListAlt />,
    title: "Xem danh sách văn bằng",
    description: "Tại mục “Danh sách văn bằng”, sinh viên có thể xem tất cả văn bằng, chứng chỉ đã được cấp.",
  },
  {
    icon: <FaFileAlt />,
    title: "Xem chi tiết văn bằng",
    description: "Nhấn vào văn bằng để xem thông tin chi tiết, gồm: thông tin văn bằng, mã định danh, thời gian cấp và nhà trường cấp.",
  },
  {
    icon: <FaDownload />,
    title: "Tải văn bằng (Bản PDF)",
    description: "Tải văn bằng, chứng chỉ số về thiết bị dưới dạng tệp PDF có chữ ký số của nhà trường.",
  },
  {
    icon: <FaShareAlt />,
    title: "Chia sẻ văn bằng",
    description: "Sử dụng mã QR hoặc đường link chia sẻ để gửi cho nhà tuyển dụng hay các bên cần xác thực.",
  },
];

const SCHOOL_STEPS = [
  {
    icon: <FaUserPlus />,
    title: "Kết nối ví Blockchain",
    description: "Nhà trường đăng nhập và kết nối ví điện tử MetaMask chứa địa chỉ ví đã được ủy quyền trên Smart Contract.",
  },
  {
    icon: <FaListAlt />,
    title: "Quản lý danh sách",
    description: "Tải lên danh sách sinh viên đủ điều kiện tốt nghiệp thông qua bảng nhập liệu hoặc file Excel mẫu.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Tạo và Ký số văn bằng",
    description: "Hệ thống tính toán mã băm (hash) của văn bằng, đại diện nhà trường tiến hành duyệt và ký số điện tử.",
  },
  {
    icon: <FaCube />,
    title: "Ghi lên Blockchain",
    description: "Thực hiện giao dịch ghi mã băm văn bằng lên mạng lưới Ethereum, tạo ra bản ghi vĩnh viễn và không thể sửa đổi.",
  },
  {
    icon: <FaQrcode />,
    title: "Cấp phát tới sinh viên",
    description: "Hệ thống tạo mã QR duy nhất và tự động gửi thông báo tài khoản nhận văn bằng số đến sinh viên qua email.",
  },
];

const VERIFY_STEPS = [
  {
    icon: <FaQrcode />,
    title: "Cách 1: Quét mã QR",
    description: "Sử dụng camera điện thoại hoặc webcam máy tính để quét mã QR được in trực tiếp trên văn bằng số.",
  },
  {
    icon: <FaKeyboard />,
    title: "Cách 2: Nhập mã xác thực",
    description: "Truy cập trang xác thực, nhập mã số văn bằng được in trên chứng chỉ (VD: UNI2024-000123) để đối chiếu.",
  },
  {
    icon: <FaFileAlt />,
    title: "Cách 3: Tải file văn bằng",
    description: "Tải lên tệp PDF văn bằng số để hệ thống tính toán mã băm tự động và so sánh với dữ liệu gốc trên Blockchain.",
  },
];

export default function GuidePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [sidebarFaqOpen, setSidebarFaqOpen] = useState(null);
  const [search, setSearch] = useState("");
  
  // States for FAQ Tab
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCat, setFaqCat] = useState("all");
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  // States for Contact Form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student",
    subject: "",
    message: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  
  // Custom Toast State
  const [toastMsg, setToastMsg] = useState(null);

  const bannerImage = `${process.env.PUBLIC_URL}/pannerhuongdan.png`;
  const studentBannerImage = `${process.env.PUBLIC_URL}/bannerhuongdansv.png`;

  useEffect(() => {
    const path = location.pathname;
    if (path === "/guide/student") {
      setActiveTab("student");
    } else if (path === "/guide/school") {
      setActiveTab("school");
    } else if (path === "/guide/verify") {
      setActiveTab("verify");
    } else if (path === "/guide/faq") {
      setActiveTab("faq");
    } else if (path === "/guide/support") {
      setActiveTab("support");
    } else {
      setActiveTab("general");
    }
  }, [location.pathname]);

  const switchTab = (tabId) => {
    if (tabId === "general") {
      navigate("/guide");
    } else {
      navigate(`/guide/${tabId}`);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormError("Vui lòng điền đầy đủ các trường thông tin bắt buộc (*).");
      return;
    }
    setFormError("");
    setFormLoading(true);
    
    setTimeout(() => {
      setFormLoading(false);
      setFormSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "student",
        subject: "",
        message: ""
      });
      
      setToastMsg({ type: 'success', text: 'Yêu cầu hỗ trợ của bạn đã được gửi đi thành công!' });
      setTimeout(() => setToastMsg(null), 4000);
    }, 1500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setFaqSearch(search);
      switchTab("faq");
      setSearch("");
    }
  };

  // Filter FAQs based on tab filters
  const filteredFaqs = ALL_FAQS.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          item.answer.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesCategory = faqCat === "all" || item.category === faqCat;
    return matchesSearch && matchesCategory;
  });

  // Render Sidebar Cards
  const renderSidebarMenuCard = () => (
    <div className="gp-card gp-card--stretch">
      <div className="gp-card-hd">MỤC HƯỚNG DẪN</div>
      <ul className="gp-nav-menu">
        {MENU_ITEMS.map((m) => (
          <li
            key={m.id}
            className={`gp-nav-item${activeTab === m.id ? " active" : ""}`}
            onClick={() => {
              switchTab(m.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="gp-nav-link">
              <span className="gp-nav-icon">{m.icon}</span>
              <span className="gp-nav-label">{m.label}</span>
              <FaChevronRight className="gp-nav-arr" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderSidebarOtherCards = () => (
    <>

        {/* CÂU HỎI THƯỜNG GẶP */}
        <div className="gp-card gp-card--stretch" id="faq">
          <div className="gp-card-hd gp-card-hd--row">
            <span>CÂU HỎI NHANH</span>
            <button 
              onClick={() => {
                switchTab("faq");
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="gp-card-more"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Xem tất cả
            </button>
          </div>
          <div className="gp-faq">
            {SIDEBAR_FAQS.map((f, i) => (
              <div
                key={i}
                className={`gp-faq-item${sidebarFaqOpen === i ? " open" : ""}`}
              >
                <button
                  className="gp-faq-q"
                  onClick={() => setSidebarFaqOpen(sidebarFaqOpen === i ? null : i)}
                >
                  <span>{f.q}</span>
                  {sidebarFaqOpen === i ? (
                    <FaChevronDown className="gp-faq-arr" />
                  ) : (
                    <FaChevronRight className="gp-faq-arr" />
                  )}
                </button>
                {sidebarFaqOpen === i && <div className="gp-faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* LIÊN HỆ HỖ TRỢ */}
        <div className="gp-card gp-card--stretch" id="support">
          <div className="gp-card-hd">LIÊN HỆ HỖ TRỢ</div>
          <p className="gp-ct-desc">
            Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua các kênh
            bên dưới.
          </p>
          <div className="gp-ct-body">
            <div className="gp-ct-list">
              <div className="gp-ct-row">
                <FaPhone className="gp-ct-icon" />
                <span>0368 251 814</span>
              </div>
              <div className="gp-ct-row">
                <FaEnvelope className="gp-ct-icon" />
                <span>linhyang0702@gmail.com</span>
              </div>
              <div className="gp-ct-row">
                <FaClock className="gp-ct-icon" />
                <span style={{ fontSize: '11.5px' }}>T2 – T6: 8:00 – 17:30</span>
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
    </>
  );

  // Render New Tabs content (School, Verify, FAQ, Support)
  const renderNewTabs = () => {
    switch (activeTab) {
      case "school":
        return (
          <div className="gp-tab-content-wrap">
            <section className="gp-section">
              <h2 className="gp-section-heading">QUY TRÌNH DÀNH CHO NHÀ TRƯỜNG</h2>
              <div className="gp-steps-grid">
                {SCHOOL_STEPS.map((step, index) => (
                  <div className="gp-step-card school" key={index}>
                    <span className="gp-step-badge">{index + 1}</span>
                    <div className="gp-step-title">{step.title}</div>
                    <div className="gp-step-visual">
                      {step.icon}
                    </div>
                    <p className="gp-step-desc">{step.description}</p>
                    {index < SCHOOL_STEPS.length - 1 && (
                      <div className="gp-step-arrow">
                        <FaChevronRight />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="student-guide__notice" style={{ borderColor: '#ddd6fe', background: 'linear-gradient(90deg, #faf5ff, #f3e8ff)' }}>
              <div className="student-guide__notice-head">
                <div className="student-guide__notice-icon" style={{ color: '#7c3aed' }}>
                  <FaShieldAlt />
                </div>
                <h3 style={{ color: '#6d28d9' }}>Lưu ý dành cho Nhà trường</h3>
              </div>
              <ul style={{ color: '#4c1d95' }}>
                <li>Mọi dữ liệu ghi lên Blockchain là bất biến và không thể xóa bỏ. Do đó, vui lòng rà soát kỹ thông tin sinh viên trước khi ký số.</li>
                <li>Đảm bảo địa chỉ ví của nhà trường có đủ số dư ETH (Testnet Sepolia) để chi trả phí gas giao dịch.</li>
                <li>Giữ bảo mật tuyệt đối mã khóa bí mật (Private Key) của ví trường học để tránh việc cấp phát văn bằng trái phép.</li>
              </ul>
            </div>
          </div>
        );

      case "verify":
        return (
          <div className="gp-tab-content-wrap">
            <section className="gp-section">
              <h2 className="gp-section-heading">CÁC PHƯƠNG THỨC XÁC THỰC VĂN BẰNG</h2>
              <div className="gp-steps-grid">
                {VERIFY_STEPS.map((step, index) => (
                  <div className="gp-step-card verify" key={index}>
                    <span className="gp-step-badge">{index + 1}</span>
                    <div className="gp-step-title">{step.title}</div>
                    <div className="gp-step-visual">
                      {step.icon}
                    </div>
                    <p className="gp-step-desc">{step.description}</p>
                    {index < VERIFY_STEPS.length - 1 && (
                      <div className="gp-step-arrow">
                        <FaChevronRight />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="gp-section">
              <h2 className="gp-section-heading">Ý NGHĨA CÁC TRẠNG THÁI XÁC THỰC</h2>
              <div className="gp-status-grid">
                <div className="gp-status-card">
                  <div className="gp-status-header valid">
                    <FaCheckCircle /> VĂN BẰNG HỢP LỆ
                  </div>
                  <p className="gp-status-desc">
                    Thông tin văn bằng tồn tại trên hệ thống Blockchain, mã hash khớp 100% và được ký số hợp lệ bởi nhà trường. Văn bằng có giá trị sử dụng.
                  </p>
                </div>
                <div className="gp-status-card">
                  <div className="gp-status-header revoked">
                    <FaExclamationTriangle /> VĂN BẰNG BỊ THU HỒI
                  </div>
                  <p className="gp-status-desc">
                    Văn bằng đã từng được cấp phát nhưng sau đó bị nhà trường thu hồi trên Blockchain (do phát hiện sai lệch thông tin hoặc vi phạm quy chế tốt nghiệp).
                  </p>
                </div>
                <div className="gp-status-card">
                  <div className="gp-status-header invalid">
                    <FaTimesCircle /> KHÔNG HỢP LỆ / GIẢ MẠO
                  </div>
                  <p className="gp-status-desc">
                    Thông tin văn bằng đã bị thay đổi (dù chỉ một ký tự) khiến mã hash không khớp, hoặc mã số văn bằng không tồn tại trên hệ thống Blockchain.
                  </p>
                </div>
              </div>
            </section>
          </div>
        );

      case "faq":
        return (
          <div className="gp-tab-content-wrap">
            <section className="gp-section">
              <h2 className="gp-section-heading">CÂU HỎI THƯỜNG GẶP (FAQ)</h2>
              
              <div className="gp-faq-search-bar">
                <div className="gp-faq-input-wrap">
                  <FaSearch className="gp-faq-search-icon" />
                  <input 
                    type="text" 
                    className="gp-faq-search-input" 
                    placeholder="Tìm kiếm câu hỏi hoặc câu trả lời..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="gp-faq-categories">
                <button className={`gp-faq-cat-btn ${faqCat === 'all' ? 'active' : ''}`} onClick={() => setFaqCat('all')}>Tất cả</button>
                <button className={`gp-faq-cat-btn ${faqCat === 'legal' ? 'active' : ''}`} onClick={() => setFaqCat('legal')}>Pháp lý</button>
                <button className={`gp-faq-cat-btn ${faqCat === 'tech' ? 'active' : ''}`} onClick={() => setFaqCat('tech')}>Blockchain & Bảo mật</button>
                <button className={`gp-faq-cat-btn ${faqCat === 'user' ? 'active' : ''}`} onClick={() => setFaqCat('user')}>Hướng dẫn sử dụng</button>
              </div>

              <div className="gp-faq-list-full">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => {
                    const isOpen = faqOpenIndex === index;
                    return (
                      <div key={index} className={`gp-faq-item${isOpen ? " open" : ""}`}>
                        <button
                          type="button"
                          className="gp-faq-q"
                          onClick={() => setFaqOpenIndex(isOpen ? null : index)}
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
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '13px' }}>
                    Không tìm thấy câu hỏi phù hợp với từ khóa của bạn.
                  </div>
                )}
              </div>
            </section>
          </div>
        );

      case "support":
        return (
          <div className="gp-tab-content-wrap">
            <div className="gp-support-container">
              <div className="gp-support-form-card">
                <h3 className="gp-support-form-title">GỬI YÊU CẦU HỖ TRỢ</h3>
                <p className="gp-support-form-subtitle">Chúng tôi sẽ phản hồi lại bạn sớm nhất có thể trong vòng 24h làm việc.</p>
                
                <form onSubmit={handleFormSubmit}>
                  {formError && <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '14px' }}>{formError}</div>}
                  {formSuccess && !toastMsg && <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', color: '#047857', padding: '10px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '14px' }}>Cảm ơn bạn! Yêu cầu hỗ trợ đã được gửi đi thành công.</div>}

                  <div className="gp-form-grid">
                    <div className="gp-form-group">
                      <label className="gp-form-label">Họ và tên *</label>
                      <input 
                        type="text" 
                        name="name" 
                        className="gp-form-input" 
                        placeholder="VD: Nguyễn Văn A"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="gp-form-group">
                      <label className="gp-form-label">Email liên hệ *</label>
                      <input 
                        type="email" 
                        name="email" 
                        className="gp-form-input" 
                        placeholder="VD: email@example.com"
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="gp-form-group">
                      <label className="gp-form-label">Số điện thoại</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        className="gp-form-input" 
                        placeholder="VD: 0368xxxxxx"
                        value={formData.phone}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="gp-form-group">
                      <label className="gp-form-label">Vai trò của bạn</label>
                      <select 
                        name="role" 
                        className="gp-form-select"
                        value={formData.role}
                        onChange={handleFormChange}
                      >
                        <option value="student">Sinh viên</option>
                        <option value="school">Nhà trường / Tổ chức</option>
                        <option value="employer">Nhà tuyển dụng</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div className="gp-form-group full-width">
                      <label className="gp-form-label">Tiêu đề yêu cầu *</label>
                      <input 
                        type="text" 
                        name="subject" 
                        className="gp-form-input" 
                        placeholder="VD: Lỗi không hiển thị văn bằng, Cấp ví..."
                        value={formData.subject}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="gp-form-group full-width">
                      <label className="gp-form-label">Nội dung chi tiết *</label>
                      <textarea 
                        name="message" 
                        className="gp-form-textarea" 
                        placeholder="Vui lòng mô tả rõ sự cố hoặc câu hỏi bạn cần hỗ trợ..."
                        value={formData.message}
                        onChange={handleFormChange}
                        required
                      ></textarea>
                    </div>
                  </div>

                  <button type="submit" className="gp-form-submit-btn" disabled={formLoading}>
                    {formLoading ? "Đang gửi..." : <><FaPaperPlane /> Gửi yêu cầu</>}
                  </button>
                </form>
              </div>

              <div className="gp-support-info-sidebar">
                <div className="gp-support-info-card">
                  <h4 className="gp-support-info-card-title">
                    <FaHeadset /> THÔNG TIN LIÊN HỆ
                  </h4>
                  <div className="gp-support-info-item">
                    <FaPhone className="gp-support-info-icon" />
                    <div className="gp-support-info-text">
                      Hotline hỗ trợ: <br />
                      <strong>0368 251 814</strong>
                    </div>
                  </div>
                  <div className="gp-support-info-item">
                    <FaEnvelope className="gp-support-info-icon" />
                    <div className="gp-support-info-text">
                      Email kỹ thuật: <br />
                      <strong>linhyang0702@gmail.com</strong>
                    </div>
                  </div>
                  <div className="gp-support-info-item">
                    <FaClock className="gp-support-info-icon" />
                    <div className="gp-support-info-text">
                      Thời gian làm việc: <br />
                      <strong>Thứ 2 – Thứ 6: 8:00 – 17:30</strong>
                    </div>
                  </div>
                </div>

                <div className="gp-support-info-card" style={{ background: '#f8fafc' }}>
                  <h4 className="gp-support-info-card-title" style={{ color: '#475569' }}>
                    <FaShieldAlt /> HỖ TRỢ KÝ SỐ & VÍ
                  </h4>
                  <p style={{ fontSize: '11.5px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                    Đối với các lỗi phát sinh trong quá trình thực hiện ký số Smart Contract hoặc lỗi ví MetaMask của Nhà trường, vui lòng cung cấp Mã trường học và Mã giao dịch (TxHash) gặp lỗi khi gửi yêu cầu để được đội ngũ kỹ thuật hỗ trợ kiểm tra và đối soát nhanh nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Get active hero details based on activeTab (for school, verify, faq, support)
  const getHeroDetails = () => {
    switch (activeTab) {
      case "school":
        return {
          title: "HƯỚNG DẪN CHO NHÀ TRƯỜNG",
          sub: "Cẩm nang kết nối ví, nhập danh sách, ký số và phát hành văn bằng lên Blockchain.",
          className: "gp-hero-school",
          icon: <FaUniversity />
        };
      case "verify":
        return {
          title: "XÁC THỰC VĂN BẰNG",
          sub: "Hướng dẫn quét QR, đối chiếu mã băm và kiểm tra tính hợp lệ của văn bằng.",
          className: "gp-hero-verify",
          icon: <FaQrcode />
        };
      case "faq":
        return {
          title: "CÂU HỎI THƯỜNG GẶP",
          sub: "Giải đáp các thắc mắc phổ biến về giá trị pháp lý và công nghệ Blockchain.",
          className: "gp-hero-faq",
          icon: <FaQuestionCircle />
        };
      case "support":
        return {
          title: "LIÊN HỆ HỖ TRỢ",
          sub: "Gửi thông tin thắc mắc hoặc báo lỗi hệ thống để được hỗ trợ kỹ thuật kịp thời.",
          className: "gp-hero-support",
          icon: <FaHeadset />
        };
      default:
        return {
          title: "HƯỚNG DẪN SỬ DỤNG",
          sub: "Tìm hiểu cách sử dụng hệ thống Quản lý và Xác thực Văn bằng, Chứng chỉ số",
          className: "",
          icon: <FaBook />
        };
    }
  };

  const hero = getHeroDetails();

  // ════════════════════════════════════════════════════════════════════════
  // 1. DÀNH CHO TAB GIỚI THIỆU CHUNG (GENERAL) - Bố cục FLAT đồng bộ chiều cao từng dòng
  // ════════════════════════════════════════════════════════════════════════
  if (activeTab === "general") {
    return (
      <div className="gp-root">
        {toastMsg && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#10b981',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            animation: 'fadein 0.5s, fadeout 0.5s 3.5s'
          }}>
            <FaCheckCircle />
            <span>{toastMsg.text}</span>
          </div>
        )}

        <div className="gp-body">
          <div className="gp-container">
            {/* ROW 1: Hero and Menu Card */}
            <div className="gp-grid" style={{ marginBottom: '12px' }}>
              {/* HERO BANNER */}
              <div className="gp-hero gp-hero--stretch">
                {/* Decorative circles */}
                <span className="gp-hero-circle gp-hero-circle--1" />
                <span className="gp-hero-circle gp-hero-circle--2" />

                <div className="gp-hero-text">
                  <h1 className="gp-hero-title">HƯỚNG DẪN SỬ DỤNG</h1>
                  <p className="gp-hero-sub">
                    Tìm hiểu cách sử dụng hệ thống Quản lý và Xác thực Văn bằng,
                    Chứng chỉ số
                  </p>
                  <form className="gp-search" onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      className="gp-search-input"
                      placeholder="Tìm kiếm hướng dẫn..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="gp-search-btn" type="submit" aria-label="Tìm kiếm">
                      <FaSearch />
                    </button>
                  </form>
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

              {/* MỤC HƯỚNG DẪN */}
              {renderSidebarMenuCard()}
            </div>

            {/* ROW 2: Main Content and Remaining Sidebar */}
            <div className="gp-grid">
              <div className="gp-left-col">
                <section className="gp-section gp-section--stretch" id="student">
                  <h2 className="gp-section-heading">HƯỚNG DẪN NHANH</h2>
                  <div className="gp-qg-grid">
                    {QUICK_GUIDES.map((g, i) => (
                      <div key={i} className="gp-qg-card" onClick={() => switchTab(g.tabId)}>
                        <div className="gp-qg-icon-ring">
                          <span className="gp-qg-icon">{g.icon}</span>
                        </div>
                        <div className="gp-qg-title">{g.title}</div>
                        <div className="gp-qg-desc">{g.desc}</div>
                        <button className="gp-qg-btn">
                          Xem hướng dẫn <FaChevronRight className="gp-qg-btn-arr" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* QUY TRÌNH SỬ DỤNG HỆ THỐNG */}
                <section className="gp-section gp-section--stretch" id="workflow-section">
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
              </div>

              {/* RIGHT COLUMN (SIDEBAR) */}
              <aside className="gp-sidebar">
                {renderSidebarOtherCards()}
              </aside>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. DÀNH CHO TAB HƯỚNG DẪN SINH VIÊN - Bố cục của StudentGuidePage
  // ════════════════════════════════════════════════════════════════════════
  if (activeTab === "student") {
    const isStudent = activeTab === "student";
    const heroIcon = isStudent ? <FaGraduationCap /> : <FaUniversity />;
    const heroTitle = isStudent ? "HƯỚNG DẪN SỬ DỤNG" : "HƯỚNG DẪN CHO NHÀ TRƯỜNG";
    const heroSub = isStudent 
      ? "Tìm hiểu cách tra cứu, quản lý và sử dụng văn bằng, chứng chỉ số được cấp trên hệ thống một cách hiệu quả." 
      : "Cẩm nang kết nối ví, nhập danh sách, ký số và phát hành văn bằng lên Blockchain.";
    const heroBg = isStudent ? studentBannerImage : bannerImage;
    
    const stepsTitle = isStudent 
      ? "QUY TRÌNH TRA CỨU VÀ SỬ DỤNG VĂN BẰNG, CHỨNG CHỈ SỐ" 
      : "QUY TRÌNH DÀNH CHO NHÀ TRƯỜNG";
    const stepsData = isStudent ? STUDENT_STEPS : SCHOOL_STEPS;
    
    const noticeTitle = isStudent ? "Lưu ý quan trọng" : "Lưu ý dành cho Nhà trường";
    const noticeStyle = isStudent 
      ? {} 
      : { borderColor: '#ddd6fe', background: 'linear-gradient(90deg, #faf5ff, #f3e8ff)' };
    const noticeHeadStyle = isStudent 
      ? {} 
      : { color: '#6d28d9' };
    const noticeIconStyle = isStudent 
      ? {} 
      : { color: '#7c3aed' };
    const noticeListStyle = isStudent 
      ? {} 
      : { color: '#4c1d95' };
      
    const noticeItems = isStudent ? [
      "Văn bằng, chứng chỉ số do nhà trường cấp trên hệ thống có giá trị tương đương văn bằng bản giấy.",
      "Thông tin văn bằng được lưu trữ và bảo mật bằng công nghệ Blockchain, không thể tự ý sửa đổi hoặc làm giả.",
      "Nếu phát hiện sai sót, vui lòng liên hệ nhà trường để được hỗ trợ."
    ] : [
      "Mọi dữ liệu ghi lên Blockchain là bất biến và không thể xóa bỏ. Do đó, vui lòng rà soát kỹ thông tin sinh viên trước khi ký số.",
      "Đảm bảo địa chỉ ví của nhà trường có đủ số dư ETH (Testnet Sepolia) để chi trả phí gas giao dịch.",
      "Giữ bảo mật tuyệt đối mã khóa bí mật (Private Key) của ví trường học để tránh việc cấp phát văn bằng trái phép."
    ];

    return (
      <main className="student-guide">
        {toastMsg && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#10b981',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            animation: 'fadein 0.5s, fadeout 0.5s 3.5s'
          }}>
            <FaCheckCircle />
            <span>{toastMsg.text}</span>
          </div>
        )}

        <div className="student-guide__container">
          {/* ROW 1: Hero and Menu Card */}
          <div className="student-guide__layout" style={{ marginBottom: '12px' }}>
            {/* Hero Banner */}
            <section
              className="student-guide__hero"
              style={{
                backgroundImage: `url(${heroBg})`,
                backgroundPosition: "right center",
                backgroundSize: "66% auto",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="student-guide__hero-copy">
                <div className="student-guide__hero-icon">
                  {heroIcon}
                </div>
                <div>
                  <h1>{heroTitle}</h1>
                  <p>{heroSub}</p>
                </div>
              </div>
            </section>
            
            {/* Menu Card */}
            {renderSidebarMenuCard()}
          </div>

          {/* ROW 2: Main Content and Remaining Sidebar */}
          <div className="student-guide__layout">
            <div className="student-guide__main">

              {/* Steps Process */}
              <section className="student-guide__process" id="student-process">
                <h2>{stepsTitle}</h2>

                <div className="student-guide__steps">
                  {stepsData.map((step, index) => (
                    <article className="student-guide__step" key={step.title}>
                      <span className="student-guide__step-number">
                        {index + 1}
                      </span>
                      <h3>{step.title}</h3>
                      <div className="student-guide__step-visual">
                        <span className="student-guide__visual-window">
                          {step.icon}
                        </span>
                        {isStudent && index === 0 && (
                          <FaLock className="student-guide__mini-icon" />
                        )}
                        {isStudent && index === 4 && (
                          <FaShareAlt className="student-guide__mini-icon" />
                        )}
                      </div>
                      <p>{step.description}</p>

                      {index < stepsData.length - 1 && (
                        <FaChevronRight
                          className="student-guide__step-arrow"
                          aria-hidden="true"
                        />
                      )}
                    </article>
                  ))}
                </div>

                {/* Important Notice */}
                <div className="student-guide__notice" style={noticeStyle}>
                  <div className="student-guide__notice-head" style={noticeHeadStyle}>
                    <div className="student-guide__notice-icon" style={noticeIconStyle}>
                      <FaShieldAlt />
                    </div>
                    <h3>{noticeTitle}</h3>
                  </div>
                  <ul style={noticeListStyle}>
                    {noticeItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            {/* Sidebar inside Student guide layout */}
            <aside className="student-guide__sidebar">
              {renderSidebarOtherCards()}
            </aside>
          </div>
        </div>
      </main>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. DÀNH CHO CÁC TAB CÒN LẠI (SCHOOL, VERIFY, FAQ, SUPPORT)
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="gp-root">
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 600,
          animation: 'fadein 0.5s, fadeout 0.5s 3.5s'
        }}>
          <FaCheckCircle />
          <span>{toastMsg.text}</span>
        </div>
      )}

      <div className="gp-body">
        <div className="gp-container">
          {/* ROW 1: Hero and Menu Card */}
          <div className="gp-grid" style={{ marginBottom: '12px' }}>
            {/* HERO BANNER FOR ACTIVE TAB */}
            <div className={`gp-hero gp-hero--stretch ${hero.className}`}>
              <div className="gp-hero-text">
                <h1 className="gp-hero-title">{hero.title}</h1>
                <p className="gp-hero-sub">{hero.sub}</p>
              </div>

              <div className="gp-hero-avatar-ring">
                <div className="gp-hero-avatar-circle">
                  {hero.icon}
                </div>
              </div>
            </div>

            {/* MENU CARD */}
            {renderSidebarMenuCard()}
          </div>

          {/* ROW 2: Main Content and Remaining Sidebar */}
          <div className="gp-grid">
            {/* LEFT COLUMN */}
            <div className="gp-left-col">
              {/* TAB CONTENT */}
              {renderNewTabs()}
            </div>

            {/* RIGHT COLUMN (SIDEBAR) */}
            <aside className="gp-sidebar">
              {renderSidebarOtherCards()}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
