import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import React from 'react';
import { createRoot } from 'react-dom/client';
import CertificateDiplomaPreview from '../components/CertificateDiplomaPreview';
import { formatDateDisplay } from './dateUtils';

const formatCertificateDate = (value) => {
  if (typeof value === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value.trim())) {
    return value.trim();
  }
  return formatDateDisplay(value);
};

const toDiplomaCertificate = (certificate) => ({
  code: certificate.certificate_code || certificate.certificateCode || certificate.code || certificate.id,
  schoolName: certificate.school_name || certificate.schoolName || certificate.school,
  degreeType: certificate.degree_type || certificate.degreeType || 'Đại học',
  major: certificate.major || certificate.title?.replace(/^Cử nhân\s+/i, ''),
  studentName: certificate.student_name || certificate.studentName,
  studentCode: certificate.student_code || certificate.studentCode,
  dateOfBirth: formatCertificateDate(
    certificate.student_date_of_birth || certificate.date_of_birth || certificate.dateOfBirth
  ),
  classification: certificate.classification,
  educationMode: certificate.education_mode || certificate.educationMode,
  issueDate: formatCertificateDate(certificate.issue_date || certificate.issueDate),
  status: certificate.certificateStatus
    || (certificate.status === 'blockchain' ? 'issued' : certificate.status),
  certificateHash: certificate.certificate_hash
    || certificate.certificateHash
    || certificate.hash
});

const renderDiplomaCanvas = async (certificate) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '520px';
  container.style.height = '570px';
  container.style.background = '#fff';
  container.style.zIndex = '-1';
  document.body.appendChild(container);

  const root = createRoot(container);
  try {
    root.render(<CertificateDiplomaPreview certificate={certificate} />);
    await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
    await document.fonts?.ready;

    const diploma = container.querySelector('.certificate-diploma');
    if (!diploma) {
      throw new Error('Không thể dựng phôi văn bằng để tạo PDF.');
    }

    return await html2canvas(diploma, {
      backgroundColor: '#fffdf5',
      scale: 3,
      width: diploma.offsetWidth,
      height: diploma.offsetHeight,
      logging: false
    });
  } finally {
    root.unmount();
    container.remove();
  }
};

export const downloadCertificatePdf = async (certificate) => {
  if (!certificate) {
    throw new Error('Không có dữ liệu văn bằng để tải.');
  }

  const diploma = toDiplomaCertificate(certificate);
  if (!diploma.code) {
    throw new Error('Văn bằng chưa có mã số để tạo tên tệp.');
  }

  const canvas = await renderDiplomaCanvas(diploma);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 30;
  const ratio = canvas.width / canvas.height;
  let imageWidth = pageWidth - margin * 2;
  let imageHeight = imageWidth / ratio;

  if (imageHeight > pageHeight - margin * 2) {
    imageHeight = pageHeight - margin * 2;
    imageWidth = imageHeight * ratio;
  }

  pdf.addImage(
    canvas.toDataURL('image/png'),
    'PNG',
    (pageWidth - imageWidth) / 2,
    (pageHeight - imageHeight) / 2,
    imageWidth,
    imageHeight
  );
  pdf.save(`Van-bang-${String(diploma.code).replace(/[^a-zA-Z0-9_-]/g, '-')}.pdf`);
};
