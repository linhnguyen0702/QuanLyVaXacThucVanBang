const express = require('express');
const settingsController = require('../controllers/settings.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
const allowedRoles = authorize('admin', 'school');

router.get('/', protect, allowedRoles, settingsController.getSystemSettings);
router.put('/', protect, allowedRoles, settingsController.updateSystemSettings);

module.exports = router;
