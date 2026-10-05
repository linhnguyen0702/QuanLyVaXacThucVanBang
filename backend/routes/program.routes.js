const express = require('express');
const router = express.Router();
const programController = require('../controllers/program.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', programController.getPrograms);

router.post('/', protect, authorize('admin', 'school'), programController.createProgram);
router.put('/:id', protect, authorize('admin', 'school'), programController.updateProgram);
router.delete('/:id', protect, authorize('admin', 'school'), programController.deleteProgram);

module.exports = router;
