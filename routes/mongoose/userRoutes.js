/**
 * MONGOOSE USER ROUTES
 * 
 * Defines all routes for User CRUD operations (MongoDB)
 */

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../../controllers/mongoose/userController');

/**
 * Route: /api/mongoose/users
 * Methods: GET (all users), POST (create user)
 */
router.route('/')
  .get(getAllUsers)     // GET /api/mongoose/users - Get all users
  .post(createUser);    // POST /api/mongoose/users - Create new user

/**
 * Route: /api/mongoose/users/:id
 * Methods: GET (single user), PUT (update), DELETE
 */
router.route('/:id')
  .get(getUserById)     // GET /api/mongoose/users/:id - Get user by ID
  .put(updateUser)      // PUT /api/mongoose/users/:id - Update user
  .delete(deleteUser);  // DELETE /api/mongoose/users/:id - Delete user

module.exports = router;
