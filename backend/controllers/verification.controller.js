const db = require('../config/database');
const { verifyCertificateOnChain, verifyCertificateByHashOnChain, isBlockchainReady } = require('../config/blockchain');
const { getPagination } = require('../utils/pagination');

// @desc    Verify certificate by code, hash or QR URL
// @route   POST /api/verification/verify
// @access  Public
exports.verifyCertificate = async (req, res, next) => {
  try {
    const { query, method = 'certificate_code' } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã văn bằng, mã sinh viên hoặc chuỗi mã băm Hash để xác thực.'
      });
    }

    const cleanQuery = query.trim();

    // Query certificate from database
    const [rows] = await db.query(
      `SELECT c.*, 
              s.school_name, s.school_code, s.website as school_website, s.logo_url as school_logo, s.wallet_address as school_wallet,
              p.program_name, p.program_code, p.education_system,
              st.date_of_birth, st.id_number, st.gender, st.place_of_birth
       FROM certificates c
       LEFT JOIN schools s ON c.school_id = s.id
       LEFT JOIN programs p ON c.program_id = p.id
       LEFT JOIN students st ON c.student_id = st.id
       WHERE c.certificate_code = ? OR c.certificate_hash = ? OR c.student_code = ? OR c.blockchain_tx_hash = ?`,
      [cleanQuery, cleanQuery, cleanQuery, cleanQuery]
    );

    const isSuccess = rows.length > 0;
    const certificate = isSuccess ? rows[0] : null;

    // Log verification attempt to database
    try {
      await db.query(
        `INSERT INTO verification_logs (certificate_id, certificate_code, verifier_ip, verifier_user_agent, verification_method, verification_result)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          certificate ? certificate.id : null,
          certificate ? certificate.certificate_code : cleanQuery,
          req.ip || '127.0.0.1',
          req.headers['user-agent'] || 'Browser',
          method,
          isSuccess
        ]
      );
    } catch (logErr) {
      console.error('Failed to log verification attempt:', logErr.message);
    }

    if (!isSuccess) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Không tìm thấy thông tin văn bằng trong hệ thống hoặc mã tra cứu không hợp lệ.'
      });
    }

    const isRevoked = certificate.status === 'revoked';
    const txHash = certificate.blockchain_tx_hash;

    // ── Xác thực on-chain từ Blockchain Sepolia (nếu blockchain khả dụng) ──
    let onChainResult = null;
    let onChainVerified = false;
    if (isBlockchainReady() && certificate.status === 'issued') {
      try {
        // Thử xác thực theo mã số văn bằng trước
        onChainResult = await verifyCertificateOnChain(certificate.certificate_code);
        if (onChainResult) {
          onChainVerified = onChainResult.isValid;
        } else if (certificate.certificate_hash) {
          // Fallback: xác thực theo hash
          const hashResult = await verifyCertificateByHashOnChain(certificate.certificate_hash);
          if (hashResult) {
            onChainVerified = hashResult.isValid;
            onChainResult = hashResult;
          }
        }
      } catch (chainErr) {
        console.error('On-chain verification error (non-fatal):', chainErr.message);
      }
    }

    res.json({
      success: true,
      verified: !isRevoked,
      isRevoked,
      message: isRevoked
        ? 'Van bang da bi THU HOI!'
        : 'Van bang HOP LE & da duoc xac thuc thanh cong!',
      certificate,
      blockchainVerification: {
        network: 'Ethereum Sepolia Testnet',
        txHash: txHash || null,
        verifiedOnChain: txHash ? onChainVerified : false,
        onChainStatus: onChainResult ? (onChainResult.isValid ? 'VALID' : 'REVOKED') : (txHash ? 'PENDING_CHECK' : 'NOT_ON_CHAIN'),
        contractAddress: process.env.CONTRACT_ADDRESS || null,
        explorerUrl: txHash ? `https://sepolia.etherscan.io/tx/${txHash}` : null,
        contractExplorerUrl: process.env.CONTRACT_ADDRESS
          ? `https://sepolia.etherscan.io/address/${process.env.CONTRACT_ADDRESS}`
          : null,
        blockchainEnabled: isBlockchainReady()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get verification logs history
// @route   GET /api/verification/logs
// @access  Private / Public
exports.getVerificationLogs = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const [logs] = await db.query(
      `SELECT vl.*, c.student_name, c.major, c.status as cert_status
       FROM verification_logs vl
       LEFT JOIN certificates c ON vl.certificate_id = c.id
       ORDER BY vl.verified_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [count] = await db.query('SELECT COUNT(*) as total FROM verification_logs');

    res.json({
      success: true,
      total: count[0] ? count[0].total : 0,
      page,
      limit,
      logs
    });
  } catch (error) {
    next(error);
  }
};
