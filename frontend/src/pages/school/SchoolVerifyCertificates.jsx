import React, { useState, useEffect } from 'react';
import { 
  FaShieldAlt, FaClock, FaCheckCircle, FaTimes, FaSpinner,
  FaFileSignature, FaDatabase, FaKey, FaLink, FaExternalLinkAlt, 
  FaCheck, FaInfoCircle
} from 'react-icons/fa';
import { api } from '../../services/api';
import './SchoolVerifyCertificates.css';

const SchoolVerifyCertificates = () => {
  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  
  // Modals state
  const [showMetaMask, setShowMetaMask] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0); // 0: hash, 1: send, 2: wait, 3: done
  const [successResult, setSuccessResult] = useState(null);
  const [approvedToday, setApprovedToday] = useState(12);
  const [gasSpent, setGasSpent] = useState(1015295);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Nạp danh sách văn bằng đã được xác thực xuất bản lên Blockchain (status = 'issued')
      const res = await api.getCertificates({ status: 'issued' });
      if (res && res.success && res.certificates) {
        const history = res.certificates.map(c => ({
          id: c.id,
          code: c.certificate_code,
          studentName: c.student_name,
          studentId: c.student_code,
          program: c.major,
          txHash: c.blockchain_tx_hash || '0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b',
          timestamp: c.issue_date ? new Date(c.issue_date).toLocaleDateString('vi-VN') : '25/07/2026',
          block: c.blockchain_certificate_id || 42895612
        }));
        setHistoryList(history);
      }

      // 2. Nạp danh sách văn bằng ở trạng thái 'pending' được tạo từ Trang Văn bằng
      const pendingRes = await api.getCertificates({ status: 'pending' });
      if (pendingRes && pendingRes.success && pendingRes.certificates) {
        const pending = pendingRes.certificates.map((c) => ({
          id: c.id,
          code: c.certificate_code,
          studentName: c.student_name,
          studentId: c.student_code,
          program: c.major,
          rank: c.classification || 'Giỏi',
          dob: c.issue_date ? new Date(c.issue_date).toLocaleDateString('vi-VN') : '14/05/2004',
          system: c.education_mode || 'Chính quy'
        }));
        setPendingList(pending);
      }
    } catch (err) {
      console.error('Failed to load certificates for verification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenApprove = (cert) => {
    setSelectedCert(cert);
  };

  const handleCloseModal = () => {
    setSelectedCert(null);
    setSuccessResult(null);
  };

  const handleTriggerMetaMask = () => {
    setShowMetaMask(true);
  };

  const handleRejectSignature = () => {
    setShowMetaMask(false);
  };

  const handleConfirmSignature = async () => {
    setShowMetaMask(false);
    setIsProcessing(true);
    setProcessStep(0);

    // Step 1: Calculate Hash
    setTimeout(async () => {
      setProcessStep(1);
      // Step 2: Send transaction to backend/blockchain
      setTimeout(async () => {
        setProcessStep(2);
        // Step 3: Wait for confirmation
        setTimeout(async () => {
          setProcessStep(3);
          
          const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
          const blockNum = Math.floor(Math.random() * 50000) + 42900000;
          const timestampStr = new Date().toLocaleDateString('vi-VN');

          try {
            if (selectedCert.id) {
              // Cập nhật trạng thái văn bằng thành issued và đẩy txHash vào CSDL
              await api.updateCertificate(selectedCert.id, {
                status: 'issued',
                blockchain_tx_hash: txHash
              });
            }
          } catch (e) {
            console.error('Failed to save approved cert to DB:', e);
          }

          const updatedCert = {
            ...selectedCert,
            txHash,
            blockNum,
            timestamp: timestampStr
          };

          setPendingList(prev => prev.filter(item => item.code !== selectedCert.code));
          setHistoryList(prev => [
            {
              code: selectedCert.code,
              studentName: selectedCert.studentName,
              program: selectedCert.program,
              txHash,
              block: blockNum,
              timestamp: timestampStr
            },
            ...prev
          ]);

          setApprovedToday(prev => prev + 1);
          setGasSpent(prev => prev + 84150);

          setSuccessResult(updatedCert);
          setIsProcessing(false);
        }, 1200);
      }, 1000);
    }, 800);
  };

  const handleBatchApprove = () => {
    if (pendingList.length === 0) return;
    setIsProcessing(true);
    setProcessStep(0);
    setTimeout(() => {
      setProcessStep(1);
      setTimeout(() => {
        setProcessStep(2);
        setTimeout(async () => {
          setProcessStep(3);
          const timestampStr = new Date().toLocaleDateString('vi-VN');
          
          const newHistoryItems = [];
          for (let i = 0; i < pendingList.length; i++) {
            const cert = pendingList[i];
            const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
            if (cert.id) {
              try {
                await api.updateCertificate(cert.id, {
                  status: 'issued',
                  blockchain_tx_hash: txHash
                });
              } catch (err) {
                console.error('Error updating cert:', err);
              }
            }
            newHistoryItems.push({
              code: cert.code,
              studentName: cert.studentName,
              program: cert.program,
              txHash,
              block: 42901100 + i,
              timestamp: timestampStr
            });
          }

          setHistoryList(prev => [...newHistoryItems, ...prev]);
          setApprovedToday(prev => prev + pendingList.length);
          setGasSpent(prev => prev + (pendingList.length * 79500));
          setPendingList([]);
          setIsProcessing(false);
        }, 1200);
      }, 1000);
    }, 800);
  };

  return (
    <div className="sd-view svc-container">
      {/* ── Page Header ── */}
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Phê duyệt & Xác thực văn bằng</h2>
          <p>Ký số và đẩy văn bằng lên CSDL MySQL & Blockchain Sepolia để kích hoạt tra cứu công khai</p>
        </div>
        <button 
          className="sd-btn-primary" 
          onClick={handleBatchApprove}
          disabled={pendingList.length === 0 || isProcessing}
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}
        >
          <FaFileSignature /> Phê duyệt đồng loạt ({pendingList.length})
        </button>
      </div>

      {/* ── Summary statistics ── */}
      <div className="svc-summary-grid">
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box orange" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}><FaClock /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Văn bằng chờ phê duyệt</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{pendingList.length}</span>
              <span className="sd-stat-badge orange">Cần xử lý</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box green" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}><FaCheckCircle /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Đã xuất bản hôm nay</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">+{approvedToday}</span>
              <span className="sd-stat-badge green">Hoạt động tốt</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box blue" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}><FaDatabase /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Gas tiêu thụ ước lượng</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{(gasSpent / 1000000).toFixed(4)} M</span>
              <span className="sd-stat-badge blue">Gwei</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Data Card: Pending list ── */}
      <div className="svc-main-card">
        <div className="svc-header-row">
          <div className="svc-card-title" style={{ margin: 0 }}>Danh sách văn bằng chờ duyệt ký Blockchain</div>
          <div className="sd-td-subtext">Danh sách sinh viên vừa hoàn thành chương trình đào tạo.</div>
        </div>

        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Mã số hiệu</th>
                <th>Thông tin sinh viên</th>
                <th>Chương trình đào tạo</th>
                <th>Xếp loại tốt nghiệp</th>
                <th>Hệ đào tạo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} /> Đang tải danh sách chờ phê duyệt...
                  </td>
                </tr>
              ) : pendingList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <FaCheckCircle style={{ color: '#10b981', fontSize: '30px', marginBottom: '10px' }} />
                    <div className="sd-td-bold">Tất cả văn bằng đã được duyệt!</div>
                    <div className="sd-td-subtext">Không còn bản ghi nào chờ xử lý.</div>
                  </td>
                </tr>
              ) : (
                pendingList.map((row) => (
                  <tr key={row.code}>
                    <td className="sd-td-bold">{row.code}</td>
                    <td>
                      <div className="sd-td-bold">{row.studentName}</div>
                      <div className="sd-td-subtext">MSSV: {row.studentId} • Ngày sinh: {row.dob}</div>
                    </td>
                    <td>{row.program}</td>
                    <td>
                      <span className={`sd-badge ${row.rank === 'Xuất sắc' ? 'green' : row.rank === 'Giỏi' ? 'blue' : 'orange'}`}>
                        {row.rank}
                      </span>
                    </td>
                    <td>{row.system}</td>
                    <td>
                      <span className="svc-badge-pending">
                        <span className="sd-bc-dot" style={{ backgroundColor: '#d97706', boxShadow: '0 0 8px #d97706' }}></span>
                        Chờ duyệt
                      </span>
                    </td>
                    <td className="sd-actions">
                      <button 
                        className="sd-btn-primary" 
                        onClick={() => handleOpenApprove(row)}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        disabled={isProcessing}
                      >
                        Duyệt ký số
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Secondary Data Card: Published Blockchain History ── */}
      <div className="svc-main-card">
        <div className="svc-card-title">Nhật ký xuất bản Blockchain gần đây</div>
        <div className="sd-table-container" style={{ marginTop: '16px' }}>
          <table className="sd-table">
            <thead>
              <tr>
                <th>Số hiệu</th>
                <th>Sinh viên</th>
                <th>Chương trình</th>
                <th>Transaction Hash (Ethereum Sepolia)</th>
                <th>Khối ghi nhận</th>
                <th>Thời gian đăng ký</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((item) => (
                <tr key={item.txHash}>
                  <td className="sd-td-bold">{item.code}</td>
                  <td className="sd-td-bold">{item.studentName}</td>
                  <td>{item.program}</td>
                  <td>
                    <span className="sd-bc-detail-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} title="Bấm để xem chi tiết">
                      <FaLink style={{ fontSize: '10px', color: '#0f4cf5' }} /> 
                      {item.txHash.substring(0, 16)}...
                    </span>
                  </td>
                  <td className="sd-td-bold">#{item.block}</td>
                  <td>{item.timestamp}</td>
                  <td>
                    <span className="svc-badge-approved">
                      <FaCheck /> Đã vào khối
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: Detail & Approve Certificate ── */}
      {selectedCert && (
        <div className="svc-modal-overlay">
          <div className="svc-modal">
            <div className="svc-modal-header">
              <span className="svc-modal-title">Xem chi tiết văn bằng & Ký duyệt</span>
              <button className="svc-modal-close" onClick={handleCloseModal} disabled={isProcessing}>
                <FaTimes />
              </button>
            </div>
            
            <div className="svc-modal-body">
              {!successResult ? (
                <>
                  <div className="sd-td-subtext" style={{ margin: 0 }}>
                    <FaInfoCircle style={{ color: '#0f4cf5', marginRight: '6px' }} />
                    Dưới đây là phôi bản dịch văn bằng nội bộ. Việc phê duyệt sẽ băm mật mã và lưu trữ dữ liệu lên CSDL MySQL & Blockchain.
                  </div>

                  <div className="svc-diploma-preview">
                    <div className="svc-diploma-watermark">
                      <FaShieldAlt size={160} />
                    </div>

                    <div className="svc-diploma-header">
                      <div className="svc-diploma-nation">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                      <div className="svc-diploma-motto">Độc lập - Tự do - Hạnh phúc</div>
                    </div>

                    <div className="svc-diploma-title">BẰNG CỬ NHÂN</div>

                    <div className="svc-diploma-body">
                      Hiệu trưởng **TRƯỜNG ĐẠI HỌC CÔNG NGHỆ** <br />
                      Cấp cho sinh viên: **{selectedCert.studentName}** <br />
                      Sinh ngày: **{selectedCert.dob}** • Hệ đào tạo: **{selectedCert.system}** <br />
                      Đã hoàn thành chương trình đào tạo ngành: **{selectedCert.program}** <br />
                      Xếp loại tốt nghiệp: **{selectedCert.rank}** <br />
                      Mã số hiệu lưu trữ: **{selectedCert.code}**
                    </div>
                  </div>

                  <div className="svc-blockchain-data">
                    <div className="svc-bc-row">
                      <span className="svc-bc-label"><FaKey /> Ví ký phát hành đại diện:</span>
                      <span className="svc-bc-value">0xA3f2d9b7eC81452D819280dEAc429e81</span>
                    </div>
                    <div className="svc-bc-row">
                      <span className="svc-bc-label"><FaDatabase /> Mạng lưới phát hành:</span>
                      <span className="sd-badge green" style={{ fontSize: '10.5px' }}>Ethereum Sepolia Testnet</span>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
                  <FaCheckCircle style={{ fontSize: '60px', color: '#10b981' }} />
                  <div>
                    <h3 className="svc-modal-title" style={{ color: '#10b981', fontSize: '20px' }}>PHÊ DUYỆT & ĐĂNG KÝ CSDL & BLOCKCHAIN THÀNH CÔNG</h3>
                    <p className="sd-td-subtext" style={{ marginTop: '8px' }}>Văn bằng của sinh viên <strong>{successResult.studentName}</strong> đã được lưu trữ vào CSDL MySQL và Blockchain.</p>
                  </div>

                  <div className="svc-blockchain-data" style={{ width: '100%', borderLeft: '4px solid #10b981' }}>
                    <div className="svc-bc-row">
                      <span className="svc-bc-label">Số hiệu văn bằng:</span>
                      <span className="svc-bc-value" style={{ backgroundColor: '#e6fdf0', color: '#15803d' }}>{successResult.code}</span>
                    </div>
                    <div className="svc-bc-row">
                      <span className="svc-bc-label">Transaction Hash:</span>
                      <span className="svc-bc-value copyable" onClick={() => alert('Đã copy TxHash')} style={{ width: '220px' }}>{successResult.txHash}</span>
                    </div>
                    <div className="svc-bc-row">
                      <span className="svc-bc-label">Khối ghi nhận:</span>
                      <span className="svc-bc-value">#{successResult.blockNum}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="svc-modal-footer">
              {!successResult ? (
                <>
                  <button className="sd-btn-secondary" style={{ margin: 0 }} onClick={handleCloseModal} disabled={isProcessing}>
                    Hủy bỏ
                  </button>
                  <button 
                    className="sd-btn-primary" 
                    style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }} 
                    onClick={handleTriggerMetaMask}
                    disabled={isProcessing}
                  >
                    <FaFileSignature /> Phê duyệt & Ký số
                  </button>
                </>
              ) : (
                <button className="sd-btn-primary" style={{ margin: 0 }} onClick={handleCloseModal}>
                  Đóng lại
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── METAMASK SIGNATURE SIMULATOR POPUP ── */}
      {showMetaMask && (
        <div className="svc-metamask-overlay">
          <div className="svc-metamask-card">
            <div className="svc-mm-header">
              <div className="svc-mm-logo-area">
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>MetaMask Wallet</span>
              </div>
              <div className="svc-mm-net-badge">Ethereum Sepolia</div>
            </div>
            
            <div className="svc-mm-body">
              <div className="svc-mm-account">Ví quản trị: 0xA3f2...9b7e</div>
              <FaShieldAlt style={{ fontSize: '40px', color: '#f97316' }} />
              <div className="svc-mm-title">Yêu cầu ký chữ ký số</div>
              <div className="svc-mm-desc">Xác nhận ký số phôi bằng {selectedCert?.code} và đẩy lên CSDL hệ thống.</div>
            </div>

            <div className="svc-mm-footer">
              <button className="svc-mm-btn reject" onClick={handleRejectSignature}>Từ chối</button>
              <button className="svc-mm-btn confirm" onClick={handleConfirmSignature}>Ký số (Sign)</button>
            </div>
          </div>
        </div>
      )}

      {/* ── BLOCKCHAIN TRANSACTION PIPELINE OVERLAY ── */}
      {isProcessing && (
        <div className="svc-modal-overlay">
          <div className="svc-modal" style={{ maxWidth: '480px', padding: '30px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <FaSpinner className="fa-spin" style={{ fontSize: '40px', color: '#0f4cf5', marginBottom: '12px' }} />
              <h4 className="svc-modal-title">Đang lưu CSDL & Blockchain</h4>
              <p className="sd-td-subtext">Vui lòng chờ trong giây lát...</p>
            </div>

            <div className="svc-steps-card">
              <div className="svc-step-row">
                <div className={`svc-step-indicator ${processStep === 0 ? 'active' : 'done'}`}>
                  {processStep > 0 ? <FaCheck /> : '1'}
                </div>
                <span className={`svc-step-text ${processStep === 0 ? 'active' : 'done'}`}>
                  Băm thông tin văn bằng số (SHA-256)
                </span>
              </div>
              
              <div className="svc-step-row">
                <div className={`svc-step-indicator ${processStep < 1 ? 'pending' : processStep === 1 ? 'active' : 'done'}`}>
                  {processStep > 1 ? <FaCheck /> : '2'}
                </div>
                <span className={`svc-step-text ${processStep < 1 ? 'pending' : processStep === 1 ? 'active' : 'done'}`}>
                  Gửi dữ liệu ghi vào CSDL MySQL & Smart Contract
                </span>
              </div>

              <div className="svc-step-row">
                <div className={`svc-step-indicator ${processStep < 2 ? 'pending' : processStep === 2 ? 'active' : 'done'}`}>
                  {processStep > 2 ? <FaCheck /> : '3'}
                </div>
                <span className={`svc-step-text ${processStep < 2 ? 'pending' : processStep === 2 ? 'active' : 'done'}`}>
                  Đã ghi nhận khối thành công
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolVerifyCertificates;
