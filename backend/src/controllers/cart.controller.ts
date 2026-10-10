import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { order: 'asc' } },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1, orderBy: { order: 'asc' } },
                },
              },
              variant: true,
            },
          },
        },
      });
    }
    return cart;
  }

  if (sessionId) {
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { order: 'asc' } },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1, orderBy: { order: 'asc' } },
                },
              },
              variant: true,
            },
          },
        },
      });
    }
    return cart;
  }

  return null;
}

function calculateCartTotals(cart: any) {
  let subtotal = 0;
  const items = cart.items.map((item: any) => {
    const basePrice = item.product.discountPrice ?? item.product.basePrice;
    const variantOffset = item.variant?.priceOffset ?? 0;
    const unitPrice = basePrice + variantOffset;
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        nameEn: item.product.nameEn,
        nameAr: item.product.nameAr,
        slug: item.product.slug,
        image: item.product.images[0]?.url || null,
        basePrice: item.product.basePrice,
        discountPrice: item.product.discountPrice,
      },
      variant: item.variant
        ? {
            id: item.variant.id,
            sku: item.variant.sku,
            colorEn: item.variant.colorEn,
            colorAr: item.variant.colorAr,
            colorHex: item.variant.colorHex,
            storage: item.variant.storage,
            ram: item.variant.ram,
            priceOffset: item.variant.priceOffset,
            stock: item.variant.stock,
          }
        : null,
      unitPrice,
      total: itemTotal,
    };
  });

  return {
    id: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    items,
    itemCount: items.reduce((acc: number, item: any) => acc + item.quantity, 0),
    subtotal,
  };
}

export async function getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string);

    if (!userId && !sessionId) {
      return sendSuccess(res, { items: [], itemCount: 0, subtotal: 0 });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) {
      return sendSuccess(res, { items: [], itemCount: 0, subtotal: 0 });
    }

    return sendSuccess(res, calculateCartTotals(cart));
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const sessionId = (req.headers['x-session-id'] as string) || req.body.sessionId;
    const { productId, variantId, quantity = 1 } = req.body;

    if (!userId && !sessionId) {
      return sendError(res, 'User identity or Session ID required', 400);
    }

    // Verify product exists and check stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || !product.isAvailable) {
      return sendError(res, 'Product is not available', 404);
    }

    let maxStock = 999;
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) return sendError(res, 'Product variant not found', 404);
      maxStock = variant.stock;
    }

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) return sendError(res, 'Could not initialize cart', 500);

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    const newQuantity = (existingItem?.quantity || 0) + quantity;
    if (newQuantity > maxStock) {
      return sendError(res, `Insufficient stock. Only ${maxStock} available.`, 400);
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
      });
    }

    const updatedCart = await getOrCreateCart(userId, sessionId);
    return sendSuccess(res, calculateCartTotals(updatedCart), 'Item added to cart');
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return sendSuccess(res, null, 'Item removed from cart');
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { variant: true, product: true },
    });

    if (!item) {
      return sendError(res, 'Cart item not found', 404);
    }

    const maxStock = item.variant ? item.variant.stock : 999;
    if (quantity > maxStock) {
      return sendError(res, `Insufficient stock. Maximum available is ${maxStock}`, 400);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return sendSuccess(res, null, 'Cart updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { itemId } = req.params;
    await prisma.cartItem.delete({ where: { id: itemId } });
    return sendSuccess(res, null, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string);

    const cart = await prisma.cart.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(sessionId ? [{ sessionId }] : []),
        ],
      },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return sendSuccess(res, null, 'Cart cleared');
  } catch (error) {
    next(error);
  }
}

export async function mergeGuestCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string | undefined || req.body.sessionId;
    const { guestItems } = req.body;

    if (!userId) return sendError(res, 'Unauthorized', 401);

    const userCart = await getOrCreateCart(userId);

    // Merge items from sessionId in DB
    if (sessionId) {
      const guestCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      });

      if (guestCart && guestCart.items.length > 0) {
        for (const gItem of guestCart.items) {
          const existing = await prisma.cartItem.findFirst({
            where: {
              cartId: userCart!.id,
              productId: gItem.productId,
              variantId: gItem.variantId,
            },
          });

          if (existing) {
            await prisma.cartItem.update({
              where: { id: existing.id },
              data: { quantity: existing.quantity + gItem.quantity },
            });
          } else {
            await prisma.cartItem.create({
              data: {
                cartId: userCart!.id,
                productId: gItem.productId,
                variantId: gItem.variantId,
                quantity: gItem.quantity,
              },
            });
          }
        }
        await prisma.cart.delete({ where: { id: guestCart.id } });
      }
    }

    // Also support direct array of items from client localStorage if passed
    if (Array.isArray(guestItems)) {
      for (const item of guestItems) {
        if (!item.productId) continue;
        const existing = await prisma.cartItem.findFirst({
          where: {
            cartId: userCart!.id,
            productId: item.productId,
            variantId: item.variantId || null,
          },
        });

        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + (item.quantity || 1) },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: userCart!.id,
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity || 1,
            },
          });
        }
      }
    }

    const updated = await getOrCreateCart(userId);
    return sendSuccess(res, calculateCartTotals(updated), 'Cart merged successfully');
  } catch (error) {
    next(error);
  }
}
