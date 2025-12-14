/**
 * PRISMA POST ROUTES
 * 
 * Defines all routes for Post CRUD operations (PostgreSQL)
 */

import express from 'express';
const router = express.Router();

// Import controller functions
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} from '../../controllers/prisma/postController.js';

/**
 * Route: /api/prisma/posts
 * Methods: GET (all posts), POST (create post)
 */
router.route('/')
  .get(getAllPosts)     // GET /api/prisma/posts - Get all posts
  .post(createPost);    // POST /api/prisma/posts - Create new post

/**
 * Route: /api/prisma/posts/:id
 * Methods: GET (single post), PUT (update), DELETE
 */
router.route('/:id')
  .get(getPostById)     // GET /api/prisma/posts/:id - Get post by ID
  .put(updatePost)      // PUT /api/prisma/posts/:id - Update post
  .delete(deletePost);  // DELETE /api/prisma/posts/:id - Delete post

export default router;
