import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaQrcode, 
  FaTimes, FaCertificate, FaShieldAlt, FaDownload, FaCheck, FaExclamationTriangle, FaSpinner
} from 'react-icons/fa';
import { api } from '../../services/api';
import { formatDateForInput, formatDateDisplay, getTodayDateInput } from '../../utils/dateUtils';

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // Modal XÓA (văn bằng chưa đẩy lên Blockchain)
  const [isRevokeOpen, setIsRevokeOpen] = useState(false); // Modal THU HỒI (văn bằng đã xác thực Blockchain)

  const [selectedCert, setSelectedCert] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'warning' });

  // Danh sách sinh viên lấy từ trang Sinh viên
  const [studentList, setStudentList] = useState([]);

  // Form inputs for Create / Edit (Không cho nhập sẵn ngành đào tạo, số quyết định, gpa)
  const initialFormData = {
    code: '',
    studentId: '',
    studentName: '',
    studentCode: '',
    major: '', // Rỗng theo yêu cầu (không nhập sẵn ngành đào tạo)
    degreeType: 'Đại học',
    educationMode: 'Chính quy',
    gpa: '', // Rỗng theo yêu cầu (không nhập sẵn gpa)
    classification: 'Giỏi',
    issueDate: getTodayDateInput(),
    decisionNumber: '', // Rỗng theo yêu cầu (không nhập sẵn số quyết định)
    status: 'pending'
  };

  const [formData, setFormData] = useState(initialFormData);
  const [revokeReason, setRevokeReason] = useState('');

  // Kiểm tra văn bằng đã được đẩy lên / xác thực trên Blockchain hay chưa
  const isBlockchainAnchored = (cert) => {
    if (!cert) return false;
    return cert.status === 'issued' || Boolean(cert.blockchain_tx_hash);
  };

  // Nạp danh sách sinh viên từ trang sinh viên
  const fetchStudents = async () => {
    try {
      const res = await api.getStudents();
      if (res && res.success) {
        setStudentList(res.students || []);
      }
    } catch (err) {
      console.error('Error fetching students list:', err);
    }
  };

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
    fetchStudents();
  }, [searchQuery, degreeFilter, statusFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Xử lý thay đổi GPA và tự gợi ý / phân loại xếp loại tốt nghiệp
  const handleGpaChange = (val) => {
    const num = parseFloat(val);
    let autoClass = formData.classification;
    if (!isNaN(num)) {
      if (num >= 3.6) autoClass = 'Xuất sắc';
      else if (num >= 3.2) autoClass = 'Giỏi';
      else if (num >= 2.5) autoClass = 'Khá';
      else if (num >= 2.0) autoClass = 'Trung bình';
    }
    setFormData(prev => ({
      ...prev,
      gpa: val,
      classification: autoClass
    }));
  };

  // Open Create Modal (Reset form sạch, không có dữ liệu nhập sẵn)
  const handleOpenAdd = () => {
    setFormError('');
    fetchStudents();
    setFormData({
      ...initialFormData,
      issueDate: getTodayDateInput()
    });
    setIsAddOpen(true);
  };

  // Handle Create Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const certCode = (formData.code || '').trim();
    const stCode = (formData.studentCode || '').trim();
    const stName = (formData.studentName || '').trim();
    const major = (formData.major || '').trim();
    const decisionNumber = (formData.decisionNumber || '').trim();

    if (!certCode) {
      setFormError('Vui lòng nhập Số hiệu văn bằng!');
      return;
    }
    if (!stCode) {
      setFormError('Vui lòng nhập Mã số sinh viên (MSSV)!');
      return;
    }
    if (!stName) {
      setFormError('Vui lòng nhập Họ và tên sinh viên!');
      return;
    }
    if (!major) {
      setFormError('Vui lòng nhập Ngành đào tạo!');
      return;
    }
    if (!decisionNumber) {
      setFormError('Vui lòng nhập Số quyết định công nhận tốt nghiệp!');
      return;
    }

    // 1. Ràng buộc: Kiểm tra không cho tạo trùng số hiệu văn bằng
    const isDuplicateCode = certificates.some(
      c => (c.certificate_code || c.code || '').toString().trim().toLowerCase() === certCode.toLowerCase()
    );
    if (isDuplicateCode) {
      setAlertModal({
        open: true,
        title: 'Cảnh báo trùng số hiệu văn bằng',
        message: `Số hiệu văn bằng "${certCode}" đã tồn tại trên hệ thống, vui lòng kiểm tra lại!`,
        type: 'warning'
      });
      return;
    }

    // 2. Ràng buộc: Kiểm tra không cho tạo trùng mã sinh viên (sinh viên đã có văn bằng chưa thu hồi)
    const existingCertStudent = certificates.find(
      c => c.status !== 'revoked' && (c.student_code || c.studentCode || '').toString().trim().toLowerCase() === stCode.toLowerCase()
    );
    if (existingCertStudent) {
      setAlertModal({
        open: true,
        title: 'Cảnh báo trùng mã sinh viên',
        message: `Sinh viên có mã "${stCode}" đã được cấp/tạo văn bằng trên hệ thống (Số hiệu: ${existingCertStudent.certificate_code || existingCertStudent.code}). Không thể tạo trùng văn bằng cho cùng một sinh viên!`,
        type: 'warning'
      });
      return;
    }

    // 3. Ràng buộc: Kiểm tra mã sinh viên phải tồn tại trong cơ sở dữ liệu sinh viên
    const normalizeStr = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');

    const matchedStudent = studentList.find(
      s => (s.student_code || s.studentCode || '').toString().trim().toLowerCase() === stCode.toLowerCase()
    );

    if (!matchedStudent) {
      setAlertModal({
        open: true,
        title: 'Thông báo dữ liệu sinh viên',
        message: `Không tìm thấy sinh viên có mã "${stCode}" trong hệ thống cơ sở dữ liệu sinh viên! Vui lòng kiểm tra lại MSSV.`,
        type: 'warning'
      });
      return;
    }

    // 4. Ràng buộc: Đúng mã đúng tên mới cho tạo (so sánh chính xác họ tên nhập vào với họ tên gốc trong hồ sơ)
    const registeredName = matchedStudent.full_name || matchedStudent.fullName || '';
    if (normalizeStr(registeredName) !== normalizeStr(stName)) {
      setAlertModal({
        open: true,
        title: 'Họ tên sinh viên không khớp',
        message: `Họ tên nhập vào "${stName}" không khớp với hồ sơ của Mã sinh viên ${stCode}! Họ tên đúng trong hồ sơ sinh viên là: "${registeredName}". Vui lòng sửa lại đúng tên mới cho tạo!`,
        type: 'warning'
      });
      return;
    }

    try {
      // Đặt status mặc định = 'pending' (Không đẩy luôn lên Blockchain khi tạo mới)
      const res = await api.createCertificate({
        certificate_code: certCode,
        student_id: matchedStudent.id,
        student_code: stCode,
        student_name: registeredName,
        major: major,
        degree_type: formData.degreeType,
        education_mode: formData.educationMode,
        gpa: formData.gpa || null,
        classification: formData.classification,
        issue_date: formData.issueDate,
        decision_number: decisionNumber,
        status: 'pending'
      });

      if (res && res.success) {
        setIsAddOpen(false);
        showToast('Tạo văn bằng mới thành công! Văn bằng ở trạng thái Chờ duyệt tại trang Xác thực.');
        fetchCertificates();
      } else {
        const msg = res.message || 'Lỗi tạo văn bằng.';
        setAlertModal({
          open: true,
          title: 'Thông báo',
          message: msg,
          type: 'warning'
        });
      }
    } catch (err) {
      setFormError('Không thể kết nối đến máy chủ Backend.');
    }
  };

  // Open Edit Modal (Chặn nếu văn bằng đã đẩy lên Blockchain)
  const handleOpenEdit = (cert) => {
    if (isBlockchainAnchored(cert)) {
      setAlertModal({
        open: true,
        title: 'Không thể chỉnh sửa',
        message: `Văn bằng số hiệu ${cert.certificate_code || cert.code} đã được xác thực và lưu trữ trên Blockchain Sepolia. Do tính chất bất biến của chuỗi khối, dữ liệu văn bằng không thể chỉnh sửa!`,
        type: 'warning'
      });
      return;
    }

    setFormError('');
    setSelectedCert(cert);
    setFormData({
      code: cert.certificate_code || cert.code || '',
      studentId: cert.student_id || '',
      studentName: cert.student_name || cert.studentName || '',
      studentCode: cert.student_code || cert.studentCode || '',
      major: cert.major || '',
      degreeType: cert.degree_type || cert.degreeType || 'Đại học',
      educationMode: cert.education_mode || cert.educationMode || 'Chính quy',
      gpa: cert.gpa || '',
      classification: cert.classification || 'Giỏi',
      issueDate: formatDateForInput(cert.issue_date || cert.issueDate),
      decisionNumber: cert.decision_number || cert.decisionNumber || '',
      status: cert.status || 'pending'
    });
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCert) return;

    if (isBlockchainAnchored(selectedCert)) {
      setAlertModal({
        open: true,
        title: 'Không thể chỉnh sửa',
        message: 'Văn bằng đã được xác thực trên Blockchain, không thể chỉnh sửa thông tin!',
        type: 'warning'
      });
      return;
    }

    setFormError('');

    const certCode = (formData.code || '').trim();
    const stCode = (formData.studentCode || '').trim();
    const stName = (formData.studentName || '').trim();
    const major = (formData.major || '').trim();
    const decisionNumber = (formData.decisionNumber || '').trim();

    if (!certCode) {
      setFormError('Vui lòng nhập Số hiệu văn bằng!');
      return;
    }
    if (!stCode) {
      setFormError('Vui lòng nhập Mã số sinh viên (MSSV)!');
      return;
    }
    if (!stName) {
      setFormError('Vui lòng nhập Họ và tên sinh viên!');
      return;
    }
    if (!major) {
      setFormError('Vui lòng nhập Ngành đào tạo!');
      return;
    }
    if (!decisionNumber) {
      setFormError('Vui lòng nhập Số quyết định công nhận tốt nghiệp!');
      return;
    }

    // 1. Ràng buộc: Kiểm tra trùng số hiệu văn bằng với các văn bằng khác
    const isDuplicateCode = certificates.some(
      c => c.id !== selectedCert.id && (c.certificate_code || c.code || '').toString().trim().toLowerCase() === certCode.toLowerCase()
    );
    if (isDuplicateCode) {
      setAlertModal({
        open: true,
        title: 'Cảnh báo trùng số hiệu văn bằng',
        message: `Số hiệu văn bằng "${certCode}" đã tồn tại trên hệ thống, vui lòng kiểm tra lại!`,
        type: 'warning'
      });
      return;
    }

    // 2. Ràng buộc: Kiểm tra trùng mã sinh viên với văn bằng khác
    const existingCertStudent = certificates.find(
      c => c.id !== selectedCert.id && c.status !== 'revoked' && (c.student_code || c.studentCode || '').toString().trim().toLowerCase() === stCode.toLowerCase()
    );
    if (existingCertStudent) {
      setAlertModal({
        open: true,
        title: 'Cảnh báo trùng mã sinh viên',
        message: `Sinh viên có mã "${stCode}" đã có văn bằng khác trên hệ thống (Số hiệu: ${existingCertStudent.certificate_code || existingCertStudent.code}). Không thể cập nhật trùng!`,
        type: 'warning'
      });
      return;
    }

    // 3. Ràng buộc: Kiểm tra mã sinh viên phải tồn tại trong danh sách sinh viên
    const validStudent = studentList.find(
      st => (st.student_code || st.studentCode || '').toString().trim().toLowerCase() === stCode.toLowerCase()
    );
    if (!validStudent) {
      setAlertModal({
        open: true,
        title: 'Mã sinh viên không hợp lệ',
        message: `Không tìm thấy sinh viên có mã "${stCode}" trên hệ thống, vui lòng kiểm tra lại!`,
        type: 'warning'
      });
      return;
    }

    // 4. Ràng buộc: Đúng mã đúng tên mới cho cập nhật
    const normalizeStr = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const officialName = validStudent.full_name || validStudent.fullName || '';
    if (normalizeStr(stName) !== normalizeStr(officialName)) {
      setAlertModal({
        open: true,
        title: 'Thông tin sinh viên không khớp',
        message: `Họ tên sinh viên "${stName}" không khớp với Mã sinh viên "${stCode}" (Hồ sơ gốc: ${officialName}). Vui lòng nhập đúng họ tên sinh viên!`,
        type: 'warning'
      });
      return;
    }

    try {
      const res = await api.updateCertificate(selectedCert.id, {
        certificate_code: certCode,
        student_name: validStudent.full_name || validStudent.fullName || stName,
        student_code: validStudent.student_code || validStudent.studentCode || stCode,
        major: major,
        degree_type: formData.degreeType,
        education_mode: formData.educationMode,
        gpa: formData.gpa,
        classification: formData.classification,
        issue_date: formData.issueDate,
        decision_number: decisionNumber
      });
      if (res && res.success) {
        setIsEditOpen(false);
        showToast('Cập nhật thông tin văn bằng thành công!');
        fetchCertificates();
      } else {
        const msg = res.message || 'Lỗi cập nhật văn bằng.';
        setFormError(msg);
        setAlertModal({
          open: true,
          title: 'Lỗi cập nhật văn bằng',
          message: msg,
          type: 'danger'
        });
      }
    } catch (err) {
      setFormError('Không thể kết nối Server.');
      setAlertModal({
        open: true,
        title: 'Lỗi kết nối',
        message: 'Không thể kết nối đến máy chủ Backend.',
        type: 'danger'
      });
    }
  };

  // Open View Modal
  const handleOpenView = (cert) => {
    setSelectedCert(cert);
    setIsViewOpen(true);
  };

  // Open Delete Modal (Dành riêng cho văn bằng CHƯA đẩy lên Blockchain)
  const handleOpenDelete = (cert) => {
    setSelectedCert(cert);
    setIsDeleteOpen(true);
  };

  // Handle Delete Confirm (Xóa hoàn toàn khỏi CSDL)
  const handleDeleteConfirm = async () => {
    if (!selectedCert) return;
    try {
      const res = await api.deleteCertificate(selectedCert.id);
      if (res && res.success) {
        setIsDeleteOpen(false);
        showToast(`Đã xóa văn bằng số hiệu ${selectedCert.certificate_code || selectedCert.code} khỏi hệ thống thành công.`);
        fetchCertificates();
      } else {
        setAlertModal({
          open: true,
          title: 'Lỗi xóa văn bằng',
          message: res.message || 'Không thể xóa văn bằng này.',
          type: 'danger'
        });
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  // Open Revoke Modal (Dành riêng cho văn bằng ĐÃ xác thực trên Blockchain)
  const handleOpenRevoke = (cert) => {
    setSelectedCert(cert);
    setRevokeReason('');
    setIsRevokeOpen(true);
  };

  // Handle Revoke Confirm (Thu hồi văn bằng trên Blockchain & CSDL)
  const handleRevokeConfirm = async () => {
    if (!selectedCert) return;
    if (!revokeReason.trim()) {
      alert('Vui lòng nhập lý do thu hồi văn bằng.');
      return;
    }
    try {
      const res = await api.revokeCertificate(selectedCert.id, revokeReason.trim());
      if (res && res.success) {
        setIsRevokeOpen(false);
        showToast(`Đã thu hồi văn bằng số hiệu ${selectedCert.certificate_code || selectedCert.code}.`);
        fetchCertificates();
      } else {
        setAlertModal({
          open: true,
          title: 'Lỗi thu hồi văn bằng',
          message: res.message || 'Không thể thu hồi văn bằng.',
          type: 'danger'
        });
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
              <option value="Cao đẳng">Cao đẳng</option>
              <option value="Thạc sĩ">Thạc sĩ</option>
              <option value="Tiến sĩ">Tiến sĩ</option>
              <option value="Chứng chỉ">Chứng chỉ</option>
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
                    <td>{formatDateDisplay(cert.issue_date || cert.issueDate)}</td>
                    <td>{getStatusBadge(cert.status)}</td>
                    <td className="sd-actions">
                      <button className="sd-action-btn" title="Xem chi tiết" onClick={() => handleOpenView(cert)}>
                        <FaEye />
                      </button>
                      <button 
                        className="sd-action-btn" 
                        title={isBlockchainAnchored(cert) ? "Văn bằng đã xác thực trên Blockchain (Không thể chỉnh sửa)" : "Chỉnh sửa"} 
                        style={isBlockchainAnchored(cert) ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
                        onClick={() => handleOpenEdit(cert)}
                      >
                        <FaEdit />
                      </button>
                      {cert.status !== 'revoked' && (
                        isBlockchainAnchored(cert) ? (
                          <button 
                            className="sd-action-btn" 
                            title="Thu hồi văn bằng (Đã xác thực trên Blockchain)" 
                            style={{ color: '#ef4444' }} 
                            onClick={() => handleOpenRevoke(cert)}
                          >
                            <FaTrash />
                          </button>
                        ) : (
                          <button 
                            className="sd-action-btn" 
                            title="Xóa văn bằng (Chưa đẩy lên Blockchain)" 
                            style={{ color: '#ef4444' }} 
                            onClick={() => handleOpenDelete(cert)}
                          >
                            <FaTrash />
                          </button>
                        )
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
                <h3>Tạo văn bằng mới </h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsAddOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="sd-modal-body">
                {formError && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}>
                    ⚠️ {formError}
                  </div>
                )}
                <div className="sd-form-grid">
                  <div className="sd-form-group">
                    <label>Số hiệu văn bằng *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required
                      placeholder="Ví dụ: UNI-2026-00123"
                      value={formData.code} 
                      onChange={(e) => setFormData({...formData, code: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Mã số sinh viên (MSSV) *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      placeholder="Ví dụ: 20201123"
                      list="studentCodeSuggestions"
                      value={formData.studentCode} 
                      onChange={(e) => setFormData({...formData, studentCode: e.target.value})} 
                    />
                    <datalist id="studentCodeSuggestions">
                      {studentList.map(st => (
                        <option key={st.id} value={st.student_code || st.studentCode}>
                          {st.full_name || st.fullName} - {st.department}
                        </option>
                      ))}
                    </datalist>
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
                    <label>Ngành đào tạo *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required
                      placeholder="Ví dụ: Công nghệ thông tin"
                      list="majorSuggestions"
                      value={formData.major} 
                      onChange={(e) => setFormData({...formData, major: e.target.value})} 
                    />
                    <datalist id="majorSuggestions">
                      <option value="Công nghệ thông tin" />
                      <option value="Kỹ thuật phần mềm" />
                      <option value="Hệ thống thông tin" />
                      <option value="Khoa học máy tính" />
                      <option value="An toàn thông tin" />
                      <option value="Quản trị kinh doanh" />
                    </datalist>
                  </div>
                  <div className="sd-form-group">
                    <label>Trình độ đào tạo</label>
                    <select className="sd-input" value={formData.degreeType} onChange={(e) => setFormData({...formData, degreeType: e.target.value})}>
                      <option value="Đại học">Đại học</option>
                      <option value="Cao đẳng">Cao đẳng</option>
                      <option value="Thạc sĩ">Thạc sĩ</option>
                      <option value="Tiến sĩ">Tiến sĩ</option>
                      <option value="Chứng chỉ">Chứng chỉ</option>
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
                      placeholder="Ví dụ: 3.50 (Thang điểm 4.0)"
                      list="gpaSuggestions"
                      value={formData.gpa} 
                      onChange={(e) => handleGpaChange(e.target.value)} 
                    />
                    <datalist id="gpaSuggestions">
                      <option value="4.00" label="Xuất sắc (4.00)" />
                      <option value="3.80" label="Xuất sắc (3.80)" />
                      <option value="3.65" label="Xuất sắc (3.65)" />
                      <option value="3.50" label="Giỏi (3.50)" />
                      <option value="3.40" label="Giỏi (3.40)" />
                      <option value="3.20" label="Giỏi (3.20)" />
                      <option value="3.00" label="Khá (3.00)" />
                      <option value="2.80" label="Khá (2.80)" />
                      <option value="2.50" label="Khá (2.50)" />
                    </datalist>
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
                    <label>Số quyết định công nhận tốt nghiệp *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required
                      placeholder="Ví dụ: QĐ-2026/QĐ-ĐH"
                      list="decisionSuggestions"
                      value={formData.decisionNumber} 
                      onChange={(e) => setFormData({...formData, decisionNumber: e.target.value})} 
                    />
                    <datalist id="decisionSuggestions">
                      <option value="QĐ-2026/QĐ-ĐH" />
                      <option value="QĐ-125/QĐ-ĐH" />
                      <option value="QĐ-528/QĐ-ĐH" />
                    </datalist>
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
                <button type="submit" className="sd-btn-primary"><FaCertificate /> Tạo văn bằng</button>
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
                {formError && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}>
                    ⚠️ {formError}
                  </div>
                )}
                <div className="sd-form-grid">
                  <div className="sd-form-group">
                    <label>Số hiệu văn bằng *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required
                      value={formData.code} 
                      onChange={(e) => setFormData({...formData, code: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Mã số sinh viên (MSSV) *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      list="studentCodeSuggestions"
                      value={formData.studentCode} 
                      onChange={(e) => {
                        const code = e.target.value;
                        const matched = studentList.find(st => (st.student_code || st.studentCode) === code);
                        setFormData(prev => ({
                          ...prev,
                          studentCode: code,
                          studentName: matched ? (matched.full_name || matched.fullName) : prev.studentName,
                          major: matched && !prev.major ? matched.department : prev.major
                        }));
                      }} 
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
                    <label>Ngành đào tạo *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required
                      placeholder="Ví dụ: Công nghệ thông tin"
                      list="majorSuggestions"
                      value={formData.major} 
                      onChange={(e) => setFormData({...formData, major: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Trình độ đào tạo</label>
                    <select className="sd-input" value={formData.degreeType} onChange={(e) => setFormData({...formData, degreeType: e.target.value})}>
                      <option value="Đại học">Đại học</option>
                      <option value="Cao đẳng">Cao đẳng</option>
                      <option value="Thạc sĩ">Thạc sĩ</option>
                      <option value="Tiến sĩ">Tiến sĩ</option>
                      <option value="Chứng chỉ">Chứng chỉ</option>
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
                      placeholder="Ví dụ: 3.50 (Thang điểm 4.0)"
                      list="gpaSuggestions"
                      value={formData.gpa} 
                      onChange={(e) => handleGpaChange(e.target.value)} 
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
                    <label>Số quyết định công nhận tốt nghiệp *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required
                      placeholder="Ví dụ: QĐ-2026/QĐ-ĐH"
                      list="decisionSuggestions"
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
                    <span className="sd-detail-value">{formatDateDisplay(selectedCert.issue_date || selectedCert.issueDate)}</span>
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

      {/* ── MODAL XÓA VĂN BẰNG (DÀNH CHO VĂN BẰNG CHƯA ĐẨY LÊN BLOCKCHAIN) ── */}
      {isDeleteOpen && selectedCert && (
        <div className="sd-modal-overlay">
          <div className="sd-modal" style={{ maxWidth: '480px' }}>
            <div className="sd-modal-header" style={{ backgroundColor: '#fef2f2' }}>
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge" style={{ background: '#fee2e2', color: '#ef4444' }}><FaTrash /></div>
                <h3 style={{ color: '#991b1b' }}>Xác nhận xóa văn bằng</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsDeleteOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: '1.6', marginBottom: '14px' }}>
                Bạn có chắc chắn muốn xóa văn bằng số hiệu <strong>{selectedCert.certificate_code || selectedCert.code}</strong> của sinh viên <strong>{selectedCert.student_name || selectedCert.studentName}</strong> không?
              </p>
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                ℹ️ Văn bằng này đang ở trạng thái chờ duyệt (chưa xác thực trên Blockchain). Thao tác này sẽ xóa hoàn toàn bản ghi khỏi hệ thống cơ sở dữ liệu.
              </div>
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn-secondary" onClick={() => setIsDeleteOpen(false)}>Hủy bỏ</button>
              <button className="sd-btn-danger" onClick={handleDeleteConfirm}>Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL THU HỒI VĂN BẰNG (DÀNH CHO VĂN BẰNG ĐÃ XÁC THỰC TRÊN BLOCKCHAIN) ── */}
      {isRevokeOpen && selectedCert && (
        <div className="sd-modal-overlay">
          <div className="sd-modal" style={{ maxWidth: '520px' }}>
            <div className="sd-modal-header" style={{ backgroundColor: '#fef2f2' }}>
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge" style={{ background: '#fee2e2', color: '#ef4444' }}><FaExclamationTriangle /></div>
                <h3 style={{ color: '#991b1b' }}>Thu hồi văn bằng đã xác thực</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsRevokeOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <p style={{ fontSize: '14px', color: '#334155', marginBottom: '12px', lineHeight: '1.5' }}>
                Văn bằng số hiệu <strong>{selectedCert.certificate_code || selectedCert.code}</strong> của sinh viên <strong>{selectedCert.student_name || selectedCert.studentName}</strong> đã được xác thực trên Blockchain.
              </p>
              <p style={{ fontSize: '13.5px', color: '#b91c1c', fontWeight: '600', marginBottom: '16px', lineHeight: '1.5' }}>
                ⚠️ Bạn có chắc chắn muốn thu hồi văn bằng này không? Hành động này sẽ chuyển trạng thái văn bằng thành <strong>ĐÃ THU HỒI (REVOKED)</strong> trên hệ thống và công khai trên cổng tra cứu.
              </p>
              <div className="sd-form-group">
                <label>Lý do thu hồi *</label>
                <textarea 
                  className="sd-input" 
                  rows="3" 
                  placeholder="Nhập lý do thu hồi (Ví dụ: Phát hiện sai lệch hồ sơ tốt nghiệp, quyết định kỷ luật)..."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                />
              </div>
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn-secondary" onClick={() => setIsRevokeOpen(false)}>Hủy bỏ</button>
              <button className="sd-btn-danger" onClick={handleRevokeConfirm}>Xác nhận Thu hồi</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM ON-SCREEN ALERT MODAL (Thay thế alert trình duyệt) ── */}
      {alertModal.open && (
        <div className="sd-modal-overlay" style={{ zIndex: 4000 }}>
          <div className="sd-modal" style={{ maxWidth: '420px', padding: '24px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: alertModal.type === 'danger' ? '#fef2f2' : '#fffbeb',
              color: alertModal.type === 'danger' ? '#ef4444' : '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              margin: '0 auto 16px'
            }}>
              ⚠️
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
              {alertModal.title}
            </h3>
            <p style={{ fontSize: '15px', color: '#334155', marginBottom: '24px', fontWeight: '600', lineHeight: '1.5' }}>
              {alertModal.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                type="button"
                className="sd-btn-primary" 
                style={{ minWidth: '120px', justifyContent: 'center' }}
                onClick={() => setAlertModal({ ...alertModal, open: false })}
              >
                Đồng ý
              </button>
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
