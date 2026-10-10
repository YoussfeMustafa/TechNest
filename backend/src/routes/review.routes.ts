import { Router } from 'express';
import { addReview, getProductReviews } from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authenticate, addReview);

export default router;
