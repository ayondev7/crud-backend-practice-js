/**
 * MONGOOSE POST ROUTES
 * 
 * Defines all routes for Post CRUD operations (MongoDB)
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
} from '../../controllers/mongoose/postController.js';

/**
 * Route: /api/mongoose/posts
 * Methods: GET (all posts), POST (create post)
 */
router.route('/')
  .get(getAllPosts)     // GET /api/mongoose/posts - Get all posts
  .post(createPost);    // POST /api/mongoose/posts - Create new post

/**
 * Route: /api/mongoose/posts/:id
 * Methods: GET (single post), PUT (update), DELETE
 */
router.route('/:id')
  .get(getPostById)     // GET /api/mongoose/posts/:id - Get post by ID
  .put(updatePost)      // PUT /api/mongoose/posts/:id - Update post
  .delete(deletePost);  // DELETE /api/mongoose/posts/:id - Delete post

export default router;
