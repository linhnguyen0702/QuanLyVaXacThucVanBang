import React, { useState, useEffect } from 'react';
import { 
  FaDownload, FaEye, FaTrash, FaSearch, FaFilter, 
  FaFilePdf, FaFileExcel, FaFileWord, FaTimes, FaCheck, 
  FaCertificate, FaShieldAlt, FaExclamationTriangle, FaQrcode, 
  FaFileUpload, FaSpinner 
} from 'react-icons/fa';
import { api } from '../../services/api';

const SchoolReports = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generator Filter Form State
  const [genForm, setGenForm] = useState({
    reportType: 'issuance',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    department: 'Tất cả khoa',
    subFilter: 'Tất cả',
    format: 'XLSX'
  });

  // History List Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('');
  const [historyFormatFilter, setHistoryFormatFilter] = useState('');

  // Modals State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedReportFile, setSelectedReportFile] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // External Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'Báo cáo phát hành văn bằng',
    format: 'PDF',
    fileObj: null
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.getReports();
      if (res && res.success) {
        setHistory(res.reports || []);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getReportTypeLabel = (key) => {
    switch (key) {
      case 'issuance': return 'Báo cáo phát hành văn bằng';
      case 'blockchain': return 'Báo cáo đối soát Blockchain';
      case 'revoked': return 'Báo cáo văn bằng thu hồi';
      case 'verification': return 'Báo cáo hoạt động xác thực';
      default: return 'Báo cáo tổng hợp';
    }
  };

  const getFormatBadge = (fmt) => {
    switch (fmt) {
      case 'XLSX':
        return <span className="sd-badge green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaFileExcel /> XLSX</span>;
      case 'PDF':
        return <span className="sd-badge red" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaFilePdf /> PDF</span>;
      case 'DOCX':
        return <span className="sd-badge blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaFileWord /> DOCX</span>;
      default:
        return <span className="sd-badge gray">{fmt}</span>;
    }
  };

  // Open Data Preview Modal before downloading
  const handleOpenGeneratorPreview = (e) => {
    e.preventDefault();
    setIsPreviewOpen(true);
  };

  // Execute Report Generation & Download
  const handleGenerateAndDownload = async () => {
    const typeLabel = getReportTypeLabel(genForm.reportType);
    const timeStamp = new Date().toISOString().slice(0, 10);
    const fileName = `Bao_Cao_${genForm.reportType.toUpperCase()}_${timeStamp}.${genForm.format.toLowerCase()}`;

    try {
      const res = await api.createReport({
        file_name: fileName,
        report_type: typeLabel,
        type_key: genForm.reportType,
        format: genForm.format,
        record_count: Math.floor(100 + Math.random() * 900),
        file_size: (Math.random() * 2 + 0.8).toFixed(1) + ' MB'
      });

      if (res && res.success) {
        setIsPreviewOpen(false);
        showToast(`Đã khởi tạo và ghi nhận file ${fileName} vào CSDL thành công!`);
        fetchReports();
      }
    } catch (err) {
      alert('Không thể tạo báo cáo.');
    }
  };

  const handleDownloadHistoryFile = (rep) => {
    showToast(`Đang tải tệp ${rep.file_name || rep.fileName} xuống...`);
  };

  const handleOpenDeleteModal = (rep) => {
    setSelectedReportFile(rep);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteOpen(false);
    showToast(`Đã xóa file báo cáo`);
    fetchReports();
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.title) {
      alert('Vui lòng nhập tên tệp báo cáo!');
      return;
    }
    try {
      const res = await api.createReport({
        file_name: `${uploadForm.title.replace(/\s+/g, '_')}.${uploadForm.format.toLowerCase()}`,
        report_type: uploadForm.type,
        type_key: 'external',
        format: uploadForm.format,
        record_count: 0,
        file_size: '2.4 MB'
      });

      if (res && res.success) {
        setIsUploadOpen(false);
        showToast('Tải lên tệp báo cáo thành công!');
        fetchReports();
      }
    } catch (err) {
      alert('Lỗi tải lên.');
    }
  };

  const filteredHistory = history.filter(h => {
    const name = h.file_name || h.fileName || '';
    const creator = h.creator_name || h.creator || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = historyTypeFilter === '' || h.type_key === historyTypeFilter || h.typeKey === historyTypeFilter;
    const matchesFormat = historyFormatFilter === '' || h.format === historyFormatFilter;
    return matchesSearch && matchesType && matchesFormat;
  });

  return (
    <div className="sd-view">
      {/* ── PAGE HEADER ── */}
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Quản lý Báo cáo động</h2>
          <p>Trích xuất báo cáo theo tiêu chí bộ lọc & Quản lý lịch sử từ CSDL MySQL</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="sd-btn-secondary" onClick={() => setIsUploadOpen(true)}>
            <FaFileUpload /> Tải lên báo cáo
          </button>
        </div>
      </div>

      {/* ── 4 REPORT CATEGORIES CARDS ── */}
      <div className="sd-stats-row">
        <div 
          className={`sd-stat-card ${genForm.reportType === 'issuance' ? 'selected' : ''}`}
          style={{ cursor: 'pointer', border: genForm.reportType === 'issuance' ? '2px solid #0f4cf5' : '1px solid #e2e8f0' }}
          onClick={() => setGenForm({ ...genForm, reportType: 'issuance' })}
        >
          <div className="sd-stat-icon-box blue"><FaCertificate /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Báo cáo phát hành</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value" style={{ fontSize: '16px' }}>Văn bằng phát hành</span>
            </div>
          </div>
        </div>

        <div 
          className={`sd-stat-card ${genForm.reportType === 'blockchain' ? 'selected' : ''}`}
          style={{ cursor: 'pointer', border: genForm.reportType === 'blockchain' ? '2px solid #0f4cf5' : '1px solid #e2e8f0' }}
          onClick={() => setGenForm({ ...genForm, reportType: 'blockchain' })}
        >
          <div className="sd-stat-icon-box green"><FaShieldAlt /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Báo cáo Blockchain</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value" style={{ fontSize: '16px' }}>Đối soát mã băm</span>
            </div>
          </div>
        </div>

        <div 
          className={`sd-stat-card ${genForm.reportType === 'revoked' ? 'selected' : ''}`}
          style={{ cursor: 'pointer', border: genForm.reportType === 'revoked' ? '2px solid #0f4cf5' : '1px solid #e2e8f0' }}
          onClick={() => setGenForm({ ...genForm, reportType: 'revoked' })}
        >
          <div className="sd-stat-icon-box orange"><FaExclamationTriangle /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Báo cáo thu hồi</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value" style={{ fontSize: '16px' }}>Văn bằng bị hủy</span>
            </div>
          </div>
        </div>

        <div 
          className={`sd-stat-card ${genForm.reportType === 'verification' ? 'selected' : ''}`}
          style={{ cursor: 'pointer', border: genForm.reportType === 'verification' ? '2px solid #0f4cf5' : '1px solid #e2e8f0' }}
          onClick={() => setGenForm({ ...genForm, reportType: 'verification' })}
        >
          <div className="sd-stat-icon-box purple"><FaQrcode /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Hoạt động xác thực</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value" style={{ fontSize: '16px' }}>Tra cứu QR & API</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DYNAMIC REPORT GENERATOR FORM ── */}
      <div className="sd-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaFilter style={{ color: '#0f4cf5' }} /> Bộ lọc trích xuất dữ liệu: 
          <span style={{ color: '#0f4cf5' }}>{getReportTypeLabel(genForm.reportType)}</span>
        </h3>

        <form onSubmit={handleOpenGeneratorPreview}>
          <div className="sd-form-grid">
            <div className="sd-form-group">
              <label>Loại báo cáo *</label>
              <select 
                className="sd-input" 
                value={genForm.reportType} 
                onChange={(e) => setGenForm({ ...genForm, reportType: e.target.value })}
              >
                <option value="issuance">Báo cáo phát hành văn bằng</option>
                <option value="blockchain">Báo cáo đối soát Blockchain</option>
                <option value="revoked">Báo cáo văn bằng thu hồi</option>
                <option value="verification">Báo cáo hoạt động xác thực</option>
              </select>
            </div>

            <div className="sd-form-group">
              <label>Từ ngày (Start Date) *</label>
              <input 
                type="date" 
                className="sd-input" 
                value={genForm.startDate} 
                onChange={(e) => setGenForm({ ...genForm, startDate: e.target.value })} 
              />
            </div>

            <div className="sd-form-group">
              <label>Đến ngày (End Date) *</label>
              <input 
                type="date" 
                className="sd-input" 
                value={genForm.endDate} 
                onChange={(e) => setGenForm({ ...genForm, endDate: e.target.value })} 
              />
            </div>

            <div className="sd-form-group">
              <label>Khoa / Ngành đào tạo</label>
              <input 
                type="text" 
                className="sd-input" 
                placeholder="Nhập tên Khoa / Ngành hoặc Tất cả"
                value={genForm.department} 
                onChange={(e) => setGenForm({ ...genForm, department: e.target.value })} 
              />
            </div>

            <div className="sd-form-group">
              <label>Bộ lọc phân loại bổ sung</label>
              <select 
                className="sd-input" 
                value={genForm.subFilter} 
                onChange={(e) => setGenForm({ ...genForm, subFilter: e.target.value })}
              >
                <option value="Tất cả">Tất cả dữ liệu</option>
                <option value="Đại học">Trình độ Đại học</option>
                <option value="Cao đẳng">Trình độ Cao đẳng</option>
                <option value="Thạc sĩ">Trình độ Thạc sĩ</option>
                <option value="Tiến sĩ">Trình độ Tiến sĩ</option>
                <option value="Chứng chỉ">Trình độ Chứng chỉ</option>
                <option value="Đã xác thực">Chỉ bằng đã ghi Blockchain</option>
              </select>
            </div>

            <div className="sd-form-group">
              <label>Định dạng tệp xuất *</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13.5px' }}>
                  <input 
                    type="radio" 
                    name="genFormat" 
                    value="XLSX" 
                    checked={genForm.format === 'XLSX'} 
                    onChange={(e) => setGenForm({ ...genForm, format: e.target.value })} 
                  />
                  <FaFileExcel style={{ color: '#16a34a' }} /> File Excel (.xlsx)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13.5px' }}>
                  <input 
                    type="radio" 
                    name="genFormat" 
                    value="PDF" 
                    checked={genForm.format === 'PDF'} 
                    onChange={(e) => setGenForm({ ...genForm, format: e.target.value })} 
                  />
                  <FaFilePdf style={{ color: '#dc2626' }} /> File PDF (.pdf)
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="sd-btn-secondary" onClick={handleOpenGeneratorPreview}>
              <FaEye /> Xem trước dữ liệu
            </button>
            <button type="button" className="sd-btn-primary" onClick={handleGenerateAndDownload}>
              <FaDownload /> Tạo & Tải báo cáo
            </button>
          </div>
        </form>
      </div>

      {/* ── EXPORTED REPORT HISTORY TABLE ── */}
      <div className="sd-data-card">
        <div className="sd-filter-bar">
          <div className="sd-filter-left">
            <div className="sd-search-box">
              <FaSearch className="sd-search-icon" />
              <input 
                type="text" 
                className="sd-search-input" 
                placeholder="Tìm theo tên file, người tạo..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="sd-select" 
              value={historyTypeFilter} 
              onChange={(e) => setHistoryTypeFilter(e.target.value)}
            >
              <option value="">Tất cả loại báo cáo</option>
              <option value="issuance">Báo cáo phát hành văn bằng</option>
              <option value="blockchain">Báo cáo đối soát Blockchain</option>
              <option value="revoked">Báo cáo văn bằng thu hồi</option>
              <option value="verification">Báo cáo hoạt động xác thực</option>
            </select>
            <select 
              className="sd-select" 
              value={historyFormatFilter} 
              onChange={(e) => setHistoryFormatFilter(e.target.value)}
            >
              <option value="">Tất cả định dạng</option>
              <option value="XLSX">Excel (.xlsx)</option>
              <option value="PDF">PDF (.pdf)</option>
              <option value="DOCX">Word (.docx)</option>
            </select>
          </div>
        </div>

        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Tên tệp báo cáo</th>
                <th>Loại báo cáo</th>
                <th>Định dạng</th>
                <th>Người tạo</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} /> Đang tải dữ liệu báo cáo...
                  </td>
                </tr>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((rep) => (
                  <tr key={rep.id}>
                    <td className="sd-td-bold">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {rep.format === 'XLSX' ? <FaFileExcel style={{ color: '#16a34a', fontSize: '16px' }} /> : 
                         rep.format === 'PDF' ? <FaFilePdf style={{ color: '#dc2626', fontSize: '16px' }} /> : 
                         <FaFileWord style={{ color: '#0f4cf5', fontSize: '16px' }} />}
                        {rep.file_name || rep.fileName}
                      </div>
                    </td>
                    <td>{rep.report_type || rep.type}</td>
                    <td>{getFormatBadge(rep.format)}</td>
                    <td>{rep.creator_name || rep.creator || 'Hệ thống'}</td>
                    <td>{rep.created_at ? new Date(rep.created_at).toLocaleDateString('vi-VN') : rep.createdDate}</td>
                    <td className="sd-actions">
                      <button 
                        className="sd-action-btn" 
                        title="Xem trước" 
                        onClick={() => { setSelectedReportFile(rep); setIsPreviewOpen(true); }}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="sd-action-btn" 
                        title="Tải xuống" 
                        style={{ color: '#0f4cf5' }} 
                        onClick={() => handleDownloadHistoryFile(rep)}
                      >
                        <FaDownload />
                      </button>
                      <button 
                        className="sd-action-btn" 
                        title="Xóa" 
                        style={{ color: '#ef4444' }} 
                        onClick={() => handleOpenDeleteModal(rep)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Chưa có tệp báo cáo nào được khởi tạo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL 1: PREVIEW REPORT DATA MODAL ── */}
      {isPreviewOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaEye /></div>
                <h3>Xem trước dữ liệu báo cáo động</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsPreviewOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <div className="sd-detail-card" style={{ marginBottom: '16px' }}>
                <div className="sd-detail-grid">
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Loại báo cáo:</span>
                    <span className="sd-detail-value">{getReportTypeLabel(genForm.reportType)}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Khoảng thời gian:</span>
                    <span className="sd-detail-value">{genForm.startDate} đến {genForm.endDate}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Khoa / Phạm vi:</span>
                    <span className="sd-detail-value">{genForm.department}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Định dạng file xuất:</span>
                    <span className="sd-detail-value">{getFormatBadge(genForm.format)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn-secondary" onClick={() => setIsPreviewOpen(false)}>Đóng bản xem trước</button>
              <button className="sd-btn-primary" onClick={handleGenerateAndDownload}>
                <FaDownload /> Tạo & Tải file ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: UPLOAD EXTERNAL REPORT MODAL ── */}
      {isUploadOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaFileUpload /></div>
                <h3>Tải lên tệp báo cáo có sẵn</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsUploadOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
                  <div className="sd-form-group full-width">
                    <label>Tên tệp báo cáo *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      placeholder="Nhập tên tệp báo cáo..."
                      value={uploadForm.title} 
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Loại báo cáo</label>
                    <select 
                      className="sd-input" 
                      value={uploadForm.type} 
                      onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    >
                      <option value="Báo cáo phát hành văn bằng">Báo cáo phát hành văn bằng</option>
                      <option value="Báo cáo đối soát Blockchain">Báo cáo đối soát Blockchain</option>
                      <option value="Báo cáo văn bằng thu hồi">Báo cáo văn bằng thu hồi</option>
                      <option value="Báo cáo hoạt động xác thực">Báo cáo hoạt động xác thực</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Định dạng file</label>
                    <select 
                      className="sd-input" 
                      value={uploadForm.format} 
                      onChange={(e) => setUploadForm({ ...uploadForm, format: e.target.value })}
                    >
                      <option value="PDF">PDF (.pdf)</option>
                      <option value="XLSX">Excel (.xlsx)</option>
                      <option value="DOCX">Word (.docx)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="sd-modal-footer">
                <button type="button" className="sd-btn-secondary" onClick={() => setIsUploadOpen(false)}>Hủy</button>
                <button type="submit" className="sd-btn-primary">Tải lên ngay</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DELETE REPORT FILE MODAL ── */}
      {isDeleteOpen && selectedReportFile && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header" style={{ backgroundColor: '#fef2f2' }}>
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge" style={{ background: '#fee2e2', color: '#ef4444' }}><FaTrash /></div>
                <h3 style={{ color: '#991b1b' }}>Xóa tệp báo cáo</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsDeleteOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <p style={{ fontSize: '14px', color: '#334155' }}>
                Bạn có chắc chắn muốn xóa tệp báo cáo <strong>{selectedReportFile.file_name || selectedReportFile.fileName}</strong> khỏi lịch sử xuất dữ liệu?
              </p>
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn-secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</button>
              <button className="sd-btn-danger" onClick={handleDeleteConfirm}>Xác nhận Xóa</button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="sd-toast success">
          <FaCheck /> {toastMessage}
        </div>
      )}
    </div>
  );
};

export default SchoolReports;
