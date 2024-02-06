// Importing required libraries
const express = require('express'); // Express.js for building web applications
const bodyParser = require('body-parser'); // Body parsing middleware for handling JSON data
const cors = require('cors'); // CORS middleware for handling Cross-Origin Resource Sharing
const userRoutes = require('../hospital-manage-backend/routes/userRoutes'); // Importing user routes
const patientRoutes = require('../hospital-manage-backend/routes/patientRoutes'); // Importing patient routes
const appointmentRoutes = require('../hospital-manage-backend/routes/appointmentRoutes'); // Importing appointment routes
const medicalRecordRoutes = require('../hospital-manage-backend/routes/medicalRecordsRoutes'); // Importing medical records routes
const Users = require("../hospital-manage/src/JSON/Staff.json"); // Importing user data from JSON file
const fs = require('fs');

// Creating an Express application
const app = express();

// Setting the port number
const PORT = 3001;

// Applying middleware
app.use(cors()); // Using CORS middleware to handle Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Using body-parser middleware for parsing JSON data

// Setting up routes for different functionalities
app.use('/api/users', userRoutes); // Using user routes
app.use('/api/patients', patientRoutes); // Using patient routes
app.use('/api/appointments', appointmentRoutes); // Using appointment routes
app.use('/api/medicalrecords', medicalRecordRoutes); // Using medical records routes

// Handling user login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Read the user data from the JSON file every time a login request is made
  const Users = JSON.parse(fs.readFileSync("../hospital-manage/src/JSON/Staff.json", 'utf8'));

  const user = Users.find((user) => user.username.trim() === username.trim());

  if (user) {
    // Validating user credentials
    if (user.password.trim() === password.trim()) {
      const role = user.role;
      const field = user.field || null;
      const authToken = generateToken();

      // Sending a JSON response with authentication details
      res.json({
        success: true,
        role,
        field,
        authToken,
      });
    } else {
      // Handling invalid password
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } else {
    // Handling user not found
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// Starting the server and listening on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Function to generate a random authentication token
function generateToken() {
  return (
    Math.random().toString(36).substr(2) +
    Math.random().toString(36).substr(2)
  );
}

// Define error messages for different input fields
/*const errors = {
  username: "invalid username",
  password: "invalid password"
};*/

// Handling user login
/*app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Read the user data from the JSON file every time a login request is made
  const Users = JSON.parse(fs.readFileSync("../hospital-manage/src/JSON/Staff.json", 'utf8'));

  const user = Users.find((user) => user.username.trim() === username.trim());

  if (user) {
    // Validating user credentials
    if (user.password.trim() === password.trim()) {
      const role = user.role;
      const field = user.field || null;
      const authToken = generateToken();

      // Sending a JSON response with authentication details
      res.json({
        success: true,
        role,
        field,
        authToken,
      });
    } else {
      // Handling invalid password
      res.status(401).json({ success: false, message: errors.password });
    }
  } else {
    // Handling user not found
    res.status(404).json({ success: false, message: errors.username });
  }
});*/