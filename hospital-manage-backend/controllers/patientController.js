const fs = require('fs').promises; // Importing the 'promises' module from the 'fs' library for asynchronous file system operations
const path = require('path'); // Importing the 'path' module for working with file paths

// Function to read patients from a JSON file
const readPatientsFromFile = async () => {
  try {
    const filePath = path.join("../hospital-manage/src/JSON/Patients.json"); // Constructing the file path
    const data = await fs.readFile(filePath, 'utf8'); // Reading file data as UTF-8
    return JSON.parse(data); // Parsing JSON data and returning the result
  } catch (error) {
    console.error('Error reading patients file:', error.message); // Handling errors during file reading
    return [];
  }
};

// Function to write patients to a JSON file
const writePatientsToFile = async (patients) => {
  try {
    const filePath = path.join("../hospital-manage/src/JSON/Patients.json"); // Constructing the file path
    await fs.writeFile(filePath, JSON.stringify(patients, null, 2), 'utf8'); // Writing formatted JSON data to the file
  } catch (error) {
    console.error('Error writing patients file:', error.message); // Handling errors during file writing
  }
};

// Function to generate a unique ID for a new patient
const generateUniqueID = (patients) => {
  const uniqueNumber = patients.length + 1; // Calculating a unique number based on the number of existing patients
  return `P-${uniqueNumber}`; // Constructing a unique patient ID
};

// Function to get all patients (with optional search functionality)
const getAllPatients = async (req, res) => {
  try {
    const patients = await readPatientsFromFile(); // Reading patients from the file

    // Check if there is a search query
    const { q } = req.query;
    if (q) {
      // Filtering patients based on the search query
      const filteredPatients = patients.filter(patient => (
        // Searching by various patient attributes
        patient.username.toLowerCase().includes(q.toLowerCase()) ||
        patient.dob.includes(q) ||
        patient.location.toLowerCase().includes(q.toLowerCase()) ||
        patient.phone_number.includes(q)
      ));
      res.json(filteredPatients); // Responding with filtered patients
    } else {
      res.json(patients); // Responding with all patients
    }
  } catch (error) {
    console.error('Error reading patients:', error.message); // Handling errors during patient retrieval
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to add a new patient
const addPatient = async (req, res) => {
  const { username, dob, location, phone_number } = req.body; // Extracting patient data from request body

  const patients = await readPatientsFromFile(); // Reading patients from the file

  const id = generateUniqueID(patients); // Generating a unique ID for the new patient

  const newPatient = {
    id,
    username,
    dob,
    location,
    phone_number,
  };

  patients.push(newPatient); // Adding the new patient to the array

  await writePatientsToFile(patients); // Writing the updated patient list to the file

  res.json(newPatient); // Responding with the newly added patient
};

// Function to update an existing patient
const updatePatient = async (req, res) => {
  const patientId = req.params.id; // Extracting patient ID from request parameters
  const { username, dob, location, phone_number } = req.body; // Extracting updated patient data from request body

  const patients = await readPatientsFromFile(); // Reading patients from the file
  const index = patients.findIndex((patient) => patient.id === patientId); // Finding the index of the patient to be updated

  if (index !== -1) {
    patients[index] = {
      ...patients[index],
      username,
      dob,
      location,
      phone_number,
    };

    await writePatientsToFile(patients); // Writing the updated patient list to the file

    res.json(patients[index]); // Responding with the updated patient
  } else {
    res.status(404).json({ error: 'Patient not found' }); // Handling the case where the patient to be updated is not found
  }
};

// Function to delete an existing patient
const deletePatient = async (req, res) => {
  const patientId = req.params.id; // Extracting patient ID from request parameters

  const patients = await readPatientsFromFile(); // Reading patients from the file
  const filteredPatients = patients.filter((patient) => patient.id !== patientId); // Filtering out the patient to be deleted

  if (filteredPatients.length < patients.length) {
    await writePatientsToFile(filteredPatients); // Writing the updated patient list to the file after deletion

    // After deletion, reassign IDs to maintain uniqueness
    const updatedPatients = reassignIDs(filteredPatients, 'P');
    await writePatientsToFile(updatedPatients); // Writing the further updated patient list to the file

    res.json({ message: 'Patient deleted successfully' }); // Responding with success message
  } else {
    res.status(404).json({ error: 'Patient not found' }); // Handling the case where the patient to be deleted is not found
  }
};

// Define a helper function to reassign IDs
const reassignIDs = (dataList, prefix) => {
  return dataList.map((data, index) => ({
    ...data,
    id: `${prefix}-${index + 1}`,
  }));
};

// Exporting the functions for use in other files
module.exports = {
  getAllPatients,
  addPatient,
  updatePatient,
  deletePatient,
};
