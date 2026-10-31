import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, FaBook, FaUserGraduate, FaSearch, 
  FaEye, FaEdit, FaTrash, FaTimes, FaCheck, FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
import { api } from '../../services/api';
import Pagination from '../../components/Pagination/Pagination';

const PAGE_SIZE = 10;

const SchoolPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [totalPrograms, setTotalPrograms] = useState(0);
  const [activePrograms, setActivePrograms] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
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
  const [toastType, setToastType] = useState('success');
  const [formError, setFormError] = useState('');
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'warning' });

  const showAlertModal = (message, title = 'Thông báo hệ thống', type = 'warning') => {
    setAlertModal({ open: true, title, message, type });
  };

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sub: '',
    dept: '',
    system: 'Đại học chính quy',
    duration: '',
    status: 'active'
  });

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPrograms({
        search: searchQuery,
        department: deptFilter,
        status: statusFilter,
        page,
        limit: PAGE_SIZE
      });
      if (res && res.success) {
        setPrograms(res.programs || []);
        setTotalPrograms(res.total || 0);
        setActivePrograms(res.activeTotal || 0);
      }
    } catch (err) {
      console.error('Failed to load programs:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, deptFilter, statusFilter, page]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return { label: 'Đang đào tạo', class: 'green' };
      case 'paused': return { label: 'Tạm dừng', class: 'orange' };
      case 'completed': return { label: 'Đã hoàn tất', class: 'purple' };
      case 'stopped': return { label: 'Đã dừng', class: 'red' };
      default: return { label: 'Đang đào tạo', class: 'green' };
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      code: '',
      name: '',
      sub: '',
      dept: '',
      system: 'Đại học chính quy',
      duration: '',
      status: 'active'
    });
    setFormError('');
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.code || !formData.dept) {
      setFormError('Vui lòng nhập đầy đủ mã chương trình, tên chương trình và khoa trực thuộc!');
      return;
    }

    // Kiểm tra trùng mã chương trình (frontend)
    const isDupCode = programs.some(
      p => (p.program_code || p.code || '').toString().trim().toLowerCase() === formData.code.trim().toLowerCase()
    );
    if (isDupCode) {
      showAlertModal(
        `Mã chương trình "${formData.code.trim()}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác!`,
        'Cảnh báo trùng mã chương trình'
      );
      return;
    }

    // Kiểm tra trùng tên chương trình (frontend)
    const isDupName = programs.some(
      p => (p.program_name || p.name || '').trim().toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (isDupName) {
      showAlertModal(
        `Tên chương trình "${formData.name.trim()}" đã tồn tại trên hệ thống. Vui lòng chọn tên khác!`,
        'Cảnh báo trùng tên chương trình'
      );
      return;
    }

    try {
      const res = await api.createProgram({
        program_code: formData.code,
        program_name: formData.name,
        sub_name: formData.sub,
        department: formData.dept,
        education_system: formData.system,
        duration: formData.duration,
        status: formData.status
      });

      if (res && res.success) {
        setIsAddOpen(false);
        showToast('Thêm chương trình đào tạo thành công!');
        fetchPrograms();
      } else {
        const msg = res.message || 'Lỗi thêm mới. Vui lòng thử lại.';
        if (msg.toLowerCase().includes('mã') || msg.toLowerCase().includes('tên')) {
          showAlertModal(msg, 'Cảnh báo dữ liệu trùng');
        } else {
          setFormError(msg);
        }
      }
    } catch (err) {
      setFormError('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối.');
    }
  };

  const handleOpenEdit = (prog) => {
    setSelectedProg(prog);
    setFormData({
      code: prog.program_code || prog.code || '',
      name: prog.program_name || prog.name || '',
      sub: prog.sub_name || prog.sub || '',
      dept: prog.department || prog.dept || '',
      system: prog.education_system || prog.system || 'Đại học chính quy',
      duration: prog.duration || '',
      status: prog.status || 'active'
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!selectedProg) return;
    if (!formData.name || !formData.code || !formData.dept) {
      setFormError('Vui lòng nhập đầy đủ mã chương trình, tên chương trình và khoa trực thuộc!');
      return;
    }

    // Kiểm tra trùng mã chương trình với chương trình khác (frontend)
    const isDupCode = programs.some(
      p => p.id !== selectedProg.id &&
           (p.program_code || p.code || '').toString().trim().toLowerCase() === formData.code.trim().toLowerCase()
    );
    if (isDupCode) {
      showAlertModal(
        `Mã chương trình "${formData.code.trim()}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác!`,
        'Cảnh báo trùng mã chương trình'
      );
      return;
    }

    // Kiểm tra trùng tên chương trình với chương trình khác (frontend)
    const isDupName = programs.some(
      p => p.id !== selectedProg.id &&
           (p.program_name || p.name || '').trim().toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (isDupName) {
      showAlertModal(
        `Tên chương trình "${formData.name.trim()}" đã tồn tại trên hệ thống. Vui lòng chọn tên khác!`,
        'Cảnh báo trùng tên chương trình'
      );
      return;
    }

    try {
      const res = await api.updateProgram(selectedProg.id, {
        program_code: formData.code,
        program_name: formData.name,
        sub_name: formData.sub,
        department: formData.dept,
        education_system: formData.system,
        duration: formData.duration,
        status: formData.status
      });
      if (res && res.success) {
        setIsEditOpen(false);
        showToast('Cập nhật chương trình đào tạo thành công!');
        fetchPrograms();
      } else {
        const msg = res.message || 'Lỗi cập nhật chương trình. Vui lòng thử lại.';
        if (msg.toLowerCase().includes('mã') || msg.toLowerCase().includes('tên')) {
          showAlertModal(msg, 'Cảnh báo dữ liệu trùng');
        } else {
          setFormError(msg);
        }
      }
    } catch (err) {
      setFormError('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối.');
    }
  };

  const handleOpenView = (prog) => {
    setSelectedProg(prog);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (prog) => {
    setSelectedProg(prog);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProg) return;
    try {
      const res = await api.deleteProgram(selectedProg.id);
      if (res && res.success) {
        setIsDeleteOpen(false);
        showToast('Đã xóa chương trình đào tạo thành công!');
        fetchPrograms();
      } else {
        setIsDeleteOpen(false);
        showToast(res.message || 'Lỗi xóa chương trình.', 'error');
      }
    } catch (err) {
      setIsDeleteOpen(false);
      showToast('Không thể kết nối máy chủ.', 'error');
    }
  };

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Chương trình đào tạo</h2>
          <p>Quản lý các chương trình đào tạo & cấp bằng của nhà trường từ CSDL MySQL</p>
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
              <span className="sd-stat-value">{totalPrograms}</span>
              <span className="sd-stat-badge green">Trong Database</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box green"><FaUserGraduate /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Đang đào tạo</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{activePrograms}</span>
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select className="sd-select" value={deptFilter} onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}>
              <option value="">Tất cả khoa</option>
              <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
              <option value="Khoa Kinh tế">Khoa Kinh tế</option>
              <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
            </select>
            <select className="sd-select" value={statusFilter} onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}>
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
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} /> Đang tải danh sách chương trình...
                  </td>
                </tr>
              ) : programs.length > 0 ? (
                programs.map((row) => {
                  const stat = getStatusLabel(row.status);
                  return (
                    <tr key={row.id}>
                      <td className="sd-td-bold">{row.program_code || row.code}</td>
                      <td>
                        <div className="sd-td-bold">{row.program_name || row.name}</div>
                        <div className="sd-td-subtext">{row.sub_name || row.sub}</div>
                      </td>
                      <td>{row.department || row.dept}</td>
                      <td>{row.education_system || row.system}</td>
                      <td>{row.duration}</td>
                      <td>
                        <span className={`sd-badge ${stat.class}`}>{stat.label}</span>
                      </td>
                      <td className="sd-td-bold">{row.issued_count || row.count || 0}</td>
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
        <Pagination page={page} total={totalPrograms} limit={PAGE_SIZE} onPageChange={setPage} />
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
                      placeholder="Ví dụ: CTDT-CNTT-01"
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
                      placeholder="Ví dụ: Công nghệ thông tin"
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Tên phân hệ / Loại chương trình</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="Ví dụ: Chương trình chuẩn"
                      value={formData.sub} 
                      onChange={(e) => setFormData({...formData, sub: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Khoa trực thuộc *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required
                      placeholder="Ví dụ: Khoa Công nghệ thông tin"
                      list="deptSuggestions"
                      value={formData.dept} 
                      onChange={(e) => setFormData({...formData, dept: e.target.value})} 
                    />
                    <datalist id="deptSuggestions">
                      <option value="Khoa Công nghệ thông tin" />
                      <option value="Khoa Kinh tế" />
                      <option value="Khoa Ngoại ngữ" />
                      <option value="Khoa Điện tử viễn thông" />
                    </datalist>
                  </div>
                  <div className="sd-form-group">
                    <label>Hệ đào tạo</label>
                    <select className="sd-input" value={formData.system} onChange={(e) => setFormData({...formData, system: e.target.value})}>
                      <option value="Đại học chính quy">Đại học chính quy</option>
                      <option value="Cao đẳng chính quy">Cao đẳng chính quy</option>
                      <option value="Vừa học vừa làm">Vừa học vừa làm</option>
                      <option value="Sau đại học">Sau đại học</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Thời gian đào tạo</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="Ví dụ: 4 năm"
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
              <div className="sd-modal-footer">
                <button type="button" className="sd-btn-secondary" onClick={() => setIsAddOpen(false)}>Hủy</button>
                <button type="submit" className="sd-btn-primary">Thêm chương trình</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {isEditOpen && selectedProg && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaEdit /></div>
                <h3>Sửa chương trình {selectedProg.program_code || selectedProg.code}</h3>
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
                    <label>Khoa trực thuộc *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="Ví dụ: Khoa Công nghệ thông tin"
                      value={formData.dept} 
                      onChange={(e) => setFormData({...formData, dept: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Hệ đào tạo</label>
                    <select className="sd-input" value={formData.system} onChange={(e) => setFormData({...formData, system: e.target.value})}>
                      <option value="Đại học chính quy">Đại học chính quy</option>
                      <option value="Cao đẳng chính quy">Cao đẳng chính quy</option>
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
                    <span className="sd-detail-value">{selectedProg.program_code || selectedProg.code}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Tên chương trình:</span>
                    <span className="sd-detail-value">{selectedProg.program_name || selectedProg.name}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Loại chương trình:</span>
                    <span className="sd-detail-value">{selectedProg.sub_name || selectedProg.sub}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Khoa trực thuộc:</span>
                    <span className="sd-detail-value">{selectedProg.department || selectedProg.dept}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Hệ đào tạo:</span>
                    <span className="sd-detail-value">{selectedProg.education_system || selectedProg.system} ({selectedProg.duration})</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Số bằng đã cấp:</span>
                    <span className="sd-detail-value">{selectedProg.issued_count || selectedProg.count || 0}</span>
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
                Bạn có chắc chắn muốn xóa chương trình <strong>{selectedProg.program_name || selectedProg.name}</strong> ({selectedProg.program_code || selectedProg.code})?
              </p>
            </div>
            <div className="sd-modal-footer">
              <button className="sd-btn-secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</button>
              <button className="sd-btn-danger" onClick={handleDeleteConfirm}>Xác nhận Xóa</button>
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

      {toastMessage && (
        <div className={`sd-toast ${toastType}`}>
          <FaCheck /> {toastMessage}
        </div>
      )}
    </div>
  );
};

export default SchoolPrograms;
