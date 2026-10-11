/**
 * Chuyển đổi ngày tháng an toàn sang định dạng YYYY-MM-DD cho thẻ <input type="date">
 * Không bị trừ lùi 1 ngày do lệch múi giờ UTC/GMT+7.
 */
export const formatDateForInput = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    // Nếu đã là chuỗi YYYY-MM-DD thuần túy
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    // Nếu là ISO chuỗi có múi giờ hoặc T (ví dụ: 2026-10-10T17:00:00.000Z)
    if (trimmed.includes('T')) {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    return trimmed.split('T')[0];
  }
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const year = dateVal.getFullYear();
    const month = String(dateVal.getMonth() + 1).padStart(2, '0');
    const day = String(dateVal.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '';
};

/**
 * Lấy ngày hôm nay theo múi giờ địa phương (YYYY-MM-DD)
 */
export const getTodayDateInput = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Định dạng ngày hiển thị dd/mm/yyyy chuẩn tiếng Việt
 */
export const formatDateDisplay = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    // Nếu là YYYY-MM-DD thuần túy
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split('-');
      return `${day}/${month}/${year}`;
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return trimmed;
  }
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    return dateVal.toLocaleDateString('vi-VN');
  }
  return String(dateVal);
};
