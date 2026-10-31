const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
const allowedRoles = authorize('admin', 'school', 'officer', 'student');

router.get('/', protect, allowedRoles, notificationController.listNotifications);
router.patch('/read-all', protect, allowedRoles, notificationController.markAllNotificationsRead);
router.patch('/:key/read', protect, allowedRoles, notificationController.markNotificationRead);
router.delete('/:key', protect, allowedRoles, notificationController.dismissNotification);

module.exports = router;
