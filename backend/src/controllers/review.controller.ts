import { Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export async function addReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const { productId, rating, title, comment } = req.body;

    // Check if verified buyer
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
    });

    if (!hasPurchased && req.user?.role !== 'ADMIN') {
      return sendError(res, 'Only verified buyers who purchased this product can leave a review', 403);
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: Math.max(1, Math.min(5, rating)),
        title,
        comment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Update product rating and numReviews
    const allReviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        numReviews: allReviews.length,
      },
    });

    return sendSuccess(res, review, 'Review submitted successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getProductReviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
}
