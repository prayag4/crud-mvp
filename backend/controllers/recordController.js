const { read } = require('fs');
const { readDatabase, writeDatabase } = require('../services/databaseService');
const upload = require('../services/fileUploadService');

// ✅ Get all records
const getAllRecords = (req, res) => {
    try {
        const db = readDatabase();
        res.json(db.records);
    } catch (error) {
        console.error('Error getting records:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ✅ Add a new record
const addRecord = (req, res) => {
    try {
        const db = readDatabase();
        const newRecord = {};

        // Handle file upload if present
        if (req.file) {
            newRecord.file = {
                path: req.file.path,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype
            };
        }

        // Handle all form fields
        Object.keys(req.body).forEach(key => {
            if (key.endsWith('[]')) {
                // Handle array fields (like multiSelect)
                const fieldName = key.slice(0, -2);
                newRecord[fieldName] = Array.isArray(req.body[key]) ? req.body[key] : [req.body[key]];
            } else {
                newRecord[key] = req.body[key];
            }
        });

        // Generate an ID for the new record
        newRecord.id = db.records.length ? db.records[db.records.length - 1].id + 1 : 1;

        db.records.push(newRecord);
        writeDatabase(db);
        res.status(201).json({ message: 'Record added successfully', newRecord });
    } catch (error) {
        console.error('Error adding record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getRecordByID = (req, res) => {
    try {
        const db = readDatabase();
        const recordId = parseInt(req.params.id);
        const record = db.records.find(record => record.id === recordId);
        
        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        res.json({ record });
    } catch (error) {
        console.error('Error getting record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ✅ Update a record by ID
const updateRecord = (req, res) => {
    try {
        const db = readDatabase();
        const recordId = parseInt(req.params.id);
        const updatedData = {};

        // Handle file upload if present
        if (req.file) {
            updatedData.file = {
                path: req.file.path,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype
            };
        }

        // Handle all form fields
        Object.keys(req.body).forEach(key => {
            if (key.endsWith('[]')) {
                // Handle array fields (like multiSelect)
                const fieldName = key.slice(0, -2);
                updatedData[fieldName] = Array.isArray(req.body[key]) ? req.body[key] : [req.body[key]];
            } else {
                updatedData[key] = req.body[key];
            }
        });

        const recordIndex = db.records.findIndex(record => record.id === recordId);

        if (recordIndex === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }

        db.records[recordIndex] = { ...db.records[recordIndex], ...updatedData };
        writeDatabase(db);
        res.json({ message: 'Record updated successfully', updatedRecord: db.records[recordIndex] });
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ✅ Delete a record by ID
const deleteRecord = (req, res) => {
    try {
        const db = readDatabase();
        const recordId = parseInt(req.params.id);

        const updatedRecords = db.records.filter(record => record.id !== recordId);

        if (updatedRecords.length === db.records.length) {
            return res.status(404).json({ error: 'Record not found' });
        }

        db.records = updatedRecords;
        writeDatabase(db);
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getAllRecords, addRecord, updateRecord, deleteRecord, getRecordByID };