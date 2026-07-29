import React, { useState } from 'react';
import { 
  FaShieldAlt, FaClock, FaCheckCircle, FaTimes, FaSpinner,
  FaFileSignature, FaDatabase, FaKey, FaLink, FaExternalLinkAlt, 
  FaCheck, FaInfoCircle
} from 'react-icons/fa';
import './SchoolVerifyCertificates.css';

// Initial pending certificates list
const INITIAL_PENDING = [
  { code: 'UNI-2026-0105', studentName: 'Nguyễn Thị Thu Thảo', studentId: '20220091', program: 'Kỹ thuật phần mềm', class: 'K67', rank: 'Xuất sắc', dob: '14/05/2004', system: 'Chính quy' },
  { code: 'UNI-2026-0106', studentName: 'Phạm Văn Hoàng', studentId: '20220184', program: 'Công nghệ thông tin', class: 'K67', rank: 'Giỏi', dob: '22/11/2004', system: 'Chính quy' },
  { code: 'UNI-2026-0107', studentName: 'Bùi Minh Anh', studentId: '20220472', program: 'Hệ thống thông tin', class: 'K67', rank: 'Khá', dob: '05/02/2004', system: 'Chính quy' },
  { code: 'UNI-2026-0108', studentName: 'Đặng Hoàng Long', studentId: '20220511', program: 'An toàn thông tin', class: 'K67', rank: 'Giỏi', dob: '19/08/2004', system: 'Chính quy' },
  { code: 'UNI-2026-0109', studentName: 'Vũ Minh Thuỷ', studentId: '20220803', program: 'Khoa học máy tính', class: 'K67', rank: 'Xuất sắc', dob: '30/10/2004', system: 'Chính quy' }
];

// Initial blockchain logs history
const INITIAL_HISTORY = [
  { code: 'UNI-2026-0012', studentName: 'Trần Thị B', program: 'Công nghệ thông tin', txHash: '0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b', timestamp: '25/07/2026 09:14', block: 42895612 },
  { code: 'UNI-2026-0013', studentName: 'Lê Văn C', program: 'Kỹ thuật phần mềm', txHash: '0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b', timestamp: '24/07/2026 14:30', block: 42894105 }
];

const SchoolVerifyCertificates = () => {
  const [pendingList, setPendingList] = useState(INITIAL_PENDING);
  const [historyList, setHistoryList] = useState(INITIAL_HISTORY);
  const [selectedCert, setSelectedCert] = useState(null);
  
  // Modals state
  const [showMetaMask, setShowMetaMask] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0); // 0: hash, 1: send, 2: wait, 3: done
  const [successResult, setSuccessResult] = useState(null);
  const [approvedToday, setApprovedToday] = useState(12);
  const [gasSpent, setGasSpent] = useState(1015295);

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
    alert('Người dùng đã từ chối giao dịch ký số.');
  };

  const handleConfirmSignature = () => {
    setShowMetaMask(false);
    setIsProcessing(true);
    setProcessStep(0);

    // Step 1: Calculate Hash
    setTimeout(() => {
      setProcessStep(1);
      // Step 2: Send transaction to blockchain
      setTimeout(() => {
        setProcessStep(2);
        // Step 3: Wait for confirmation
        setTimeout(() => {
          setProcessStep(3);
          
          // Generate mock tx data
          const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
          const blockNum = Math.floor(Math.random() * 50000) + 42900000;
          const cleanDate = new Date();
          const timestampStr = `${cleanDate.getDate().toString().padStart(2, '0')}/${(cleanDate.getMonth()+1).toString().padStart(2, '0')}/${cleanDate.getFullYear()} ${cleanDate.getHours().toString().padStart(2, '0')}:${cleanDate.getMinutes().toString().padStart(2, '0')}`;

          const updatedCert = {
            ...selectedCert,
            txHash,
            blockNum,
            timestamp: timestampStr
          };

          // Remove from pending
          setPendingList(prev => prev.filter(item => item.code !== selectedCert.code));
          // Add to history
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

          // Update stats
          setApprovedToday(prev => prev + 1);
          setGasSpent(prev => prev + 84150);

          setSuccessResult(updatedCert);
          setIsProcessing(false);
        }, 1500);
      }, 1200);
    }, 1000);
  };

  const handleBatchApprove = () => {
    if (pendingList.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn phê duyệt đồng loạt ${pendingList.length} văn bằng và đẩy lên Blockchain?`)) {
      // Simulate batch approval
      setIsProcessing(true);
      setProcessStep(0);
      setTimeout(() => {
        setProcessStep(1);
        setTimeout(() => {
          setProcessStep(2);
          setTimeout(() => {
            setProcessStep(3);
            
            // Map all pending to history
            const cleanDate = new Date();
            const timestampStr = `${cleanDate.getDate().toString().padStart(2, '0')}/${(cleanDate.getMonth()+1).toString().padStart(2, '0')}/${cleanDate.getFullYear()} ${cleanDate.getHours().toString().padStart(2, '0')}:${cleanDate.getMinutes().toString().padStart(2, '0')}`;
            
            const newHistoryItems = pendingList.map((cert, idx) => {
              const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
              return {
                code: cert.code,
                studentName: cert.studentName,
                program: cert.program,
                txHash,
                block: 42901100 + idx,
                timestamp: timestampStr
              };
            });

            setHistoryList(prev => [...newHistoryItems, ...prev]);
            setApprovedToday(prev => prev + pendingList.length);
            setGasSpent(prev => prev + (pendingList.length * 79500));
            setPendingList([]);
            setIsProcessing(false);
            alert(`Đã phê duyệt và đẩy thành công ${newHistoryItems.length} văn bằng lên Blockchain Polygon Mainnet!`);
          }, 1500);
        }, 1200);
      }, 1000);
    }
  };

  return (
    <div className="sd-view svc-container">
      {/* ── Page Header ── */}
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Phê duyệt & Xác thực văn bằng</h2>
          <p>Ký số số hiệu và xuất bản văn bằng số đã tạo lên sổ cái Blockchain để kích hoạt tra cứu công khai</p>
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
            <span className="sd-stat-label">Đã xuất bản Blockchain hôm nay</span>
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
          <div className="sd-td-subtext">Danh sách sinh viên vừa hoàn thành chương trình đào tạo, đã cấp phôi bằng nội bộ.</div>
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
              {pendingList.length === 0 ? (
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
                <th>Transaction Hash (Polygon)</th>
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
              {/* If signing is not successful yet */}
              {!successResult ? (
                <>
                  <div className="sd-td-subtext" style={{ margin: 0 }}>
                    <FaInfoCircle style={{ color: '#0f4cf5', marginRight: '6px' }} />
                    Dưới đây là phôi bản dịch văn bằng nội bộ. Việc phê duyệt sẽ băm mật mã và tải chữ ký pháp lý của trường lên blockchain Polygon.
                  </div>

                  {/* Diploma Template Preview */}
                  <div className="svc-diploma-preview">
                    {/* Watermark SVG background */}
                    <div className="svc-diploma-watermark">
                      <FaShieldAlt size={160} />
                    </div>

                    <div className="svc-diploma-header">
                      <div className="svc-diploma-nation">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                      <div className="svc-diploma-motto">Độc lập - Tự do - Hạnh phúc</div>
                    </div>

                    <div className="svc-diploma-title">BẰNG CỬ NHÂN</div>

                    <div className="svc-diploma-body">
                      Hiệu trưởng **TRƯỜNG ĐẠI HỌC CÔNG NGHỆ VÀ PHÁT TRIỂN** <br />
                      Cấp cho sinh viên: **{selectedCert.studentName}** <br />
                      Sinh ngày: **{selectedCert.dob}** • Hệ đào tạo: **{selectedCert.system}** <br />
                      Đã hoàn thành chương trình đào tạo ngành: **{selectedCert.program}** <br />
                      Xếp loại tốt nghiệp: **{selectedCert.rank}** <br />
                      Mã số hiệu lưu trữ: **{selectedCert.code}**
                    </div>

                    <div className="svc-diploma-footer">
                      <div className="svc-diploma-seal-spot">
                        <div className="svc-diploma-seal">ĐHQG HÀ NỘI<br/>DỰ THẢO</div>
                      </div>
                      <div className="svc-diploma-sign">
                        Hà Nội, ngày cấp {selectedCert.dob.split('/')[0]} tháng 07 năm 2026 <br />
                        **HIỆU TRƯỞNG** <br />
                        <span style={{ fontStyle: 'italic', fontSize: '11px', color: '#94a3b8' }}>[Đang chờ chữ ký số của ví đại diện]</span>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Sign info */}
                  <div className="svc-blockchain-data">
                    <div className="svc-bc-row">
                      <span className="svc-bc-label"><FaKey /> Ví ký phát hành đại diện:</span>
                      <span className="svc-bc-value">0xA3f2d9b7eC81452D819280dEAc429e</span>
                    </div>
                    <div className="svc-bc-row">
                      <span className="svc-bc-label"><FaDatabase /> Mạng lưới phát hành:</span>
                      <span className="sd-badge green" style={{ fontSize: '10.5px' }}>Polygon Mainnet (Lớp 2)</span>
                    </div>
                  </div>
                </>
              ) : (
                // If approval successfully pushed to Blockchain
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
                  <FaCheckCircle style={{ fontSize: '60px', color: '#10b981' }} />
                  <div>
                    <h3 className="svc-modal-title" style={{ color: '#10b981', fontSize: '20px' }}>PHÊ DUYỆT & ĐĂNG KÝ BLOCKCHAIN THÀNH CÔNG</h3>
                    <p className="sd-td-subtext" style={{ marginTop: '8px' }}>Văn bằng của sinh viên <strong>{successResult.studentName}</strong> đã được lưu trữ bất biến trên mạng Polygon.</p>
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
                    <div className="svc-bc-row">
                      <span className="svc-bc-label">Mã băm bằng (Cert Hash):</span>
                      <span className="svc-bc-value" style={{ width: '220px' }}>0x11223344556677889900aabbccddeeff0011223344556677889900aabbccddee</span>
                    </div>
                  </div>

                  <a 
                    href={`https://polygonscan.com/tx/${successResult.txHash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="sd-btn-secondary" 
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    Kiểm tra giao dịch trên Polygonscan <FaExternalLinkAlt style={{ fontSize: '11px' }} />
                  </a>
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
                {/* Simulated Orange Fox Logo (MetaMask) */}
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                  <path d="M29.8 4.2L20.4 12L23 5L29.8 4.2Z" fill="#E17726"/>
                  <path d="M2.2 4.2L11.6 12L9 5L2.2 4.2Z" fill="#E17726"/>
                  <path d="M26.2 22.4L20.4 27.6L20.8 19.8L26.2 22.4Z" fill="#E17726"/>
                  <path d="M5.8 22.4L11.6 27.6L11.2 19.8L5.8 22.4Z" fill="#E17726"/>
                  <path d="M12.6 12L16 18.2L19.4 12H12.6Z" fill="#E17726"/>
                  <path d="M20.8 19.8L16 23.4L11.2 19.8L16 17.6L20.8 19.8Z" fill="#F6851B"/>
                  <path d="M26.2 22.4L29.6 17.6L24.6 16.4L26.2 22.4Z" fill="#D7C1B1"/>
                  <path d="M5.8 22.4L2.4 17.6L7.4 16.4L5.8 22.4Z" fill="#D7C1B1"/>
                  <path d="M16 1.8L21.4 8.6L16 9.6L10.6 8.6L16 1.8Z" fill="#E2761B"/>
                </svg>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>MetaMask</span>
              </div>
              <div className="svc-mm-net-badge">Polygon Mainnet</div>
            </div>
            
            <div className="svc-mm-body">
              <div className="svc-mm-account">Ví quản trị: 0xA3f2...9b7e</div>
              <FaShieldAlt style={{ fontSize: '40px', color: '#f97316' }} />
              <div className="svc-mm-title">Yêu cầu ký chữ ký số</div>
              <div className="svc-mm-desc">Bạn đang thực hiện ký số phê duyệt giao dịch Smart Contract để phát hành và đẩy dữ liệu băm văn bằng lên mạng lưới blockchain.</div>
              
              <div className="svc-mm-box">
                {`{
  "contract": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "method": "issueDiploma",
  "data": {
    "code": "${selectedCert?.code}",
    "name": "${selectedCert?.studentName}",
    "rank": "${selectedCert?.rank}",
    "hash": "0x11223344556677889900aabbccddeeff0011223344556677889900aabbccddee"
  }
}`}
              </div>
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
              <h4 className="svc-modal-title">Đang ghi sổ Blockchain</h4>
              <p className="sd-td-subtext">Đang tương tác với các Node trên Polygon Mainnet. Vui lòng giữ kết nối Internet ổn định.</p>
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
                  Gửi chữ ký số ví lên Smart Contract
                </span>
              </div>

              <div className="svc-step-row">
                <div className={`svc-step-indicator ${processStep < 2 ? 'pending' : processStep === 2 ? 'active' : 'done'}`}>
                  {processStep > 2 ? <FaCheck /> : '3'}
                </div>
                <span className={`svc-step-text ${processStep < 2 ? 'pending' : processStep === 2 ? 'active' : 'done'}`}>
                  Đang đợi thợ đào khai thác khối...
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
