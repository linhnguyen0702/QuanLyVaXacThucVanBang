import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaUserGraduate, 
  FaTimes, FaCheck, FaFileUpload, FaSpinner 
} from 'react-icons/fa';
import { api } from '../../services/api';

const SchoolStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    studentCode: '',
    fullName: '',
    email: '',
    dob: '',
    gender: 'Nam',
    idNumber: '',
    placeOfBirth: '',
    department: 'Công nghệ thông tin',
    className: '',
    graduationStatus: 'eligible'
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({
        search: searchQuery,
        status: statusFilter,
        department: deptFilter
      });
      if (res && res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách sinh viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, statusFilter, deptFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenAdd = () => {
    setFormData({
      studentCode: '',
      fullName: '',
      email: '',
      dob: '',
      gender: 'Nam',
      idNumber: '',
      placeOfBirth: '',
      department: 'Công nghệ thông tin',
      className: '',
      graduationStatus: 'eligible'
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.studentCode || !formData.email) {
      alert('Vui lòng nhập họ tên, MSSV và Email!');
      return;
    }
    try {
      const res = await api.createStudent({
        student_code: formData.studentCode,
        full_name: formData.fullName,
        email: formData.email,
        date_of_birth: formData.dob,
        gender: formData.gender,
        id_number: formData.idNumber,
        place_of_birth: formData.placeOfBirth,
        department: formData.department,
        class_name: formData.className,
        graduation_status: formData.graduationStatus
      });

      if (res && res.success) {
        setIsAddOpen(false);
        showToast('Thêm sinh viên mới vào CSDL thành công!');
        fetchStudents();
      } else {
        alert(res.message || 'Lỗi thêm sinh viên.');
      }
    } catch (err) {
      alert('Không thể kết nối Backend.');
    }
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      studentCode: student.student_code || student.studentCode,
      fullName: student.full_name || student.fullName,
      email: student.email,
      dob: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
      gender: student.gender || 'Nam',
      idNumber: student.id_number || student.idNumber || '',
      placeOfBirth: student.place_of_birth || student.placeOfBirth || '',
      department: student.department || 'Công nghệ thông tin',
      className: student.class_name || student.className || '',
      graduationStatus: student.graduation_status || student.graduationStatus || 'eligible'
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const res = await api.updateStudent(selectedStudent.id, {
        student_code: formData.studentCode,
        full_name: formData.fullName,
        email: formData.email,
        date_of_birth: formData.dob,
        gender: formData.gender,
        id_number: formData.idNumber,
        place_of_birth: formData.placeOfBirth,
        department: formData.department,
        class_name: formData.className,
        graduation_status: formData.graduationStatus
      });

      if (res && res.success) {
        setIsEditOpen(false);
        showToast('Cập nhật thông tin sinh viên thành công!');
        fetchStudents();
      } else {
        alert(res.message || 'Lỗi cập nhật sinh viên.');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ Backend.');
    }
  };

  const handleOpenView = (student) => {
    setSelectedStudent(student);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    try {
      const res = await api.deleteStudent(selectedStudent.id);
      if (res && res.success) {
        setIsDeleteOpen(false);
        showToast(`Đã xóa sinh viên khỏi danh sách`);
        fetchStudents();
      } else {
        alert(res.message || 'Lỗi xóa sinh viên.');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ Backend.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'issued':
        return <span className="sd-badge green">Đã cấp bằng</span>;
      case 'eligible':
        return <span className="sd-badge orange">Đủ điều kiện tốt nghiệp</span>;
      case 'studying':
        return <span className="sd-badge purple">Đang theo học</span>;
      case 'suspended':
        return <span className="sd-badge red">Tạm dừng học</span>;
      default:
        return <span className="sd-badge gray">Không xác định</span>;
    }
  };

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Quản lý sinh viên</h2>
          <p>Danh sách sinh viên và trạng thái xét duyệt cấp văn bằng từ CSDL MySQL</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="sd-btn-secondary" onClick={() => setIsImportOpen(true)}>
            <FaFileUpload /> Import Excel
          </button>
          <button className="sd-btn-primary" onClick={handleOpenAdd}>
            <FaPlus /> Thêm sinh viên
          </button>
        </div>
      </div>

      <div className="sd-data-card">
        <div className="sd-filter-bar">
          <div className="sd-filter-left">
            <div className="sd-search-box">
              <FaSearch className="sd-search-icon" />
              <input 
                type="text" 
                className="sd-search-input" 
                placeholder="Tìm theo tên, MSSV, Email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="sd-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="">Tất cả khoa</option>
              <option value="Công nghệ thông tin">Công nghệ thông tin</option>
              <option value="Khoa học máy tính">Khoa học máy tính</option>
              <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
            </select>
            <select className="sd-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái tốt nghiệp</option>
              <option value="issued">Đã cấp bằng</option>
              <option value="eligible">Đủ điều kiện</option>
              <option value="studying">Đang theo học</option>
            </select>
          </div>
        </div>

        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Khoa / Ngành</th>
                <th>Lớp</th>
                <th>Trạng thái tốt nghiệp</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} /> Đang tải dữ liệu sinh viên...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map(student => (
                  <tr key={student.id}>
                    <td className="sd-td-bold">{student.student_code || student.studentCode}</td>
                    <td className="sd-td-bold">{student.full_name || student.fullName}</td>
                    <td>{student.email}</td>
                    <td>{student.department}</td>
                    <td>{student.class_name || student.className}</td>
                    <td>{getStatusBadge(student.graduation_status || student.graduationStatus)}</td>
                    <td className="sd-actions">
                      <button className="sd-action-btn" title="Xem chi tiết" onClick={() => handleOpenView(student)}>
                        <FaEye />
                      </button>
                      <button className="sd-action-btn" title="Chỉnh sửa" onClick={() => handleOpenEdit(student)}>
                        <FaEdit />
                      </button>
                      <button className="sd-action-btn" title="Xóa" style={{color: '#ef4444'}} onClick={() => handleOpenDelete(student)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Không tìm thấy sinh viên phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE STUDENT MODAL ── */}
      {isAddOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaUserGraduate /></div>
                <h3>Thêm sinh viên mới</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsAddOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
                  <div className="sd-form-group">
                    <label>MSSV *</label>
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
                    <label>Họ và tên *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Email sinh viên *</label>
                    <input 
                      type="email" 
                      className="sd-input" 
                      required 
                      placeholder="an@school.edu.vn"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Ngày sinh</label>
                    <input 
                      type="date" 
                      className="sd-input" 
                      value={formData.dob} 
                      onChange={(e) => setFormData({...formData, dob: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Giới tính</label>
                    <select className="sd-input" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Nơi sinh</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="Ví dụ: Hà Nội"
                      value={formData.placeOfBirth} 
                      onChange={(e) => setFormData({...formData, placeOfBirth: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Số CCCD / CMND</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="Ví dụ: 001200001234"
                      value={formData.idNumber} 
                      onChange={(e) => setFormData({...formData, idNumber: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Khoa / Ngành</label>
                    <select className="sd-input" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                      <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                      <option value="Khoa học máy tính">Khoa học máy tính</option>
                      <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
                      <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Lớp học</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="Ví dụ: CNTT-01 K65"
                      value={formData.className} 
                      onChange={(e) => setFormData({...formData, className: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group full-width">
                    <label>Trạng thái xét tốt nghiệp</label>
                    <select className="sd-input" value={formData.graduationStatus} onChange={(e) => setFormData({...formData, graduationStatus: e.target.value})}>
                      <option value="eligible">Đủ điều kiện cấp bằng</option>
                      <option value="issued">Đã được cấp bằng</option>
                      <option value="studying">Đang theo học</option>
                      <option value="suspended">Tạm dừng học</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="sd-modal-footer">
                <button type="button" className="sd-btn-secondary" onClick={() => setIsAddOpen(false)}>Hủy</button>
                <button type="submit" className="sd-btn-primary">Tạo sinh viên mới</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BATCH IMPORT MODAL ── */}
      {isImportOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaFileUpload /></div>
                <h3>Import danh sách sinh viên hàng loạt</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsImportOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <div className="sd-chart-placeholder" style={{ height: '180px', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}>
                <FaFileUpload style={{ fontSize: '36px', color: '#0f4cf5' }} />
                <span>Kéo thả file .xlsx / .csv vào đây hoặc bấm để chọn file</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Dung lượng tối đa 10MB (Theo biểu mẫu chuẩn nhà trường)</span>
              </div>
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn-secondary" onClick={() => setIsImportOpen(false)}>Hủy</button>
              <button className="sd-btn-primary" onClick={() => { setIsImportOpen(false); showToast('Đã nhập thành công hồ sơ sinh viên!'); }}>Tải lên & Xử lý</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT STUDENT MODAL ── */}
      {isEditOpen && selectedStudent && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaEdit /></div>
                <h3>Sửa thông tin sinh viên {selectedStudent.student_code || selectedStudent.studentCode}</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsEditOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
                  <div className="sd-form-group">
                    <label>MSSV *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      value={formData.studentCode} 
                      onChange={(e) => setFormData({...formData, studentCode: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Họ và tên *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Email sinh viên *</label>
                    <input 
                      type="email" 
                      className="sd-input" 
                      required 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Ngày sinh</label>
                    <input 
                      type="date" 
                      className="sd-input" 
                      value={formData.dob} 
                      onChange={(e) => setFormData({...formData, dob: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Giới tính</label>
                    <select className="sd-input" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Nơi sinh</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.placeOfBirth} 
                      onChange={(e) => setFormData({...formData, placeOfBirth: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Số CCCD / CMND</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.idNumber} 
                      onChange={(e) => setFormData({...formData, idNumber: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Khoa / Ngành</label>
                    <select className="sd-input" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                      <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                      <option value="Khoa học máy tính">Khoa học máy tính</option>
                      <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
                      <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Lớp học</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.className} 
                      onChange={(e) => setFormData({...formData, className: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group full-width">
                    <label>Trạng thái xét tốt nghiệp</label>
                    <select className="sd-input" value={formData.graduationStatus} onChange={(e) => setFormData({...formData, graduationStatus: e.target.value})}>
                      <option value="eligible">Đủ điều kiện cấp bằng</option>
                      <option value="issued">Đã được cấp bằng</option>
                      <option value="studying">Đang theo học</option>
                      <option value="suspended">Tạm dừng học</option>
                    </select>
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

      {/* ── VIEW STUDENT DETAIL MODAL ── */}
      {isViewOpen && selectedStudent && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaUserGraduate /></div>
                <h3>Hồ sơ sinh viên chi tiết</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsViewOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <div className="sd-detail-card">
                <div className="sd-detail-grid">
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">MSSV:</span>
                    <span className="sd-detail-value">{selectedStudent.student_code || selectedStudent.studentCode}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Họ và tên:</span>
                    <span className="sd-detail-value">{selectedStudent.full_name || selectedStudent.fullName}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Email:</span>
                    <span className="sd-detail-value">{selectedStudent.email}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Ngày sinh:</span>
                    <span className="sd-detail-value">{selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString('vi-VN') : selectedStudent.dob} ({selectedStudent.gender || 'Nam'})</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Nơi sinh:</span>
                    <span className="sd-detail-value">{selectedStudent.place_of_birth || selectedStudent.placeOfBirth || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Khoa/Ngành:</span>
                    <span className="sd-detail-value">{selectedStudent.department}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Lớp sinh hoạt:</span>
                    <span className="sd-detail-value">{selectedStudent.class_name || selectedStudent.className}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Số CCCD:</span>
                    <span className="sd-detail-value">{selectedStudent.id_number || selectedStudent.idNumber}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Trạng thái:</span>
                    <span className="sd-detail-value">{getStatusBadge(selectedStudent.graduation_status || selectedStudent.graduationStatus)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn-secondary" onClick={() => setIsViewOpen(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {isDeleteOpen && selectedStudent && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header" style={{ backgroundColor: '#fef2f2' }}>
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge" style={{ background: '#fee2e2', color: '#ef4444' }}><FaTrash /></div>
                <h3 style={{ color: '#991b1b' }}>Xóa hồ sơ sinh viên</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsDeleteOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <p style={{ fontSize: '14px', color: '#334155' }}>
                Bạn có chắc chắn muốn xóa hồ sơ sinh viên <strong>{selectedStudent.full_name || selectedStudent.fullName}</strong> (MSSV: {selectedStudent.student_code || selectedStudent.studentCode}) khỏi hệ thống? 
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

export default SchoolStudents;
