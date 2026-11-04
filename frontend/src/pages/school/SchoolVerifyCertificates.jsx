import React, { useState, useEffect, useCallback } from 'react';
import { getAddress, hexlify, toUtf8Bytes } from 'ethers';
import { 
  FaClock, FaCheckCircle, FaTimes, FaSpinner,
  FaFileSignature, FaDatabase, FaKey, FaLink, FaExternalLinkAlt, 
  FaCheck, FaInfoCircle
} from 'react-icons/fa';
import { api } from '../../services/api';
import CertificateDiplomaPreview from '../../components/CertificateDiplomaPreview';
import './SchoolVerifyCertificates.css';
import Pagination from '../../components/Pagination/Pagination';
import { formatDateDisplay } from '../../utils/dateUtils';

const PAGE_SIZE = 10;
const SEPOLIA_CHAIN_ID = '0xaa36a7';

const ensureSepoliaNetwork = async (ethereum) => {
  const chainId = await ethereum.request({ method: 'eth_chainId' });
  if (chainId === SEPOLIA_CHAIN_ID) return;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }]
    });
  } catch (error) {
    if (error.code !== 4902) throw error;

    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: SEPOLIA_CHAIN_ID,
        chainName: 'Sepolia',
        nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://rpc.sepolia.org'],
        blockExplorerUrls: ['https://sepolia.etherscan.io']
      }]
    });
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }]
    });
  }

  const activeChainId = await ethereum.request({ method: 'eth_chainId' });
  if (activeChainId !== SEPOLIA_CHAIN_ID) {
    throw new Error('Vui lòng chuyển MetaMask sang mạng Ethereum Sepolia để tiếp tục.');
  }
};

const createApprovalChallenge = (certificate, account) => {
  const approvalNonce = Array.from(
    window.crypto.getRandomValues(new Uint8Array(16)),
    (byte) => byte.toString(16).padStart(2, '0')
  ).join('');
  const approvalMessage = [
    'Xác nhận phê duyệt văn bằng điện tử',
    `Mã văn bằng: ${certificate.code}`,
    `ID văn bằng: ${certificate.id}`,
    `Ví phê duyệt: ${account}`,
    `Nonce: ${approvalNonce}`,
    'Network: Ethereum Sepolia'
  ].join('\n');

  return {
    approvalNonce,
    approvalMessage: hexlify(toUtf8Bytes(approvalMessage))
  };
};

const SchoolVerifyCertificates = ({ walletAddress }) => {
  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [pendingPage, setPendingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedCertLoading, setSelectedCertLoading] = useState(false);
  const [selectedCertError, setSelectedCertError] = useState('');
  
  // Modals state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0); // 0: wallet signature, 1: submit, 2: wait, 3: done
  const [successResult, setSuccessResult] = useState(null);
  const [approvedToday, setApprovedToday] = useState(12);
  const [gasSpent, setGasSpent] = useState(1015295);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Nạp danh sách văn bằng đã được xác thực xuất bản lên Blockchain (status = 'issued')
      const [res, pendingRes] = await Promise.all([
        api.getCertificates({ status: 'issued', page: historyPage, limit: PAGE_SIZE }),
        api.getCertificates({ status: 'pending', page: pendingPage, limit: PAGE_SIZE })
      ]);
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
        setHistoryTotal(res.total || 0);
      }

      // 2. Nạp danh sách văn bằng ở trạng thái 'pending' được tạo từ Trang Văn bằng
      if (pendingRes && pendingRes.success && pendingRes.certificates) {
        const pending = pendingRes.certificates.map((c) => ({
          id: c.id,
          code: c.certificate_code,
          studentName: c.student_name,
          studentId: c.student_code,
          dob: formatDateDisplay(c.student_date_of_birth),
          program: c.major,
          rank: c.classification || 'Giỏi',
          system: c.education_mode || 'Chính quy',
          degreeType: c.degree_type || 'Đại học',
          issueDate: c.issue_date || '',
          schoolName: c.school_name || ''
        }));
        setPendingList(pending);
        setPendingTotal(pendingRes.total || 0);
      }
    } catch (err) {
      console.error('Failed to load certificates for verification:', err);
    } finally {
      setLoading(false);
    }
  }, [pendingPage, historyPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenApprove = async (cert) => {
    setSelectedCert(cert);
    setSelectedCertError('');
    setSelectedCertLoading(true);
    try {
      const response = await api.getCertificateById(cert.id);
      if (!response?.success || !response.certificate) {
        throw new Error(response?.message || 'Không thể tải thông tin văn bằng.');
      }

      const detail = response.certificate;
      setSelectedCert({
        ...cert,
        studentName: detail.student_name || '',
        studentId: detail.student_code || '',
        program: detail.major || '',
        rank: detail.classification || '',
        dob: formatDateDisplay(detail.date_of_birth),
        system: detail.education_mode || '',
        degreeType: detail.degree_type || '',
        issueDate: formatDateDisplay(detail.issue_date),
        schoolName: detail.issuing_school_name || detail.school_name || ''
      });
    } catch (error) {
      console.error('Failed to load certificate details for approval:', error);
      setSelectedCertError(error.message || 'Không thể tải thông tin văn bằng.');
    } finally {
      setSelectedCertLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedCert(null);
    setSuccessResult(null);
    setSelectedCertLoading(false);
    setSelectedCertError('');
  };

  const getMetaMaskAccount = async () => {
    if (!window.ethereum) {
      throw new Error('Chưa phát hiện MetaMask. Vui lòng cài đặt hoặc mở tiện ích MetaMask.');
    }
    if (!walletAddress) {
      throw new Error('Tài khoản chưa liên kết ví. Vui lòng kết nối ví MetaMask trong thanh bên trước.');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts?.length) {
      throw new Error('Không có tài khoản MetaMask nào được chọn.');
    }
    const account = getAddress(accounts[0]);
    if (account.toLowerCase() !== getAddress(walletAddress).toLowerCase()) {
      throw new Error('Ví MetaMask đang chọn không khớp với ví đã liên kết tài khoản. Vui lòng chuyển sang đúng ví.');
    }

    await ensureSepoliaNetwork(window.ethereum);
    return { ethereum: window.ethereum, account };
  };

  const requestApprovalSignature = async (certificate, ethereum, account) => {
    const challenge = createApprovalChallenge(certificate, account);
    const signature = await ethereum.request({
      method: 'personal_sign',
      params: [challenge.approvalMessage, account]
    });
    return {
      approvalNonce: challenge.approvalNonce,
      approvalSignature: signature
    };
  };

  const handleApproveWithMetaMask = async () => {
    setIsProcessing(true);
    setProcessStep(0);

    try {
      if (!selectedCert?.id) {
        throw new Error('Không tìm thấy mã văn bằng để phê duyệt.');
      }

      const { ethereum, account } = await getMetaMaskAccount();
      const approval = await requestApprovalSignature(selectedCert, ethereum, account);
      setProcessStep(1);

      let txHash = null;
      let blockNum = null;
      let explorerUrl = null;
      setProcessStep(2);

      const apiResult = await api.updateCertificate(selectedCert.id, {
        status: 'issued',
        ...approval
      });
      if (!apiResult?.success) {
        throw new Error(apiResult?.message || 'Không thể phê duyệt văn bằng.');
      }

      if (apiResult.blockchain) {
        txHash = apiResult.blockchain.txHash;
        blockNum = apiResult.blockchain.blockNumber;
        explorerUrl = apiResult.blockchain.explorerUrl;
      } else if (apiResult.certificate?.blockchain_tx_hash) {
        txHash = apiResult.certificate.blockchain_tx_hash;
        explorerUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
      }

      const timestampStr = new Date().toLocaleDateString('vi-VN');

      setProcessStep(3);

      const updatedCert = {
        ...selectedCert,
        txHash: txHash || null,
        blockNum: blockNum || null,
        timestamp: timestampStr,
        explorerUrl: explorerUrl || null
      };

      setPendingList(prev => prev.filter(item => item.code !== selectedCert.code));
      setPendingTotal(prev => Math.max(0, prev - 1));
      setHistoryList(prev => [
        {
          code: selectedCert.code,
          studentName: selectedCert.studentName,
          program: selectedCert.program,
          txHash: txHash || null,
          block: blockNum || null,
          timestamp: timestampStr,
          explorerUrl: explorerUrl || null
        },
        ...prev
      ]);
      setHistoryTotal(prev => prev + 1);

      setApprovedToday(prev => prev + 1);
      setGasSpent(prev => prev + 84150);
      setSuccessResult(updatedCert);
      if (!apiResult.emailNotificationSent) {
        alert('Văn bằng đã được phê duyệt nhưng email thông báo chưa gửi được. Vui lòng kiểm tra cấu hình email.');
      }
    } catch (e) {
      console.error('Failed to approve cert on blockchain:', e);
      alert(e.code === 4001
        ? 'Bạn đã từ chối yêu cầu ký trong MetaMask.'
        : 'Lỗi khi phê duyệt văn bằng: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchApprove = async () => {
    if (pendingList.length === 0) return;
    setIsProcessing(true);
    setProcessStep(0);
    try {
      const { ethereum, account } = await getMetaMaskAccount();
      const timestampStr = new Date().toLocaleDateString('vi-VN');
      const newHistoryItems = [];
      const approvedIds = new Set();
      const failedCertificates = [];
      let failedEmailNotifications = 0;
      let wasSignatureRejected = false;

      for (const cert of pendingList) {
        try {
          if (!cert.id) {
            throw new Error('Không tìm thấy mã văn bằng để phê duyệt.');
          }
          const approval = await requestApprovalSignature(cert, ethereum, account);
          setProcessStep(1);
          const apiResult = await api.updateCertificate(cert.id, {
            status: 'issued',
            ...approval
          });
          if (!apiResult?.success) {
            throw new Error(apiResult?.message || 'Không thể phê duyệt văn bằng.');
          }
          if (!apiResult.emailNotificationSent) failedEmailNotifications += 1;
          approvedIds.add(cert.id);
          newHistoryItems.push({
            code: cert.code,
            studentName: cert.studentName,
            program: cert.program,
            txHash: apiResult.blockchain?.txHash || apiResult.certificate?.blockchain_tx_hash || null,
            block: apiResult.blockchain?.blockNumber || null,
            timestamp: timestampStr
          });
          setProcessStep(2);
        } catch (err) {
          console.error(`Error updating certificate ${cert.code}:`, err);
          failedCertificates.push(cert);
          if (err.code === 4001) {
            wasSignatureRejected = true;
            break;
          }
        }
      }

      setProcessStep(3);
      setHistoryList(prev => [...newHistoryItems, ...prev]);
      setHistoryTotal(prev => prev + newHistoryItems.length);
      setApprovedToday(prev => prev + newHistoryItems.length);
      setGasSpent(prev => prev + (newHistoryItems.length * 79500));
      setPendingList(prev => prev.filter(cert => !approvedIds.has(cert.id)));
      setPendingTotal(prev => Math.max(0, prev - approvedIds.size));
      setPendingPage(1);
      setHistoryPage(1);
      if (failedCertificates.length > 0) {
        alert(wasSignatureRejected
          ? 'Bạn đã từ chối yêu cầu ký trong MetaMask. Các văn bằng chưa ký vẫn ở trạng thái chờ duyệt.'
          : `${failedCertificates.length} văn bằng chưa được phê duyệt. Vui lòng kiểm tra trạng thái sinh viên và thử lại.`);
      }
      if (failedEmailNotifications > 0) {
        alert(`${failedEmailNotifications} email thông báo chưa gửi được. Vui lòng kiểm tra cấu hình email.`);
      }
    } catch (err) {
      console.error('Failed to start batch certificate approval:', err);
      alert(err.code === 4001
        ? 'Bạn đã từ chối yêu cầu trong MetaMask.'
        : 'Không thể bắt đầu phê duyệt: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="sd-view svc-container">
      {/* ── Page Header ── */}
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Phê duyệt & Xác thực văn bằng</h2>
          <p>Kiểm duyệt và xác thực văn bằng điện tử, đảm bảo an toàn thông tin và ngăn ngừa giả mạo.</p>
        </div>
        <button 
          className="sd-btn-primary" 
          onClick={handleBatchApprove}
          disabled={pendingList.length === 0 || isProcessing}
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}
        >
          <FaFileSignature /> Phê duyệt đồng loạt trang này ({pendingList.length})
        </button>
      </div>

      {/* ── Summary statistics ── */}
      <div className="svc-summary-grid">
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box orange" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}><FaClock /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Văn bằng chờ phê duyệt</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{pendingTotal}</span>
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
          <table className="sd-table svc-pending-table">
            <colgroup>
              <col style={{ width: '14%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '19%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '11%' }} />
            </colgroup>
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
                      <div className="sd-td-subtext svc-student-meta">MSSV: {row.studentId || '—'}</div>
                      <div className="sd-td-subtext svc-student-meta">Ngày sinh: {row.dob || '—'}</div>
                    </td>
                    <td>{row.program}</td>
                    <td>
                      <span className={`sd-badge ${row.rank === 'Xuất sắc' ? 'green' : row.rank === 'Giỏi' ? 'blue' : 'orange'}`}>
                        {row.rank}
                      </span>
                    </td>
                    <td>{row.system}</td>
                    <td>
                      <span className="svc-badge-pending svc-table-status">
                        <span className="sd-bc-dot" style={{ backgroundColor: '#d97706', boxShadow: '0 0 8px #d97706' }}></span>
                        Chờ duyệt
                      </span>
                    </td>
                    <td className="sd-actions">
                      <button 
                        className="sd-btn-primary" 
                        onClick={() => handleOpenApprove(row)}
                        style={{ padding: '8px 10px', fontSize: '12px' }}
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
        <Pagination page={pendingPage} total={pendingTotal} limit={PAGE_SIZE} onPageChange={setPendingPage} />
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
                    {item.txHash ? (
                      <a
                        href={item.explorerUrl || `https://sepolia.etherscan.io/tx/${item.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sd-bc-detail-val"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', textDecoration: 'none' }}
                        title="Xem giao dịch trên Etherscan Sepolia"
                      >
                        <FaLink style={{ fontSize: '10px' }} />
                        {item.txHash.substring(0, 14)}...
                        <FaExternalLinkAlt style={{ fontSize: '9px' }} />
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td className="sd-td-bold">{item.block ? `#${item.block}` : <span style={{ color: '#94a3b8' }}>—</span>}</td>
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
        <Pagination page={historyPage} total={historyTotal} limit={PAGE_SIZE} onPageChange={setHistoryPage} />
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

                  {selectedCertLoading ? (
                    <div className="svc-preview-message"><FaSpinner className="svc-spin" /> Đang tải thông tin văn bằng...</div>
                  ) : selectedCertError ? (
                    <div className="svc-preview-error" role="alert">{selectedCertError}</div>
                  ) : (
                    <>
                      <CertificateDiplomaPreview certificate={{
                        code: selectedCert.code,
                        schoolName: selectedCert.schoolName,
                        degreeType: selectedCert.degreeType,
                        major: selectedCert.program,
                        studentName: selectedCert.studentName,
                        studentCode: selectedCert.studentId,
                        dateOfBirth: selectedCert.dob,
                        classification: selectedCert.rank,
                        educationMode: selectedCert.system,
                        issueDate: selectedCert.issueDate,
                        status: 'pending'
                      }} />

                      <div className="svc-blockchain-data">
                        <div className="svc-bc-row">
                          <span className="svc-bc-label"><FaKey /> Ví ký phát hành đại diện:</span>
                          <span className="svc-bc-value">{walletAddress || 'Chưa kết nối ví'}</span>
                        </div>
                        <div className="svc-bc-row">
                          <span className="svc-bc-label"><FaDatabase /> Mạng lưới phát hành:</span>
                          <span className="sd-badge green" style={{ fontSize: '10.5px' }}>Ethereum Sepolia Testnet</span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="svc-success-container">
                  {/* Animated success icon */}
                  <div className="svc-success-icon-wrap">
                    <div className="svc-success-ring svc-ring-1" />
                    <div className="svc-success-ring svc-ring-2" />
                    <div className="svc-success-icon-inner">
                      <FaCheckCircle />
                    </div>
                  </div>

                  {/* Headline */}
                  <div className="svc-success-headline">
                    <h3 className="svc-success-title">Phê duyệt &amp; Đăng ký thành công!</h3>
                    <p className="svc-success-subtitle">
                      Văn bằng của <strong>{successResult.studentName}</strong> đã được lưu trữ vào
                      <span className="svc-success-tag svc-tag-db"> &nbsp;CSDL MySQL&nbsp; </span>
                      &amp;
                      <span className="svc-success-tag svc-tag-chain"> &nbsp;Blockchain Sepolia&nbsp; </span>
                    </p>
                  </div>

                  {/* Info cards grid */}
                  <div className="svc-success-grid">
                    <div className="svc-info-card svc-info-card--green">
                      <div className="svc-info-card-label">Số hiệu văn bằng</div>
                      <div className="svc-info-card-value">{successResult.code}</div>
                    </div>
                    <div className="svc-info-card svc-info-card--blue">
                      <div className="svc-info-card-label">Khối ghi nhận</div>
                      <div className="svc-info-card-value">
                        {successResult.blockNum ? `#${successResult.blockNum}` : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Transaction Hash row */}
                  {successResult.txHash ? (
                    <>
                      <div className="svc-txhash-row">
                        <div className="svc-txhash-label">
                          <FaLink style={{ fontSize: 11 }} /> Transaction Hash (Sepolia)
                        </div>
                        <div className="svc-txhash-value-wrap">
                          <code
                            className="svc-txhash-code"
                            onClick={() => navigator.clipboard.writeText(successResult.txHash)}
                            title="Bấm để sao chép toàn bộ hash"
                          >
                            {successResult.txHash.substring(0, 24)}...{successResult.txHash.slice(-8)}
                          </code>
                          <button
                            className="svc-copy-btn"
                            onClick={() => navigator.clipboard.writeText(successResult.txHash)}
                            title="Sao chép"
                          >
                            <FaKey style={{ fontSize: 10 }} /> Copy
                          </button>
                        </div>
                      </div>
                      <a
                        className="svc-etherscan-btn"
                        href={successResult.explorerUrl || `https://sepolia.etherscan.io/tx/${successResult.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaExternalLinkAlt style={{ fontSize: 11 }} />
                        Xem giao dịch trên Sepolia Etherscan
                      </a>
                    </>
                  ) : (
                    <div className="svc-txhash-row">
                      <div className="svc-txhash-label">
                        <FaDatabase style={{ fontSize: 11 }} /> Trạng thái Blockchain
                      </div>
                      <span className="svc-success-tag svc-tag-pending">Đã lưu DB — Blockchain đang xử lý</span>
                    </div>
                  )}
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
                    onClick={handleApproveWithMetaMask}
                    disabled={isProcessing || selectedCertLoading || Boolean(selectedCertError)}
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

      {/* ── BLOCKCHAIN TRANSACTION PIPELINE OVERLAY ── */}
      {isProcessing && (
        <div className="svc-modal-overlay">
          <div className="svc-modal" style={{ maxWidth: '480px', padding: '30px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <FaSpinner className="fa-spin" style={{ fontSize: '40px', color: '#0f4cf5', marginBottom: '12px' }} />
              <h4 className="svc-modal-title">
                {processStep === 0 ? 'Đang chờ MetaMask xác nhận' : 'Đang lưu CSDL & Blockchain'}
              </h4>
              <p className="sd-td-subtext">Vui lòng chờ trong giây lát...</p>
            </div>

            <div className="svc-steps-card">
              <div className="svc-step-row">
                <div className={`svc-step-indicator ${processStep === 0 ? 'active' : 'done'}`}>
                  {processStep > 0 ? <FaCheck /> : '1'}
                </div>
                <span className={`svc-step-text ${processStep === 0 ? 'active' : 'done'}`}>
                  Xác nhận chữ ký phê duyệt qua MetaMask
                </span>
              </div>
              
              <div className="svc-step-row">
                <div className={`svc-step-indicator ${processStep < 1 ? 'pending' : processStep === 1 ? 'active' : 'done'}`}>
                  {processStep > 1 ? <FaCheck /> : '2'}
                </div>
                <span className={`svc-step-text ${processStep < 1 ? 'pending' : processStep === 1 ? 'active' : 'done'}`}>
                  Gửi phê duyệt và ghi dữ liệu
                </span>
              </div>

              <div className="svc-step-row">
                <div className={`svc-step-indicator ${processStep < 2 ? 'pending' : processStep === 2 ? 'active' : 'done'}`}>
                  {processStep > 2 ? <FaCheck /> : '3'}
                </div>
                <span className={`svc-step-text ${processStep < 2 ? 'pending' : processStep === 2 ? 'active' : 'done'}`}>
                  Chờ Blockchain xác nhận giao dịch
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
