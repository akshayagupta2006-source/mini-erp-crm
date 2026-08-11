import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addStockMovement, getStockHistory } from '../controllers/product.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getProducts)
  .post(authorize('ADMIN', 'WAREHOUSE'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(authorize('ADMIN', 'WAREHOUSE'), updateProduct)
  .delete(authorize('ADMIN'), deleteProduct);

router.route('/:id/stock')
  .post(authorize('ADMIN', 'WAREHOUSE'), addStockMovement);

router.route('/:id/stock-history')
  .get(getStockHistory);

export default router;
