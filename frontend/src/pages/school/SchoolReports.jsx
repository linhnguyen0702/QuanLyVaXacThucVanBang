import React, { useState, useEffect } from 'react';
import { 
  FaDownload, FaEye, FaTrash, FaSearch, FaFilter, 
  FaFilePdf, FaFileExcel, FaFileWord, FaTimes, FaCheck, 
  FaCertificate, FaShieldAlt, FaExclamationTriangle, FaQrcode, 
  FaSpinner
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { api } from '../../services/api';

const reportColumns = {
  issuance: ['certificate_code', 'student_code', 'student_name', 'major', 'degree_type', 'education_mode', 'gpa', 'classification', 'issue_date', 'decision_number', 'school_name', 'program_name', 'blockchain_tx_hash', 'certificate_hash'],
  blockchain: ['certificate_code', 'student_code', 'student_name', 'major', 'degree_type', 'issue_date', 'blockchain_status', 'blockchain_tx_hash', 'certificate_hash', 'school_name', 'program_name'],
  revoked: ['certificate_code', 'student_code', 'student_name', 'major', 'degree_type', 'revoked_at', 'revoke_reason', 'school_name', 'program_name'],
  verification: ['verified_at', 'certificate_code', 'student_code', 'student_name', 'major', 'degree_type', 'verification_method', 'verification_result', 'school_name']
};

const columnLabels = {
  certificate_code: 'Mã văn bằng',
  student_code: 'Mã sinh viên',
  student_name: 'Họ và tên',
  major: 'Ngành',
  degree_type: 'Trình độ',
  education_mode: 'Hình thức đào tạo',
  gpa: 'Điểm trung bình',
  classification: 'Xếp loại',
  issue_date: 'Ngày cấp',
  decision_number: 'Số quyết định',
  school_name: 'Trường',
  program_name: 'Chương trình',
  blockchain_tx_hash: 'Mã giao dịch Blockchain',
  certificate_hash: 'Mã băm văn bằng',
  blockchain_status: 'Trạng thái Blockchain',
  revoked_at: 'Ngày cập nhật thu hồi',
  revoke_reason: 'Lý do thu hồi',
  verified_at: 'Thời gian xác thực',
  verification_method: 'Phương thức xác thực',
  verification_result: 'Kết quả'
};

const toLocalDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCellValue = (key, value) => {
  if (key === 'verification_result') return value ? 'Thành công' : 'Thất bại';
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toLocaleString('vi-VN');
  return String(value);
};

const downloadReportFile = async (rows, format, fileName, title, typeKey) => {
  const keys = rows.length ? Object.keys(rows[0]) : reportColumns[typeKey] || [];

  if (format !== 'CSV' && format !== 'PDF') {
    throw new Error('Định dạng của báo cáo cũ không được hỗ trợ tải xuống.');
  }

  if (format === 'CSV') {
    const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const csvRows = [
      keys.map((key) => escapeCsv(columnLabels[key] || key)).join(','),
      ...rows.map((row) => keys.map((key) => escapeCsv(getCellValue(key, row[key]))).join(','))
    ];
    const blob = new Blob([`\uFEFF${csvRows.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-10000px;top:0;width:1120px;padding:24px;background:#fff;color:#111827;font:14px Arial,sans-serif;';
  const heading = document.createElement('h2');
  heading.textContent = title;
  heading.style.cssText = 'margin:0 0 16px;font-size:20px;';
  container.appendChild(heading);
  const table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;font-size:10px;';
  const head = document.createElement('tr');
  keys.forEach((key) => {
    const cell = document.createElement('th');
    cell.textContent = columnLabels[key] || key;
    cell.style.cssText = 'border:1px solid #cbd5e1;padding:6px;background:#eff6ff;text-align:left;';
    head.appendChild(cell);
  });
  table.appendChild(head);
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    keys.forEach((key) => {
      const cell = document.createElement('td');
      cell.textContent = getCellValue(key, row[key]);
      cell.style.cssText = 'border:1px solid #cbd5e1;padding:6px;vertical-align:top;word-break:break-word;';
      tr.appendChild(cell);
    });
    table.appendChild(tr);
  });
  container.appendChild(table);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const margin = 8;
    const width = pdf.internal.pageSize.getWidth() - margin * 2;
    const height = canvas.height * width / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    const pageCount = Math.max(1, Math.ceil(height / pageHeight));
    for (let page = 0; page < pageCount; page += 1) {
      if (page) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin - page * pageHeight, width, height);
    }
    pdf.save(fileName);
  } finally {
    container.remove();
  }
};

const SchoolReports = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewFilters, setPreviewFilters] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  // Generator Filter Form State
  const [genForm, setGenForm] = useState({
    reportType: 'issuance',
    startDate: toLocalDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    endDate: toLocalDateInput(new Date()),
    department: 'Tất cả khoa',
    subFilter: 'Tất cả',
    format: 'CSV'
  });

  // History List Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('');
  const [historyFormatFilter, setHistoryFormatFilter] = useState('');

  // Modals State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedReportFile, setSelectedReportFile] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.getReports();
      if (res && res.success) {
        setHistory(res.reports || []);
        setReportError('');
      }
    } catch (err) {
      setReportError(err.message || 'Không thể tải lịch sử báo cáo.');
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
      case 'CSV':
        return <span className="sd-badge green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaFileExcel /> CSV</span>;
      case 'PDF':
        return <span className="sd-badge red" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaFilePdf /> PDF</span>;
      case 'DOCX':
        return <span className="sd-badge blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaFileWord /> DOCX</span>;
      default:
        return <span className="sd-badge gray">{fmt}</span>;
    }
  };

  const handleOpenGeneratorPreview = async (e) => {
    if (e) e.preventDefault();
    setSelectedReportFile(null);
    setPreviewFilters(genForm);
    setPreviewRows([]);
    setReportError('');
    setPreviewLoading(true);
    setIsPreviewOpen(true);
    try {
      const res = await api.previewReport(genForm);
      setPreviewRows(res.rows || []);
    } catch (err) {
      setReportError(err.message || 'Không thể xem trước báo cáo.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerateAndDownload = async () => {
    try {
      setReportError('');
      const res = await api.generateReport(genForm);
      if (res && res.success) {
        setIsPreviewOpen(false);
        await fetchReports();
        await downloadReportFile(
          res.rows || [],
          genForm.format,
          res.report.file_name,
          res.report.report_type,
          genForm.reportType
        );
        showToast(`Đã tạo báo cáo ${res.report.file_name} (${res.count} bản ghi).`);
      }
    } catch (err) {
      setReportError(err.message || 'Không thể tạo báo cáo.');
    }
  };

  const handleDownloadHistoryFile = async (rep) => {
    try {
      setReportError('');
      const res = await api.getReportData(rep.id);
      const filters = typeof res.report.report_filters === 'string'
        ? JSON.parse(res.report.report_filters)
        : res.report.report_filters;
      await downloadReportFile(
        res.rows || [],
        rep.format,
        rep.file_name,
        rep.report_type,
        filters.type_key
      );
    } catch (err) {
      setReportError(err.message || 'Không thể tải tệp báo cáo.');
    }
  };

  const handleOpenHistoryPreview = async (rep) => {
    setSelectedReportFile(rep);
    setPreviewRows([]);
    setReportError('');
    setPreviewLoading(true);
    setIsPreviewOpen(true);
    try {
      setPreviewFilters(typeof rep.report_filters === 'string'
        ? JSON.parse(rep.report_filters)
        : rep.report_filters);
      const res = await api.getReportData(rep.id);
      setPreviewRows(res.rows || []);
    } catch (err) {
      setReportError(err.message || 'Không thể tải dữ liệu báo cáo.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenDeleteModal = (rep) => {
    setSelectedReportFile(rep);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.deleteReport(selectedReportFile.id);
      setIsDeleteOpen(false);
      setSelectedReportFile(null);
      showToast('Đã xóa báo cáo.');
      await fetchReports();
    } catch (err) {
      setReportError(err.message || 'Không thể xóa báo cáo.');
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
  const previewType = selectedReportFile ? selectedReportFile.type_key : genForm.reportType;
  const previewTitle = selectedReportFile
    ? selectedReportFile.report_type
    : getReportTypeLabel(genForm.reportType);
  const previewKeys = previewRows.length
    ? Object.keys(previewRows[0])
    : reportColumns[previewType] || [];

  return (
    <div className="sd-view">
      {/* ── PAGE HEADER ── */}
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Quản lý Báo cáo động</h2>
          <p>Trích xuất dữ liệu văn bằng và hoạt động xác thực theo bộ lọc</p>
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
                required
                value={genForm.startDate} 
                onChange={(e) => setGenForm({ ...genForm, startDate: e.target.value })} 
              />
            </div>

            <div className="sd-form-group">
              <label>Đến ngày (End Date) *</label>
              <input 
                type="date" 
                className="sd-input" 
                required
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
                    value="CSV"
                    checked={genForm.format === 'CSV'}
                    onChange={(e) => setGenForm({ ...genForm, format: e.target.value })} 
                  />
                  <FaFileExcel style={{ color: '#16a34a' }} /> Tệp CSV (mở được bằng Excel)
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
          {reportError && (
            <p role="alert" style={{ color: '#b91c1c', marginTop: '12px' }}>{reportError}</p>
          )}
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
              <option value="CSV">CSV</option>
              <option value="PDF">PDF (.pdf)</option>
              <option value="XLSX">Excel (.xlsx) - báo cáo cũ</option>
              <option value="DOCX">Word (.docx) - báo cáo cũ</option>
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
                        {rep.format === 'XLSX' || rep.format === 'CSV' ? <FaFileExcel style={{ color: '#16a34a', fontSize: '16px' }} /> :
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
                        onClick={() => handleOpenHistoryPreview(rep)}
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
                    <span className="sd-detail-value">{previewTitle}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Khoảng thời gian:</span>
                    <span className="sd-detail-value">
                      {(previewFilters && previewFilters.startDate) || 'Không giới hạn'} đến {(previewFilters && previewFilters.endDate) || 'Không giới hạn'}
                    </span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Khoa / Phạm vi:</span>
                    <span className="sd-detail-value">{(previewFilters && previewFilters.department) || 'Tất cả khoa'}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Số bản ghi:</span>
                    <span className="sd-detail-value">{previewRows.length}</span>
                  </div>
                </div>
              </div>
              {reportError && <p role="alert" style={{ color: '#b91c1c' }}>{reportError}</p>}
              {previewLoading ? (
                <p style={{ textAlign: 'center', padding: '24px' }}>
                  <FaSpinner className="fa-spin" /> Đang truy vấn dữ liệu...
                </p>
              ) : (
                <div className="sd-table-container" style={{ maxHeight: '360px', overflow: 'auto' }}>
                  <table className="sd-table">
                    <thead>
                      <tr>{previewKeys.map((key) => <th key={key}>{columnLabels[key] || key}</th>)}</tr>
                    </thead>
                    <tbody>
                      {previewRows.length ? previewRows.map((row, rowIndex) => (
                        <tr key={`${row.certificate_code || row.id || 'row'}-${rowIndex}`}>
                          {previewKeys.map((key) => <td key={key}>{getCellValue(key, row[key]) || '—'}</td>)}
                        </tr>
                      )) : (
                        <tr><td colSpan={Math.max(previewKeys.length, 1)} style={{ textAlign: 'center' }}>Không có dữ liệu phù hợp với bộ lọc.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn-secondary" onClick={() => setIsPreviewOpen(false)}>Đóng bản xem trước</button>
              {selectedReportFile ? (
                <button className="sd-btn-primary" onClick={() => handleDownloadHistoryFile(selectedReportFile)}>
                  <FaDownload /> Tải lại báo cáo
                </button>
              ) : (
                <button className="sd-btn-primary" onClick={handleGenerateAndDownload} disabled={previewLoading}>
                  <FaDownload /> Tạo & Tải file ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE REPORT MODAL ── */}
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
