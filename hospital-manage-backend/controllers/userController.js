const fs = require('fs').promises; // Importing the 'promises' module from the 'fs' library for asynchronous file system operations
const path = require('path'); // Importing the 'path' module for working with file paths

// Function to read users from a JSON file
const readUsersFromFile = async () => {
  try {
    const filePath = path.join("../hospital-manage/src/JSON/Staff.json"); // Constructing the file path
    const data = await fs.readFile(filePath, 'utf8'); // Reading file data as UTF-8
    return JSON.parse(data); // Parsing JSON data and returning the result
  } catch (error) {
    console.error('Error reading users file:', error.message); // Handling errors during file reading
    return [];
  }
};

// Function to write users to a JSON file
const writeUsersToFile = async (users) => {
  try {
    const filePath = path.join("../hospital-manage/src/JSON/Staff.json"); // Constructing the file path
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8'); // Writing formatted JSON data to the file
  } catch (error) {
    console.error('Error writing users file:', error.message); // Handling errors during file writing
  }
};

// Function to generate a unique ID based on user role
const generateUniqueID = (users, role) => {
  const filteredUsers = users.filter((user) => user.role === role); // Filtering users by role
  const uniqueNumber = filteredUsers.length + 1; // Calculating a unique number based on the role

  return `${role.charAt(0).toUpperCase()}-${uniqueNumber}`; // Constructing a unique ID
};

// Function to get all users (with optional search functionality)
const getAllUsers = async (req, res) => {
  try {
    const users = await readUsersFromFile(); // Reading users from the file

    // Check if there is a search query
    const { q } = req.query;
    if (q) {
      // Filtering users based on the search query
      const filteredUsers = users.filter(user => (
        // Searching by various user attributes
        user.username.toLowerCase().includes(q.toLowerCase()) ||
        user.role.toLowerCase().includes(q.toLowerCase()) ||
        (user.field && user.field.toLowerCase().includes(q.toLowerCase())) ||
        user.dob.includes(q) ||
        user.location.toLowerCase().includes(q.toLowerCase()) ||
        user.phone.includes(q) ||
        user.email.toLowerCase().includes(q.toLowerCase())
      ));
      res.json(filteredUsers); // Responding with filtered users
    } else {
      res.json(users); // Responding with all users
    }
  } catch (error) {
    console.error('Error reading users:', error.message); // Handling errors during user retrieval
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to add a new user
const addUser = async (req, res) => {
  const { username, role, field, dob, location, phone, email, password } = req.body; // Extracting user data from request body

  const users = await readUsersFromFile(); // Reading users from the file

  const id = generateUniqueID(users, role); // Generating a unique ID for the new user

  const newUser = {
    id,
    username,
    role,
    field,
    dob,
    location,
    phone,
    email,
    password,
  };

  users.push(newUser); // Adding the new user to the array

  await writeUsersToFile(users); // Writing the updated user list to the file

  res.json(newUser); // Responding with the newly added user
};

// Function to update an existing user
const updateUser = async (req, res) => {
  const userId = req.params.id; // Extracting user ID from request parameters
  const { username, role, field, dob, location, phone, email, password } = req.body; // Extracting updated user data from request body

  const users = await readUsersFromFile(); // Reading users from the file
  const index = users.findIndex((user) => user.id === userId); // Finding the index of the user to be updated

  if (index !== -1) {
    const updatedUser = {
      ...users[index],
      username,
      role,
      field,
      dob,
      location,
      phone,
      email,
      password,
    };

    // Check if the role is being changed
    if (users[index].role !== role) {
      updatedUser.id = generateUniqueID(users, role); // Generating a new unique ID if the role is changed
    }

    users[index] = updatedUser; // Updating the user in the array

    await writeUsersToFile(users); // Writing the updated user list to the file

    res.json(updatedUser); // Responding with the updated user
  } else {
    res.status(404).json({ error: 'User not found' }); // Handling the case where the user to be updated is not found
  }
};

// Function to delete an existing user
const deleteUser = async (req, res) => {
  const userId = req.params.id; // Extracting user ID from request parameters

  const users = await readUsersFromFile(); // Reading users from the file
  const filteredUsers = users.filter((user) => user.id !== userId); // Filtering out the user to be deleted

  if (filteredUsers.length < users.length) {
    await writeUsersToFile(filteredUsers); // Writing the updated user list to the file after deletion

    // After deletion, reassign IDs to maintain uniqueness
    const updatedUsers = reassignIDs(filteredUsers); // Reassigning IDs to maintain uniqueness
    await writeUsersToFile(updatedUsers); // Writing the further updated user list to the file

    res.json({ message: 'User deleted successfully' }); // Responding with success message
  } else {
    res.status(404).json({ error: 'User not found' }); // Handling the case where the user to be deleted is not found
  }
};

// Helper function to reassign IDs for maintaining uniqueness
const reassignIDs = (dataList) => {
  const roleCounts = {};

  return dataList.map((data) => {
    const { role } = data;
    const prefix = role.charAt(0).toUpperCase();

    roleCounts[role] = (roleCounts[role] || 0) + 1;

    return {
      ...data,
      id: `${prefix}-${roleCounts[role]}`,
    };
  });
};

// Exporting the functions for use in other files
module.exports = {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
};
