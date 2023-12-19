const fs = require('fs').promises; // Importing the 'promises' module from the 'fs' library for asynchronous file system operations
const path = require('path'); // Importing the 'path' module for working with file paths

// Function to read medical records from a JSON file
const readMedicalRecordsFromFile = async () => {
  try {
    const filePath = path.join("../hospital-manage/src/JSON/MedicalRecords.json"); // Constructing the file path
    const data = await fs.readFile(filePath, 'utf8'); // Reading file data as UTF-8

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data); // Parsing JSON data and returning the result
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Medical records file not found. Creating an empty file.');
      await writeMedicalRecordsToFile([]); // Creating an empty file if it doesn't exist
      return [];
    }

    console.error('Error reading medical records file:', error.message); // Handling errors during file reading
    return [];
  }
};

// Function to write medical records to a JSON file
const writeMedicalRecordsToFile = async (medicalRecords) => {
  try {
    const filePath = path.join("../hospital-manage/src/JSON/MedicalRecords.json"); // Constructing the file path
    await fs.writeFile(filePath, JSON.stringify(medicalRecords, null, 2), 'utf8'); // Writing formatted JSON data to the file
  } catch (error) {
    console.error('Error writing medical records file:', error.message); // Handling errors during file writing
  }
};

// Function to generate a unique ID for a new medical record
const generateUniqueID = (medicalRecords) => {
  const uniqueNumber = medicalRecords.length + 1; // Calculating a unique number based on the number of existing medical records
  return `MDR-${uniqueNumber}`; // Constructing a unique medical record ID
};

// Function to get all medical records (with optional search functionality)
const getAllMedicalRecords = async (req, res) => {
  try {
    const medicalRecords = await readMedicalRecordsFromFile(); // Reading medical records from the file

    // Check if there is a search query
    const { q } = req.query;
    if (q) {
      // Filtering medical records based on the search query
      const filteredMedicalRecords = medicalRecords.filter(record => (
        // Searching by various medical record attributes
        record.username.toLowerCase().includes(q.toLowerCase()) ||
        record.doctor.toLowerCase().includes(q.toLowerCase()) ||
        record.condition.toLowerCase().includes(q.toLowerCase()) ||
        record.description.toLowerCase().includes(q.toLowerCase()) ||
        record.time.includes(q)
      ));
      res.json(filteredMedicalRecords); // Responding with filtered medical records
    } else {
      // Sorting medical records by time and ID
      const sortedMedicalRecords = medicalRecords.sort((a, b) => (
        new Date(b.time) - new Date(a.time) || b.id.localeCompare(a.id)
      ));

      res.json(sortedMedicalRecords); // Responding with sorted medical records
    }
  } catch (error) {
    console.error('Error reading medical records:', error.message); // Handling errors during medical record retrieval
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to edit the description of a medical record
const editMedicalRecordDescription = async (req, res) => {
  try {
    const medicalRecordId = req.params.id;
    const { description } = req.body;

    const medicalRecords = await readMedicalRecordsFromFile();
    const index = medicalRecords.findIndex((record) => record.id === medicalRecordId);

    if (index !== -1) {
      medicalRecords[index] = {
        ...medicalRecords[index],
        description,
      };

      await writeMedicalRecordsToFile(medicalRecords);

      res.json(medicalRecords[index]);
    } else {
      res.status(404).json({ error: 'Medical Record not found' });
    }
  } catch (error) {
    console.error('Error editing medical record description:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to update an existing medical record
const updateMedicalRecord = async (req, res) => {
  const medicalRecordId = req.params.id;
  const { username, doctor, condition, description, time, finishedTime, duration } = req.body;

  const medicalRecords = await readMedicalRecordsFromFile();
  const index = medicalRecords.findIndex((record) => record.id === medicalRecordId);

  if (index !== -1) {
    medicalRecords[index] = {
      ...medicalRecords[index],
      username,
      doctor,
      condition,
      description,
      time,
      finishedTime,
      duration
    };

    await writeMedicalRecordsToFile(medicalRecords);

    res.json(medicalRecords[index]);
  } else {
    res.status(404).json({ error: 'Medical Record not found' });
  }
};

// Function to add a new medical record
const addMedicalRecord = async (req, res) => {
  const { appointmentId, username, doctor, condition, description, time, finishedTime, duration } = req.body;

  const medicalRecords = await readMedicalRecordsFromFile();
  const newMedicalRecord = {
    id: appointmentId,
    username,
    doctor,
    condition,
    description,
    time,
    finishedTime,
    duration
  };

  medicalRecords.push(newMedicalRecord);

  await writeMedicalRecordsToFile(medicalRecords);

  res.json(newMedicalRecord);
};

// Function to delete an existing medical record
const deleteMedicalRecord = async (req, res) => {
  const medicalRecordId = req.params.id;

  const medicalRecords = await readMedicalRecordsFromFile();
  const updatedMedicalRecords = medicalRecords.filter((record) => record.id !== medicalRecordId);

  if (medicalRecords.length !== updatedMedicalRecords.length) {
    await writeMedicalRecordsToFile(updatedMedicalRecords);
    res.json({ message: 'Medical Record deleted successfully' });
  } else {
    res.status(404).json({ error: 'Medical Record not found' });
  }
};

// Exporting the functions for use in other files
module.exports = {
  getAllMedicalRecords,
  updateMedicalRecord,
  editMedicalRecordDescription,
  addMedicalRecord,
  deleteMedicalRecord,
};
