import express from 'express';
import * as productController from '../../controllers/mongoose/productController.js'

const router = express.Router();

router.get('/get-products-filtered', productController.getFilteredProducts);

export default router;