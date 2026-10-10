import { Router } from 'express';
import {
  getDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  createCategory,
  createBrand,
  createCoupon,
  getAdminCoupons,
  createBanner,
  getAdminMessages,
  getAdminUsers,
} from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import { createProductSchema } from '../validations/product.validation.js';
import { updateOrderStatusSchema } from '../validations/order.validation.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getDashboardStats);
router.post('/products', validateRequest(createProductSchema), createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', validateRequest(updateOrderStatusSchema), updateOrderStatus);
router.post('/categories', createCategory);
router.post('/brands', createBrand);
router.post('/coupons', createCoupon);
router.get('/coupons', getAdminCoupons);
router.post('/banners', createBanner);
router.get('/messages', getAdminMessages);
router.get('/users', getAdminUsers);

export default router;
