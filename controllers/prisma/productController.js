/**
 * PRISMA PRODUCT CONTROLLER
 * 
 * Handles all CRUD operations for Products using Prisma (PostgreSQL)
 */

const { response } = require('../../app');
const { prisma } = require('../../config/prisma');

/**
 * @desc    Get all products
 * @route   GET /api/prisma/products
 * @access  Public
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    // Extract query parameters for filtering
    const { category, minPrice, maxPrice } = req.query;
    
    // Build where clause based on filters
    const where = {};
    if (category) where.category = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    // Retrieve products
    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
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
 * @route   GET /api/prisma/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });
    
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
    next(error);
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/prisma/products
 * @access  Public
 */
// exports.createProduct = async (req, res, next) => {
//   try {
//     const { name, description, price, stock, category, imageUrl } = req.body;
    
//     // Validate required fields
//     if (!name || !price || !category) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide name, price, and category'
//       });
//     }
    
//     // Create new product
//     const product = await prisma.product.create({
//       data: {
//         name,
//         description: description || null,
//         price: parseFloat(price),
//         stock: stock ? parseInt(stock) : 0,
//         category,
//         imageUrl: imageUrl || null
//       }
//     });
    
//     res.status(201).json({
//       success: true,
//       message: 'Product created successfully',
//       data: product
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.createProduct = async(req,res,next)=> {
  try {
    const {name, description, price, stock, category, imageUrl} = req.body;

    if(!name || !price || !category){
     return res.status(400).json({
        success:false,
        message:"Please provide name, price, and category"
      });
    }

    const product = await prisma.product.create({
      data:{
        name,
        description: description || null,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        category,
        imageUrl: imageUrl || null
      }
    });

    res.status(201).json({
      success:true,
      message:"product added successfully",
      data:product
    });

  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Update product
 * @route   PUT /api/prisma/products/:id
 * @access  Public
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, imageUrl } = req.body;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${id}`
      });
    }
    
    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    // Update product
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/prisma/products/:id
 * @access  Public
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${id}`
      });
    }
    
    // Delete product
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: existingProduct
    });
  } catch (error) {
    next(error);
  }
};
