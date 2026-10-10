import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// --- Dashboard Stats ---
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      orders,
      recentOrders,
      lowStockVariants,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        select: { total: true, createdAt: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          payment: true,
        },
      }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 5 } },
        include: { product: { select: { nameEn: true, nameAr: true } } },
        take: 5,
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    return sendSuccess(res, {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockVariants,
    });
  } catch (error) {
    next(error);
  }
}

// --- Product CRUD ---
export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      nameEn,
      nameAr,
      slug,
      descriptionEn,
      descriptionAr,
      brandId,
      categoryId,
      basePrice,
      discountPrice,
      isFeatured,
      isFlashDeal,
      flashDealEnd,
      warrantyEn,
      warrantyAr,
      specs,
      variants,
      images,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return sendError(res, 'Product slug already exists', 400);
    }

    const product = await prisma.product.create({
      data: {
        nameEn,
        nameAr,
        slug,
        descriptionEn,
        descriptionAr,
        brandId,
        categoryId,
        basePrice,
        discountPrice: discountPrice || null,
        isFeatured: Boolean(isFeatured),
        isFlashDeal: Boolean(isFlashDeal),
        flashDealEnd: flashDealEnd ? new Date(flashDealEnd) : null,
        warrantyEn,
        warrantyAr,
        specs: typeof specs === 'object' ? JSON.stringify(specs) : specs,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v: any) => ({
            sku: v.sku,
            colorEn: v.colorEn,
            colorAr: v.colorAr,
            colorHex: v.colorHex,
            storage: v.storage,
            ram: v.ram,
            priceOffset: v.priceOffset || 0,
            stock: v.stock || 0,
            image: v.image,
          })),
        } : undefined,
        images: images && images.length > 0 ? {
          create: images.map((img: any, idx: number) => ({
            url: img.url,
            altEn: img.altEn,
            altAr: img.altAr,
            isPrimary: img.isPrimary || idx === 0,
            order: img.order || idx,
          })),
        } : undefined,
      },
      include: {
        variants: true,
        images: true,
        category: true,
        brand: true,
      },
    });

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const {
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      brandId,
      categoryId,
      basePrice,
      discountPrice,
      isFeatured,
      isFlashDeal,
      flashDealEnd,
      warrantyEn,
      warrantyAr,
      specs,
      isAvailable,
    } = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(nameEn && { nameEn }),
        ...(nameAr && { nameAr }),
        ...(descriptionEn && { descriptionEn }),
        ...(descriptionAr && { descriptionAr }),
        ...(brandId && { brandId }),
        ...(categoryId && { categoryId }),
        ...(basePrice !== undefined && { basePrice }),
        ...(discountPrice !== undefined && { discountPrice }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isFlashDeal !== undefined && { isFlashDeal }),
        ...(flashDealEnd !== undefined && { flashDealEnd: flashDealEnd ? new Date(flashDealEnd) : null }),
        ...(warrantyEn !== undefined && { warrantyEn }),
        ...(warrantyAr !== undefined && { warrantyAr }),
        ...(specs !== undefined && { specs: typeof specs === 'object' ? JSON.stringify(specs) : specs }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
      include: {
        variants: true,
        images: true,
        category: true,
        brand: true,
      },
    });

    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
}

// --- Order Management ---
export async function getAdminOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          payment: true,
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    return sendSuccess(res, orders, 'Orders fetched', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(cancelReason && { cancelReason }),
      },
      include: { items: true, payment: true },
    });

    return sendSuccess(res, order, 'Order status updated');
  } catch (error) {
    next(error);
  }
}

// --- Categories CRUD ---
export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug, nameEn, nameAr, descriptionEn, descriptionAr, image, icon, parentId, isFeatured, order } = req.body;
    const category = await prisma.category.create({
      data: { slug, nameEn, nameAr, descriptionEn, descriptionAr, image, icon, parentId, isFeatured, order: order || 0 },
    });
    return sendSuccess(res, category, 'Category created', 201);
  } catch (error) {
    next(error);
  }
}

// --- Brands CRUD ---
export async function createBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug, name, logo, descriptionEn, descriptionAr, isFeatured } = req.body;
    const brand = await prisma.brand.create({
      data: { slug, name, logo, descriptionEn, descriptionAr, isFeatured: Boolean(isFeatured) },
    });
    return sendSuccess(res, brand, 'Brand created', 201);
  } catch (error) {
    next(error);
  }
}

// --- Coupons CRUD ---
export async function createCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, validFrom, validUntil, usageLimit } = req.body;
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        maxDiscount,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: new Date(validUntil),
        usageLimit,
      },
    });
    return sendSuccess(res, coupon, 'Coupon created', 201);
  } catch (error) {
    next(error);
  }
}

export async function getAdminCoupons(req: Request, res: Response, next: NextFunction) {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return sendSuccess(res, coupons);
  } catch (error) {
    next(error);
  }
}

// --- Banners CRUD ---
export async function createBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const { titleEn, titleAr, subtitleEn, subtitleAr, imageEn, imageAr, link, buttonTextEn, buttonTextAr, position, order } = req.body;
    const banner = await prisma.banner.create({
      data: {
        titleEn,
        titleAr,
        subtitleEn,
        subtitleAr,
        imageEn,
        imageAr,
        link: link || '/',
        buttonTextEn: buttonTextEn || 'Shop Now',
        buttonTextAr: buttonTextAr || 'تسوق الآن',
        position: position || 'HERO',
        order: order || 0,
      },
    });
    return sendSuccess(res, banner, 'Banner created', 201);
  } catch (error) {
    next(error);
  }
}

// --- Messages & Reviews ---
export async function getAdminMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    return sendSuccess(res, messages);
  } catch (error) {
    next(error);
  }
}

export async function getAdminUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
}
