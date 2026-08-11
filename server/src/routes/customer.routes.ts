import { Router } from 'express';
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, addFollowUp, getFollowUps } from '../controllers/customer.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(authorize('ADMIN', 'SALES'), createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(authorize('ADMIN', 'SALES'), updateCustomer)
  .delete(authorize('ADMIN'), deleteCustomer);

router.route('/:id/followups')
  .get(getFollowUps)
  .post(authorize('ADMIN', 'SALES'), addFollowUp);

export default router;
