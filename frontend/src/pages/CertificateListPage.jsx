import { useState } from 'react'
import { FaSearch, FaFilter, FaCheckCircle, FaUserGraduate, FaUniversity, FaCalendarAlt, FaDownload, FaEye } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './CertificateListPage.css'

const MOCK_CERTIFICATES = [
  {
    id: 'UNI2024-000123',
    name: 'Nguyễn Thị Minh Châu',
    degree: 'Kỹ sư Công nghệ thông tin',
    school: 'Trường Đại học Công nghệ',
    issueDate: '20/05/2024',
    status: 'Đã ghi Blockchain',
    verified: true
  },
  {
    id: 'UNI2024-000124',
    name: 'Trần Văn Đức',
    degree: 'Cử nhân Quản trị kinh doanh',
    school: 'Trường Đại học Kinh tế',
    issueDate: '19/05/2024',
    status: 'Đã ghi Blockchain',
    verified: true
  },
  {
    id: 'UNI2024-000125',
    name: 'Lê Thị Hải Yến',
    degree: 'Thạc sĩ Kiểm toán',
    school: 'Trường Đại học Kinh tế',
    issueDate: '18/05/2024',
    status: 'Đã ghi Blockchain',
    verified: true
  },
  {
    id: 'UNI2024-000126',
    name: 'Phạm Minh Tuấn',
    degree: 'Kỹ sư Điện tử viễn thông',
    school: 'Trường Đại học Bách khoa',
    issueDate: '17/05/2024',
    status: 'Đã ghi Blockchain',
    verified: true
  },
  {
    id: 'UNI2024-000127',
    name: 'Hoàng Thị Mai',
    degree: 'Cử nhân Ngôn ngữ Anh',
    school: 'Trường Đại học Ngoại ngữ',
    issueDate: '16/05/2024',
    status: 'Đã ghi Blockchain',
    verified: true
  }
]

const CertificateListPage = () => {
  const [search, setSearch] = useState('')
  const [filterSchool, setFilterSchool] = useState('all')

  return (
    <div className="cert-list-page">
      <Navbar />

      <div className="cert-list-main">
        <div className="cert-list-container">
          <div className="cert-list-header">
            <h1 className="cert-list-title">VĂN BẰNG MỚI CẤP</h1>
            <p className="cert-list-subtitle">
              Danh sách văn bằng, chứng chỉ được cấp gần đây
            </p>
          </div>

          {/* Filters */}
          <div className="cert-list-filters">
            <div className="cert-search-box">
              <FaSearch className="cert-search-icon" />
              <input
                type="text"
                className="cert-search-input"
                placeholder="Tìm kiếm theo tên hoặc mã văn bằng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="cert-filter-select"
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
            >
              <option value="all">Tất cả trường</option>
              <option value="cntt">Trường Đại học Công nghệ</option>
              <option value="kt">Trường Đại học Kinh tế</option>
              <option value="bk">Trường Đại học Bách khoa</option>
            </select>
          </div>

          {/* List */}
          <div className="cert-list-grid">
            {MOCK_CERTIFICATES.map((cert) => (
              <div key={cert.id} className="cert-card">
                <div className="cert-card-header">
                  <div className="cert-card-avatar">
                    <FaUserGraduate />
                  </div>
                  <div className="cert-card-header-info">
                    <div className="cert-card-name">{cert.name}</div>
                    <div className="cert-card-id">Mã VB: {cert.id}</div>
                  </div>
                  {cert.verified && (
                    <FaCheckCircle className="cert-card-verified" />
                  )}
                </div>
                <div className="cert-card-body">
                  <div className="cert-card-row">
                    <FaUserGraduate className="cert-card-icon" />
                    <span className="cert-card-label">Văn bằng:</span>
                    <span className="cert-card-value">{cert.degree}</span>
                  </div>
                  <div className="cert-card-row">
                    <FaUniversity className="cert-card-icon" />
                    <span className="cert-card-label">Cơ sở:</span>
                    <span className="cert-card-value">{cert.school}</span>
                  </div>
                  <div className="cert-card-row">
                    <FaCalendarAlt className="cert-card-icon" />
                    <span className="cert-card-label">Ngày cấp:</span>
                    <span className="cert-card-value">{cert.issueDate}</span>
                  </div>
                </div>
                <div className="cert-card-footer">
                  <span className={`cert-status ${cert.verified ? 'verified' : ''}`}>
                    {cert.status}
                  </span>
                  <div className="cert-card-actions">
                    <button className="cert-action-btn view">
                      <FaEye /> Xem
                    </button>
                    <button className="cert-action-btn download">
                      <FaDownload /> Tải
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default CertificateListPage
