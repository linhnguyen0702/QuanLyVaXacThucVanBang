const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verification.controller');

router.post('/verify', verifyController.verifyCertificate);
router.get('/logs', verifyController.getVerificationLogs);

module.exports = router;
