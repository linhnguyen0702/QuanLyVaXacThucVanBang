import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaUserGraduate, 
  FaTimes, FaCheck, FaFileUpload 
} from 'react-icons/fa';

const INITIAL_STUDENTS = [
  {
    id: 1,
    studentCode: '20201123',
    fullName: 'Trần Thị B',
    email: 'tranthib@school.edu.vn',
    dob: '2002-05-14',
    gender: 'Nữ',
    idNumber: '001198001234',
    department: 'Công nghệ thông tin',
    className: 'CNTT-01 K65',
    graduationStatus: 'issued' // issued, eligible, studying, suspended
  },
  {
    id: 2,
    studentCode: '20203492',
    fullName: 'Lê Văn C',
    email: 'levanc@school.edu.vn',
    dob: '2002-08-20',
    gender: 'Nam',
    idNumber: '001198005678',
    department: 'Khoa học máy tính',
    className: 'KHMT-02 K65',
    graduationStatus: 'eligible'
  },
  {
    id: 3,
    studentCode: '20210045',
    fullName: 'Phạm Minh Tuấn',
    email: 'tuanpm@school.edu.vn',
    dob: '2003-01-10',
    gender: 'Nam',
    idNumber: '001198009988',
    department: 'Kỹ thuật phần mềm',
    className: 'KTPM-01 K66',
    graduationStatus: 'studying'
  }
];

const SchoolStudents = () => {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('school_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

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
    dob: '2002-01-01',
    gender: 'Nam',
    idNumber: '',
    department: 'Công nghệ thông tin',
    className: 'CNTT-01 K65',
    graduationStatus: 'eligible'
  });

  useEffect(() => {
    localStorage.setItem('school_students', JSON.stringify(students));
  }, [students]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenAdd = () => {
    setFormData({
      studentCode: `2022${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      email: '',
      dob: '2002-01-01',
      gender: 'Nam',
      idNumber: '00120' + Math.floor(1000000 + Math.random() * 9000000),
      department: 'Công nghệ thông tin',
      className: 'CNTT-01 K65',
      graduationStatus: 'eligible'
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.studentCode) {
      alert('Vui lòng nhập họ tên và MSSV!');
      return;
    }
    const newStudent = { id: Date.now(), ...formData };
    setStudents([newStudent, ...students]);
    setIsAddOpen(false);
    showToast('Thêm sinh viên mới thành công!');
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({ ...student });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, ...formData } : s));
    setIsEditOpen(false);
    showToast('Cập nhật thông tin sinh viên thành công!');
  };

  const handleOpenView = (student) => {
    setSelectedStudent(student);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    setStudents(students.filter(s => s.id !== selectedStudent.id));
    setIsDeleteOpen(false);
    showToast(`Đã xóa sinh viên ${selectedStudent.fullName}`);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === '' || s.department === deptFilter;
    const matchesStatus = statusFilter === '' || s.graduationStatus === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

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
          <p>Danh sách sinh viên và trạng thái xét duyệt cấp văn bằng</p>
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
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td className="sd-td-bold">{student.studentCode}</td>
                    <td className="sd-td-bold">{student.fullName}</td>
                    <td>{student.email}</td>
                    <td>{student.department}</td>
                    <td>{student.className}</td>
                    <td>{getStatusBadge(student.graduationStatus)}</td>
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
                      placeholder="Nguyễn Văn A"
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
              <button className="sd-btn-primary" onClick={() => { setIsImportOpen(false); showToast('Đã nhập thành công 45 hồ sơ sinh viên!'); }}>Tải lên & Xử lý</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT STUDENT MODAL (IDENTICAL FULL FORM AS CREATE MODAL) ── */}
      {isEditOpen && selectedStudent && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaEdit /></div>
                <h3>Sửa thông tin sinh viên {selectedStudent.studentCode}</h3>
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
                      <option value="issued">Đã cấp bằng</option>
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
                    <span className="sd-detail-value">{selectedStudent.studentCode}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Họ và tên:</span>
                    <span className="sd-detail-value">{selectedStudent.fullName}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Email:</span>
                    <span className="sd-detail-value">{selectedStudent.email}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Ngày sinh:</span>
                    <span className="sd-detail-value">{selectedStudent.dob} ({selectedStudent.gender})</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Khoa/Ngành:</span>
                    <span className="sd-detail-value">{selectedStudent.department}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Lớp sinh hoạt:</span>
                    <span className="sd-detail-value">{selectedStudent.className}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Số CCCD:</span>
                    <span className="sd-detail-value">{selectedStudent.idNumber}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Trạng thái:</span>
                    <span className="sd-detail-value">{getStatusBadge(selectedStudent.graduationStatus)}</span>
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
                Bạn có chắc chắn muốn xóa hồ sơ sinh viên <strong>{selectedStudent.fullName}</strong> (MSSV: {selectedStudent.studentCode}) khỏi hệ thống? 
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
