import { useEffect } from "react";
import {
  FaExclamationTriangle,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import CertificateBlockchainInfo from "../CertificateBlockchainInfo";
import CertificateDiplomaPreview from "../CertificateDiplomaPreview";
import { formatDateDisplay } from "../../utils/dateUtils";
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
              {result.integrityIssues?.length > 0 && (
                <div className="certificate-verification-issues" role="alert">
                  <strong>Phát hiện dữ liệu không khớp:</strong>
                  <ul>
                    {result.integrityIssues.map((issue) => <li key={issue}>{issue}</li>)}
                  </ul>
                  <p>Vui lòng liên hệ trường cấp bằng để kiểm tra, hệ thống không xác nhận văn bằng này là hợp lệ.</p>
                </div>
              )}

              <div className="certificate-verification-diploma">
                <CertificateDiplomaPreview certificate={{
                  code: certificate.certificate_code,
                  schoolName: certificate.school_name,
                  degreeType: certificate.degree_type,
                  major: certificate.major,
                  studentName: certificate.student_name,
                  studentCode: certificate.student_code,
                  dateOfBirth: formatDateDisplay(certificate.date_of_birth),
                  classification: certificate.classification,
                  educationMode: certificate.education_mode,
                  issueDate: formatDateDisplay(certificate.issue_date),
                  status: certificate.status,
                  certificateHash: certificate.certificate_hash
                }} />
              </div>

              {blockchain && (
                <CertificateBlockchainInfo
                  title={`Xác thực Blockchain — ${blockchain.network}`}
                  certificate={{
                    status: certificate.status,
                    blockchain_confirmed: blockchain.verifiedOnChain,
                    blockchain_network: blockchain.network,
                    blockchain_tx_hash: blockchain.txHash,
                    blockchain_explorer_url: blockchain.explorerUrl,
                    blockchain_block_number: blockchain.blockNumber,
                    blockchain_timestamp: blockchain.timestamp
                  }}
                />
              )}
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default CertificateVerificationDialog;
