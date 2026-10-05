const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/audit', protect, authorize('admin'), logController.getAuditLogs);
router.get('/verification', logController.getVerificationLogs);

module.exports = router;
