// medicalRecordsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllMedicalRecords,
  updateMedicalRecord,
  addMedicalRecord,
  deleteMedicalRecord, 
  editMedicalRecordDescription
} = require('../controllers/medicalRecordsController');

router.get('/', getAllMedicalRecords);
router.put('/:id', updateMedicalRecord);
router.post('/', addMedicalRecord);
router.delete('/:id', deleteMedicalRecord); 
router.patch('/:id/edit-description', editMedicalRecordDescription);


module.exports = router;
