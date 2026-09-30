import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaUser, FaSearch, 
  FaTimes, FaCheck 
} from 'react-icons/fa';

const INITIAL_USERS = [
  {
    id: 1,
    fullName: 'Nguyễn Văn An',
    email: 'annv@school.edu.vn',
    department: 'Phòng Đào tạo',
    role: 'admin',
    roleLabel: 'Quản trị viên',
    status: 'active',
    lastLogin: '2026-09-30 08:30'
  },
  {
    id: 2,
    fullName: 'Phạm Thị D',
    email: 'dpt@school.edu.vn',
    department: 'Phòng Đào tạo',
    role: 'officer',
    roleLabel: 'Cán bộ nhập liệu',
    status: 'active',
    lastLogin: '2026-09-29 14:15'
  },
  {
    id: 3,
    fullName: 'Hoàng Văn E',
    email: 'ehv@school.edu.vn',
    department: 'Khoa CNTT',
    role: 'viewer',
    roleLabel: 'Nhân viên tra cứu',
    status: 'inactive',
    lastLogin: '2026-08-12 10:00'
  }
];

const SchoolUsers = () => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('school_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    department: 'Phòng Đào tạo',
    role: 'officer',
    status: 'active'
  });

  useEffect(() => {
    localStorage.setItem('school_users', JSON.stringify(users));
  }, [users]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="sd-badge purple">Quản trị viên</span>;
      case 'officer':
        return <span className="sd-badge orange">Cán bộ nhập liệu</span>;
      case 'viewer':
        return <span className="sd-badge green">Nhân viên tra cứu</span>;
      default:
        return <span className="sd-badge gray">Người dùng</span>;
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      department: 'Phòng Đào tạo',
      role: 'officer',
      status: 'active'
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      alert('Vui lòng nhập họ tên và email!');
      return;
    }
    const roleLabels = { admin: 'Quản trị viên', officer: 'Cán bộ nhập liệu', viewer: 'Nhân viên tra cứu' };
    const newUser = {
      id: Date.now(),
      ...formData,
      roleLabel: roleLabels[formData.role] || 'Người dùng',
      lastLogin: 'Chưa đăng nhập'
    };
    setUsers([newUser, ...users]);
    setIsAddOpen(false);
    showToast('Thêm người dùng mới thành công!');
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({ ...user, password: '' });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const roleLabels = { admin: 'Quản trị viên', officer: 'Cán bộ nhập liệu', viewer: 'Nhân viên tra cứu' };
    setUsers(users.map(u => u.id === selectedUser.id ? { 
      ...u, 
      fullName: formData.fullName, 
      email: formData.email, 
      department: formData.department,
      role: formData.role,
      roleLabel: roleLabels[formData.role] || u.roleLabel,
      status: formData.status
    } : u));
    setIsEditOpen(false);
    showToast('Cập nhật người dùng thành công!');
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setIsDeleteOpen(false);
    showToast(`Đã xóa tài khoản ${selectedUser.fullName}`);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === '' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Quản lý người dùng</h2>
          <p>Danh sách các cán bộ, nhân viên được cấp quyền truy cập hệ thống</p>
        </div>
        <button className="sd-btn-primary" onClick={handleOpenAdd}>
          <FaPlus /> Thêm người dùng
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
                placeholder="Tìm theo tên người dùng, email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="sd-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="officer">Cán bộ nhập liệu</option>
              <option value="viewer">Nhân viên tra cứu</option>
            </select>
          </div>
        </div>

        <div className="sd-table-container">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Tên người dùng</th>
                <th>Email</th>
                <th>Bộ phận</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Đăng nhập cuối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="sd-td-bold">{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.department}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      {user.status === 'active' ? (
                        <span className="sd-badge green">Hoạt động</span>
                      ) : (
                        <span className="sd-badge red">Tạm khóa</span>
                      )}
                    </td>
                    <td>{user.lastLogin}</td>
                    <td className="sd-actions">
                      <button className="sd-action-btn" title="Chỉnh sửa" onClick={() => handleOpenEdit(user)}>
                        <FaEdit />
                      </button>
                      <button className="sd-action-btn" title="Xóa" style={{color: '#ef4444'}} onClick={() => handleOpenDelete(user)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE USER MODAL ── */}
      {isAddOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaUser /></div>
                <h3>Thêm người dùng mới</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsAddOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
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
                    <label>Email truy cập *</label>
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
                    <label>Mật khẩu khởi tạo</label>
                    <input 
                      type="password" 
                      className="sd-input" 
                      placeholder="••••••••"
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Bộ phận / Phòng ban</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.department} 
                      onChange={(e) => setFormData({...formData, department: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Vai trò</label>
                    <select className="sd-input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                      <option value="admin">Quản trị viên (Admin)</option>
                      <option value="officer">Cán bộ nhập liệu</option>
                      <option value="viewer">Nhân viên tra cứu</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Trạng thái</label>
                    <select className="sd-input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm khóa</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="sd-modal-footer">
                <button type="button" className="sd-btn-secondary" onClick={() => setIsAddOpen(false)}>Hủy</button>
                <button type="submit" className="sd-btn-primary">Tạo người dùng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL (IDENTICAL FULL FORM AS CREATE MODAL) ── */}
      {isEditOpen && selectedUser && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header">
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge"><FaEdit /></div>
                <h3>Sửa người dùng {selectedUser.fullName}</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsEditOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="sd-modal-body">
                <div className="sd-form-grid">
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
                    <label>Email truy cập *</label>
                    <input 
                      type="email" 
                      className="sd-input" 
                      required
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Đổi mật khẩu mới (Nếu có)</label>
                    <input 
                      type="password" 
                      className="sd-input" 
                      placeholder="Để trống nếu không đổi..."
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Bộ phận / Phòng ban</label>
                    <input 
                      type="text" 
                      className="sd-input" 
                      value={formData.department} 
                      onChange={(e) => setFormData({...formData, department: e.target.value})} 
                    />
                  </div>
                  <div className="sd-form-group">
                    <label>Vai trò</label>
                    <select className="sd-input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                      <option value="admin">Quản trị viên (Admin)</option>
                      <option value="officer">Cán bộ nhập liệu</option>
                      <option value="viewer">Nhân viên tra cứu</option>
                    </select>
                  </div>
                  <div className="sd-form-group">
                    <label>Trạng thái</label>
                    <select className="sd-input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm khóa</option>
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

      {/* ── DELETE MODAL ── */}
      {isDeleteOpen && selectedUser && (
        <div className="sd-modal-overlay">
          <div className="sd-modal">
            <div className="sd-modal-header" style={{ backgroundColor: '#fef2f2' }}>
              <div className="sd-modal-title">
                <div className="sd-modal-icon-badge" style={{ background: '#fee2e2', color: '#ef4444' }}><FaTrash /></div>
                <h3 style={{ color: '#991b1b' }}>Xóa tài khoản người dùng</h3>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setIsDeleteOpen(false)}><FaTimes /></button>
            </div>
            <div className="sd-modal-body">
              <p style={{ fontSize: '14px', color: '#334155' }}>
                Bạn có chắc chắn muốn xóa tài khoản của <strong>{selectedUser.fullName}</strong> ({selectedUser.email})?
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

export default SchoolUsers;
