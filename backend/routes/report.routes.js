const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin', 'school', 'officer'));
router.get('/', reportController.getReports);
router.post('/preview', reportController.previewReport);
router.post('/generate', reportController.createReport);
router.get('/:id/data', reportController.getReportData);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
