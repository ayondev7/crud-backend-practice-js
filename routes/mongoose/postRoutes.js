import express from 'express'
import * as postController from '../../controllers/mongoose/postController.js';

const router = express.Router();

router.get('/category/:slug',postController.getPostsByCategory);

export default router;