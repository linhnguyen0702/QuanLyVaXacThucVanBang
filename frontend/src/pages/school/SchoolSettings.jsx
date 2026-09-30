import React, { useState } from 'react';
import { FaCheck, FaShieldAlt, FaEnvelope, FaDatabase } from 'react-icons/fa';

const SchoolSettings = () => {
  const [toastMessage, setToastMessage] = useState('');
  const [settings, setSettings] = useState({
    autoSyncBlockchain: true,
    network: 'polygon_mainnet',
    rpcEndpoint: 'https://polygon-rpc.com',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    sendEmailNotify: true,
    emailSmtpHost: 'smtp.gmail.com',
    emailSmtpPort: '587',
    maintenanceMode: false,
    autoBackup: 'daily'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('Đã lưu cấu hình thông số vận hành hệ thống!');
  };

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Cài đặt hệ thống & Cấu hình vận hành</h2>
          <p>Thiết lập thông số kết nối Blockchain, máy chủ Email và chế độ sao lưu</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings}>
        {/* Section 1: Blockchain Settings */}
        <div className="sd-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaShieldAlt style={{ color: '#0f4cf5' }} /> Cấu hình Mạng lưới Blockchain & Smart Contract
          </h3>
          
          <div className="sd-settings-list" style={{ marginBottom: '20px' }}>
            <div className="sd-setting-item">
              <input 
                type="checkbox" 
                id="autoSyncBlockchain"
                checked={settings.autoSyncBlockchain} 
                onChange={(e) => setSettings({...settings, autoSyncBlockchain: e.target.checked})} 
              />
              <div className="sd-setting-details">
                <label htmlFor="autoSyncBlockchain"><h5>Tự động ghi nhận mã băm văn bằng lên Blockchain</h5></label>
                <p>Mỗi khi bấm "Cấp văn bằng mới", hệ thống sẽ tự động thực hiện giao dịch ghi mã SHA-256 lên mạng Polygon.</p>
              </div>
            </div>
          </div>

          <div className="sd-form-grid">
            <div className="sd-form-group">
              <label>Mạng lưới Blockchain (Network)</label>
              <select className="sd-input" value={settings.network} onChange={(e) => setSettings({...settings, network: e.target.value})}>
                <option value="polygon_mainnet">Polygon Mainnet (Khuyên dùng)</option>
                <option value="polygon_amoy">Polygon Amoy Testnet</option>
                <option value="ethereum_mainnet">Ethereum Mainnet</option>
              </select>
            </div>
            <div className="sd-form-group">
              <label>Địa chỉ RPC Node Endpoint</label>
              <input 
                type="text" 
                className="sd-input" 
                value={settings.rpcEndpoint} 
                onChange={(e) => setSettings({...settings, rpcEndpoint: e.target.value})} 
              />
            </div>
            <div className="sd-form-group full-width">
              <label>Địa chỉ Hợp đồng thông minh (Smart Contract Address)</label>
              <input 
                type="text" 
                className="sd-input" 
                style={{ fontFamily: 'monospace' }}
                value={settings.contractAddress} 
                onChange={(e) => setSettings({...settings, contractAddress: e.target.value})} 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Email Notification Settings */}
        <div className="sd-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaEnvelope style={{ color: '#10b981' }} /> Máy chủ Email & Thông báo tự động
          </h3>

          <div className="sd-settings-list" style={{ marginBottom: '20px' }}>
            <div className="sd-setting-item">
              <input 
                type="checkbox" 
                id="sendEmailNotify"
                checked={settings.sendEmailNotify} 
                onChange={(e) => setSettings({...settings, sendEmailNotify: e.target.checked})} 
              />
              <div className="sd-setting-details">
                <label htmlFor="sendEmailNotify"><h5>Gửi Email tự động cho sinh viên khi phát hành bằng</h5></label>
                <p>Sinh viên sẽ nhận được email chứa đường link tra cứu kèm mã QR văn bằng số ngay sau khi phát hành.</p>
              </div>
            </div>
          </div>

          <div className="sd-form-grid">
            <div className="sd-form-group">
              <label>Email SMTP Host</label>
              <input 
                type="text" 
                className="sd-input" 
                value={settings.emailSmtpHost} 
                onChange={(e) => setSettings({...settings, emailSmtpHost: e.target.value})} 
              />
            </div>
            <div className="sd-form-group">
              <label>Cổng SMTP Port</label>
              <input 
                type="text" 
                className="sd-input" 
                value={settings.emailSmtpPort} 
                onChange={(e) => setSettings({...settings, emailSmtpPort: e.target.value})} 
              />
            </div>
          </div>
        </div>

        {/* Section 3: Backup & Maintenance */}
        <div className="sd-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaDatabase style={{ color: '#8b5cf6' }} /> Bảo trì & Sao lưu dữ liệu
          </h3>

          <div className="sd-settings-list">
            <div className="sd-setting-item">
              <input 
                type="checkbox" 
                id="maintenanceMode"
                checked={settings.maintenanceMode} 
                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} 
              />
              <div className="sd-setting-details">
                <label htmlFor="maintenanceMode"><h5>Bật chế độ bảo trì hệ thống (Maintenance Mode)</h5></label>
                <p style={{ color: '#ef4444' }}>Tạm thời khóa cổng tra cứu công khai đối với người dùng ngoài (Chỉ Admin đăng nhập được).</p>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="sd-btn-primary">
          <FaCheck /> Lưu toàn bộ cấu hình
        </button>
      </form>

      {toastMessage && (
        <div className="sd-toast success">
          <FaCheck /> {toastMessage}
        </div>
      )}
    </div>
  );
};

export default SchoolSettings;
