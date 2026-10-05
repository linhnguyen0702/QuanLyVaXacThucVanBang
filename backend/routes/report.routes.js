const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', reportController.getReports);
router.post('/', protect, reportController.createReport);

module.exports = router;
