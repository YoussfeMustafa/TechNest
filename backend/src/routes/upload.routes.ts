import { Router } from 'express';
import { uploadMiddleware, handleUpload } from '../controllers/upload.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/', authenticate, requireAdmin, uploadMiddleware.single('image'), handleUpload);

export default router;
