/**
 * MONGOOSE POST CONTROLLER
 * 
 * Handles all CRUD operations for Posts using Mongoose (MongoDB)
 */

const Post = require('../../models/mongoose/Post');
const User = require('../../models/mongoose/User');

/**
 * @desc    Get all posts
 * @route   GET /api/mongoose/posts
 * @access  Public
 */
exports.getAllPosts = async (req, res, next) => {
  try {
    // Retrieve all posts from database
    const posts = await Post.find()
      .populate('author', 'name email') // Populate author info (only name and email)
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single post by ID
 * @route   GET /api/mongoose/posts/:id
 * @access  Public
 */
exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id).populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post not found with id: ${id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format'
      });
    }
    next(error);
  }
};

/**
 * @desc    Create new post
 * @route   POST /api/mongoose/posts
 * @access  Public
 */
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, published, author } = req.body;
    
    // Validate required fields
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and author'
      });
    }
    
    // Check if author exists
    const authorExists = await User.findById(author);
    if (!authorExists) {
      return res.status(404).json({
        success: false,
        message: `Author not found with id: ${author}`
      });
    }
    
    // Create new post
    const post = await Post.create({
      title,
      content,
      published,
      author
    });
    
    // Populate author info in response
    await post.populate('author', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
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
 * @desc    Update post
 * @route   PUT /api/mongoose/posts/:id
 * @access  Public
 */
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, published } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (published !== undefined) updateData.published = published;
    
    // Update post
    const post = await Post.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post not found with id: ${id}`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
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
        message: 'Invalid post ID format'
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/mongoose/posts/:id
 * @access  Public
 */
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByIdAndDelete(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post not found with id: ${id}`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: post
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format'
      });
    }
    next(error);
  }
};
