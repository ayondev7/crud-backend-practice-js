/**
 * PRISMA POST CONTROLLER
 * 
 * Handles all CRUD operations for Posts using Prisma (PostgreSQL)
 */

const { prisma } = require('../../config/prisma');

/**
 * @desc    Get all posts
 * @route   GET /api/prisma/posts
 * @access  Public
 */
exports.getAllPosts = async (req, res, next) => {
  try {
    // Retrieve all posts from database
    const posts = await prisma.post.findMany({
      include: {
        author: true // Include author information
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
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
 * @route   GET /api/prisma/posts/:id
 * @access  Public
 */
exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: true
      }
    });
    
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
    next(error);
  }
};

/**
 * @desc    Create new post
 * @route   POST /api/prisma/posts
 * @access  Public
 */
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, published, authorId } = req.body;
    
    // Validate required fields
    if (!title || !authorId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and authorId'
      });
    }
    
    // Check if author exists
    const author = await prisma.user.findUnique({
      where: { id: parseInt(authorId) }
    });
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: `Author not found with id: ${authorId}`
      });
    }
    
    // Create new post
    const post = await prisma.post.create({
      data: {
        title,
        content: content || null,
        published: published || false,
        authorId: parseInt(authorId)
      },
      include: {
        author: true
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update post
 * @route   PUT /api/prisma/posts/:id
 * @access  Public
 */
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, published } = req.body;
    
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: `Post not found with id: ${id}`
      });
    }
    
    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (published !== undefined) updateData.published = published;
    
    // Update post
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        author: true
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/prisma/posts/:id
 * @access  Public
 */
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: `Post not found with id: ${id}`
      });
    }
    
    // Delete post
    await prisma.post.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: existingPost
    });
  } catch (error) {
    next(error);
  }
};
