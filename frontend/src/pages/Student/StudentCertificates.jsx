import React, { useState } from 'react';
import { 
  FaSearch, FaEye, FaDownload, FaQrcode, FaPrint, 
  FaCheckCircle, FaClock, FaTimes, FaLink, FaCopy 
} from 'react-icons/fa';

const StudentCertificates = ({ 
  certificates = [], 
  selectedCert = null,
  showCertModal = false,
  setShowCertModal = () => {},
  setSelectedCert = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Local state modal control (if not triggered from overview)
  const [localModal, setLocalModal] = useState(false);
  const [localCert, setLocalCert] = useState(null);

  const isModalOpen = showCertModal || localModal;
  const activeCert = selectedCert || localCert;

  const handleOpenModal = (cert) => {
    setSelectedCert(cert);
    setLocalCert(cert);
    setLocalModal(true);
    setShowCertModal(true);
  };

  const handleCloseModal = () => {
    setLocalModal(false);
    setShowCertModal(false);
    setSelectedCert(null);
    setLocalCert(null);
  };

  const handleCopyTx = (txHash) => {
    navigator.clipboard.writeText(txHash);
    showToast('Đã sao chép mã giao dịch Blockchain!');
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = (certId) => {
    showToast(`Đã tải xuống mã QR cho văn bằng ${certId} thành công!`);
  };

  const handleDownloadMockPDF = (certTitle) => {
    showToast(`Đang tạo và tải bản PDF ký số cho "${certTitle}"...`);
  };

  // Filter logic
  const filteredCerts = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cert.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === '' || cert.type.includes(filterType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="std-view">
      <div className="std-page-header">
        <div className="std-page-title-area">
          <h2>Văn bằng của tôi</h2>
          <p>Danh sách văn bằng, chứng chỉ của bạn đã được chứng thực trên hệ thống Blockchain.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="std-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="std-input" 
              placeholder="Tìm theo tên bằng, mã định danh..." 
              style={{ width: '100%', paddingLeft: '38px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="std-input" 
            style={{ minWidth: '160px', cursor: 'pointer' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tất cả loại bằng</option>
            <option value="Bằng Tốt Nghiệp">Bằng tốt nghiệp</option>
            <option value="Chứng Chỉ">Chứng chỉ</option>
          </select>
        </div>
      </div>

      {/* Certificates Grid */}
      {filteredCerts.length > 0 ? (
        <div className="std-certs-grid">
          {filteredCerts.map((cert) => (
            <div key={cert.id} className="std-cert-card">
              <div className="std-cert-header">
                <span className="std-cert-type">{cert.type}</span>
                <span className="std-cert-id">{cert.id}</span>
              </div>
              
              <div className="std-cert-body">
                <h3 className="std-cert-name">{cert.title}</h3>
                <p className="std-cert-school">{cert.school}</p>
                <div className="std-cert-date">Ngày cấp: {cert.issueDate}</div>
              </div>

              <div className="std-cert-footer">
                {cert.status === 'blockchain' ? (
                  <span className="std-badge green">
                    <FaCheckCircle /> Đã ghi Blockchain
                  </span>
                ) : (
                  <span className="std-badge amber">
                    <FaClock /> Đã phê duyệt, chờ ghi
                  </span>
                )}
                
                <div className="std-cert-actions">
                  <button 
                    className="std-icon-btn" 
                    title="Xem chi tiết"
                    onClick={() => handleOpenModal(cert)}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="std-icon-btn" 
                    title="Tải QR Code"
                    onClick={() => handleDownloadQR(cert.id)}
                  >
                    <FaQrcode />
                  </button>
                  <button 
                    className="std-icon-btn" 
                    title="Tải PDF ký số"
                    onClick={() => handleDownloadMockPDF(cert.title)}
                  >
                    <FaDownload />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="std-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          Không tìm thấy văn bằng hay chứng chỉ nào phù hợp với tìm kiếm của bạn.
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && activeCert && (
        <div className="std-modal-overlay" onClick={handleCloseModal}>
          <div className="std-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="std-modal-header">
              <h3 className="std-modal-title">Chi tiết văn bằng số</h3>
              <button className="std-modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="std-modal-body">
              {/* Premium Certificate View */}
              <div className="std-cert-view-container" id="printable-certificate">
                {/* Decorative background vectors or watermarks */}
                <div className="std-cert-view-watermark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"/>
                  </svg>
                </div>

                <div className="std-cert-view-header">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '15px', color: '#475569' }}>
                  Độc lập - Tự do - Hạnh phúc
                </div>
                
                <div className="std-cert-view-title">BẰNG TỐT NGHIỆP</div>
                <div className="std-cert-view-subtitle">HIỆU TRƯỞNG TRƯỜNG ĐẠI HỌC QUYẾT ĐỊNH CẤP</div>

                <div className="std-cert-view-recipient-lbl">Cho sinh viên:</div>
                <div className="std-cert-view-recipient-name">NGUYỄN VĂN AN</div>
                
                <div className="std-cert-view-desc">
                  Đã hoàn thành chương trình đào tạo ngành <strong>{activeCert.title.replace('Cử nhân ', '')}</strong> tại <strong>{activeCert.school}</strong><br/>
                  Quyết định công nhận tốt nghiệp số: <strong>{activeCert.id.replace('UNI-', 'QD-')}</strong><br/>
                  Xếp loại tốt nghiệp: <strong>{activeCert.gpa || 'Khá'}</strong>
                </div>

                <div className="std-cert-view-meta-row">
                  <div className="std-cert-view-sign">
                    <span className="std-cert-view-sign-lbl">Số hiệu: {activeCert.id}</span>
                    <span className="std-cert-view-sign-lbl" style={{ marginTop: '4px' }}>Ngày cấp: {activeCert.issueDate}</span>
                  </div>

                  <div className="std-cert-view-goldseal">
                    {/* Golden seal SVG */}
                    <svg viewBox="0 0 100 100" width="80" height="80">
                      <circle cx="50" cy="50" r="45" fill="#f59e0b" stroke="#d97706" strokeWidth="3" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 2" />
                      <path d="M50 20 L55 35 L70 35 L58 45 L62 60 L50 50 L38 60 L42 45 L30 35 L45 35 Z" fill="#ffffff" />
                      <text x="50" y="80" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">VERIFIED</text>
                    </svg>
                  </div>

                  <div className="std-cert-view-sign">
                    {/* Simulated signature image or typography */}
                    <span style={{ fontFamily: 'Dancing Script, cursive', fontSize: '20px', color: '#1e3a8a', fontStyle: 'italic', fontWeight: 'bold' }}>
                      Nguyen Van B
                    </span>
                    <span className="std-cert-view-sign-name">PGS.TS Nguyễn Văn B</span>
                    <span className="std-cert-view-sign-lbl">Hiệu trưởng nhà trường</span>
                  </div>
                </div>

                {/* QR Section */}
                <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="std-cert-view-qrcode">
                    {/* Standard SVG QR Code mock */}
                    <svg width="72" height="72" viewBox="0 0 29 29" shapeRendering="crispEdges">
                      <path fill="#ffffff" d="M0 0h29v29H0z"/>
                      <path fill="#000000" d="M0 0h7v7H0zm22 0h7v7h-7zM0 22h7v7H0zm9 0h2v2H9zm2 2h2v3h-2zm4-2h1v1h-1zm1 1h2v2h-2zm2-1h1v2h-1zm2 1h1v1h-1zm-2 2h3v1h-3zm-6 2h2v1h-2zm-3-5h2v1H9zm1 1h2v1h-2zm5-1h1v2h-1zm-2-3h1v2h-1zm3 1h2v1h-2zm-1 2h1v1h-1zm3-3h2v1h-2zm-2-2h1v1h-1zm-2 1h2v1h-2zm-3-1h1v1h-1zm1 1h2v1h-2zm-3-1h1v1H9zm-7 8h5v5H2z"/>
                    </svg>
                  </div>
                  <span className="std-cert-view-qrcode-lbl">Quét QR hoặc truy cập đường dẫn để xác thực</span>
                </div>
              </div>

              {/* Blockchain info panel */}
              <div className="std-cert-bc-box">
                <h4 className="std-cert-bc-title">
                  <FaLink style={{ color: '#4f46e5' }} /> Thông tin lưu trữ Blockchain
                </h4>
                
                {activeCert.status === 'blockchain' ? (
                  <div className="std-cert-bc-grid">
                    <span className="std-cert-bc-lbl">Trạng thái:</span>
                    <span className="std-cert-bc-val status">
                      <FaCheckCircle /> Đã chứng thực thành công trên Blockchain
                    </span>

                    <span className="std-cert-bc-lbl">Mạng lưới:</span>
                    <span className="std-cert-bc-val">Polygon Mainnet (Public Layer 2)</span>

                    <span className="std-cert-bc-lbl">Transaction Hash:</span>
                    <span className="std-cert-bc-val mono" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeCert.txHash}</span>
                      <button 
                        onClick={() => handleCopyTx(activeCert.txHash)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                        title="Sao chép Hash"
                      >
                        <FaCopy />
                      </button>
                    </span>

                    <span className="std-cert-bc-lbl">Block ghi nhận:</span>
                    <span className="std-cert-bc-val mono">{activeCert.blockNumber}</span>

                    <span className="std-cert-bc-lbl">Thời gian ghi nhận:</span>
                    <span className="std-cert-bc-val">{activeCert.blockchainTime}</span>
                  </div>
                ) : (
                  <div className="std-cert-bc-grid">
                    <span className="std-cert-bc-lbl">Trạng thái:</span>
                    <span className="std-cert-bc-val status" style={{ color: '#ea580c' }}>
                      <FaClock /> Đã phê duyệt ký số - Đang chờ ghi lên Blockchain
                    </span>
                    <span className="std-cert-bc-lbl">Chi tiết:</span>
                    <span className="std-cert-bc-val">
                      Văn bằng đã được Nhà trường phê duyệt thành công. Giao dịch đẩy dữ liệu lên Smart Contract đang được xếp hàng thực hiện.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="std-modal-footer">
              <button className="std-btn-secondary" onClick={handleCloseModal}>
                Đóng lại
              </button>
              <button 
                className="std-btn-secondary" 
                onClick={() => handleDownloadQR(activeCert.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaQrcode /> Tải QR Code
              </button>
              <button 
                className="std-btn-primary" 
                onClick={handlePrint}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaPrint /> In hoặc Lưu PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="std-toast success">
          <FaCheckCircle /> {toastMsg}
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;
