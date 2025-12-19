import express from 'express';
import * as orderController from '../../controllers/mongoose/orderController.js'

const router = express.Router();

router.get('/:id',orderController.getOrdersWithUserAndProductDetails);

export default router;