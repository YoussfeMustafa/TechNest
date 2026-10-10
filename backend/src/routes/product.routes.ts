import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  getSearchSuggestions,
  getFeaturedProducts,
  getFlashDeals,
} from '../controllers/product.controller.js';
import { validateRequest } from '../middlewares/validate.js';
import { listProductsQuerySchema } from '../validations/product.validation.js';

const router = Router();

router.get('/', validateRequest(listProductsQuerySchema), getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/flash-deals', getFlashDeals);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);

export default router;
