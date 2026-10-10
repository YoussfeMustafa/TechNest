import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
} from '../controllers/cart.controller.js';
import { optionalAuthenticate, authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/', optionalAuthenticate, getCart);
router.post('/items', optionalAuthenticate, addToCart);
router.put('/items/:itemId', optionalAuthenticate, updateCartItem);
router.delete('/items/:itemId', optionalAuthenticate, removeCartItem);
router.delete('/', optionalAuthenticate, clearCart);
router.post('/merge', authenticate, mergeGuestCart);

export default router;
