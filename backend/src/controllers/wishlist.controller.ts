import { Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export async function getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { order: 'asc' } },
            category: { select: { id: true, nameEn: true, nameAr: true, slug: true } },
            brand: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, items.map((i) => i.product));
  } catch (error) {
    next(error);
  }
}

export async function toggleWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { productId } = req.body;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return sendSuccess(res, { inWishlist: false }, 'Removed from wishlist');
    } else {
      await prisma.wishlist.create({
        data: { userId, productId },
      });
      return sendSuccess(res, { inWishlist: true }, 'Added to wishlist');
    }
  } catch (error) {
    next(error);
  }
}
