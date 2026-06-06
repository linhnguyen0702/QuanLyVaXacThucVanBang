import React, { useState } from 'react';
import { FaQrcode, FaSearch, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './VerificationPage.css';

const VerificationPage = () => {
  const [activeTab, setActiveTab] = useState('qr');
  const [certificateCode, setCertificateCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerify = () => {
    // Simulate verification
    setVerificationResult({
      valid: true,
      data: {
        name: 'Nguyễn Văn An',
        dob: '15/06/2000',
        studentId: '012345678901',
        major: 'Kỹ sư Công nghệ thông tin',
        university: 'Trường Đại học Công nghệ',
        issueDate: '20/05/2024',
        degreeNumber: '1234/QĐ-ĐHCN',
        education: 'Chính quy',
        gender: 'Nam',
        certificateId: 'UNI2024-000123',
        blockchain: 'Ethereum Mainnet',
        hash: '0x7e3a...af9b2f1c',
        block: '195,456,789',
        timestamp: '20/05/2024 14:32:30 (UTC+7)'
      }
    });
  };

  return (
    <div className="verification-page">
      <div className="verification-header">
        <div className="container">
          <h1>XÁC THỰC VĂN BẰNG</h1>
          <p>Kiểm tra tính xác thực của văn bằng, chứng chỉ được cấp trên hệ thống Blockchain</p>
        </div>
      </div>

      <div className="container">
        <div className="verification-content">
          <div className="verification-card">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'qr' ? 'active' : ''}`}
                onClick={() => setActiveTab('qr')}
              >
                Quét mã QR
              </button>
              <button 
                className={`tab ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
              >
                Nhập mã xác thực
              </button>
            </div>

            <div className="tab-content-area">
              {activeTab === 'qr' && (
                <div className="qr-tab">
                  <div className="qr-scanner">
                    <FaQrcode />
                  </div>
                  <p>Quét mã QR trên văn bằng để kiểm tra tính xác thực</p>
                  <button className="btn btn-secondary">Tải ảnh lên</button>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="code-tab">
                  <p className="instruction-text">
                    Nhập mã xác thực (VD: UNI2024-000123)
                  </p>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Nhập mã xác thực..."
                      value={certificateCode}
                      onChange={(e) => setCertificateCode(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-primary btn-verify" onClick={handleVerify}>
                    <FaSearch />
                    Xác thực ngay
                  </button>
                </div>
              )}
            </div>
          </div>

          {verificationResult && (
            <div className="result-card">
              <div className={`result-header ${verificationResult.valid ? 'valid' : 'invalid'}`}>
                {verificationResult.valid ? (
                  <>
                    <FaCheckCircle className="result-icon" />
                    <div>
                      <h2>VĂN BẰNG HỢP LỆ</h2>
                      <p>Văn bằng này đã được xác thực trên Blockchain và thông tin hoàn toàn khớp với dữ liệu gốc</p>
                    </div>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="result-icon" />
                    <div>
                      <h2>VĂN BẰNG KHÔNG HỢP LỆ</h2>
                      <p>Văn bằng này không tồn tại trên hệ thống</p>
                    </div>
                  </>
                )}
              </div>

              {verificationResult.valid && (
                <>
                  <div className="result-section">
                    <h3>THÔNG TIN VĂN BẰNG</h3>
                    <div className="info-grid">
                      <div className="info-row">
                        <span className="label">Họ và tên</span>
                        <span className="value">{verificationResult.data.name}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Ngày sinh</span>
                        <span className="value">{verificationResult.data.dob}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Số CMND/CCCD</span>
                        <span className="value">{verificationResult.data.studentId}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Văn bằng</span>
                        <span className="value">{verificationResult.data.major}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Ngành đào tạo</span>
                        <span className="value">{verificationResult.data.major}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Hình thức đào tạo</span>
                        <span className="value">{verificationResult.data.education}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Đơn vị cấp</span>
                        <span className="value">{verificationResult.data.university}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Ngày cấp</span>
                        <span className="value">{verificationResult.data.issueDate}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Số quyết định</span>
                        <span className="value">{verificationResult.data.degreeNumber}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Giới tính</span>
                        <span className="value">{verificationResult.data.gender}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Xác nhận trên tích</span>
                        <span className="value verified">
                          <FaCheckCircle /> Đã xác thực
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">Trạng thái</span>
                        <span className="value valid-status">Hợp lệ</span>
                      </div>
                      <div className="info-row full-width">
                        <span className="label">Số hiệu văn bằng</span>
                        <span className="value">{verificationResult.data.certificateId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="result-section">
                    <h3>THÔNG TIN BLOCKCHAIN</h3>
                    <div className="info-grid">
                      <div className="info-row">
                        <span className="label">Blockchain</span>
                        <span className="value">{verificationResult.data.blockchain}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Mã Hash</span>
                        <span className="value hash">{verificationResult.data.hash}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Số block</span>
                        <span className="value">{verificationResult.data.block}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Thời gian ghi nhận</span>
                        <span className="value">{verificationResult.data.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="result-actions">
                    <button className="btn btn-primary">
                      Xem chi tiết văn bằng
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
