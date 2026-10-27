const express = require('express');
const {
  bookAppointment,
  listMyAppointments,
  cancelAppointment,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('student'), bookAppointment);
router.get('/', authorize('student', 'counselor'), listMyAppointments);
router.patch('/:id/cancel', authorize('student', 'counselor'), cancelAppointment);
router.patch('/:id/status', authorize('counselor'), updateAppointmentStatus);

module.exports = router;
