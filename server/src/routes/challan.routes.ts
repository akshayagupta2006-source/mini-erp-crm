import { Router } from 'express';
import { getChallans, getChallan, createChallan, confirmChallan, cancelChallan } from '../controllers/challan.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getChallans)
  .post(authorize('ADMIN', 'SALES'), createChallan);

router.route('/:id')
  .get(getChallan);

router.route('/:id/confirm')
  .post(authorize('ADMIN', 'SALES'), confirmChallan);

router.route('/:id/cancel')
  .post(authorize('ADMIN', 'SALES'), cancelChallan);

export default router;
