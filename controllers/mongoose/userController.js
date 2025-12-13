/**
 * MONGOOSE USER CONTROLLER
 * 
 * Handles all CRUD operations for Users using Mongoose (MongoDB)
 */

const User = require('../../models/mongoose/User');

/**
 * @desc    Get all users
 * @route   GET /api/mongoose/users
 * @access  Public
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Retrieve all users from database
    const users = await User.find()
      .populate('posts') // Populate related posts
      .sort({ createdAt: -1 }); // Sort by newest first
    
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
 * @route   GET /api/mongoose/users/:id
 * @access  Public
 */
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find user by ID
    const user = await User.findById(id).populate('posts');
    
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
    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    next(error);
  }
};

/**
 * @desc    Create new user
 * @route   POST /api/mongoose/users
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
    const user = await User.create({
      email,
      name,
      age
    });
    
    // Send success response
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/mongoose/users/:id
 * @access  Public
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, name, age } = req.body;
    
    // Prepare update data (only include fields that are provided)
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    
    // Update user and return new document
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    );
    
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
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/mongoose/users/:id
 * @access  Public
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find and delete user
    const user = await User.findByIdAndDelete(id);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${id}`
      });
    }
    
    // Note: You might want to also delete related posts here
    // await Post.deleteMany({ author: id });
    
    // Send success response
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: user
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    next(error);
  }
};
