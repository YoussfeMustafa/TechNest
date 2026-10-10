import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export async function createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const {
      addressId,
      shippingAddress,
      paymentMethod = 'COD',
      couponCode,
      notes,
      currency = 'EGP',
      items: directItems,
    } = req.body;

    // 1. Resolve address
    let resolvedAddress: any;
    if (addressId) {
      const dbAddress = await prisma.address.findUnique({
        where: { id: addressId, userId },
      });
      if (!dbAddress) return sendError(res, 'Shipping address not found', 404);
      resolvedAddress = {
        recipientName: dbAddress.recipientName,
        phone: dbAddress.phone,
        street: dbAddress.street,
        city: dbAddress.city,
        state: dbAddress.state,
        postalCode: dbAddress.postalCode,
        country: dbAddress.country,
      };
    } else if (shippingAddress) {
      resolvedAddress = shippingAddress;
    } else {
      return sendError(res, 'Shipping address is required', 400);
    }

    // 2. Fetch order items (from direct payload or user's cart)
    let orderItemsToProcess: Array<{ productId: string; variantId?: string | null; quantity: number }> = [];

    if (Array.isArray(directItems) && directItems.length > 0) {
      orderItemsToProcess = directItems;
    } else {
      const userCart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!userCart || userCart.items.length === 0) {
        return sendError(res, 'Your cart is empty', 400);
      }

      orderItemsToProcess = userCart.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      }));
    }

    // 3. Process items, verify stock and calculate subtotal
    const detailedItems: any[] = [];
    let subtotal = 0;

    for (const item of orderItemsToProcess) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: true,
          images: { take: 1, orderBy: { order: 'asc' } },
        },
      });

      if (!product || !product.isAvailable) {
        return sendError(res, `Product ${item.productId} is not available`, 400);
      }

      let unitPrice = product.discountPrice ?? product.basePrice;
      let variantInfoEn: string | null = null;
      let variantInfoAr: string | null = null;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) return sendError(res, `Selected variant for ${product.nameEn} not found`, 400);
        if (variant.stock < item.quantity) {
          return sendError(
            res,
            `Insufficient stock for ${product.nameEn} (${variant.sku}). Available: ${variant.stock}`,
            400
          );
        }
        unitPrice += variant.priceOffset;
        variantInfoEn = [variant.colorEn, variant.storage, variant.ram].filter(Boolean).join(' / ');
        variantInfoAr = [variant.colorAr, variant.storage, variant.ram].filter(Boolean).join(' / ');
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      detailedItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        productNameEn: product.nameEn,
        productNameAr: product.nameAr,
        variantInfoEn,
        variantInfoAr,
        image: product.images[0]?.url || null,
        price: unitPrice,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // 4. Validate Coupon
    let discount = 0;
    let couponRecord: any = null;
    if (couponCode) {
      couponRecord = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (couponRecord && couponRecord.isActive && new Date() <= couponRecord.validUntil) {
        if (subtotal >= couponRecord.minOrderAmount) {
          if (couponRecord.discountType === 'PERCENTAGE') {
            discount = (subtotal * couponRecord.discountValue) / 100;
            if (couponRecord.maxDiscount && discount > couponRecord.maxDiscount) {
              discount = couponRecord.maxDiscount;
            }
          } else {
            discount = couponRecord.discountValue;
          }
        }
      }
    }

    const shippingFee = subtotal > 1500 ? 0 : 50; // Free shipping over 1500
    const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100; // 5% tax
    const total = Math.max(0, subtotal - discount + shippingFee + tax);

    const orderNumber = `TN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Execute transaction (Order creation + stock decrement + coupon usage + cart clear)
    const result = await prisma.$transaction(async (tx) => {
      // Decrement stock for variants
      for (const item of orderItemsToProcess) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // If coupon used, increment count
      if (couponRecord) {
        await tx.coupon.update({
          where: { id: couponRecord.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressSnapshot: JSON.stringify(resolvedAddress),
          status: 'PENDING',
          subtotal,
          discount,
          shippingFee,
          tax,
          total,
          currency,
          notes,
          items: {
            create: detailedItems,
          },
          payment: {
            create: {
              method: paymentMethod,
              status: paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
              transactionId: paymentMethod === 'STRIPE' ? `ch_test_${Date.now()}` : null,
              amount: total,
              currency,
            },
          },
        },
        include: {
          items: true,
          payment: true,
        },
      });

      // Clear user cart
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return createdOrder;
    });

    return sendSuccess(res, result, 'Order placed successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getUserOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(req.user?.role !== 'ADMIN' ? { userId } : {}),
      },
      include: {
        items: true,
        payment: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(req.user?.role !== 'ADMIN' ? { userId } : {}),
      },
      include: { items: true },
    });

    if (!order) return sendError(res, 'Order not found', 404);

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      return sendError(res, `Cannot cancel order in status: ${order.status}`, 400);
    }

    // Rollback stock inside transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelReason: reason || 'Cancelled by user',
        },
        include: { items: true, payment: true },
      });
    });

    return sendSuccess(res, updatedOrder, 'Order cancelled successfully');
  } catch (error) {
    next(error);
  }
}
