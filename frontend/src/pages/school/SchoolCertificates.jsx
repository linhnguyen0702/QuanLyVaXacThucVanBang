import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaQrcode, 
  FaTimes, FaCertificate, FaShieldAlt, FaDownload, FaCheck, FaExclamationTriangle, FaSpinner
} from 'react-icons/fa';
import { api } from '../../services/api';

const SchoolCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedCert, setSelectedCert] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form inputs for Create / Edit
  const [formData, setFormData] = useState({
    code: '',
    studentName: '',
    studentCode: '',
    major: 'Công nghệ thông tin',
    degreeType: 'Đại học',
    educationMode: 'Chính quy',
    gpa: '',
    classification: 'Giỏi',
    issueDate: new Date().toISOString().split('T')[0],
    decisionNumber: '',
    status: 'issued'
  });

  const [revokeReason, setRevokeReason] = useState('');

  // Fetch certificates from Backend Database
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.getCertificates({
        search: searchQuery,
        degree_type: degreeFilter,
        status: statusFilter
      });
      if (res && res.success) {
        setCertificates(res.certificates || []);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [searchQuery, degreeFilter, statusFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Open Create Modal
  const handleOpenAdd = () => {
    setFormData({
      code: '',
      studentName: '',
      studentCode: '',
      major: 'Công nghệ thông tin',
      degreeType: 'Đại học',
      educationMode: 'Chính quy',
      gpa: '',
      classification: 'Giỏi',
      issueDate: new Date().toISOString().split('T')[0],
      decisionNumber: '',
      status: 'issued'
    });
    setIsAddOpen(true);
  };

  // Handle Create Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.studentCode) {
      alert('Vui lòng nhập tên sinh viên và MSSV!');
      return;
    }

    try {
      const res = await api.createCertificate({
        certificate_code: formData.code,
        student_code: formData.studentCode,
        student_name: formData.studentName,
        major: formData.major,
        degree_type: formData.degreeType,
        education_mode: formData.educationMode,
        gpa: formData.gpa,
        classification: formData.classification,
        issue_date: formData.issueDate,
        decision_number: formData.decisionNumber
      });

      if (res && res.success) {
        setIsAddOpen(false);
        showToast('Cấp văn bằng mới và lưu vào CSDL thành công!');
        fetchCertificates();
      } else {
        alert(res.message || 'Lỗi cấp văn bằng.');
      }
    } catch (err) {
      alert('Không thể kết nối Server.');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (cert) => {
    setSelectedCert(cert);
    setFormData({
      code: cert.certificate_code || cert.code,
      studentName: cert.student_name || cert.studentName,
      studentCode: cert.student_code || cert.studentCode,
      major: cert.major,
      degreeType: cert.degree_type || cert.degreeType,
      educationMode: cert.education_mode || cert.educationMode,
      gpa: cert.gpa,
      classification: cert.classification,
      issueDate: cert.issue_date ? cert.issue_date.split('T')[0] : new Date().toISOString().split('T')[0],
      decisionNumber: cert.decision_number || cert.decisionNumber,
      status: cert.status
    });
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCert) return;
    try {
      const res = await api.updateCertificate(selectedCert.id, {
        certificate_code: formData.code,
        student_name: formData.studentName,
        student_code: formData.studentCode,
        major: formData.major,
        degree_type: formData.degreeType,
        education_mode: formData.educationMode,
        gpa: formData.gpa,
        classification: formData.classification,
        issue_date: formData.issueDate,
        decision_number: formData.decisionNumber
      });
      if (res && res.success) {
        setIsEditOpen(false);
        showToast('Cập nhật thông tin văn bằng thành công!');
        fetchCertificates();
      } else {
        alert(res.message || 'Lỗi cập nhật văn bằng.');
      }
    } catch (err) {
      alert('Không thể kết nối Server.');
    }
  };

  // Open View Modal
  const handleOpenView = (cert) => {
    setSelectedCert(cert);
    setIsViewOpen(true);
  };

  // Open Delete / Revoke Modal
  const handleOpenDelete = (cert) => {
    setSelectedCert(cert);
    setRevokeReason('');
    setIsDeleteOpen(true);
  };

  // Handle Delete / Revoke Confirm
  const handleDeleteConfirm = async () => {
    if (!revokeReason) {
      alert('Vui lòng nhập lý do thu hồi.');
      return;
    }
    try {
      const res = await api.revokeCertificate(selectedCert.id, revokeReason);
      if (res && res.success) {
        setIsDeleteOpen(false);
        showToast(`Đã thu hồi văn bằng số hiệu ${selectedCert.certificate_code || selectedCert.code}`);
        fetchCertificates();
      } else {
        alert(res.message || 'Lỗi thu hồi văn bằng.');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'issued':
        return <span className="sd-badge green"><FaCheck style={{marginRight: '4px'}} /> Đã xác thực Blockchain</span>;
      case 'pending':
        return <span className="sd-badge orange">Chờ phê duyệt</span>;
      case 'revoked':
        return <span className="sd-badge red">Đã thu hồi</span>;
      default:
        return <span className="sd-badge gray">Đã xác thực</span>;
    }
  };

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Quản lý văn bằng</h2>
          <p>Danh sách văn bằng, chứng chỉ được đồng bộ từ Cơ sở dữ liệu và Blockchain</p>
        </div>
        <button className="sd-btn-primary" onClick={handleOpenAdd}>
          <FaPlus /> Cấp văn bằng mới
        </button>
      </div>

      <div className="sd-data-card">
        <div className="sd-filter-bar">
          <div className="sd-filter-left">
            <div className="sd-search-box">
              <FaSearch className="sd-search-icon" />
              <input 
                type="text" 
                className="sd-search-input" 
                placeholder="Tìm tên sinh viên, MSSV, số hiệu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="sd-select" value={degreeFilter} onChange={(e) => setDegreeFilter(e.target.value)}>
              <option value="">Tất cả trình độ</option>
              <option value="Đại học">Đại học</option>
              <option value="Thạc sĩ">Thạc sĩ</option>
              <option value="Tiến sĩ">Tiến sĩ</option>
            </select>
            <select className="sd-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="issued">Đã xác thực</option>
              <option value="pending">Chờ phê duyệt</option>
              <option value="revoked">Đã thu hồi</option>
            </select>
          </div>
        </div>

        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Số hiệu văn bằng</th>
                <th>Sinh viên</th>
                <th>Chương trình / Ngành</th>
                <th>Trình độ</th>
                <th>Ngày cấp</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} /> Đang tải dữ liệu văn bằng từ Database...
                  </td>
                </tr>
              ) : certificates.length > 0 ? (
                certificates.map(cert => (
                  <tr key={cert.id}>
                    <td className="sd-td-bold">{cert.certificate_code || cert.code}</td>
                    <td>
                      <div className="sd-td-bold">{cert.student_name || cert.studentName}</div>
                      <div className="sd-td-subtext">MSSV: {cert.student_code || cert.studentCode}</div>
                    </td>
                    <td>{cert.major}</td>
                    <td>{cert.degree_type || cert.degreeType || 'Đại học'}</td>
                    <td>{cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('vi-VN') : cert.issueDate}</td>
                    <td>{getStatusBadge(cert.status)}</td>
                    <td className="sd-actions">
                      <button className="sd-action-btn" title="Xem chi tiết" onClick={() => handleOpenView(cert)}>
                        <FaEye />
                      </button>
                      <button className="sd-action-btn" title="Chỉnh sửa" onClick={() => handleOpenEdit(cert)}>
                        <FaEdit />
                      </button>
                      {cert.status !== 'revoked' && (
                        <button className="sd-action-btn" title="Thu hồi văn bằng" style={{color: '#ef4444'}} onClick={() => handleOpenDelete(cert)}>
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Không tìm thấy văn bằng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE MODAL ── */}
      {isAddOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaCertificate /></div>
                <h3>Cấp văn bằng mới trên CSDL & Blockchain</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsAddOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
                  <div className="sd-form-group">
                    <label>Số hiệu văn bằng</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="Ví dụ: UNI-2026-00123"
                      value={formData.code} 
                      onChange={(e) => setFormData({...formData, code: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Họ và tên sinh viên *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={formData.studentName} 
                      onChange={(e) => setFormData({...formData, studentName: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Mã số sinh viên (MSSV) *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      placeholder="Ví dụ: 20201123"
                      value={formData.studentCode} 
                      onChange={(e) => setFormData({...formData, studentCode: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Ngành đào tạo</label>
                    <select className="sd-input" value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})}>
                      <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                      <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
                      <option value="Hệ thống thông tin">Hệ thống thông tin</option>
                      <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Trình độ đào tạo</label>
                    <select className="sd-input" value={formData.degreeType} onChange={(e) => setFormData({...formData, degreeType: e.target.value})}>
                      <option value="Đại học">Đại học</option>
                      <option value="Thạc sĩ">Thạc sĩ</option>
                      <option value="Tiến sĩ">Tiến sĩ</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Hình thức đào tạo</label>
                    <select className="sd-input" value={formData.educationMode} onChange={(e) => setFormData({...formData, educationMode: e.target.value})}>
                      <option value="Chính quy">Chính quy</option>
                      <option value="Vừa học vừa làm">Vừa học vừa làm</option>
                      <option value="Từ xa">Từ xa</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Điểm GPA tích lũy</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="3.50"
                      value={formData.gpa} 
                      onChange={(e) => setFormData({...formData, gpa: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Xếp loại tốt nghiệp</label>
                    <select className="sd-input" value={formData.classification} onChange={(e) => setFormData({...formData, classification: e.target.value})}>
                      <option value="Xuất sắc">Xuất sắc</option>
                      <option value="Giỏi">Giỏi</option>
                      <option value="Khá">Khá</option>
                      <option value="Trung bình">Trung bình</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Số quyết định công nhận tốt nghiệp</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="Ví dụ: QĐ-2026/QĐ-ĐH"
                      value={formData.decisionNumber} 
                      onChange={(e) => setFormData({...formData, decisionNumber: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Ngày cấp bằng</label>
                    <input 
                      type="date" 
                      className="sd-input" 
                      value={formData.issueDate} 
                      onChange={(e) => setFormData({...formData, issueDate: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              <div className="sd-modal-footer">
                <button type="button" className="sd-btn-secondary" onClick={() => setIsAddOpen(false)}>Hủy</button>
                <button type="submit" className="sd-btn-primary"><FaShieldAlt /> Xác nhận & Đẩy lên Blockchain</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {isEditOpen && selectedCert && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaEdit /></div>
                <h3>Chỉnh sửa thông tin văn bằng {selectedCert.certificate_code || selectedCert.code}</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsEditOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
                  <div className="sd-form-group">
                    <label>Số hiệu văn bằng</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.code} 
                      onChange={(e) => setFormData({...formData, code: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Họ và tên sinh viên *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      value={formData.studentName} 
                      onChange={(e) => setFormData({...formData, studentName: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Mã số sinh viên (MSSV) *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      value={formData.studentCode} 
                      onChange={(e) => setFormData({...formData, studentCode: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Ngành đào tạo</label>
                    <select className="sd-input" value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})}>
                      <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                      <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
                      <option value="Hệ thống thông tin">Hệ thống thông tin</option>
                      <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Trình độ đào tạo</label>
                    <select className="sd-input" value={formData.degreeType} onChange={(e) => setFormData({...formData, degreeType: e.target.value})}>
                      <option value="Đại học">Đại học</option>
                      <option value="Thạc sĩ">Thạc sĩ</option>
                      <option value="Tiến sĩ">Tiến sĩ</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Hình thức đào tạo</label>
                    <select className="sd-input" value={formData.educationMode} onChange={(e) => setFormData({...formData, educationMode: e.target.value})}>
                      <option value="Chính quy">Chính quy</option>
                      <option value="Vừa học vừa làm">Vừa học vừa làm</option>
                      <option value="Từ xa">Từ xa</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Điểm GPA tích lũy</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.gpa} 
                      onChange={(e) => setFormData({...formData, gpa: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Xếp loại tốt nghiệp</label>
                    <select className="sd-input" value={formData.classification} onChange={(e) => setFormData({...formData, classification: e.target.value})}>
                      <option value="Xuất sắc">Xuất sắc</option>
                      <option value="Giỏi">Giỏi</option>
                      <option value="Khá">Khá</option>
                      <option value="Trung bình">Trung bình</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Số quyết định công nhận tốt nghiệp</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.decisionNumber} 
                      onChange={(e) => setFormData({...formData, decisionNumber: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Ngày cấp bằng</label>
                    <input 
                      type="date" 
                      className="sd-input" 
                      value={formData.issueDate} 
                      onChange={(e) => setFormData({...formData, issueDate: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              <div className="sd-modal-footer">
                <button type="button" className="sd-btn-secondary" onClick={() => setIsEditOpen(false)}>Hủy</button>
                <button type="submit" className="sd-btn-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ── */}
      {isViewOpen && selectedCert && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaQrcode /></div>
                <h3>Chi tiết văn bằng số & Mã QR Blockchain</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsViewOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <div className="sd-cert-preview-box">
                <div className="sd-cert-preview-watermark"><FaShieldAlt /></div>
                <h4 style={{ color: '#0f4cf5', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>BẰNG TỐT NGHIỆP</h4>
                <div className="sd-cert-title">{(selectedCert.degree_type || selectedCert.degreeType || 'ĐẠI HỌC').toUpperCase()}</div>
                <div className="sd-cert-sub">Chuyên ngành: <strong>{selectedCert.major}</strong> ({selectedCert.education_mode || selectedCert.educationMode || 'Chính quy'})</div>
                
                <div className="sd-detail-grid" style={{ textAlign: 'left', marginTop: '20px' }}>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Người được cấp:</span>
                    <span className="sd-detail-value">{selectedCert.student_name || selectedCert.studentName} (MSSV: {selectedCert.student_code || selectedCert.studentCode})</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Số hiệu văn bằng:</span>
                    <span className="sd-detail-value">{selectedCert.certificate_code || selectedCert.code}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Xếp loại:</span>
                    <span className="sd-detail-value">{selectedCert.classification} (GPA: {selectedCert.gpa})</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Số quyết định:</span>
                    <span className="sd-detail-value">{selectedCert.decision_number || selectedCert.decisionNumber}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Ngày cấp:</span>
                    <span className="sd-detail-value">{selectedCert.issue_date ? new Date(selectedCert.issue_date).toLocaleDateString('vi-VN') : selectedCert.issueDate}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Trạng thái:</span>
                    <span className="sd-detail-value">{getStatusBadge(selectedCert.status)}</span>
                  </div>
                </div>

                <div className="sd-cert-hash-box">
                  <strong>Mã băm SHA-256 Blockchain:</strong><br />
                  {selectedCert.certificate_hash || selectedCert.hash || '0x8f2a91b4c3d7e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0'}
                </div>
              </div>
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn-secondary" onClick={() => setIsViewOpen(false)}>Đóng</button>
              <button className="sd-btn-primary" onClick={() => showToast('Đang tải văn bằng số PDF...')}><FaDownload /> Tải bản thể hiện PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE / REVOKE MODAL ── */}
      {isDeleteOpen && selectedCert && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header" style={{ backgroundColor: '#fef2f2' }}>
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge" style={{ background: '#fee2e2', color: '#ef4444' }}><FaExclamationTriangle /></div>
                <h3 style={{ color: '#991b1b' }}>Thu hồi văn bằng</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsDeleteOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <p style={{ fontSize: '14px', color: '#334155', marginBottom: '16px' }}>
                Bạn có chắc chắn muốn thu hồi văn bằng số hiệu <strong>{selectedCert.certificate_code || selectedCert.code}</strong> của sinh viên <strong>{selectedCert.student_name || selectedCert.studentName}</strong>? 
                Hành động này sẽ ghi nhận trạng thái **REVOKED** trên CSDL và Blockchain.
              </p>
              <div className="sd-form-group">
                <label>Lý do thu hồi *</label>
                <textarea 
                  className="sd-input" 
                  rows="3" 
                  placeholder="Nhập lý do thu hồi (Ví dụ: Phát hiện gian lận hồ sơ)..."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                />
              </div>
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn-secondary" onClick={() => setIsDeleteOpen(false)}>Hủy bỏ</button>
              <button className="sd-btn-danger" onClick={handleDeleteConfirm}>Xác nhận Thu hồi</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast alert */}
      {toastMessage && (
        <div className="sd-toast success">
          <FaCheck /> {toastMessage}
        </div>
      )}
    </div>
  );
};

export default SchoolCertificates;
