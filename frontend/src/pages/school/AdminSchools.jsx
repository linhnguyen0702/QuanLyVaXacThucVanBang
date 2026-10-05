import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaUniversity, FaSearch, FaEye, FaEdit, FaTrash, 
  FaCheck, FaTimes, FaShieldAlt, FaSpinner 
} from 'react-icons/fa';
import { api } from '../../services/api';

const AdminSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedSchool, setSelectedSchool] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    schoolName: '',
    schoolCode: '',
    schoolType: 'university',
    establishmentYear: '',
    licenseNumber: '',
    website: '',
    walletAddress: '',
    isVerified: true
  });

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.getSchools(searchQuery);
      if (res && res.success) {
        setSchools(res.schools || []);
      }
    } catch (err) {
      console.error('Failed to load schools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [searchQuery]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'university': return 'Đại học';
      case 'college': return 'Cao đẳng';
      case 'institute': return 'Học viện / Viện';
      default: return 'Trường học';
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      schoolName: '',
      schoolCode: '',
      schoolType: 'university',
      establishmentYear: '',
      licenseNumber: '',
      website: '',
      walletAddress: '',
      isVerified: true
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.schoolName || !formData.schoolCode) {
      alert('Vui lòng nhập tên trường và mã trường!');
      return;
    }
    try {
      const res = await api.createSchool({
        school_name: formData.schoolName,
        school_code: formData.schoolCode,
        school_type: formData.schoolType,
        establishment_year: formData.establishmentYear,
        license_number: formData.licenseNumber,
        website: formData.website,
        wallet_address: formData.walletAddress
      });

      if (res && res.success) {
        setIsAddOpen(false);
        showToast('Thêm mới cơ sở giáo dục thành công!');
        fetchSchools();
      } else {
        alert(res.message || 'Lỗi tạo trường học.');
      }
    } catch (err) {
      alert('Không thể kết nối máy chủ.');
    }
  };

  const handleOpenEdit = (sch) => {
    setSelectedSchool(sch);
    setFormData({
      schoolName: sch.school_name || sch.schoolName,
      schoolCode: sch.school_code || sch.schoolCode,
      schoolType: sch.school_type || sch.schoolType || 'university',
      establishmentYear: sch.establishment_year || sch.establishmentYear || 2000,
      licenseNumber: sch.license_number || sch.licenseNumber,
      website: sch.website,
      walletAddress: sch.wallet_address || sch.walletAddress,
      isVerified: sch.is_verified ?? sch.isVerified ?? true
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSchool) return;
    try {
      const res = await api.updateSchool(selectedSchool.id, {
        school_name: formData.schoolName,
        school_code: formData.schoolCode,
        school_type: formData.schoolType,
        establishment_year: formData.establishmentYear,
        license_number: formData.licenseNumber,
        website: formData.website,
        wallet_address: formData.walletAddress
      });
      if (res && res.success) {
        setIsEditOpen(false);
        showToast('Cập nhật thông tin nhà trường thành công!');
        fetchSchools();
      } else {
        alert(res.message || 'Lỗi cập nhật nhà trường.');
      }
    } catch (err) {
      alert('Không thể kết nối máy chủ.');
    }
  };

  const handleOpenView = (sch) => {
    setSelectedSchool(sch);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (sch) => {
    setSelectedSchool(sch);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSchool) return;
    try {
      const res = await api.deleteSchool(selectedSchool.id);
      if (res && res.success) {
        setIsDeleteOpen(false);
        showToast(`Đã xóa cơ sở đào tạo thành công!`);
        fetchSchools();
      } else {
        alert(res.message || 'Lỗi xóa cơ sở nhà trường.');
      }
    } catch (err) {
      alert('Không thể kết nối máy chủ.');
    }
  };

  const filteredSchools = schools.filter(s => {
    const name = s.school_name || s.schoolName || '';
    const code = s.school_code || s.schoolCode || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Quản lý Trường học & Đơn vị cấp bằng</h2>
          <p>Danh sách các cơ sở giáo dục đã được lưu trên CSDL & xác minh địa chỉ ví Blockchain</p>
        </div>
        <button className="sd-btn-primary" onClick={handleOpenAdd}>
          <FaPlus /> Thêm trường mới
        </button>
      </div>

      <div className="sd-stats-row">
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box blue"><FaUniversity /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Tổng số cơ sở đào tạo</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{schools.length}</span>
              <span className="sd-stat-badge green">Trong Database</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box green"><FaShieldAlt /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Đã xác minh Blockchain</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{schools.filter(s=>s.is_verified || s.isVerified).length}</span>
              <span className="sd-stat-badge green">Đã kết nối ví</span>
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
                placeholder="Tìm tên trường, mã trường..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="sd-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">Tất cả loại hình</option>
              <option value="university">Đại học</option>
              <option value="college">Cao đẳng</option>
              <option value="institute">Học viện</option>
            </select>
          </div>
        </div>

        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Mã trường</th>
                <th>Tên Trường / Học viện</th>
                <th>Loại hình</th>
                <th>Địa chỉ ví Blockchain</th>
                <th>Tổng số văn bằng</th>
                <th>Trạng thái xác minh</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} /> Đang tải danh sách trường học...
                  </td>
                </tr>
              ) : filteredSchools.length > 0 ? (
                filteredSchools.map(sch => (
                  <tr key={sch.id}>
                    <td className="sd-td-bold">{sch.school_code || sch.schoolCode}</td>
                    <td>
                      <div className="sd-td-bold">{sch.school_name || sch.schoolName}</div>
                      <div className="sd-td-subtext">{sch.website}</div>
                    </td>
                    <td>{getTypeLabel(sch.school_type || sch.schoolType)}</td>
                    <td className="sd-bc-detail-val">
                      {(sch.wallet_address || sch.walletAddress || '0x...').substring(0, 10)}...
                    </td>
                    <td className="sd-td-bold">{(sch.certificate_count || sch.certificateCount || 0).toLocaleString()}</td>
                    <td>
                      <span className="sd-badge green">
                        <FaCheck style={{marginRight: '4px'}} /> Đã xác minh
                      </span>
                    </td>
                    <td className="sd-actions">
                      <button className="sd-action-btn" title="Xem" onClick={() => handleOpenView(sch)}><FaEye /></button>
                      <button className="sd-action-btn" title="Sửa" onClick={() => handleOpenEdit(sch)}><FaEdit /></button>
                      <button className="sd-action-btn" title="Xóa" style={{color: '#ef4444'}} onClick={() => handleOpenDelete(sch)}><FaTrash /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Không tìm thấy cơ sở giáo dục phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE SCHOOL MODAL ── */}
      {isAddOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaUniversity /></div>
                <h3>Thêm trường học / Cơ sở cấp bằng mới</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsAddOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
                  <div className="sd-form-group">
                    <label>Tên trường học *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      placeholder="Trường Đại học..."
                      value={formData.schoolName} 
                      onChange={(e) => setFormData({...formData, schoolName: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Mã trường *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      placeholder="UET"
                      value={formData.schoolCode} 
                      onChange={(e) => setFormData({...formData, schoolCode: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Loại hình cơ sở</label>
                    <select className="sd-input" value={formData.schoolType} onChange={(e) => setFormData({...formData, schoolType: e.target.value})}>
                      <option value="university">Đại học</option>
                      <option value="college">Cao đẳng</option>
                      <option value="institute">Học viện</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Năm thành lập</label>
                    <input 
                      type="number" 
                      className="sd-input" 
                      placeholder="Ví dụ: 1995"
                      value={formData.establishmentYear} 
                      onChange={(e) => setFormData({...formData, establishmentYear: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Số giấy phép hoạt động</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="Ví dụ: GP-2026/BGDDT"
                      value={formData.licenseNumber} 
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Địa chỉ Website</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="https://vnu.edu.vn"
                      value={formData.website} 
                      onChange={(e) => setFormData({...formData, website: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group full-width">
                    <label>Địa chỉ ví MetaMask / Blockchain nhà trường</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="0x..."
                      style={{ fontFamily: 'monospace' }}
                      value={formData.walletAddress} 
                      onChange={(e) => setFormData({...formData, walletAddress: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              <div className="sd-modal-footer">
                <button type="button" className="sd-btn-secondary" onClick={() => setIsAddOpen(false)}>Hủy</button>
                <button type="submit" className="sd-btn-primary">Đăng ký nhà trường</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT SCHOOL MODAL ── */}
      {isEditOpen && selectedSchool && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaEdit /></div>
                <h3>Sửa cơ sở {selectedSchool.school_code || selectedSchool.schoolCode}</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsEditOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
                  <div className="sd-form-group">
                    <label>Tên trường học *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      value={formData.schoolName} 
                      onChange={(e) => setFormData({...formData, schoolName: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Mã trường *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      value={formData.schoolCode} 
                      onChange={(e) => setFormData({...formData, schoolCode: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Loại hình cơ sở</label>
                    <select className="sd-input" value={formData.schoolType} onChange={(e) => setFormData({...formData, schoolType: e.target.value})}>
                      <option value="university">Đại học</option>
                      <option value="college">Cao đẳng</option>
                      <option value="institute">Học viện</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Năm thành lập</label>
                    <input 
                      type="number" 
                      className="sd-input" 
                      value={formData.establishmentYear} 
                      onChange={(e) => setFormData({...formData, establishmentYear: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Số giấy phép hoạt động</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.licenseNumber} 
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Địa chỉ Website</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.website} 
                      onChange={(e) => setFormData({...formData, website: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group full-width">
                    <label>Địa chỉ ví MetaMask / Blockchain nhà trường</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      style={{ fontFamily: 'monospace' }}
                      value={formData.walletAddress} 
                      onChange={(e) => setFormData({...formData, walletAddress: e.target.value})} 
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

      {/* ── VIEW SCHOOL MODAL ── */}
      {isViewOpen && selectedSchool && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaUniversity /></div>
                <h3>Thông tin cơ sở đào tạo</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsViewOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <div className="sd-detail-card">
                <div className="sd-detail-grid">
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Tên cơ sở:</span>
                    <span className="sd-detail-value">{selectedSchool.school_name || selectedSchool.schoolName}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Mã trường:</span>
                    <span className="sd-detail-value">{selectedSchool.school_code || selectedSchool.schoolCode}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Loại hình:</span>
                    <span className="sd-detail-value">{getTypeLabel(selectedSchool.school_type || selectedSchool.schoolType)}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Năm thành lập:</span>
                    <span className="sd-detail-value">{selectedSchool.establishment_year || selectedSchool.establishmentYear}</span>
                  </div>
                </div>
                <div className="sd-cert-hash-box" style={{ marginTop: '16px' }}>
                  <strong>Ví Smart Contract Polygon/Sepolia:</strong><br />
                  {selectedSchool.wallet_address || selectedSchool.walletAddress}
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
      {isDeleteOpen && selectedSchool && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header" style={{ backgroundColor: '#fef2f2' }}>
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge" style={{ background: '#fee2e2', color: '#ef4444' }}><FaTrash /></div>
                <h3 style={{ color: '#991b1b' }}>Xóa cơ sở nhà trường</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsDeleteOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <p style={{ fontSize: '14px', color: '#334155' }}>
                Bạn có chắc chắn muốn xóa <strong>{selectedSchool.school_name || selectedSchool.schoolName}</strong> ({selectedSchool.school_code || selectedSchool.schoolCode})?
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

export default AdminSchools;
