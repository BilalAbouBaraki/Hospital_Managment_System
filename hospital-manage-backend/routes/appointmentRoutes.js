const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  updateAppointmentTime,
} = require('../controllers/appointmentController');

router.get('/', getAllAppointments);
router.post('/', addAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);
router.patch('/:id/status', updateAppointmentStatus); 
router.patch('/:id/time', updateAppointmentTime); 

module.exports = router;