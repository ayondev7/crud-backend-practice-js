import express from 'express';
import * as tagController from '../../controllers/mongoose/tagController.js';

const router=express.Router();

router.get('/get-all-tags',tagController.getAllTags);

export default router;