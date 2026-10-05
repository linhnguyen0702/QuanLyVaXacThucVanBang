const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudentById);

router.post('/', protect, authorize('admin', 'school', 'officer'), studentController.createStudent);
router.put('/:id', protect, authorize('admin', 'school', 'officer'), studentController.updateStudent);
router.delete('/:id', protect, authorize('admin', 'school'), studentController.deleteStudent);

module.exports = router;
