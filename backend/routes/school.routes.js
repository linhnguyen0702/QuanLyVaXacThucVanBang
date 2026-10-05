const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/school.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', schoolController.getSchools);
router.get('/:id', schoolController.getSchoolById);

router.post('/', protect, authorize('admin'), schoolController.createSchool);
router.put('/:id', protect, authorize('admin', 'school'), schoolController.updateSchool);
router.delete('/:id', protect, authorize('admin'), schoolController.deleteSchool);

module.exports = router;
