import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export async function validateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, amount = 0 } = req.body;

    if (!code) {
      return sendError(res, 'Coupon code is required', 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return sendError(res, 'Invalid coupon code', 404);
    }

    if (new Date() > coupon.validUntil) {
      return sendError(res, 'This coupon has expired', 400);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return sendError(res, 'This coupon has reached its usage limit', 400);
    }

    if (amount < coupon.minOrderAmount) {
      return sendError(res, `Minimum order amount for this coupon is ${coupon.minOrderAmount}`, 400);
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return sendSuccess(res, {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.min(amount, discount),
    }, 'Coupon applied successfully');
  } catch (error) {
    next(error);
  }
}
