const express = require('express');
const router = express.Router();
const { getAllRecords, addRecord, updateRecord, deleteRecord, getRecordByID,getImageByID } = require('../controllers/recordController');
const upload = require('../services/fileUploadService');

router.get('/', getAllRecords); // ✅ Get all records
router.get('/:id', getRecordByID); // ✅ Get all records
router.post('/', upload.single('file'), addRecord); // ✅ Add a new record
router.put('/:id', upload.single('file'), updateRecord); // ✅ Update a record by ID
router.delete('/:id', deleteRecord); // ✅ Delete a record by ID
router.get('/getImage/:id',getImageByID)

module.exports = router;
