import React from 'react';
import { FaCheckCircle, FaClock, FaExternalLinkAlt, FaLink } from 'react-icons/fa';
import './CertificateBlockchainInfo.css';

const CertificateBlockchainInfo = ({ certificate, title = 'Thông tin lưu trữ Blockchain' }) => {
  const isRecorded = Boolean(certificate.blockchain_confirmed);
  const isApproved = ['issued', 'revoked'].includes(certificate.status);
  const hasTransaction = Boolean(certificate.blockchain_tx_hash);
  const hasBlockNumber = certificate.blockchain_block_number !== null
    && certificate.blockchain_block_number !== undefined;
  const hasBlockDetails = hasBlockNumber || Boolean(certificate.blockchain_timestamp);

  let statusMessage = 'Văn bằng đang chờ phê duyệt.';
  if (isRecorded) {
    statusMessage = certificate.status === 'revoked'
      ? 'Giao dịch phát hành đã được xác nhận trên Blockchain; văn bằng hiện đã bị thu hồi.'
      : 'Đã chứng thực thành công trên Blockchain.';
  } else if (certificate.status === 'revoked') {
    statusMessage = 'Văn bằng đã bị thu hồi trong hệ thống; chưa xác nhận được receipt phát hành trên Blockchain.';
  } else if (hasTransaction) {
    statusMessage = 'Đã có mã giao dịch nhưng chưa xác nhận được receipt từ node Blockchain.';
  } else if (isApproved) {
    statusMessage = 'Đã phê duyệt trong hệ thống nhưng chưa có giao dịch Blockchain.';
  }

  return (
    <section className="certificate-blockchain-info">
      <h4 className="certificate-blockchain-title">
        <FaLink /> {title}
      </h4>
      <div className="certificate-blockchain-grid">
        <span className="certificate-blockchain-label">Trạng thái:</span>
        <span className={`certificate-blockchain-value status ${isRecorded ? 'confirmed' : 'pending'}`}>
          {isRecorded ? <FaCheckCircle /> : <FaClock />}
          {statusMessage}
        </span>

        <span className="certificate-blockchain-label">Mạng lưới:</span>
        <span className="certificate-blockchain-value">
          {certificate.blockchain_network || 'Chưa có thông tin mạng lưới'}
        </span>

        {hasTransaction && (
          <>
            <span className="certificate-blockchain-label">Transaction Hash:</span>
            <span className="certificate-blockchain-value transaction">
              <code>{certificate.blockchain_tx_hash}</code>
              {certificate.blockchain_explorer_url && (
                <a
                  href={certificate.blockchain_explorer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Xem giao dịch Blockchain"
                  title="Xem giao dịch trên Blockchain Explorer"
                >
                  <FaExternalLinkAlt />
                </a>
              )}
            </span>
          </>
        )}

        {(isRecorded || hasBlockDetails) && (
          <>
            <span className="certificate-blockchain-label">Block ghi nhận:</span>
            <span className="certificate-blockchain-value mono">
              {certificate.blockchain_block_number ?? '—'}
            </span>

            <span className="certificate-blockchain-label">Thời gian ghi nhận:</span>
            <span className="certificate-blockchain-value">
              {certificate.blockchain_timestamp
                ? new Date(certificate.blockchain_timestamp).toLocaleString('vi-VN')
                : '—'}
            </span>
          </>
        )}
      </div>
    </section>
  );
};

export default CertificateBlockchainInfo;
