const db = require('../config/database');

const getRoleNotifications = async (user) => {
  if (user.role === 'student') {
    const [rows] = await db.query(
      `SELECT c.id, c.certificate_code, c.student_name, c.major, c.status,
              c.updated_at, c.revoke_reason, s.school_name
       FROM certificates c
       INNER JOIN students st ON st.id = c.student_id
       LEFT JOIN schools s ON s.id = c.school_id
       WHERE st.email = ?
         AND c.status IN ('pending', 'issued', 'revoked')
         AND c.updated_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
       ORDER BY c.updated_at DESC
       LIMIT 100`,
      [user.email]
    );
    return rows;
  }

  if (!['admin', 'school', 'officer'].includes(user.role)) {
    return [];
  }

  const schoolScope = user.role === 'school'
    ? 'AND c.school_id IN (SELECT id FROM schools WHERE user_id = ?)'
    : '';
  const params = user.role === 'school' ? [user.id] : [];
  const [rows] = await db.query(
    `SELECT c.id, c.certificate_code, c.student_name, c.major, c.status,
            c.updated_at, c.revoke_reason, s.school_name
     FROM certificates c
     LEFT JOIN schools s ON s.id = c.school_id
     WHERE c.status IN ('pending', 'issued', 'revoked')
       AND c.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       ${schoolScope}
     ORDER BY c.updated_at DESC
     LIMIT 100`,
    params
  );
  return rows;
};

const toNotification = (certificate) => {
  const statusLabels = {
    pending: {
      title: 'Văn bằng đang chờ xác thực',
      type: 'issue'
    },
    issued: {
      title: 'Văn bằng đã được xác thực',
      type: 'blockchain'
    },
    revoked: {
      title: 'Văn bằng đã bị thu hồi',
      type: 'alert'
    }
  };
  const status = statusLabels[certificate.status];
  const school = certificate.school_name ? ` tại ${certificate.school_name}` : '';
  const reason = certificate.status === 'revoked' && certificate.revoke_reason
    ? ` Lý do: ${certificate.revoke_reason}`
    : '';

  return {
    id: `certificate-${certificate.id}-${certificate.status}-${new Date(certificate.updated_at).getTime()}`,
    title: status.title,
    desc: `${certificate.certificate_code} - ${certificate.student_name}, ngành ${certificate.major}${school}.${reason}`,
    time: certificate.updated_at,
    type: status.type,
    unread: true
  };
};

const getNotifications = async (user) => {
  const certificates = await getRoleNotifications(user);
  const notifications = certificates.map(toNotification);
  if (!notifications.length) return [];

  const keys = notifications.map((notification) => notification.id);
  const placeholders = keys.map(() => '?').join(', ');
  const [states] = await db.query(
    `SELECT notification_key, is_read, is_dismissed
     FROM notification_states
     WHERE user_id = ? AND notification_key IN (${placeholders})`,
    [user.id, ...keys]
  );
  const stateByKey = new Map(states.map((state) => [state.notification_key, state]));

  return notifications
    .map((notification) => {
      const state = stateByKey.get(notification.id);
      return {
        ...notification,
        unread: state ? !Boolean(state.is_read) : true,
        dismissed: state ? Boolean(state.is_dismissed) : false
      };
    })
    .filter((notification) => !notification.dismissed);
};

exports.listNotifications = async (req, res, next) => {
  try {
    const notifications = await getNotifications(req.user);
    res.json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter((notification) => notification.unread).length,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    await db.query(
      `INSERT INTO notification_states (user_id, notification_key, is_read)
       VALUES (?, ?, TRUE)
       ON DUPLICATE KEY UPDATE is_read = TRUE`,
      [req.user.id, req.params.key]
    );
    res.json({ success: true, message: 'Đã đánh dấu thông báo đã đọc.' });
  } catch (error) {
    next(error);
  }
};

exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    const notifications = await getNotifications(req.user);
    if (notifications.length) {
      const values = notifications.map(() => '(?, ?, TRUE)').join(', ');
      const params = notifications.flatMap((notification) => [req.user.id, notification.id]);
      await db.query(
        `INSERT INTO notification_states (user_id, notification_key, is_read)
         VALUES ${values}
         ON DUPLICATE KEY UPDATE is_read = TRUE`,
        params
      );
    }
    res.json({ success: true, message: 'Đã đánh dấu tất cả thông báo đã đọc.' });
  } catch (error) {
    next(error);
  }
};

exports.dismissNotification = async (req, res, next) => {
  try {
    await db.query(
      `INSERT INTO notification_states (user_id, notification_key, is_dismissed)
       VALUES (?, ?, TRUE)
       ON DUPLICATE KEY UPDATE is_dismissed = TRUE`,
      [req.user.id, req.params.key]
    );
    res.json({ success: true, message: 'Đã ẩn thông báo.' });
  } catch (error) {
    next(error);
  }
};
