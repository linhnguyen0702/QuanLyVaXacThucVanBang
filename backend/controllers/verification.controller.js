const db = require('../config/database');
const { getProvider, verifyCertificateOnChain, verifyCertificateByHashOnChain, isBlockchainReady } = require('../config/blockchain');
const { getPagination } = require('../utils/pagination');

// @desc    Verify certificate by code, hash or QR URL
// @route   POST /api/verification/verify
// @access  Public
exports.verifyCertificate = async (req, res, next) => {
  try {
    const { query, method = 'certificate_code' } = req.body;

    if (typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã văn bằng, mã sinh viên hoặc chuỗi mã băm Hash để xác thực.'
      });
    }

    const cleanQuery = query.trim();
    const recordVerificationLog = async (certificate, verified) => {
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
            verified
          ]
        );
      } catch (logErr) {
        console.error('Failed to log verification attempt:', logErr.message);
      }
    };

    const [rows] = await db.query(
      `SELECT c.*,
              s.school_name AS certificate_school_name, s.school_code AS certificate_school_code,
              s.website as school_website, s.logo_url as school_logo, s.wallet_address as school_wallet,
              p.program_name, p.program_code, p.education_system,
              p.school_id AS program_school_id,
              st.date_of_birth, st.id_number, st.gender, st.place_of_birth,
              st.student_code AS registered_student_code,
              st.full_name AS registered_student_name,
              st.school_id AS registered_school_id,
              st.department AS registered_major,
              (
                SELECT profile_school.id
                FROM schools profile_school
                WHERE LOWER(TRIM(profile_school.school_name)) = LOWER(TRIM(st.school_name))
                   OR LOWER(TRIM(profile_school.school_code)) = LOWER(TRIM(st.school_name))
                ORDER BY profile_school.id
                LIMIT 1
              ) AS profile_school_id,
              (
                SELECT profile_school.school_name
                FROM schools profile_school
                WHERE LOWER(TRIM(profile_school.school_name)) = LOWER(TRIM(st.school_name))
                   OR LOWER(TRIM(profile_school.school_code)) = LOWER(TRIM(st.school_name))
                ORDER BY profile_school.id
                LIMIT 1
              ) AS profile_school_name,
              (
                SELECT profile_school.school_code
                FROM schools profile_school
                WHERE LOWER(TRIM(profile_school.school_name)) = LOWER(TRIM(st.school_name))
                   OR LOWER(TRIM(profile_school.school_code)) = LOWER(TRIM(st.school_name))
                ORDER BY profile_school.id
                LIMIT 1
              ) AS profile_school_code,
              registered_school.school_name AS registered_school_name,
              registered_school.school_code AS registered_school_code,
              CASE
                WHEN c.certificate_code = ? THEN 'certificate_code'
                WHEN c.certificate_hash = ? THEN 'certificate_hash'
                WHEN c.blockchain_tx_hash = ? THEN 'transaction_hash'
                ELSE 'student_code'
              END AS match_type
       FROM certificates c
       LEFT JOIN schools s ON c.school_id = s.id
       LEFT JOIN programs p ON c.program_id = p.id
       LEFT JOIN students st ON c.student_id = st.id
       LEFT JOIN schools registered_school ON st.school_id = registered_school.id
       WHERE c.certificate_code = ? OR c.certificate_hash = ? OR c.student_code = ? OR c.blockchain_tx_hash = ?
       ORDER BY CASE
         WHEN c.certificate_code = ? THEN 0
         WHEN c.certificate_hash = ? THEN 1
         WHEN c.blockchain_tx_hash = ? THEN 2
         ELSE 3
       END,
       CASE c.status WHEN 'issued' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END,
       c.id DESC
       LIMIT 2`,
      [
        cleanQuery, cleanQuery, cleanQuery,
        cleanQuery, cleanQuery, cleanQuery, cleanQuery,
        cleanQuery, cleanQuery, cleanQuery
      ]
    );

    if (rows.length === 0) {
      await recordVerificationLog(null, false);
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Không tìm thấy thông tin văn bằng trong hệ thống hoặc mã tra cứu không hợp lệ.'
      });
    }

    if (
      rows[0].match_type === 'student_code' &&
      rows.length > 1 &&
      rows[1].match_type === 'student_code'
    ) {
      await recordVerificationLog(null, false);
      return res.status(409).json({
        success: false,
        verified: false,
        ambiguous: true,
        message: 'Mã sinh viên có nhiều văn bằng. Vui lòng nhập chính xác mã văn bằng để tránh hiển thị nhầm hồ sơ.'
      });
    }

    const {
      match_type: matchType,
      certificate_school_name: certificateSchoolName,
      certificate_school_code: certificateSchoolCode,
      registered_school_name: registeredSchoolName,
      registered_school_code: registeredSchoolCode,
      registered_student_code: registeredStudentCode,
      registered_student_name: registeredStudentName,
      registered_school_id: registeredSchoolId,
      registered_major: registeredMajor,
      profile_school_id: profileSchoolId,
      profile_school_name: profileSchoolName,
      profile_school_code: profileSchoolCode,
      program_school_id: programSchoolId,
      ...certificate
    } = rows[0];
    const certificateStudentCode = certificate.student_code;
    const certificateStudentName = certificate.student_name;
    const certificateMajor = certificate.major;
    const normalize = (value) => String(value || '').trim().toLocaleLowerCase('vi').replace(/\s+/g, ' ');
    const integrityIssues = [];
    const studentSchoolId = profileSchoolId || registeredSchoolId;
    const studentSchoolName = profileSchoolName || registeredSchoolName;
    const studentSchoolCode = profileSchoolCode || registeredSchoolCode;
    const sameSchool = Number(certificate.school_id) === Number(studentSchoolId)
      || (
        certificateSchoolCode &&
        studentSchoolCode &&
        normalize(certificateSchoolCode) === normalize(studentSchoolCode)
      )
      || (
        certificateSchoolName &&
        studentSchoolName &&
        normalize(certificateSchoolName) === normalize(studentSchoolName)
      );
    certificate.student_code = registeredStudentCode || certificate.student_code;
    certificate.student_name = registeredStudentName || certificate.student_name;
    certificate.major = registeredMajor || certificate.major;
    certificate.school_name = studentSchoolName || certificateSchoolName || null;
    certificate.school_code = studentSchoolCode || certificateSchoolCode || null;

    if (!registeredStudentCode || certificateStudentCode !== registeredStudentCode) {
      integrityIssues.push('Mã sinh viên trên văn bằng không khớp hồ sơ sinh viên.');
    }
    if (!registeredStudentName || normalize(certificateStudentName) !== normalize(registeredStudentName)) {
      integrityIssues.push('Họ tên trên văn bằng không khớp hồ sơ sinh viên.');
    }
    if (
      registeredSchoolId === null ||
      !sameSchool ||
      (profileSchoolId !== null && Number(profileSchoolId) !== Number(registeredSchoolId))
    ) {
      integrityIssues.push('Trường cấp trên văn bằng không khớp trường trong hồ sơ sinh viên.');
    }
    if (!registeredMajor || normalize(certificateMajor) !== normalize(registeredMajor)) {
      integrityIssues.push('Ngành đào tạo trên văn bằng không khớp hồ sơ sinh viên.');
    }
    if (
      certificate.program_id &&
      Number(certificate.school_id) !== Number(programSchoolId)
    ) {
      integrityIssues.push('Chương trình đào tạo không thuộc trường cấp văn bằng.');
    }

    const isRevoked = certificate.status === 'revoked';
    const isPending = certificate.status === 'pending';
    const verified = certificate.status === 'issued' && !isRevoked && integrityIssues.length === 0;
    const txHash = certificate.blockchain_tx_hash;

    let onChainResult = null;
    let onChainVerified = false;
    let blockchainBlockNumber = null;
    let blockchainTimestamp = null;
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

    if (txHash) {
      const provider = getProvider();
      if (provider) {
        try {
          const receipt = await provider.getTransactionReceipt(txHash);
          if (receipt && Number(receipt.status) === 1) {
            const block = await provider.getBlock(receipt.blockNumber);
            if (block) {
              blockchainBlockNumber = receipt.blockNumber;
              blockchainTimestamp = new Date(Number(block.timestamp) * 1000).toISOString();
            }
          }
        } catch (chainErr) {
          console.error('Could not read certificate transaction block details:', chainErr.message);
        }
      }
    }

    await recordVerificationLog(certificate, verified);

    res.json({
      success: true,
      verified,
      isRevoked,
      isPending,
      matchType,
      integrityIssues,
      message: isRevoked
        ? 'Văn bằng đã bị thu hồi.'
        : integrityIssues.length > 0
          ? 'Thông tin văn bằng không khớp hồ sơ gốc. Chưa thể xác nhận hợp lệ.'
          : isPending
            ? 'Văn bằng đang chờ duyệt, chưa thể xác thực.'
            : verified
              ? 'Văn bằng hợp lệ, thông tin đã khớp hồ sơ.'
              : 'Văn bằng chưa đủ điều kiện xác thực.',
      certificate,
      blockchainVerification: {
        network: 'Ethereum Sepolia Testnet',
        txHash: txHash || null,
        blockNumber: blockchainBlockNumber,
        timestamp: blockchainTimestamp,
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
