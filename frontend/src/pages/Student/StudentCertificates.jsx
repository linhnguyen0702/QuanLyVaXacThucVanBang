import React, { useState } from 'react';
import { 
  FaSearch, FaEye, FaDownload, FaQrcode, FaPrint, 
  FaCheckCircle, FaClock, FaTimes
} from 'react-icons/fa';
import CertificateDiplomaPreview from '../../components/CertificateDiplomaPreview';
import CertificateBlockchainInfo from '../../components/CertificateBlockchainInfo';

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

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = (cert) => {
    if (!cert?.certificateHash) {
      showToast('Văn bằng chưa có mã QR.');
      return;
    }

    const qrSvg = document.querySelector('.certificate-diploma-qr svg');
    if (!qrSvg) {
      showToast('Không thể tạo mã QR.');
      return;
    }

    const svgContent = new XMLSerializer().serializeToString(qrSvg);
    const objectUrl = URL.createObjectURL(new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${cert.id}-QR.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
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
                ) : activeCert.certificateStatus === 'issued' ? (
                  <span className="std-badge amber">
                    <FaClock /> Đã duyệt, chưa xác nhận Blockchain
                  </span>
                ) : activeCert.certificateStatus === 'revoked' ? (
                  <span className="std-badge amber">
                    <FaClock /> Đã thu hồi
                  </span>
                ) : (
                  <span className="std-badge amber">
                    <FaClock /> Chờ phê duyệt
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
                    title="Xem mã QR"
                    onClick={() => handleOpenModal(cert)}
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

            <div className="std-modal-body std-cert-view-body">
              {/* Premium Certificate View */}
              <div id="printable-certificate">
                <CertificateDiplomaPreview certificate={{
                  code: activeCert.certificateCode || activeCert.id,
                  schoolName: activeCert.school,
                  degreeType: activeCert.degreeType,
                  major: activeCert.major || activeCert.title?.replace(/^Cử nhân\s+/i, ''),
                  studentName: activeCert.studentName,
                  studentCode: activeCert.studentCode,
                  dateOfBirth: activeCert.dateOfBirth,
                  classification: activeCert.classification,
                  educationMode: activeCert.educationMode,
                  issueDate: activeCert.issueDate,
                  status: activeCert.certificateStatus || (activeCert.status === 'blockchain' ? 'issued' : 'pending'),
                  certificateHash: activeCert.certificateHash
                }} />
              </div>

              <CertificateBlockchainInfo certificate={{
                status: activeCert.certificateStatus || 'pending',
                blockchain_confirmed: activeCert.blockchainConfirmed,
                blockchain_network: activeCert.blockchainNetwork,
                blockchain_tx_hash: activeCert.txHash,
                blockchain_block_number: activeCert.blockchainBlockNumber,
                blockchain_timestamp: activeCert.blockchainTimestamp,
                blockchain_explorer_url: activeCert.blockchainExplorerUrl
              }} />
            </div>

            <div className="std-modal-footer">
              <button className="std-btn-secondary" onClick={handleCloseModal}>
                Đóng lại
              </button>
              <button 
                className="std-btn-secondary" 
                onClick={() => handleDownloadQR(activeCert)}
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
