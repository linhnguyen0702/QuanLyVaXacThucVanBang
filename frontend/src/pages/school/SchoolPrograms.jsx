import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaBook, FaUserGraduate, FaSearch, 
  FaEye, FaEdit, FaTrash, FaTimes, FaCheck 
} from 'react-icons/fa';

const INITIAL_PROGRAMS = [
  { id: 1, code: 'CTDT-CNTT-01', name: 'Công nghệ thông tin', sub: 'Chương trình chuẩn', dept: 'Khoa Công nghệ thông tin', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '2.856' },
  { id: 2, code: 'CTDT-ATPM-01', name: 'Kỹ thuật phần mềm', sub: 'Chương trình chuẩn', dept: 'Khoa Công nghệ thông tin', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '1.928' },
  { id: 3, code: 'CTDT-HTTT-01', name: 'Hệ thống thông tin', sub: 'Chương trình chuẩn', dept: 'Khoa Công nghệ thông tin', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '1.256' },
  { id: 4, code: 'CTDT-ATTT-01', name: 'An toàn thông tin', sub: 'Chương trình tiên tiến', dept: 'Khoa Công nghệ thông tin', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '842' },
  { id: 5, code: 'CTDT-QTKD-01', name: 'Quản trị kinh doanh', sub: 'Chương trình chuẩn', dept: 'Khoa Kinh tế', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '3.102' },
  { id: 6, code: 'CTDT-KT-01', name: 'Kế toán', sub: 'Chương trình chuẩn', dept: 'Khoa Kinh tế', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '2.348' },
  { id: 7, code: 'CTDT-NNANH-01', name: 'Ngôn ngữ Anh', sub: 'Chương trình chuẩn', dept: 'Khoa Ngoại ngữ', system: 'Đại học chính quy', duration: '4 năm', status: 'paused', count: '512' }
];

const SchoolPrograms = () => {
  const [programs, setPrograms] = useState(() => {
    const saved = localStorage.getItem('school_programs');
    return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedProg, setSelectedProg] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sub: 'Chương trình chuẩn',
    dept: 'Khoa Công nghệ thông tin',
    system: 'Đại học chính quy',
    duration: '4 năm',
    status: 'active'
  });

  useEffect(() => {
    localStorage.setItem('school_programs', JSON.stringify(programs));
  }, [programs]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return { label: 'Đang đào tạo', class: 'green' };
      case 'paused': return { label: 'Tạm dừng', class: 'orange' };
      case 'completed': return { label: 'Đã hoàn tất', class: 'purple' };
      case 'stopped': return { label: 'Đã dừng', class: 'red' };
      default: return { label: 'Không xác định', class: 'gray' };
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      code: `CTDT-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      sub: 'Chương trình chuẩn',
      dept: 'Khoa Công nghệ thông tin',
      system: 'Đại học chính quy',
      duration: '4 năm',
      status: 'active'
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Vui lòng nhập tên và mã chương trình!');
      return;
    }
    const newProg = {
      id: Date.now(),
      ...formData,
      count: '0'
    };
    setPrograms([newProg, ...programs]);
    setIsAddOpen(false);
    showToast('Thêm chương trình đào tạo thành công!');
  };

  const handleOpenEdit = (prog) => {
    setSelectedProg(prog);
    setFormData({ ...prog });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setPrograms(programs.map(p => p.id === selectedProg.id ? { ...p, ...formData } : p));
    setIsEditOpen(false);
    showToast('Cập nhật chương trình thành công!');
  };

  const handleOpenView = (prog) => {
    setSelectedProg(prog);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (prog) => {
    setSelectedProg(prog);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    setPrograms(programs.filter(p => p.id !== selectedProg.id));
    setIsDeleteOpen(false);
    showToast(`Đã xóa chương trình ${selectedProg.name}`);
  };

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === '' || p.dept === deptFilter;
    const matchesStatus = statusFilter === '' || p.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Chương trình đào tạo</h2>
          <p>Quản lý các chương trình đào tạo & cấp bằng của nhà trường</p>
        </div>
        <button className="sd-btn-primary" onClick={handleOpenAdd}>
          <FaPlus /> Thêm chương trình
        </button>
      </div>

      <div className="sd-stats-row">
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box blue"><FaBook /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Tổng số chương trình</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{programs.length}</span>
              <span className="sd-stat-badge green">Mới cập nhật</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box green"><FaUserGraduate /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Đang đào tạo</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{programs.filter(p=>p.status==='active').length}</span>
              <span className="sd-stat-badge green">Hoạt động</span>
            </div>
          </div>
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
                placeholder="Tìm kiếm theo tên chương trình, mã chương trình..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="sd-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="">Tất cả khoa</option>
              <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
              <option value="Khoa Kinh tế">Khoa Kinh tế</option>
              <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
            </select>
            <select className="sd-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang đào tạo</option>
              <option value="paused">Tạm dừng</option>
              <option value="completed">Hoàn tất</option>
            </select>
          </div>
        </div>

        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Mã chương trình</th>
                <th>Tên chương trình</th>
                <th>Khoa / Ngành</th>
                <th>Hệ đào tạo</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Đã cấp bằng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map((row) => {
                  const stat = getStatusLabel(row.status);
                  return (
                    <tr key={row.id}>
                      <td className="sd-td-bold">{row.code}</td>
                      <td>
                        <div className="sd-td-bold">{row.name}</div>
                        <div className="sd-td-subtext">{row.sub}</div>
                      </td>
                      <td>{row.dept}</td>
                      <td>{row.system}</td>
                      <td>{row.duration}</td>
                      <td>
                        <span className={`sd-badge ${stat.class}`}>{stat.label}</span>
                      </td>
                      <td className="sd-td-bold">{row.count}</td>
                      <td className="sd-actions">
                        <button className="sd-action-btn" title="Xem" onClick={() => handleOpenView(row)}><FaEye /></button>
                        <button className="sd-action-btn" title="Sửa" onClick={() => handleOpenEdit(row)}><FaEdit /></button>
                        <button className="sd-action-btn" title="Xóa" style={{color: '#ef4444'}} onClick={() => handleOpenDelete(row)}><FaTrash /></button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Không tìm thấy chương trình phù hợp.
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
                <div className="sd-modal-icon-badge"><FaBook /></div>
                <h3>Thêm Chương trình đào tạo mới</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsAddOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
                  <div className="sd-form-group">
                    <label>Mã chương trình *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      value={formData.code} 
                      onChange={(e) => setFormData({...formData, code: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Tên chương trình đào tạo *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      placeholder="Công nghệ thông tin"
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Tên phân hệ / Loại chương trình</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="Chương trình chuẩn"
                      value={formData.sub} 
                      onChange={(e) => setFormData({...formData, sub: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Khoa trực thuộc</label>
                    <select className="sd-input" value={formData.dept} onChange={(e) => setFormData({...formData, dept: e.target.value})}>
                      <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
                      <option value="Khoa Kinh tế">Khoa Kinh tế</option>
                      <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
                      <option value="Khoa Luật">Khoa Luật</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Hệ đào tạo</label>
                    <select className="sd-input" value={formData.system} onChange={(e) => setFormData({...formData, system: e.target.value})}>
                      <option value="Đại học chính quy">Đại học chính quy</option>
                      <option value="Vừa học vừa làm">Vừa học vừa làm</option>
                      <option value="Sau đại học">Sau đại học</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Thời gian đào tạo</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.duration} 
                      onChange={(e) => setFormData({...formData, duration: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group full-width">
                    <label>Trạng thái đào tạo</label>
                    <select className="sd-input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="active">Đang đào tạo</option>
                      <option value="paused">Tạm dừng</option>
                      <option value="completed">Đã hoàn tất</option>
                      <option value="stopped">Đã dừng</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="sd-modal-footer">
                <button type="button" className="sd-btn-secondary" onClick={() => setIsAddOpen(false)}>Hủy</button>
                <button type="submit" className="sd-btn-primary">Thêm chương trình</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL (IDENTICAL FULL FORM AS CREATE MODAL) ── */}
      {isEditOpen && selectedProg && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaEdit /></div>
                <h3>Sửa chương trình {selectedProg.code}</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsEditOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
                  <div className="sd-form-group">
                    <label>Mã chương trình *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      value={formData.code} 
                      onChange={(e) => setFormData({...formData, code: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Tên chương trình đào tạo *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Tên phân hệ / Loại chương trình</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.sub} 
                      onChange={(e) => setFormData({...formData, sub: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Khoa trực thuộc</label>
                    <select className="sd-input" value={formData.dept} onChange={(e) => setFormData({...formData, dept: e.target.value})}>
                      <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
                      <option value="Khoa Kinh tế">Khoa Kinh tế</option>
                      <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
                      <option value="Khoa Luật">Khoa Luật</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Hệ đào tạo</label>
                    <select className="sd-input" value={formData.system} onChange={(e) => setFormData({...formData, system: e.target.value})}>
                      <option value="Đại học chính quy">Đại học chính quy</option>
                      <option value="Vừa học vừa làm">Vừa học vừa làm</option>
                      <option value="Sau đại học">Sau đại học</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Thời gian đào tạo</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.duration} 
                      onChange={(e) => setFormData({...formData, duration: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group full-width">
                    <label>Trạng thái đào tạo</label>
                    <select className="sd-input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="active">Đang đào tạo</option>
                      <option value="paused">Tạm dừng</option>
                      <option value="completed">Đã hoàn tất</option>
                      <option value="stopped">Đã dừng</option>
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

      {/* ── VIEW MODAL ── */}
      {isViewOpen && selectedProg && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaBook /></div>
                <h3>Chi tiết chương trình đào tạo</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsViewOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <div className="sd-detail-card">
                <div className="sd-detail-grid">
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Mã chương trình:</span>
                    <span className="sd-detail-value">{selectedProg.code}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Tên chương trình:</span>
                    <span className="sd-detail-value">{selectedProg.name}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Loại chương trình:</span>
                    <span className="sd-detail-value">{selectedProg.sub}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Khoa trực thuộc:</span>
                    <span className="sd-detail-value">{selectedProg.dept}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Hệ đào tạo:</span>
                    <span className="sd-detail-value">{selectedProg.system} ({selectedProg.duration})</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Số bằng đã cấp:</span>
                    <span className="sd-detail-value">{selectedProg.count}</span>
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
      {isDeleteOpen && selectedProg && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header" style={{ backgroundColor: '#fef2f2' }}>
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge" style={{ background: '#fee2e2', color: '#ef4444' }}><FaTrash /></div>
                <h3 style={{ color: '#991b1b' }}>Xóa chương trình đào tạo</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsDeleteOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <p style={{ fontSize: '14px', color: '#334155' }}>
                Bạn có chắc chắn muốn xóa chương trình <strong>{selectedProg.name}</strong> ({selectedProg.code})?
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

export default SchoolPrograms;
