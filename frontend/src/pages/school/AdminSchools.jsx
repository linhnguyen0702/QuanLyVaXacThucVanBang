import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, FaUniversity, FaSearch, FaEye, FaEdit, FaTrash, 
  FaCheck, FaTimes, FaShieldAlt, FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
import { api } from '../../services/api';
import Pagination from '../../components/Pagination/Pagination';

const PAGE_SIZE = 10;

const AdminSchools = () => {
  const [schools, setSchools] = useState([]);
  const [totalSchools, setTotalSchools] = useState(0);
  const [verifiedSchools, setVerifiedSchools] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedSchool, setSelectedSchool] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'warning' });

  const showAlertModal = (message, title = 'Thông báo hệ thống', type = 'warning') => {
    setAlertModal({ open: true, title, message, type });
  };

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

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getSchools({
        search: searchQuery,
        school_type: typeFilter,
        page,
        limit: PAGE_SIZE
      });
      if (res && res.success) {
        setSchools(res.schools || []);
        setTotalSchools(res.total || 0);
        setVerifiedSchools(res.verifiedTotal || 0);
      }
    } catch (err) {
      console.error('Failed to load schools:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter, page]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

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
    setFormError('');
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const name = (formData.schoolName || '').trim();
    const code = (formData.schoolCode || '').trim();

    if (!name || !code) {
      setFormError('Vui lòng nhập đầy đủ Tên trường và Mã trường!');
      return;
    }

    // Kiểm tra trùng mã trường (frontend)
    const isDupCode = schools.some(
      s => (s.school_code || s.schoolCode || '').toString().trim().toLowerCase() === code.toLowerCase()
    );
    if (isDupCode) {
      showAlertModal(
        `Mã trường "${code}" đã tồn tại trên hệ thống. Vui lòng chọn mã trường khác!`,
        'Cảnh báo trùng mã trường'
      );
      return;
    }

    // Kiểm tra trùng Tên trường (frontend)
    const isDupName = schools.some(
      s => (s.school_name || s.schoolName || '').trim().toLowerCase() === name.toLowerCase()
    );
    if (isDupName) {
      showAlertModal(
        `Tên trường "${name}" đã tồn tại trên hệ thống. Vui lòng kiểm tra lại!`,
        'Cảnh báo trùng tên trường'
      );
      return;
    }

    // Kiểm tra trùng Số giấy phép hoạt động
    const license = (formData.licenseNumber || '').trim();
    if (license) {
      const isDupLicense = schools.some(
        s => (s.license_number || s.licenseNumber || '').trim().toLowerCase() === license.toLowerCase()
      );
      if (isDupLicense) {
        showAlertModal(
          `Số giấy phép hoạt động "${license}" đã được sử dụng bởi một cơ sở khác. Vui lòng kiểm tra lại!`,
          'Cảnh báo trùng số giấy phép'
        );
        return;
      }
    }

    try {
      const res = await api.createSchool({
        school_name: name,
        school_code: code,
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
        const msg = res.message || 'Lỗi tạo trường học.';
        if (msg.toLowerCase().includes('mã trường') || msg.toLowerCase().includes('tên trường')) {
          showAlertModal(msg, 'Cảnh báo dữ liệu trùng');
        } else {
          setFormError(msg);
        }
      }
    } catch (err) {
      setFormError('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối.');
    }
  };

  const handleOpenEdit = (sch) => {
    setSelectedSchool(sch);
    setFormData({
      schoolName: sch.school_name || sch.schoolName || '',
      schoolCode: sch.school_code || sch.schoolCode || '',
      schoolType: sch.school_type || sch.schoolType || 'university',
      establishmentYear: sch.establishment_year || sch.establishmentYear || '',
      licenseNumber: sch.license_number || sch.licenseNumber || '',
      website: sch.website || '',
      walletAddress: sch.wallet_address || sch.walletAddress || '',
      isVerified: sch.is_verified ?? sch.isVerified ?? true
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!selectedSchool) return;

    const name = (formData.schoolName || '').trim();
    const code = (formData.schoolCode || '').trim();

    if (!name || !code) {
      setFormError('Vui lòng nhập đầy đủ Tên trường và Mã trường!');
      return;
    }

    // Kiểm tra trùng mã trường với trường khác (frontend)
    const isDupCode = schools.some(
      s => s.id !== selectedSchool.id &&
           (s.school_code || s.schoolCode || '').toString().trim().toLowerCase() === code.toLowerCase()
    );
    if (isDupCode) {
      showAlertModal(
        `Mã trường "${code}" đã tồn tại trên hệ thống. Vui lòng chọn mã trường khác!`,
        'Cảnh báo trùng mã trường'
      );
      return;
    }

    // Kiểm tra trùng tên trường với trường khác (frontend)
    const isDupName = schools.some(
      s => s.id !== selectedSchool.id &&
           (s.school_name || s.schoolName || '').trim().toLowerCase() === name.toLowerCase()
    );
    if (isDupName) {
      showAlertModal(
        `Tên trường "${name}" đã tồn tại trên hệ thống. Vui lòng kiểm tra lại!`,
        'Cảnh báo trùng tên trường'
      );
      return;
    }

    // Kiểm tra trùng Số giấy phép hoạt động với cơ sở khác
    const license = (formData.licenseNumber || '').trim();
    if (license) {
      const isDupLicense = schools.some(
        s => s.id !== selectedSchool.id &&
             (s.license_number || s.licenseNumber || '').trim().toLowerCase() === license.toLowerCase()
      );
      if (isDupLicense) {
        showAlertModal(
          `Số giấy phép hoạt động "${license}" đã được sử dụng bởi một cơ sở khác. Vui lòng kiểm tra lại!`,
          'Cảnh báo trùng số giấy phép'
        );
        return;
      }
    }

    try {
      const res = await api.updateSchool(selectedSchool.id, {
        school_name: name,
        school_code: code,
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
        const msg = res.message || 'Lỗi cập nhật nhà trường.';
        if (msg.toLowerCase().includes('mã trường') || msg.toLowerCase().includes('tên trường')) {
          showAlertModal(msg, 'Cảnh báo dữ liệu trùng');
        } else {
          setFormError(msg);
        }
      }
    } catch (err) {
      setFormError('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối.');
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
        setIsDeleteOpen(false);
        showAlertModal(res.message || 'Lỗi xóa cơ sở nhà trường.', 'Lỗi xóa dữ liệu', 'danger');
      }
    } catch (err) {
      setIsDeleteOpen(false);
      showAlertModal('Không thể kết nối máy chủ.', 'Lỗi kết nối', 'danger');
    }
  };

  const filteredSchools = schools;

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Quản lý Trường học &amp; Đơn vị cấp bằng</h2>
          <p>Danh sách các cơ sở giáo dục đã được lưu trên CSDL &amp; xác minh địa chỉ ví Blockchain</p>
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
              <span className="sd-stat-value">{totalSchools}</span>
              <span className="sd-stat-badge green">Trong Database</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box green"><FaShieldAlt /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Đã xác minh Blockchain</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{verifiedSchools}</span>
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select className="sd-select" value={typeFilter} onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}>
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
        <Pagination page={page} total={totalSchools} limit={PAGE_SIZE} onPageChange={setPage} />
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
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Số giấy phép:</span>
                    <span className="sd-detail-value">{selectedSchool.license_number || selectedSchool.licenseNumber || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Website:</span>
                    <span className="sd-detail-value">{selectedSchool.website || 'Chưa cập nhật'}</span>
                  </div>
                </div>
                <div className="sd-cert-hash-box" style={{ marginTop: '16px' }}>
                  <strong>Ví Smart Contract Polygon/Sepolia:</strong><br />
                  {selectedSchool.wallet_address || selectedSchool.walletAddress || 'Chưa kết nối ví'}
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
              <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                Bạn có chắc chắn muốn xóa <strong>{selectedSchool.school_name || selectedSchool.schoolName}</strong> ({selectedSchool.school_code || selectedSchool.schoolCode})?
              </p>
              <p style={{ fontSize: '13px', color: '#b91c1c', fontWeight: '600', marginTop: '10px' }}>
                ⚠️ Hành động này sẽ xóa vĩnh viễn cơ sở đào tạo khỏi hệ thống và không thể khôi phục.
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
        <div className="sd-toast success">
          <FaCheck /> {toastMessage}
        </div>
      )}
    </div>
  );
};

export default AdminSchools;
