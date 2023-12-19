const fs = require('fs').promises; // Importing the 'promises' module from the 'fs' library for asynchronous file system operations
const path = require('path'); // Importing the 'path' module for working with file paths


// Function to read medical records from a JSON file
const readMedicalRecordsFromFile = async () => {
  try {
    const filePath = path.join("../hospital-manage/src/JSON/MedicalRecords.json"); // Constructing the file path
    const data = await fs.readFile(filePath, 'utf8'); // Reading file data as UTF-8
    return JSON.parse(data); // Parsing JSON data and returning the result
  } catch (error) {
    console.error('Error reading medical records file:', error.message); // Handling errors during file reading
    return [];
  }
};

// Function to read appointments from a JSON file
const readAppointmentsFromFile = async () => {
  try {
    const filePath = path.join("../hospital-manage/src/JSON/Appointments.json"); // Constructing the file path
    const data = await fs.readFile(filePath, 'utf8'); // Reading file data as UTF-8
    return JSON.parse(data); // Parsing JSON data and returning the result
  } catch (error) {
    console.error('Error reading appointments file:', error.message); // Handling errors during file reading
    return [];
  }
};

// Function to write appointments to a JSON file
const writeAppointmentsToFile = async (appointments) => {
  try {
    const filePath = path.join("../hospital-manage/src/JSON/Appointments.json"); // Constructing the file path
    await fs.writeFile(filePath, JSON.stringify(appointments, null, 2), 'utf8'); // Writing formatted JSON data to the file
  } catch (error) {
    console.error('Error writing appointments file:', error.message); // Handling errors during file writing
  }
};

// Function to generate a unique ID for a new appointment
const generateUniqueID = async (appointments, medicalRecords) => {
  let id = 1;

  // Create a set of all existing IDs in appointments and medical records
  const existingIds = new Set([
    ...appointments.map(appointment => Number(appointment.id.split('-')[1])),
    ...medicalRecords.map(record => Number(record.id.split('-')[1]))
  ]);

  // Find the smallest unused ID
  while (existingIds.has(id)) {
    id++;
  }

  return `AP-${id}`; // Return the unique appointment ID
};

// Function to get all appointments (with optional search functionality)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await readAppointmentsFromFile(); // Reading appointments from the file

    // Check if there is a search query
    const { q } = req.query;
    if (q) {
      // Filtering appointments based on the search query
      const filteredAppointments = appointments.filter(appointment => (
        // Searching by various appointment attributes
        appointment.username.toLowerCase().includes(q.toLowerCase()) ||
        appointment.doctor.toLowerCase().includes(q.toLowerCase()) ||
        appointment.condition.toLowerCase().includes(q.toLowerCase()) ||
        appointment.description.toLowerCase().includes(q.toLowerCase()) ||
        appointment.time.includes(q) ||
        appointment.status.toLowerCase().includes(q.toLowerCase()) 
      ));
      res.json(filteredAppointments); // Responding with filtered appointments
    } else {
      res.json(appointments); // Responding with all appointments
    }
  } catch (error) {
    console.error('Error in getAllAppointments:', error); // Handling errors during appointment retrieval
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to add a new appointment
const addAppointment = async (req, res) => {
  const { appointmentId, username, doctor, condition, description, time, finishedTime, duration } = req.body;

  const appointments = await readAppointmentsFromFile();
  const medicalRecords = await readMedicalRecordsFromFile();

  let id;
  if (appointmentId) {
    id = appointmentId;
  } else {
    // Generate a unique ID that doesn't exist in the appointments or medical records
    id = await generateUniqueID(appointments, medicalRecords);
  }

  const newAppointment = {
    id,
    username,
    doctor,
    condition,
    description,
    time,
    status: 'Registered',
    disabled: false,
  };

  appointments.push(newAppointment);

  await writeAppointmentsToFile(appointments);

  res.json(newAppointment);
};

// Function to update an existing appointment
const updateAppointment = async (req, res) => {
  const appointmentId = req.params.id; // Extracting appointment ID from request parameters
  const { username, doctor, condition, description, time, status, disabled } = req.body; // Extracting updated appointment data from request body

  const appointments = await readAppointmentsFromFile(); // Reading appointments from the file
  const index = appointments.findIndex((appointment) => appointment.id === appointmentId); // Finding the index of the appointment to be updated

  if (index !== -1) {
    appointments[index] = {
      ...appointments[index],
      username,
      doctor,
      condition,
      description,
      time,
      status,
      disabled,
    };

    await writeAppointmentsToFile(appointments); // Writing the updated appointment list to the file

    res.json(appointments[index]); // Responding with the updated appointment
  } else {
    res.status(404).json({ error: 'Appointment not found' }); // Handling the case where the appointment to be updated is not found
  }
};

// Function to update an existing appointment's status
const updateAppointmentStatus = async (req, res) => {
  const appointmentId = req.params.id; // Extracting appointment ID from request parameters
  const { status } = req.body; // Extracting updated status from request body
 
  const appointments = await readAppointmentsFromFile(); // Reading appointments from the file
  const index = appointments.findIndex((appointment) => appointment.id === appointmentId); // Finding the index of the appointment to be updated
 
  if (index !== -1) {
    appointments[index] = {
      ...appointments[index],
      status,
    };
 
    await writeAppointmentsToFile(appointments); // Writing the updated appointment list to the file
 
    res.json(appointments[index]); // Responding with the updated appointment
  } else {
    res.status(404).json({ error: 'Appointment not found' }); // Handling the case where the appointment to be updated is not found
  }
 };
 

// Function to delete an existing appointment
const deleteAppointment = async (req, res) => {
  const appointmentId = req.params.id; // Extracting appointment ID from request parameters

  const appointments = await readAppointmentsFromFile(); // Reading appointments from the file
  const filteredAppointments = appointments.filter((appointment) => appointment.id !== appointmentId); // Filtering out the appointment to be deleted

  if (filteredAppointments.length < appointments.length) {
    await writeAppointmentsToFile(filteredAppointments); // Writing the updated appointment list to the file after deletion

    res.json({ message: 'Appointment deleted successfully' }); // Responding with success message
  } else {
    res.status(404).json({ error: 'Appointment not found' }); // Handling the case where the appointment to be deleted is not found
  }
};
// Function to update an existing appointment's time
const updateAppointmentTime = async (req, res) => {
  const appointmentId = req.params.id; // Extracting appointment ID from request parameters
  const { time } = req.body; // Extracting updated time from request body
 
  const appointments = await readAppointmentsFromFile(); // Reading appointments from the file
  const index = appointments.findIndex((appointment) => appointment.id === appointmentId); // Finding the index of the appointment to be updated
 
  if (index !== -1) {
    appointments[index] = {
      ...appointments[index],
      time,
    };
 
    await writeAppointmentsToFile(appointments); // Writing the updated appointment list to the file
 
    res.json(appointments[index]); // Responding with the updated appointment
  } else {
    res.status(404).json({ error: 'Appointment not found' }); // Handling the case where the appointment to be updated is not found
  }
 };

// Define a helper function to reassign IDs
/*const reassignIDs = (dataList, prefix) => {
  return dataList.map((data, index) => ({
    ...data,
    id: `${prefix}-${index + 1}`,
  }));
};*/

// Exporting the functions for use in other files
module.exports = {
  getAllAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus, // Adding the new function to update only the status
  updateAppointmentTime,
};
