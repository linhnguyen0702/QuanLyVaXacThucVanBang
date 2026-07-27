import React, { useState } from 'react';
import { FaPlus, FaBook, FaUserGraduate, FaCheckCircle, FaDatabase, FaSearch, FaDownload, FaEye, FaEdit } from 'react-icons/fa';

const PROGRAMS_DATA = [
  { code: 'CTDT-CNTT-01', name: 'Công nghệ thông tin', sub: 'Chương trình chuẩn', dept: 'Khoa Công nghệ thông tin', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '2.856' },
  { code: 'CTDT-ATPM-01', name: 'Kỹ thuật phần mềm', sub: 'Chương trình chuẩn', dept: 'Khoa Công nghệ thông tin', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '1.928' },
  { code: 'CTDT-HTTT-01', name: 'Hệ thống thông tin', sub: 'Chương trình chuẩn', dept: 'Khoa Công nghệ thông tin', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '1.256' },
  { code: 'CTDT-ATTT-01', name: 'An toàn thông tin', sub: 'Chương trình tiên tiến', dept: 'Khoa Công nghệ thông tin', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '842' },
  { code: 'CTDT-QTKD-01', name: 'Quản trị kinh doanh', sub: 'Chương trình chuẩn', dept: 'Khoa Kinh tế', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '3.102' },
  { code: 'CTDT-KT-01', name: 'Kế toán', sub: 'Chương trình chuẩn', dept: 'Khoa Kinh tế', system: 'Đại học chính quy', duration: '4 năm', status: 'active', count: '2.348' },
  { code: 'CTDT-NNANH-01', name: 'Ngôn ngữ Anh', sub: 'Chương trình chuẩn', dept: 'Khoa Ngoại ngữ', system: 'Đại học chính quy', duration: '4 năm', status: 'paused', count: '512' },
  { code: 'CTDT-LUAT-01', name: 'Luật', sub: 'Chương trình chuẩn', dept: 'Khoa Luật', system: 'Đại học chính quy', duration: '4 năm', status: 'completed', count: '1.856' },
  { code: 'CTDT-DTVT-01', name: 'Điện tử viễn thông', sub: 'Chương trình cũ', dept: 'Khoa Điện - Điện tử', system: 'Đại học chính quy', duration: '4 năm', status: 'stopped', count: '324' },
  { code: 'CTDT-COKHI-01', name: 'Cơ khí chế tạo máy', sub: 'Chương trình cũ', dept: 'Khoa Cơ khí', system: 'Đại học chính quy', duration: '4.5 năm', status: 'stopped', count: '218' }
];

const SchoolPrograms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [systemFilter, setSystemFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return { label: 'Đang đào tạo', class: 'green' };
      case 'paused': return { label: 'Tạm dừng', class: 'orange' };
      case 'completed': return { label: 'Đã hoàn tất', class: 'purple' };
      case 'stopped': return { label: 'Đã dừng', class: 'red' };
      default: return { label: 'Không xác định', class: 'gray' };
    }
  };

  const filteredPrograms = PROGRAMS_DATA.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === '' || p.dept === deptFilter;
    const matchesSystem = systemFilter === '' || p.system === systemFilter;
    const matchesStatus = statusFilter === '' || p.status === statusFilter;
    return matchesSearch && matchesDept && matchesSystem && matchesStatus;
  });

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Chương trình đào tạo</h2>
          <p>Quản lý các chương trình đào tạo của nhà trường</p>
        </div>
        <button className="sd-btn-primary">
          <FaPlus /> Thêm chương trình
        </button>
      </div>

      <div className="sd-stats-row">
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box blue"><FaBook /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Tổng số chương trình</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">128</span>
              <span className="sd-stat-badge green">+8 chương trình mới</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box green"><FaUserGraduate /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Chương trình đang đào tạo</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">96</span>
              <span className="sd-stat-badge green">75.0% tổng số</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box orange"><FaCheckCircle /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Chương trình đã dừng</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">12</span>
              <span className="sd-stat-badge orange">9.4% tổng số</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box purple"><FaDatabase /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Chương trình đã hoàn tất</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">20</span>
              <span className="sd-stat-badge purple">15.6% tổng số</span>
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
              <option value="Khoa Luật">Khoa Luật</option>
              <option value="Khoa Điện - Điện tử">Khoa Điện - Điện tử</option>
              <option value="Khoa Cơ khí">Khoa Cơ khí</option>
            </select>
            <select className="sd-select" value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)}>
              <option value="">Tất cả hệ đào tạo</option>
              <option value="Đại học chính quy">Đại học chính quy</option>
            </select>
            <select className="sd-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang đào tạo</option>
              <option value="paused">Tạm dừng</option>
              <option value="completed">Đã hoàn tất</option>
              <option value="stopped">Đã dừng</option>
            </select>
          </div>
          <div className="sd-filter-right">
            <button className="sd-btn-secondary"><FaCheckCircle /> Bộ lọc</button>
            <button className="sd-btn-secondary"><FaDownload /> Xuất Excel</button>
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
                <th>Thời gian đào tạo</th>
                <th>Trạng thái</th>
                <th>Số văn bằng đã cấp</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.map((row, idx) => {
                const stat = getStatusLabel(row.status);
                return (
                  <tr key={idx}>
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
                      <button className="sd-action-btn" title="Xem"><FaEye /></button>
                      <button className="sd-action-btn" title="Sửa"><FaEdit /></button>
                      <button className="sd-action-btn" title="Thêm"><FaPlus /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="sd-pagination">
          <span className="sd-pagination-info">
            Hiển thị 1 - {filteredPrograms.length} trong tổng số {filteredPrograms.length} chương trình
          </span>
          <div className="sd-pagination-controls">
            <div className="sd-pg-list">
              <button className="sd-pg-btn" disabled>&lt;</button>
              <button className="sd-pg-btn active">1</button>
              <button className="sd-pg-btn">2</button>
              <span className="sd-pg-dots">...</span>
              <button className="sd-pg-btn">13</button>
              <button className="sd-pg-btn">&gt;</button>
            </div>
            <select className="sd-select" style={{ width: '110px', padding: '6px 10px' }}>
              <option>10 / trang</option>
              <option>20 / trang</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolPrograms;
