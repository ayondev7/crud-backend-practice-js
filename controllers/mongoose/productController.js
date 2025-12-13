/**
 * MONGOOSE PRODUCT CONTROLLER
 * 
 * Handles all CRUD operations for Products using Mongoose (MongoDB)
 */

const Product = require('../../models/mongoose/Product');

/**
 * @desc    Get all products
 * @route   GET /api/mongoose/products
 * @access  Public
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    // Extract query parameters for filtering
    const { category, minPrice, maxPrice } = req.query;
    
    // Build filter object based on query params
    const filter = {};
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Retrieve products
    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/mongoose/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    next(error);
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/mongoose/products
 * @access  Public
 */
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and category'
      });
    }
    
    // Create new product
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      imageUrl
    });
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
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
 * @desc    Update product
 * @route   PUT /api/mongoose/products/:id
 * @access  Public
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, imageUrl } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    // Update product
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${id}`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
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
        message: 'Invalid product ID format'
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/mongoose/products/:id
 * @access  Public
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${id}`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    next(error);
  }
};
