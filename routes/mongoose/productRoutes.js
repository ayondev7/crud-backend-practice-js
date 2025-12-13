/**
 * MONGOOSE PRODUCT ROUTES
 * 
 * Defines all routes for Product CRUD operations (MongoDB)
 */

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../../controllers/mongoose/productController');

/**
 * Route: /api/mongoose/products
 * Methods: GET (all products), POST (create product)
 * Query params for GET: category, minPrice, maxPrice
 */
router.route('/')
  .get(getAllProducts)     // GET /api/mongoose/products - Get all products
  .post(createProduct);    // POST /api/mongoose/products - Create new product

/**
 * Route: /api/mongoose/products/:id
 * Methods: GET (single product), PUT (update), DELETE
 */
router.route('/:id')
  .get(getProductById)     // GET /api/mongoose/products/:id - Get product by ID
  .put(updateProduct)      // PUT /api/mongoose/products/:id - Update product
  .delete(deleteProduct);  // DELETE /api/mongoose/products/:id - Delete product

module.exports = router;
