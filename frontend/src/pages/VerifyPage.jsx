import { useState } from 'react'
import { 
  FaQrcode, FaKeyboard, FaSearch, FaCheckCircle, FaTimesCircle,
  FaShieldAlt, FaCube, FaClock, FaHashtag, FaBox,
  FaFileAlt, FaCopy, FaExternalLinkAlt, FaEye,
  FaUserGraduate, FaUniversity, FaBirthdayCake, FaIdCard,
  FaCalendarAlt, FaGraduationCap
} from 'react-icons/fa'
import Footer from '../components/Footer'
import './VerifyPage.css'

const MOCK_CERTIFICATE = {
  id: 'UNI2024-000123',
  holderName: 'Nguyễn Văn An',
  dob: '15/06/2000',
  idNumber: '012345678901',
  degree: 'Kỹ sư Công nghệ thông tin',
  major: 'Công nghệ thông tin',
  trainingMode: 'Chính quy',
  graduationRank: 'Giỏi',
  issuer: 'Trường Đại học Công nghệ',
  issueDate: '20/05/2024',
  decisionNumber: '1234/QĐ-ĐHCN',
  signatureStatus: 'Đã xác thực',
  status: 'Hợp lệ',
  verifyTime: '10:24:36 | 24/05/2024',
  txHash: '0x7d3a...e9b2f1c',
  blockchain: 'Ethereum Mainnet',
  hashShort: 'QmZ7X3a...l9kP2m',
  blockNumber: '195,456,789',
  recordedTime: '20/05/2024 14:32:11 (UTC+7)',
  valid: true
}

const VerifyPage = () => {
  const [activeTab, setActiveTab] = useState('qr')
  const [verifyCode, setVerifyCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const handleVerify = () => {
    if (!verifyCode.trim()) return
    setLoading(true)
    setNotFound(false)
    setResult(null)
    setTimeout(() => {
      setLoading(false)
      if (verifyCode.toUpperCase() === 'UNI2024-000123' || verifyCode === 'demo') {
        setResult(MOCK_CERTIFICATE)
      } else {
        setNotFound(true)
      }
    }, 1500)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleVerify()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="verify-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="verify-container">
          <span className="breadcrumb-link">Trang chủ</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Xác thực văn bằng</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="verify-header">
        <div className="verify-container">
          <h1 className="verify-title">XÁC THỰC VĂN BẰNG</h1>
          <p className="verify-subtitle">
            Kiểm tra tính xác thực của văn bằng, chứng chỉ được cấp trên hệ thống Blockchain
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="verify-main">
        <div className="verify-container">
          <div className="verify-grid">
            {/* Left: Verification Form + Results */}
            <div className="verify-left">
              {/* Tabs */}
              <div className="verify-tabs">
                <button
                  className={`verify-tab ${activeTab === 'qr' ? 'active' : ''}`}
                  onClick={() => setActiveTab('qr')}
                >
                  <FaQrcode /> Quét mã QR
                </button>
                <button
                  className={`verify-tab ${activeTab === 'code' ? 'active' : ''}`}
                  onClick={() => setActiveTab('code')}
                >
                  <FaKeyboard /> Nhập mã xác thực
                </button>
              </div>

              {/* Tab Content */}
              <div className="verify-tab-content">
                {activeTab === 'qr' ? (
                  <div className="qr-section">
                    <div className="qr-area">
                      <div className="qr-scanner-box">
                        <div className="qr-corner tl"></div>
                        <div className="qr-corner tr"></div>
                        <div className="qr-corner bl"></div>
                        <div className="qr-corner br"></div>
                        <FaQrcode className="qr-placeholder-icon" />
                      </div>
                      <p className="qr-label">Quét mã QR trên văn bằng</p>
                    </div>
                    <div className="qr-divider">
                      <span>hoặc</span>
                    </div>
                    <div className="code-input-row">
                      <input
                        type="text"
                        className="verify-input"
                        placeholder="Nhập mã xác thực (VD: UNI2024-000123)"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <button
                      className="verify-btn"
                      onClick={handleVerify}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="btn-loading"></span>
                      ) : (
                        <><FaSearch /> Xác thực ngay</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="code-section">
                    <input
                      type="text"
                      className="verify-input"
                      placeholder="Nhập mã xác thực (VD: UNI2024-000123)"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      className="verify-btn"
                      onClick={handleVerify}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="btn-loading"></span>
                      ) : (
                        <><FaSearch /> Xác thực ngay</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Not Found */}
              {notFound && (
                <div className="result-invalid">
                  <div className="result-invalid-header">
                    <FaTimesCircle className="invalid-icon" />
                    <div>
                      <div className="result-invalid-title">KHÔNG TÌM THẤY VĂN BẰNG</div>
                      <div className="result-invalid-desc">
                        Không tìm thấy văn bằng với mã xác thực này. Vui lòng kiểm tra lại mã hoặc liên hệ đơn vị cấp văn bằng.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Valid Result */}
              {result && (
                <>
                  {/* Status Banner */}
                  <div className={`result-banner ${result.valid ? 'valid' : 'invalid'}`}>
                    <div className="result-banner-left">
                      {result.valid ? (
                        <FaCheckCircle className="banner-icon valid" />
                      ) : (
                        <FaTimesCircle className="banner-icon invalid" />
                      )}
                      <div>
                        <div className="banner-title">
                          {result.valid ? 'VĂN BẰNG HỢP LỆ' : 'VĂN BẰNG KHÔNG HỢP LỆ'}
                        </div>
                        <div className="banner-desc">
                          {result.valid
                            ? 'Văn bằng này đã được xác thực trên Blockchain và thông tin hoàn toàn khớp với dữ liệu lưu trữ.'
                            : 'Văn bằng này không được xác thực hoặc đã bị thu hồi.'}
                        </div>
                      </div>
                    </div>
                    <div className="banner-right">
                      <div className="banner-time-label">Thời gian xác thực</div>
                      <div className="banner-time">{result.verifyTime}</div>
                      <div className="banner-tx-label">Mã giao dịch Blockchain</div>
                      <div className="banner-tx">
                        <span>{result.txHash}</span>
                        <FaCopy
                          className="copy-icon"
                          onClick={() => copyToClipboard(result.txHash)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Certificate Info */}
                  <div className="cert-detail-card">
                    <div className="cert-detail-body">
                      <div className="cert-info-grid">
                        <div className="cert-info-left">
                          <h3 className="cert-section-title">THÔNG TIN VĂN BẰNG</h3>
                          <div className="cert-fields">
                            <div className="cert-field">
                              <span className="field-label">Họ và tên</span>
                              <span className="field-value bold">{result.holderName}</span>
                            </div>
                            <div className="cert-field">
                              <span className="field-label">Ngày sinh</span>
                              <span className="field-value">{result.dob}</span>
                            </div>
                            <div className="cert-field">
                              <span className="field-label">Số CMND/CCCD</span>
                              <span className="field-value">{result.idNumber}</span>
                            </div>
                            <div className="cert-field">
                              <span className="field-label">Văn bằng</span>
                              <span className="field-value">{result.degree}</span>
                            </div>
                            <div className="cert-field">
                              <span className="field-label">Ngành đào tạo</span>
                              <span className="field-value">{result.major}</span>
                            </div>
                            <div className="cert-field">
                              <span className="field-label">Hình thức đào tạo</span>
                              <span className="field-value">{result.trainingMode}</span>
                            </div>
                            <div className="cert-field">
                              <span className="field-label">Xếp loại tốt nghiệp</span>
                              <span className="field-value">{result.graduationRank}</span>
                            </div>
                            <div className="cert-field">
                              <span className="field-label">Số hiệu văn bằng</span>
                              <span className="field-value mono">{result.id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="cert-info-right">
                          <div className="cert-fields">
                            <div className="cert-field">
                              <span className="field-label">Đơn vị cấp</span>
                              <span className="field-value bold">{result.issuer}</span>
                            </div>
                            <div className="cert-field">
                              <span className="field-label">Ngày cấp</span>
                              <span className="field-value">{result.issueDate}</span>
                            </div>
                            <div className="cert-field">
                              <span className="field-label">Số vào sổ gốc</span>
                              <span className="field-value">{result.decisionNumber}</span>
                            </div>
                            <div className="cert-field">
                              <span className="field-label">Chữ ký số</span>
                              <span className="field-value">
                                <span className="status-badge verified">
                                  {result.signatureStatus} <FaCheckCircle />
                                </span>
                              </span>
                            </div>
                            <div className="cert-field">
                              <span className="field-label">Trạng thái</span>
                              <span className="field-value">
                                <span className="status-badge valid">{result.status}</span>
                              </span>
                            </div>
                          </div>

                          {/* Certificate Preview */}
                          <div className="cert-preview-box">
                            <div className="cert-preview-header">TRƯỜNG ĐẠI HỌC CÔNG NGHỆ</div>
                            <div className="cert-preview-degree">BẰNG KỸ SƯ</div>
                            <div className="cert-preview-sub">Kỹ sư Công nghệ Thông tin</div>
                            <div className="cert-preview-name">{result.holderName}</div>
                            <div className="cert-preview-footer">
                              <div className="cert-preview-qr">
                                <FaQrcode />
                              </div>
                              <div className="cert-preview-sig">Chữ ký</div>
                            </div>
                          </div>

                          <button className="view-detail-btn">
                            <FaEye /> Xem chi tiết văn bằng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Info */}
                  <div className="blockchain-info-card">
                    <h3 className="blockchain-info-title">THÔNG TIN BLOCKCHAIN</h3>
                    <div className="blockchain-info-grid">
                      <div className="blockchain-info-item">
                        <FaCube className="bc-icon" />
                        <div>
                          <div className="bc-label">Blockchain</div>
                          <div className="bc-value">{result.blockchain}</div>
                        </div>
                      </div>
                      <div className="blockchain-info-item">
                        <FaHashtag className="bc-icon" />
                        <div>
                          <div className="bc-label">Mã Hash</div>
                          <div className="bc-value mono">{result.hashShort}</div>
                        </div>
                      </div>
                      <div className="blockchain-info-item">
                        <FaBox className="bc-icon" />
                        <div>
                          <div className="bc-label">Số block</div>
                          <div className="bc-value">{result.blockNumber}</div>
                        </div>
                      </div>
                      <div className="blockchain-info-item">
                        <FaClock className="bc-icon" />
                        <div>
                          <div className="bc-label">Thời gian ghi nhận</div>
                          <div className="bc-value">{result.recordedTime}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: Guide Panel */}
            <div className="verify-right">
              <div className="guide-panel">
                <h3 className="guide-panel-title">HƯỚNG DẪN XÁC THỰC</h3>
                <div className="guide-steps">
                  <div className="guide-step">
                    <div className="guide-step-number">
                      <FaQrcode />
                    </div>
                    <div className="guide-step-content">
                      <div className="guide-step-title">Bước 1</div>
                      <div className="guide-step-main">Quét mã QR trên văn bằng</div>
                      <div className="guide-step-desc">
                        Sử dụng ứng dụng quét mã QR hoặc camera để quét mã trên văn bằng
                      </div>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">
                      <FaFileAlt />
                    </div>
                    <div className="guide-step-content">
                      <div className="guide-step-title">Bước 2</div>
                      <div className="guide-step-main">Kiểm tra thông tin</div>
                      <div className="guide-step-desc">
                        Hệ thống sẽ tự động truy xuất thông tin văn bằng từ Blockchain
                      </div>
                    </div>
                  </div>
                  <div className="guide-step">
                    <div className="guide-step-number">
                      <FaShieldAlt />
                    </div>
                    <div className="guide-step-content">
                      <div className="guide-step-title">Bước 3</div>
                      <div className="guide-step-main">Xem kết quả xác thực</div>
                      <div className="guide-step-desc">
                        Kết quả sẽ hiển thị ngay lập tức
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="notice-panel">
                <h3 className="notice-panel-title">LƯU Ý</h3>
                <div className="notice-items">
                  <div className="notice-item">
                    <FaCheckCircle className="notice-icon" />
                    <span>Kết quả xác thực chỉ có giá trị tại thời điểm tra cứu</span>
                  </div>
                  <div className="notice-item">
                    <FaCheckCircle className="notice-icon" />
                    <span>Văn bằng giả mạo sẽ không tồn tại trên hệ thống Blockchain</span>
                  </div>
                  <div className="notice-item">
                    <FaCheckCircle className="notice-icon" />
                    <span>Mọi thắc mắc vui lòng liên hệ với đơn vị cấp văn bằng</span>
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

export default VerifyPage
