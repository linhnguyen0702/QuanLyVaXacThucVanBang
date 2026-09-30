import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaShieldAlt, FaTimes, FaCheck } from 'react-icons/fa';

const INITIAL_ROLES = [
  {
    id: 1,
    name: 'Quản trị viên (Admin)',
    code: 'admin',
    desc: 'Quyền cao nhất hệ thống, toàn quyền quản lý nhà trường',
    permissions: {
      viewCert: true,
      createCert: true,
      editConfig: true,
      viewLogs: true
    },
    isSystem: true
  },
  {
    id: 2,
    name: 'Cán bộ đào tạo',
    code: 'officer',
    desc: 'Cán bộ phòng đào tạo được cấp quyền duyệt & phát hành văn bằng',
    permissions: {
      viewCert: true,
      createCert: true,
      editConfig: false,
      viewLogs: false
    },
    isSystem: true
  },
  {
    id: 3,
    name: 'Nhân viên tra cứu',
    code: 'viewer',
    desc: 'Chỉ được xem danh sách và tra cứu văn bằng',
    permissions: {
      viewCert: true,
      createCert: false,
      editConfig: false,
      viewLogs: false
    },
    isSystem: true
  }
];

const SchoolRoles = () => {
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('school_roles');
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    desc: '',
    permissions: {
      viewCert: true,
      createCert: false,
      editConfig: false,
      viewLogs: false
    }
  });

  useEffect(() => {
    localStorage.setItem('school_roles', JSON.stringify(roles));
  }, [roles]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: `custom_role_${Date.now().toString().slice(-4)}`,
      desc: '',
      permissions: {
        viewCert: true,
        createCert: false,
        editConfig: false,
        viewLogs: false
      }
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Vui lòng nhập tên vai trò!');
      return;
    }
    const newRole = { id: Date.now(), ...formData, isSystem: false };
    setRoles([...roles, newRole]);
    setIsAddOpen(false);
    showToast('Tạo nhóm vai trò thành công!');
  };

  const handleOpenEdit = (role) => {
    setSelectedRole(role);
    setFormData({ ...role, permissions: { ...role.permissions } });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setRoles(roles.map(r => r.id === selectedRole.id ? { ...r, ...formData } : r));
    setIsEditOpen(false);
    showToast('Cập nhật phân quyền thành công!');
  };

  const handleOpenDelete = (role) => {
    setSelectedRole(role);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    setRoles(roles.filter(r => r.id !== selectedRole.id));
    setIsDeleteOpen(false);
    showToast(`Đã xóa vai trò ${selectedRole.name}`);
  };

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Vai trò & Phân quyền</h2>
          <p>Quản lý các nhóm vai trò và phân quyền chi tiết cho hệ thống</p>
        </div>
        <button className="sd-btn-primary" onClick={handleOpenAdd}>
          <FaPlus /> Tạo vai trò mới
        </button>
      </div>

      <div className="sd-data-card">
        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Nhóm Vai trò</th>
                <th>Xem văn bằng</th>
                <th>Cấp phát mới</th>
                <th>Cấu hình hệ thống</th>
                <th>Xem nhật ký</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id}>
                  <td>
                    <div className="sd-td-bold">{role.name}</div>
                    <div className="sd-td-subtext">{role.desc}</div>
                  </td>
                  <td>
                    {role.permissions.viewCert ? (
                      <span className="sd-badge green">Cho phép</span>
                    ) : (
                      <span className="sd-badge red">Từ chối</span>
                    )}
                  </td>
                  <td>
                    {role.permissions.createCert ? (
                      <span className="sd-badge green">Cho phép</span>
                    ) : (
                      <span className="sd-badge red">Từ chối</span>
                    )}
                  </td>
                  <td>
                    {role.permissions.editConfig ? (
                      <span className="sd-badge green">Cho phép</span>
                    ) : (
                      <span className="sd-badge red">Từ chối</span>
                    )}
                  </td>
                  <td>
                    {role.permissions.viewLogs ? (
                      <span className="sd-badge green">Cho phép</span>
                    ) : (
                      <span className="sd-badge red">Từ chối</span>
                    )}
                  </td>
                  <td className="sd-actions">
                    <button className="sd-action-btn" title="Chỉnh sửa phân quyền" onClick={() => handleOpenEdit(role)}>
                      <FaEdit />
                    </button>
                    {!role.isSystem && (
                      <button className="sd-action-btn" title="Xóa vai trò" style={{color: '#ef4444'}} onClick={() => handleOpenDelete(role)}>
                        <FaTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE ROLE MODAL ── */}
      {isAddOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaShieldAlt /></div>
                <h3>Tạo nhóm vai trò mới</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsAddOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
                  <div className="sd-form-group full-width">
                    <label>Tên vai trò *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      placeholder="Cán bộ phòng công tác sinh viên"
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group full-width">
                    <label>Mô tả vai trò</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      placeholder="Nhập mô tả nhiệm vụ vai trò..."
                      value={formData.desc} 
                      onChange={(e) => setFormData({...formData, desc: e.target.value})} 
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '16px 0 12px 0' }}>Chi tiết phân quyền</h4>
                <div className="sd-settings-list">
                  <div className="sd-setting-item">
                    <input 
                      type="checkbox" 
                      id="p_viewCert"
                      checked={formData.permissions.viewCert} 
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions, viewCert: e.target.checked}})} 
                    />
                    <label htmlFor="p_viewCert" style={{ cursor: 'pointer' }}>Quyền tra cứu & xem thông tin văn bằng</label>
                  </div>
                  <div className="sd-setting-item">
                    <input 
                      type="checkbox" 
                      id="p_createCert"
                      checked={formData.permissions.createCert} 
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions, createCert: e.target.checked}})} 
                    />
                    <label htmlFor="p_createCert" style={{ cursor: 'pointer' }}>Quyền tạo mới & phát hành văn bằng lên Blockchain</label>
                  </div>
                  <div className="sd-setting-item">
                    <input 
                      type="checkbox" 
                      id="p_editConfig"
                      checked={formData.permissions.editConfig} 
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions, editConfig: e.target.checked}})} 
                    />
                    <label htmlFor="p_editConfig" style={{ cursor: 'pointer' }}>Quyền quản trị & cài đặt cấu hình hệ thống</label>
                  </div>
                  <div className="sd-setting-item">
                    <input 
                      type="checkbox" 
                      id="p_viewLogs"
                      checked={formData.permissions.viewLogs} 
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions, viewLogs: e.target.checked}})} 
                    />
                    <label htmlFor="p_viewLogs" style={{ cursor: 'pointer' }}>Quyền xem nhật ký hệ thống & audit logs</label>
                  </div>
                </div>
              </div>
              <div className="sd-modal-footer">
                <button type="button" className="sd-btn-secondary" onClick={() => setIsAddOpen(false)}>Hủy</button>
                <button type="submit" className="sd-btn-primary">Tạo vai trò</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT ROLE MODAL (IDENTICAL FULL FORM AS CREATE MODAL) ── */}
      {isEditOpen && selectedRole && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaEdit /></div>
                <h3>Sửa vai trò: {selectedRole.name}</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsEditOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
                  <div className="sd-form-group full-width">
                    <label>Tên vai trò *</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      required 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group full-width">
                    <label>Mô tả vai trò</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.desc} 
                      onChange={(e) => setFormData({...formData, desc: e.target.value})} 
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '16px 0 12px 0' }}>Bật/Tắt các quyền truy cập</h4>
                <div className="sd-settings-list">
                  <div className="sd-setting-item">
                    <input 
                      type="checkbox" 
                      id="pe_viewCert"
                      checked={formData.permissions.viewCert} 
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions, viewCert: e.target.checked}})} 
                    />
                    <label htmlFor="pe_viewCert" style={{ cursor: 'pointer' }}>Quyền tra cứu & xem thông tin văn bằng</label>
                  </div>
                  <div className="sd-setting-item">
                    <input 
                      type="checkbox" 
                      id="pe_createCert"
                      checked={formData.permissions.createCert} 
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions, createCert: e.target.checked}})} 
                    />
                    <label htmlFor="pe_createCert" style={{ cursor: 'pointer' }}>Quyền tạo mới & phát hành văn bằng lên Blockchain</label>
                  </div>
                  <div className="sd-setting-item">
                    <input 
                      type="checkbox" 
                      id="pe_editConfig"
                      checked={formData.permissions.editConfig} 
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions, editConfig: e.target.checked}})} 
                    />
                    <label htmlFor="pe_editConfig" style={{ cursor: 'pointer' }}>Quyền quản trị & cài đặt cấu hình hệ thống</label>
                  </div>
                  <div className="sd-setting-item">
                    <input 
                      type="checkbox" 
                      id="pe_viewLogs"
                      checked={formData.permissions.viewLogs} 
                      onChange={(e) => setFormData({...formData, permissions: {...formData.permissions, viewLogs: e.target.checked}})} 
                    />
                    <label htmlFor="pe_viewLogs" style={{ cursor: 'pointer' }}>Quyền xem nhật ký hệ thống & audit logs</label>
                  </div>
                </div>
              </div>
              <div className="sd-modal-footer">
                <button type="button" className="sd-btn-secondary" onClick={() => setIsEditOpen(false)}>Hủy</button>
                <button type="submit" className="sd-btn-primary">Lưu quyền hạn</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {isDeleteOpen && selectedRole && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header" style={{ backgroundColor: '#fef2f2' }}>
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge" style={{ background: '#fee2e2', color: '#ef4444' }}><FaTrash /></div>
                <h3 style={{ color: '#991b1b' }}>Xóa vai trò</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsDeleteOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <p style={{ fontSize: '14px', color: '#334155' }}>
                Bạn có chắc chắn muốn xóa vai trò <strong>{selectedRole.name}</strong>?
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

export default SchoolRoles;
