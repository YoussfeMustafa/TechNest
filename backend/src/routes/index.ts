import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import brandRoutes from './brand.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import reviewRoutes from './review.routes.js';
import couponRoutes from './coupon.routes.js';
import addressRoutes from './address.routes.js';
import bannerRoutes from './banner.routes.js';
import contactRoutes from './contact.routes.js';
import uploadRoutes from './upload.routes.js';
import adminRoutes from './admin.routes.js';

const apiV1Router = Router();

apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/products', productRoutes);
apiV1Router.use('/categories', categoryRoutes);
apiV1Router.use('/brands', brandRoutes);
apiV1Router.use('/cart', cartRoutes);
apiV1Router.use('/orders', orderRoutes);
apiV1Router.use('/wishlist', wishlistRoutes);
apiV1Router.use('/reviews', reviewRoutes);
apiV1Router.use('/coupons', couponRoutes);
apiV1Router.use('/addresses', addressRoutes);
apiV1Router.use('/banners', bannerRoutes);
apiV1Router.use('/contact', contactRoutes);
apiV1Router.use('/upload', uploadRoutes);
apiV1Router.use('/admin', adminRoutes);

export default apiV1Router;
