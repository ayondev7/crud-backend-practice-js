/**
 * PRISMA PRODUCT ROUTES
 * 
 * Defines all routes for Product CRUD operations (PostgreSQL)
 */

import express from 'express';
const router = express.Router();

// Import controller functions
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../../controllers/prisma/productController.js';

/**
 * Route: /api/prisma/products
 * Methods: GET (all products), POST (create product)
 * Query params for GET: category, minPrice, maxPrice
 */
router.route('/')
  .get(getAllProducts)     // GET /api/prisma/products - Get all products
  .post(createProduct);    // POST /api/prisma/products - Create new product

/**
 * Route: /api/prisma/products/:id
 * Methods: GET (single product), PUT (update), DELETE
 */
router.route('/:id')
  .get(getProductById)     // GET /api/prisma/products/:id - Get product by ID
  .put(updateProduct)      // PUT /api/prisma/products/:id - Update product
  .delete(deleteProduct);  // DELETE /api/prisma/products/:id - Delete product

export default router;
