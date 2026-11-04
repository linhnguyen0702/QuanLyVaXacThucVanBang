const nodemailer = require('nodemailer');

const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => {
  const entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return entities[character];
});

exports.sendCertificateEmail = async ({ email, studentName, certificate, status }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;
  if (!emailUser || !emailPassword) {
    console.error(`Certificate ${certificate.certificate_code} email notification skipped: email is not configured.`);
    return false;
  }

  const isIssued = status === 'issued';
  const subject = isIssued
    ? `Văn bằng ${certificate.certificate_code} đã được phê duyệt`
    : `Đã tạo văn bằng ${certificate.certificate_code}`;
  const statusMessage = isIssued
    ? 'Văn bằng của bạn đã được phê duyệt thành công.'
    : 'Văn bằng của bạn đã được tạo và đang chờ phê duyệt.';
  const safeStudentName = escapeHtml(studentName);
  const safeCertificateCode = escapeHtml(certificate.certificate_code);
  const safeHash = escapeHtml(certificate.certificate_hash);
  const safeQrUrl = escapeHtml(certificate.qr_code_url);

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: emailUser,
        pass: emailPassword
      }
    });

    await transporter.sendMail({
      from: `"Hệ thống Văn bằng số" <${emailUser}>`,
      to: email,
      subject,
      text: [
        `Xin chào ${studentName},`,
        statusMessage,
        `Số hiệu văn bằng: ${certificate.certificate_code}`,
        `Mã SHA-256: ${certificate.certificate_hash}`,
        `Mã QR: ${certificate.qr_code_url}`
      ].join('\n'),
      html: `
        <p>Xin chào ${safeStudentName},</p>
        <p>${statusMessage}</p>
        <p><strong>Số hiệu văn bằng:</strong> ${safeCertificateCode}</p>
        <p><strong>Mã SHA-256:</strong> <code>${safeHash}</code></p>
        <p><strong>Mã QR xác thực văn bằng:</strong></p>
        <img src="${safeQrUrl}" alt="Mã QR văn bằng ${safeCertificateCode}" width="200" height="200" />
      `
    });
    return true;
  } catch (error) {
    console.error(`Failed to send certificate ${certificate.certificate_code} email to ${email}:`, error);
    return false;
  }
};
