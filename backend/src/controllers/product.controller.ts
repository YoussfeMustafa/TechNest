import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      isFeatured,
      isFlashDeal,
      search,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category) {
      where.OR = [
        { category: { slug: category } },
        { categoryId: category },
      ];
    }

    if (brand) {
      where.OR = [
        { brand: { slug: brand } },
        { brandId: brand },
      ];
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }

    if (rating) {
      where.rating = { gte: parseFloat(rating) };
    }

    if (inStock === 'true') {
      where.isAvailable = true;
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    if (isFlashDeal === 'true') {
      where.isFlashDeal = true;
    }

    if (search) {
      const searchTerms = search.trim();
      where.OR = [
        { nameEn: { contains: searchTerms } },
        { nameAr: { contains: searchTerms } },
        { descriptionEn: { contains: searchTerms } },
        { descriptionAr: { contains: searchTerms } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { basePrice: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { basePrice: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'popularity') {
      orderBy = { numReviews: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, nameEn: true, nameAr: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logo: true } },
          images: { orderBy: { order: 'asc' } },
          variants: true,
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    return sendSuccess(res, products, 'Products retrieved successfully', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}

export async function getRelatedProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true, brandId: true },
    });

    if (!currentProduct) {
      return sendError(res, 'Product not found', 404);
    }

    const related = await prisma.product.findMany({
      where: {
        id: { not: id },
        OR: [
          { categoryId: currentProduct.categoryId },
          { brandId: currentProduct.brandId },
        ],
      },
      include: {
        category: { select: { id: true, nameEn: true, nameAr: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
      },
      take: 6,
    });

    return sendSuccess(res, related);
  } catch (error) {
    next(error);
  }
}

export async function getSearchSuggestions(req: Request, res: Response, next: NextFunction) {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return sendSuccess(res, { products: [], categories: [] });
    }

    const query = q.trim();

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { nameEn: { contains: query } },
            { nameAr: { contains: query } },
          ],
        },
        select: {
          id: true,
          slug: true,
          nameEn: true,
          nameAr: true,
          basePrice: true,
          discountPrice: true,
          images: { take: 1, orderBy: { order: 'asc' } },
        },
        take: 6,
      }),
      prisma.category.findMany({
        where: {
          OR: [
            { nameEn: { contains: query } },
            { nameAr: { contains: query } },
          ],
        },
        select: {
          id: true,
          slug: true,
          nameEn: true,
          nameAr: true,
        },
        take: 4,
      }),
    ]);

    return sendSuccess(res, { products, categories });
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true },
      include: {
        category: { select: { id: true, nameEn: true, nameAr: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
      },
      take: 10,
    });
    return sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}

export async function getFlashDeals(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await prisma.product.findMany({
      where: { isFlashDeal: true },
      include: {
        category: { select: { id: true, nameEn: true, nameAr: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
      },
      take: 8,
    });
    return sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}
