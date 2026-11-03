import React, { useEffect, useState } from 'react';
import {
  FaCheck,
  FaShieldAlt,
  FaEnvelope,
  FaDatabase,
  FaEdit,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import { api } from '../../services/api';

const DEFAULT_SETTINGS = {
  autoSyncBlockchain: true,
  network: 'polygon_mainnet',
  rpcEndpoint: 'https://polygon-rpc.com',
  contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
  sendEmailNotify: true,
  emailSmtpHost: 'smtp.gmail.com',
  emailSmtpPort: '587',
  maintenanceMode: false,
  autoBackup: 'daily'
};

const SchoolSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        const response = await api.getSystemSettings();
        if (!response?.success || !response.settings) {
          throw new Error(response?.message || 'Không thể tải cấu hình hệ thống.');
        }
        if (isMounted) {
          setSettings(response.settings);
          setSavedSettings(response.settings);
        }
      } catch (error) {
        console.error('Failed to load system settings:', error);
        if (isMounted) setErrorMessage(error.message || 'Không thể tải cấu hình hệ thống.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateSetting = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCancel = () => {
    setSettings(savedSettings);
    setErrorMessage('');
    setToastMessage('');
    setIsEditing(false);
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setToastMessage('');
    try {
      const response = await api.updateSystemSettings(settings);
      if (!response?.success || !response.settings) {
        throw new Error(response?.message || 'Không thể lưu cấu hình hệ thống.');
      }
      setSettings(response.settings);
      setSavedSettings(response.settings);
      setIsEditing(false);
      setToastMessage(response.message || 'Đã lưu cấu hình hệ thống.');
    } catch (error) {
      console.error('Failed to save system settings:', error);
      setErrorMessage(error.message || 'Không thể lưu cấu hình hệ thống. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sd-view">
        <div className="sd-page-header">
          <div className="sd-page-title-area">
            <h2>Cài đặt hệ thống &amp; Cấu hình vận hành</h2>
            <p>Thiết lập thông số kết nối Blockchain, máy chủ Email và chế độ sao lưu</p>
          </div>
        </div>
        <div className="sd-card" style={{ textAlign: 'center', color: '#64748b' }}>
          <FaSpinner className="wallet-connect-spinner" /> Đang tải cấu hình...
        </div>
      </div>
    );
  }

  if (errorMessage && !savedSettings) {
    return (
      <div className="sd-view">
        <div className="sd-page-header">
          <div className="sd-page-title-area">
            <h2>Cài đặt hệ thống &amp; Cấu hình vận hành</h2>
            <p>Thiết lập thông số kết nối Blockchain, máy chủ Email và chế độ sao lưu</p>
          </div>
        </div>
        <div className="sd-card" role="alert" style={{ color: '#b91c1c' }}>
          <FaExclamationTriangle /> {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="sd-view">
      <div className="sd-page-header">
        <div className="sd-page-title-area">
          <h2>Cài đặt hệ thống &amp; Cấu hình vận hành</h2>
          <p>Thiết lập thông số kết nối Blockchain, máy chủ Email và chế độ sao lưu</p>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            padding: '12px 16px',
            color: '#b91c1c',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px'
          }}
        >
          <FaExclamationTriangle /> {errorMessage}
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        <fieldset
          disabled={!isEditing || isSaving}
          style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
        >
          {/* Section 1: Blockchain Settings */}
          <div className="sd-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaShieldAlt style={{ color: '#0f4cf5' }} /> Cấu hình Mạng lưới Blockchain &amp; Smart Contract
            </h3>

            <div className="sd-settings-list" style={{ marginBottom: '20px' }}>
              <div className="sd-setting-item">
                <input
                  type="checkbox"
                  id="autoSyncBlockchain"
                  name="autoSyncBlockchain"
                  checked={settings.autoSyncBlockchain}
                  onChange={updateSetting}
                />
                <div className="sd-setting-details">
                  <label htmlFor="autoSyncBlockchain"><h5>Tự động ghi nhận mã băm văn bằng lên Blockchain</h5></label>
                  <p>Mỗi khi bấm "Cấp văn bằng mới", hệ thống sẽ tự động thực hiện giao dịch ghi mã SHA-256 lên mạng Polygon.</p>
                </div>
              </div>
            </div>

            <div className="sd-form-grid">
              <div className="sd-form-group">
                <label htmlFor="network">Mạng lưới Blockchain (Network)</label>
                <select id="network" name="network" className="sd-input" value={settings.network} onChange={updateSetting}>
                  <option value="polygon_mainnet">Polygon Mainnet (Khuyên dùng)</option>
                  <option value="polygon_amoy">Polygon Amoy Testnet</option>
                  <option value="ethereum_mainnet">Ethereum Mainnet</option>
                </select>
              </div>
              <div className="sd-form-group">
                <label htmlFor="rpcEndpoint">Địa chỉ RPC Node Endpoint</label>
                <input
                  id="rpcEndpoint"
                  name="rpcEndpoint"
                  type="text"
                  className="sd-input"
                  value={settings.rpcEndpoint}
                  onChange={updateSetting}
                />
              </div>
              <div className="sd-form-group full-width">
                <label htmlFor="contractAddress">Địa chỉ Hợp đồng thông minh (Smart Contract Address)</label>
                <input
                  id="contractAddress"
                  name="contractAddress"
                  type="text"
                  className="sd-input"
                  style={{ fontFamily: 'monospace' }}
                  value={settings.contractAddress}
                  onChange={updateSetting}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Email Notification Settings */}
          <div className="sd-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaEnvelope style={{ color: '#10b981' }} /> Máy chủ Email &amp; Thông báo tự động
            </h3>

            <div className="sd-settings-list" style={{ marginBottom: '20px' }}>
              <div className="sd-setting-item">
                <input
                  type="checkbox"
                  id="sendEmailNotify"
                  name="sendEmailNotify"
                  checked={settings.sendEmailNotify}
                  onChange={updateSetting}
                />
                <div className="sd-setting-details">
                  <label htmlFor="sendEmailNotify"><h5>Gửi Email tự động cho sinh viên khi phát hành bằng</h5></label>
                  <p>Sinh viên sẽ nhận được email chứa đường link tra cứu kèm mã QR văn bằng số ngay sau khi phát hành.</p>
                </div>
              </div>
            </div>

            <div className="sd-form-grid">
              <div className="sd-form-group">
                <label htmlFor="emailSmtpHost">Email SMTP Host</label>
                <input
                  id="emailSmtpHost"
                  name="emailSmtpHost"
                  type="text"
                  className="sd-input"
                  value={settings.emailSmtpHost}
                  onChange={updateSetting}
                />
              </div>
              <div className="sd-form-group">
                <label htmlFor="emailSmtpPort">Cổng SMTP Port</label>
                <input
                  id="emailSmtpPort"
                  name="emailSmtpPort"
                  type="text"
                  className="sd-input"
                  value={settings.emailSmtpPort}
                  onChange={updateSetting}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Backup & Maintenance */}
          <div className="sd-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaDatabase style={{ color: '#8b5cf6' }} /> Bảo trì &amp; Sao lưu dữ liệu
            </h3>

            <div className="sd-settings-list">
              <div className="sd-setting-item">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={updateSetting}
                />
                <div className="sd-setting-details">
                  <label htmlFor="maintenanceMode"><h5>Bật chế độ bảo trì hệ thống (Maintenance Mode)</h5></label>
                  <p style={{ color: '#ef4444' }}>Tạm thời khóa cổng tra cứu công khai đối với người dùng ngoài (Chỉ Admin đăng nhập được).</p>
                </div>
              </div>
            </div>
          </div>
        </fieldset>

        {isEditing ? (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="submit" className="sd-btn-primary" disabled={isSaving}>
              {isSaving ? <FaSpinner className="wallet-connect-spinner" /> : <FaCheck />}
              {isSaving ? ' Đang lưu...' : ' Lưu toàn bộ cấu hình'}
            </button>
            <button type="button" className="sd-btn-secondary" onClick={handleCancel} disabled={isSaving}>
              <FaTimes /> Hủy
            </button>
          </div>
        ) : (
          <button type="button" className="sd-btn-primary" onClick={() => setIsEditing(true)}>
            <FaEdit /> Chỉnh sửa cấu hình
          </button>
        )}
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
