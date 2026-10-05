const express = require('express');
const router = express.Router();
const certController = require('../controllers/certificate.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', certController.getCertificates);
router.get('/stats/summary', certController.getStatsSummary);
router.get('/:id', certController.getCertificateById);

router.post('/', protect, authorize('admin', 'school', 'officer'), certController.createCertificate);
router.put('/:id', protect, authorize('admin', 'school', 'officer'), certController.updateCertificate);
router.put('/:id/revoke', protect, authorize('admin', 'school'), certController.revokeCertificate);
router.delete('/:id', protect, authorize('admin'), certController.deleteCertificate);

module.exports = router;
