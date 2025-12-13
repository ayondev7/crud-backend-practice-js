/**
 * PRISMA USER ROUTES
 * 
 * Defines all routes for User CRUD operations (PostgreSQL)
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
} = require('../../controllers/prisma/userController');

/**
 * Route: /api/prisma/users
 * Methods: GET (all users), POST (create user)
 */
router.route('/')
  .get(getAllUsers)     // GET /api/prisma/users - Get all users
  .post(createUser);    // POST /api/prisma/users - Create new user

/**
 * Route: /api/prisma/users/:id
 * Methods: GET (single user), PUT (update), DELETE
 */
router.route('/:id')
  .get(getUserById)     // GET /api/prisma/users/:id - Get user by ID
  .put(updateUser)      // PUT /api/prisma/users/:id - Update user
  .delete(deleteUser);  // DELETE /api/prisma/users/:id - Delete user

module.exports = router;
