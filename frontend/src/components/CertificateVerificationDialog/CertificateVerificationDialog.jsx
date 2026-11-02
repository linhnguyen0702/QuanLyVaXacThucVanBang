import { useEffect } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import "./CertificateVerificationDialog.css";

const CertificateVerificationDialog = ({
  isOpen,
  loading,
  error,
  result,
  query,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const certificate = result?.certificate;
  const blockchain = result?.blockchainVerification;
  const status = result?.isRevoked
    ? "revoked"
    : result?.integrityIssues?.length
      ? "mismatch"
      : result?.isPending || certificate?.status === "pending"
        ? "pending"
        : result?.verified
          ? "valid"
          : "invalid";
  const statusIcon = status === "valid" ? <FaCheckCircle /> : <FaExclamationTriangle />;
  const issueDate = certificate?.issue_date
    ? new Date(certificate.issue_date).toLocaleDateString("vi-VN")
    : "—";

  return (
    <div
      className="certificate-verification-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="certificate-verification-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="certificate-verification-title"
      >
        <header className="certificate-verification-dialog__header">
          <div>
            <h2 id="certificate-verification-title">Kết quả xác thực văn bằng</h2>
            <p>Mã tra cứu: {query || "—"}</p>
          </div>
          <button
            type="button"
            className="certificate-verification-dialog__close"
            aria-label="Đóng kết quả xác thực"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </header>

        <div className="certificate-verification-dialog__content" aria-live="polite">
          {loading ? (
            <div className="certificate-verification-dialog__state">
              <FaSpinner className="fa-spin" />
              <span>Đang kiểm tra dữ liệu văn bằng...</span>
            </div>
          ) : error ? (
            <div className="certificate-verification-dialog__error" role="alert">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          ) : certificate ? (
            <>
              <div className={`certificate-verification-status certificate-verification-status--${status}`}>
                {statusIcon}
                <div>
                  <strong>{result.message}</strong>
                  <span>Mã văn bằng: {certificate.certificate_code || "—"}</span>
                </div>
              </div>

              {result.integrityIssues?.length > 0 && (
                <div className="certificate-verification-issues" role="alert">
                  <strong>Phát hiện dữ liệu không khớp:</strong>
                  <ul>
                    {result.integrityIssues.map((issue) => <li key={issue}>{issue}</li>)}
                  </ul>
                  <p>Vui lòng liên hệ trường cấp bằng để kiểm tra, hệ thống không xác nhận văn bằng này là hợp lệ.</p>
                </div>
              )}

              <div className="certificate-verification-details">
                <div><span>Họ và tên sinh viên</span><strong>{certificate.student_name || "—"}</strong></div>
                <div><span>Mã sinh viên</span><strong>{certificate.student_code || "—"}</strong></div>
                <div><span>Trường cấp bằng</span><strong>{certificate.school_name || "—"}</strong></div>
                <div><span>Ngành đào tạo</span><strong>{certificate.major || "—"}</strong></div>
                <div><span>Loại văn bằng / Xếp loại</span><strong>{certificate.degree_type || "—"}{certificate.classification ? ` - ${certificate.classification}` : ""}{certificate.gpa !== null && certificate.gpa !== undefined ? ` (GPA: ${certificate.gpa})` : ""}</strong></div>
                <div><span>Ngày cấp / Quyết định</span><strong>{issueDate}{certificate.decision_number ? ` (${certificate.decision_number})` : ""}</strong></div>
              </div>

              {blockchain && (
                <div className="certificate-verification-blockchain">
                  <div className="certificate-verification-blockchain__heading">
                    <strong>Xác thực Blockchain — {blockchain.network}</strong>
                    <span className={blockchain.verifiedOnChain ? "is-valid" : ""}>
                      {blockchain.verifiedOnChain
                        ? "Đã xác thực on-chain"
                        : blockchain.txHash
                          ? "Đang xác nhận giao dịch"
                          : "Chỉ lưu trong CSDL"}
                    </span>
                  </div>
                  {blockchain.txHash ? (
                    <>
                      <p><span>Transaction Hash:</span><code>{blockchain.txHash}</code></p>
                      {blockchain.explorerUrl && (
                        <a href={blockchain.explorerUrl} target="_blank" rel="noopener noreferrer">
                          <FaExternalLinkAlt /> Xem giao dịch trên Sepolia Etherscan
                        </a>
                      )}
                    </>
                  ) : (
                    <p>Văn bằng chưa có giao dịch trên Blockchain.</p>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default CertificateVerificationDialog;
