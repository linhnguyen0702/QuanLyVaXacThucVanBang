const db = require('../config/database');

const DEFAULT_SETTINGS = {
  autoSyncBlockchain: true,
  network: 'polygon_mainnet',
  rpcEndpoint: 'https://polygon-rpc.com',
  contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
  sendEmailNotify: true,
  emailSmtpHost: 'smtp.gmail.com',
  emailSmtpPort: '587',
  maintenanceMode: false,
  autoBackup: 'daily'
};

const BOOLEAN_FIELDS = ['autoSyncBlockchain', 'sendEmailNotify', 'maintenanceMode'];
const STRING_FIELDS = [
  'network',
  'rpcEndpoint',
  'contractAddress',
  'emailSmtpHost',
  'emailSmtpPort',
  'autoBackup'
];

const validateSettings = (settings) => {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return 'Dữ liệu cấu hình không hợp lệ.';
  }

  for (const field of BOOLEAN_FIELDS) {
    if (typeof settings[field] !== 'boolean') {
      return `Giá trị cấu hình "${field}" không hợp lệ.`;
    }
  }

  for (const field of STRING_FIELDS) {
    if (typeof settings[field] !== 'string') {
      return `Giá trị cấu hình "${field}" không hợp lệ.`;
    }
  }

  if (!['polygon_mainnet', 'polygon_amoy', 'ethereum_mainnet'].includes(settings.network)) {
    return 'Mạng Blockchain không hợp lệ.';
  }
  if (
    settings.rpcEndpoint &&
    !/^https?:\/\/\S+$/i.test(settings.rpcEndpoint.trim())
  ) {
    return 'Địa chỉ RPC phải là URL HTTP hoặc HTTPS hợp lệ.';
  }
  if (
    settings.contractAddress &&
    !/^0x[a-fA-F0-9]{40}$/.test(settings.contractAddress.trim())
  ) {
    return 'Địa chỉ Smart Contract phải có định dạng 0x và 40 ký tự thập lục phân.';
  }
  if (
    !/^\d+$/.test(settings.emailSmtpPort) ||
    Number(settings.emailSmtpPort) < 1 ||
    Number(settings.emailSmtpPort) > 65535
  ) {
    return 'Cổng SMTP phải nằm trong khoảng 1 đến 65535.';
  }
  if (!['daily', 'weekly', 'monthly'].includes(settings.autoBackup)) {
    return 'Chu kỳ sao lưu không hợp lệ.';
  }

  return null;
};

exports.getSystemSettings = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT setting_key, setting_value FROM system_settings'
    );
    const settings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      if (Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, row.setting_key)) {
        settings[row.setting_key] = row.setting_value;
      }
    }

    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

exports.updateSystemSettings = async (req, res, next) => {
  const validationError = validateSettings(req.body);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    for (const key of [...BOOLEAN_FIELDS, ...STRING_FIELDS]) {
      await connection.query(
        `INSERT INTO system_settings (setting_key, setting_value, updated_by)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           setting_value = VALUES(setting_value),
           updated_by = VALUES(updated_by),
           updated_at = CURRENT_TIMESTAMP`,
        [key, JSON.stringify(req.body[key]), req.user.id]
      );
    }
    await connection.commit();
    const settings = Object.fromEntries(
      [...BOOLEAN_FIELDS, ...STRING_FIELDS].map((key) => [key, req.body[key]])
    );
    res.json({
      success: true,
      message: 'Đã lưu cấu hình hệ thống.',
      settings
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};
