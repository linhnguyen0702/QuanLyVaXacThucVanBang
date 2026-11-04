import { useState, useEffect, useCallback } from 'react'
import { FaSearch, FaCheckCircle, FaUserGraduate, FaUniversity, FaCalendarAlt, FaDownload, FaEye, FaSpinner, FaTimes } from 'react-icons/fa'
import Footer from '../../components/Footer/Footer'
import { api } from '../../services/api'
import Pagination from '../../components/Pagination/Pagination'
import CertificateDiplomaPreview from '../../components/CertificateDiplomaPreview'
import CertificateBlockchainInfo from '../../components/CertificateBlockchainInfo'
import { formatDateDisplay } from '../../utils/dateUtils'
import { downloadCertificatePdf } from '../../utils/downloadCertificatePdf'
import './CertificateListPage.css'

const PAGE_SIZE = 10;

const CertificateListPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [totalCertificates, setTotalCertificates] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('')
  const [filterSchool, setFilterSchool] = useState('all')
  const [schools, setSchools] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [downloadError, setDownloadError] = useState('');

  const handleDownloadCertificate = async (certificate) => {
    setDownloadError('');
    try {
      await downloadCertificatePdf(certificate);
    } catch (error) {
      console.error('Failed to download certificate PDF:', error);
      setDownloadError(error.message || 'Không thể tạo PDF văn bằng.');
    }
  };

  const fetchCerts = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await api.getPublicCertificates({
        search,
        status: 'issued',
        school_id: filterSchool === 'all' ? '' : filterSchool,
        page,
        limit: PAGE_SIZE
      });
      if (res && res.success) {
        setCertificates(res.certificates || []);
        setTotalCertificates(res.total || 0);
      } else {
        throw new Error(res?.message || 'Không thể tải danh sách văn bằng.');
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
      setLoadError(err.message || 'Không thể tải danh sách văn bằng.');
    } finally {
      setLoading(false);
    }
  }, [search, page, filterSchool]);

  useEffect(() => {
    fetchCerts();
  }, [fetchCerts]);

  useEffect(() => {
    let isMounted = true;
    api.getSchools({ limit: 100 })
      .then((response) => {
        if (isMounted && response?.success) setSchools(response.schools || []);
      })
      .catch((error) => {
        console.error('Failed to load school filters:', error);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCertificate) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedCertificate(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCertificate]);

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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="cert-filter-select"
              value={filterSchool}
              onChange={(e) => {
                setFilterSchool(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tất cả trường</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>{school.school_name}</option>
              ))}
            </select>
          </div>

          {downloadError && (
            <p className="cert-list-message" role="alert">{downloadError}</p>
          )}

          {/* List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
              <FaSpinner className="fa-spin" style={{ fontSize: '24px', marginBottom: '8px' }} /><br />
              Đang tải danh sách văn bằng mới cấp...
            </div>
          ) : loadError ? (
            <p className="cert-list-message" role="alert">
              Không thể tải văn bằng: {loadError}
            </p>
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
                      <span className="cert-card-value">{cert.school_name || '—'}</span>
                    </div>
                    <div className="cert-card-row">
                      <FaCalendarAlt className="cert-card-icon" />
                      <span className="cert-card-label">Ngày cấp:</span>
                      <span className="cert-card-value">{cert.issue_date ? formatDateDisplay(cert.issue_date) : '—'}</span>
                    </div>
                  </div>
                  <div className="cert-card-footer">
                    <span className={`cert-status ${cert.status === 'issued' ? 'verified' : ''}`}>
                      {cert.status === 'issued' ? 'Đã ghi Blockchain' : 'Đã xác thực'}
                    </span>
                    <div className="cert-card-actions">
                      <button className="cert-action-btn view" onClick={() => setSelectedCertificate(cert)}>
                        <FaEye /> Xem
                      </button>
                      <button className="cert-action-btn download" onClick={() => handleDownloadCertificate(cert)}>
                        <FaDownload /> Tải
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {certificates.length === 0 && (
                <p className="cert-list-message">Chưa có văn bằng nào được phát hành phù hợp với tìm kiếm.</p>
              )}
            </div>
          )}
          {!loading && (
            <Pagination page={page} total={totalCertificates} limit={PAGE_SIZE} onPageChange={setPage} />
          )}
        </div>
      </div>

      {selectedCertificate && (
        <div
          className="cert-view-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedCertificate(null);
          }}
        >
          <section className="cert-view-modal" role="dialog" aria-modal="true" aria-labelledby="cert-view-title">
            <header className="cert-view-modal-header">
              <div>
                <h2 id="cert-view-title">Chi tiết văn bằng số & Mã QR Blockchain</h2>
                <p>Mã văn bằng: {selectedCertificate.certificate_code || '—'}</p>
              </div>
              <button type="button" aria-label="Đóng chi tiết văn bằng" onClick={() => setSelectedCertificate(null)}>
                <FaTimes />
              </button>
            </header>
            <div className="cert-view-modal-body">
              <CertificateDiplomaPreview certificate={{
                code: selectedCertificate.certificate_code,
                schoolName: selectedCertificate.school_name,
                degreeType: selectedCertificate.degree_type,
                major: selectedCertificate.major,
                studentName: selectedCertificate.student_name,
                studentCode: selectedCertificate.student_code,
                dateOfBirth: formatDateDisplay(selectedCertificate.student_date_of_birth),
                classification: selectedCertificate.classification,
                educationMode: selectedCertificate.education_mode,
                issueDate: formatDateDisplay(selectedCertificate.issue_date),
                status: selectedCertificate.status,
                certificateHash: selectedCertificate.certificate_hash
              }} />
              <CertificateBlockchainInfo certificate={selectedCertificate} />
            </div>
            <footer className="cert-view-modal-footer">
              <button type="button" onClick={() => setSelectedCertificate(null)}>Đóng</button>
            </footer>
          </section>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default CertificateListPage
