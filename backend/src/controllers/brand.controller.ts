import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export async function getBrands(req: Request, res: Response, next: NextFunction) {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, brands);
  } catch (error) {
    next(error);
  }
}

export async function getBrandBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!brand) {
      return sendError(res, 'Brand not found', 404);
    }

    return sendSuccess(res, brand);
  } catch (error) {
    next(error);
  }
}
