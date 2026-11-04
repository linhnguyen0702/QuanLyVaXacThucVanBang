import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import './CertificateDiplomaPreview.css';

const DEGREE_TITLES = {
  'Đại học': 'CỬ NHÂN',
  'Thạc sĩ': 'THẠC SĨ',
  'Tiến sĩ': 'TIẾN SĨ',
  'Cao đẳng': 'CAO ĐẲNG',
  'Chứng chỉ': 'CHỨNG CHỈ'
};

const CertificateDiplomaPreview = ({ certificate }) => {
  const degreeType = certificate.degreeType || 'Đại học';
  const diplomaTitle = DEGREE_TITLES[degreeType] || String(degreeType).toLocaleUpperCase('vi');
  const isIssued = ['issued', 'revoked'].includes(certificate.status);
  const qrValue = certificate.certificateHash || certificate.code;

  return (
    <div className="certificate-diploma">
      <div className="certificate-diploma-watermark">
        <FaShieldAlt size={160} />
      </div>

      <header className="certificate-diploma-header">
        <div className="certificate-diploma-nation">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div className="certificate-diploma-motto">Độc lập - Tự do - Hạnh phúc</div>
        <div className="certificate-diploma-school">{certificate.schoolName || '—'}</div>
      </header>

      <div className="certificate-diploma-issue-label">CẤP</div>
      <div className="certificate-diploma-title">BẰNG {diplomaTitle}</div>
      <div className="certificate-diploma-major">{certificate.major || '—'}</div>

      <div className="certificate-diploma-body">
        <div className="certificate-diploma-detail">
          Họ và tên: <strong>{certificate.studentName || '—'}</strong>
        </div>
        {certificate.studentCode && (
          <div className="certificate-diploma-detail">
            Mã số sinh viên: <strong>{certificate.studentCode}</strong>
          </div>
        )}
        <div className="certificate-diploma-detail">
          Sinh ngày: <strong>{certificate.dateOfBirth || '—'}</strong>
        </div>
        <div className="certificate-diploma-detail">
          Xếp loại tốt nghiệp: <strong>{certificate.classification || '—'}</strong>
        </div>
        <div className="certificate-diploma-detail">
          Hình thức đào tạo: <strong>{certificate.educationMode || '—'}</strong>
        </div>
      </div>

      <footer className="certificate-diploma-footer">
        <div className="certificate-diploma-meta">
          <div><span>Số hiệu:</span><strong>{certificate.code || '—'}</strong></div>
          <div><span>Ngày cấp:</span><strong>{certificate.issueDate || '—'}</strong></div>
        </div>
        {isIssued && qrValue && (
          <div className="certificate-diploma-qr" aria-label={`Mã QR văn bằng ${certificate.code}`}>
            <QRCodeSVG value={qrValue} size={76} level="H" title={`Mã QR văn bằng ${certificate.code}`} />
          </div>
        )}
      </footer>
    </div>
  );
};

export default CertificateDiplomaPreview;
