const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  addPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');

router.get('/', getAllPatients);
router.post('/', addPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);


module.exports = router;
