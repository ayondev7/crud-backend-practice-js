import express from 'express';
import * as tagController from '../../controllers/mongoose/tagController.js';

const router=express.Router();

router.get('/get-all-tags',tagController.getAllTags);
router.get('/get-single-tag/:id',tagController.getSingleTag);
router.get('/get-tags',tagController.getTagsByType);

export default router;