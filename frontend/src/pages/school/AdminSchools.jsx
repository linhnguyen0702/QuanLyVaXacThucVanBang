import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaUniversity, FaSearch, FaEye, FaEdit, FaTrash, 
  FaCheck, FaTimes, FaShieldAlt 
} from 'react-icons/fa';

const INITIAL_SCHOOLS = [
  {
    id: 1,
    schoolName: 'Trường Đại học Công nghệ - ĐHQGHN',
    schoolCode: 'UET-VNU',
    schoolType: 'university',
    schoolTypeLabel: 'Đại học',
    establishmentYear: 2004,
    licenseNumber: 'GP-1234/BGDDT',
    website: 'https://uet.vnu.edu.vn',
    walletAddress: '0xA3f2d9b7eC81452D819280dEAc429e81',
    isVerified: true,
    certificateCount: 12450
  },
  {
    id: 2,
    schoolName: 'Trường Đại học Bách khoa Hà Nội',
    schoolCode: 'HUST',
    schoolType: 'university',
    schoolTypeLabel: 'Đại học',
    establishmentYear: 1956,
    licenseNumber: 'GP-5678/BGDDT',
    website: 'https://hust.edu.vn',
    walletAddress: '0xB821c9e4a11295D31918aC391e',
    isVerified: true,
    certificateCount: 28900
  },
  {
    id: 3,
    schoolName: 'Học viện Công nghệ Bưu chính Viễn thông',
    schoolCode: 'PTIT',
    schoolType: 'institute',
    schoolTypeLabel: 'Học viện',
    establishmentYear: 1997,
    licenseNumber: 'GP-9912/BGDDT',
    website: 'https://ptit.edu.vn',
    walletAddress: '0xC918237192831823719bA',
    isVerified: false,
    certificateCount: 8400
  }
];

const AdminSchools = () => {
  const [schools, setSchools] = useState(() => {
    const saved = localStorage.getItem('system_schools');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });

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
    establishmentYear: 2000,
    licenseNumber: 'GP-2026/BGDDT',
    website: 'https://',
    walletAddress: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
    isVerified: true
  });

  useEffect(() => {
    localStorage.setItem('system_schools', JSON.stringify(schools));
  }, [schools]);

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
      establishmentYear: 2000,
      licenseNumber: 'GP-2026/BGDDT',
      website: 'https://',
      walletAddress: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      isVerified: true
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.schoolName || !formData.schoolCode) {
      alert('Vui lòng nhập tên trường và mã trường!');
      return;
    }
    const newSchool = {
      id: Date.now(),
      ...formData,
      schoolTypeLabel: getTypeLabel(formData.schoolType),
      certificateCount: 0
    };
    setSchools([newSchool, ...schools]);
    setIsAddOpen(false);
    showToast('Tạo mới trường học / đơn vị cấp bằng thành công!');
  };

  const handleOpenEdit = (sch) => {
    setSelectedSchool(sch);
    setFormData({ ...sch });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setSchools(schools.map(s => s.id === selectedSchool.id ? { 
      ...s, 
      ...formData, 
      schoolTypeLabel: getTypeLabel(formData.schoolType)
    } : s));
    setIsEditOpen(false);
    showToast('Cập nhật thông tin nhà trường thành công!');
  };

  const handleOpenView = (sch) => {
    setSelectedSchool(sch);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (sch) => {
    setSelectedSchool(sch);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    setSchools(schools.filter(s => s.id !== selectedSchool.id));
    setIsDeleteOpen(false);
    showToast(`Đã xóa cơ sở ${selectedSchool.schoolName}`);
  };

  const toggleVerifyStatus = (sch) => {
    setSchools(schools.map(s => s.id === sch.id ? { ...s, isVerified: !s.isVerified } : s));
    showToast(`Đã ${!sch.isVerified ? 'xác thực' : 'hủy xác thực'} ${sch.schoolName}`);
  };

  const filteredSchools = schools.filter(s => {
    const matchesSearch = s.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.schoolCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === '' || s.schoolType === typeFilter;
    const matchesVerify = verifiedFilter === '' || (verifiedFilter === 'verified' ? s.isVerified : !s.isVerified);
    return matchesSearch && matchesType && matchesVerify;
  });

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Quản lý Trường học & Đơn vị cấp bằng</h2>
          <p>Danh sách các cơ sở giáo dục đã được xác minh địa chỉ ví Blockchain</p>
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
              <span className="sd-stat-badge green">Trường học</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box green"><FaShieldAlt /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Đã xác minh Blockchain</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">{schools.filter(s=>s.isVerified).length}</span>
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
            <select className="sd-select" value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
              <option value="">Tất cả xác minh</option>
              <option value="verified">Đã xác minh</option>
              <option value="unverified">Chưa xác minh</option>
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
              {filteredSchools.length > 0 ? (
                filteredSchools.map(sch => (
                  <tr key={sch.id}>
                    <td className="sd-td-bold">{sch.schoolCode}</td>
                    <td>
                      <div className="sd-td-bold">{sch.schoolName}</div>
                      <div className="sd-td-subtext">{sch.website}</div>
                    </td>
                    <td>{sch.schoolTypeLabel}</td>
                    <td className="sd-bc-detail-val">{sch.walletAddress.slice(0, 10)}...{sch.walletAddress.slice(-6)}</td>
                    <td className="sd-td-bold">{sch.certificateCount.toLocaleString()}</td>
                    <td>
                      {sch.isVerified ? (
                        <span className="sd-badge green" style={{ cursor: 'pointer' }} onClick={() => toggleVerifyStatus(sch)}>
                          <FaCheck style={{marginRight: '4px'}} /> Đã xác minh
                        </span>
                      ) : (
                        <span className="sd-badge orange" style={{ cursor: 'pointer' }} onClick={() => toggleVerifyStatus(sch)}>
                          Chờ xác minh
                        </span>
                      )}
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
                <button type="button" className="sd-btn-secondary" onClick={() => setIsAddOpen(false)}>Hủy</button>
                <button type="submit" className="sd-btn-primary">Đăng ký nhà trường</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT SCHOOL MODAL (IDENTICAL FULL FORM AS CREATE MODAL) ── */}
      {isEditOpen && selectedSchool && (
        <div className="sd-modal-overlay">
          <div className="sd-modal large">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaEdit /></div>
                <h3>Sửa cơ sở {selectedSchool.schoolCode}</h3>
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
                  <div className="sd-form-group full-width">
                    <label>Xác minh ví Blockchain</label>
                    <select className="sd-input" value={formData.isVerified ? 'true' : 'false'} onChange={(e) => setFormData({...formData, isVerified: e.target.value === 'true'})}>
                      <option value="true">Đã xác minh (Verified)</option>
                      <option value="false">Chưa xác minh (Unverified)</option>
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
                    <span className="sd-detail-value">{selectedSchool.schoolName}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Mã trường:</span>
                    <span className="sd-detail-value">{selectedSchool.schoolCode}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Loại hình:</span>
                    <span className="sd-detail-value">{selectedSchool.schoolTypeLabel}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Năm thành lập:</span>
                    <span className="sd-detail-value">{selectedSchool.establishmentYear}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Số giấy phép:</span>
                    <span className="sd-detail-value">{selectedSchool.licenseNumber}</span>
                  </div>
                  <div className="sd-detail-item">
                    <span className="sd-detail-label">Tổng bằng đã cấp:</span>
                    <span className="sd-detail-value">{selectedSchool.certificateCount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="sd-cert-hash-box" style={{ marginTop: '16px' }}>
                  <strong>Ví Smart Contract Polygon:</strong><br />
                  {selectedSchool.walletAddress}
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
                Bạn có chắc chắn muốn xóa <strong>{selectedSchool.schoolName}</strong> ({selectedSchool.schoolCode})?
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
