import React from 'react';
import { 
  FaChartPie, FaUserGraduate, FaCertificate, FaShieldAlt, 
  FaCheckCircle, FaDownload 
} from 'react-icons/fa';

const SchoolStats = () => {
  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Thống kê văn bằng & Số liệu hệ thống</h2>
          <p>Báo cáo phân tích chuyên sâu về số liệu phát hành văn bằng số và lượt xác thực</p>
        </div>
        <button className="sd-btn-secondary" onClick={() => alert('Đang xuất tệp thống kê tổng hợp...')}>
          <FaDownload /> Xuất số liệu thống kê
        </button>
      </div>

      {/* Top Overview Metric Cards */}
      <div className="sd-stats-row">
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box blue"><FaCertificate /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Tổng số văn bằng đã phát hành</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">12.845</span>
              <span className="sd-stat-badge green">+12% so với năm trước</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box green"><FaShieldAlt /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Tỷ lệ xác thực Blockchain thành công</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">99.98%</span>
              <span className="sd-stat-badge green">Toàn vẹn dữ liệu</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box orange"><FaUserGraduate /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Sinh viên đã nhận bằng số</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">11.920</span>
              <span className="sd-stat-badge orange">Đã kích hoạt tài khoản</span>
            </div>
          </div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-box purple"><FaCheckCircle /></div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">Lượt tra cứu & Quét QR toàn quốc</span>
            <div className="sd-stat-val-row">
              <span className="sd-stat-value">48.210</span>
              <span className="sd-stat-badge purple">+1.2k tháng này</span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution by Department / Major */}
      <div className="sd-summary-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="sd-card">
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaChartPie style={{ color: '#0f4cf5' }} /> Phân bố số lượng văn bằng theo Ngành học
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span>Công nghệ thông tin</span>
                <span>4,250 văn bằng (33.1%)</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '33.1%', height: '100%', background: '#0f4cf5' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span>Kỹ thuật phần mềm</span>
                <span>2,980 văn bằng (23.2%)</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '23.2%', height: '100%', background: '#10b981' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span>Quản trị kinh doanh</span>
                <span>2,410 văn bằng (18.7%)</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '18.7%', height: '100%', background: '#f59e0b' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span>Ngôn ngữ Anh</span>
                <span>1,840 văn bằng (14.3%)</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '14.3%', height: '100%', background: '#8b5cf6' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Degree Level Proportion */}
        <div className="sd-card">
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Tỷ lệ Trình độ</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="sd-detail-card">
              <span className="sd-detail-label">Đại học chính quy</span>
              <span className="sd-detail-value" style={{ fontSize: '20px', color: '#0f4cf5' }}>74.5%</span>
            </div>
            <div className="sd-detail-card">
              <span className="sd-detail-label">Thạc sĩ</span>
              <span className="sd-detail-value" style={{ fontSize: '20px', color: '#10b981' }}>18.2%</span>
            </div>
            <div className="sd-detail-card">
              <span className="sd-detail-label">Tiến sĩ</span>
              <span className="sd-detail-value" style={{ fontSize: '20px', color: '#8b5cf6' }}>7.3%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolStats;
