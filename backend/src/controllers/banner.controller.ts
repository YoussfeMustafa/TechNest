import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getBanners(req: Request, res: Response, next: NextFunction) {
  try {
    const { position } = req.query;

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position ? { position: position as string } : {}),
      },
      orderBy: { order: 'asc' },
    });

    return sendSuccess(res, banners);
  } catch (error) {
    next(error);
  }
}
