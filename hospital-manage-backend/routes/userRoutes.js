const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

router.get('/', getAllUsers);
router.post('/', addUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
