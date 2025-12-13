/**
 * PRISMA USER CONTROLLER
 * 
 * Handles all CRUD operations for Users using Prisma (PostgreSQL)
 */

const { prisma } = require('../../config/prisma');

/**
 * @desc    Get all users
 * @route   GET /api/prisma/users
 * @access  Public
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Retrieve all users from database
    const users = await prisma.user.findMany({
      include: {
        posts: true // Include related posts
      },
      orderBy: {
        createdAt: 'desc' // Sort by newest first
      }
    });
    
    // Send success response
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    // Pass error to error handler middleware
    next(error);
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/prisma/users/:id
 * @access  Public
 */
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        posts: true // Include related posts
      }
    });
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${id}`
      });
    }
    
    // Send success response
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new user
 * @route   POST /api/prisma/users
 * @access  Public
 */
exports.createUser = async (req, res, next) => {
  try {
    const { email, name, age } = req.body;
    
    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and name'
      });
    }
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        age: age ? parseInt(age) : null
      }
    });
    
    // Send success response
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    // Handle unique constraint violation (duplicate email)
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/prisma/users/:id
 * @access  Public
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, name, age } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${id}`
      });
    }
    
    // Prepare update data (only include fields that are provided)
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age ? parseInt(age) : null;
    
    // Update user
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    // Send success response
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/prisma/users/:id
 * @access  Public
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${id}`
      });
    }
    
    // Delete user (cascade will delete related posts)
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });
    
    // Send success response
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: existingUser
    });
  } catch (error) {
    next(error);
  }
};
