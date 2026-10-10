import { Router } from 'express';
import { getBrands, getBrandBySlug } from '../controllers/brand.controller.js';

const router = Router();

router.get('/', getBrands);
router.get('/slug/:slug', getBrandBySlug);

export default router;
