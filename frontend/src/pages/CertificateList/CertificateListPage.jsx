import { useState, useEffect } from 'react'
import { FaSearch, FaFilter, FaCheckCircle, FaUserGraduate, FaUniversity, FaCalendarAlt, FaDownload, FaEye, FaSpinner } from 'react-icons/fa'
import Footer from '../../components/Footer/Footer'
import { api } from '../../services/api'
import './CertificateListPage.css'

const CertificateListPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('')
  const [filterSchool, setFilterSchool] = useState('all')

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const res = await api.getCertificates({ search });
      if (res && res.success) {
        setCertificates(res.certificates || []);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, [search]);

  return (
    <div className="cert-list-page">

      <div className="cert-list-main">
        <div className="cert-list-container">
          <div className="cert-list-header">
            <h1 className="cert-list-title">VĂN BẰNG MỚI CẤP</h1>
            <p className="cert-list-subtitle">
              Danh sách văn bằng, chứng chỉ được cấp gần đây từ CSDL MySQL & Blockchain
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
              <FaSpinner className="fa-spin" style={{ fontSize: '24px', marginBottom: '8px' }} /><br />
              Đang tải danh sách văn bằng mới cấp...
            </div>
          ) : (
            <div className="cert-list-grid">
              {certificates.map((cert) => (
                <div key={cert.id} className="cert-card">
                  <div className="cert-card-header">
                    <div className="cert-card-avatar">
                      <FaUserGraduate />
                    </div>
                    <div className="cert-card-header-info">
                      <div className="cert-card-name">{cert.student_name || cert.studentName}</div>
                      <div className="cert-card-id">Mã VB: {cert.certificate_code || cert.code}</div>
                    </div>
                    {cert.status === 'issued' && (
                      <FaCheckCircle className="cert-card-verified" />
                    )}
                  </div>
                  <div className="cert-card-body">
                    <div className="cert-card-row">
                      <FaUserGraduate className="cert-card-icon" />
                      <span className="cert-card-label">Văn bằng:</span>
                      <span className="cert-card-value">{cert.major} ({cert.degree_type || 'Đại học'})</span>
                    </div>
                    <div className="cert-card-row">
                      <FaUniversity className="cert-card-icon" />
                      <span className="cert-card-label">Cơ sở:</span>
                      <span className="cert-card-value">{cert.school_name || 'Trường Đại học Công nghệ'}</span>
                    </div>
                    <div className="cert-card-row">
                      <FaCalendarAlt className="cert-card-icon" />
                      <span className="cert-card-label">Ngày cấp:</span>
                      <span className="cert-card-value">{cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('vi-VN') : '2026-07-25'}</span>
                    </div>
                  </div>
                  <div className="cert-card-footer">
                    <span className={`cert-status ${cert.status === 'issued' ? 'verified' : ''}`}>
                      {cert.status === 'issued' ? 'Đã ghi Blockchain' : 'Đã xác thực'}
                    </span>
                    <div className="cert-card-actions">
                      <button className="cert-action-btn view" onClick={() => alert(`Xem chi tiết văn bằng: ${cert.certificate_code || cert.code}`)}>
                        <FaEye /> Xem
                      </button>
                      <button className="cert-action-btn download" onClick={() => alert('Đang tải bản PDF...')}>
                        <FaDownload /> Tải
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default CertificateListPage
