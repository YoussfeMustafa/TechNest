import { Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export async function getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return sendSuccess(res, addresses);
  } catch (error) {
    next(error);
  }
}

export async function addAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const { label, recipientName, phone, street, city, state, postalCode, country, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const count = await prisma.address.count({ where: { userId } });
    const markDefault = isDefault || count === 0;

    const address = await prisma.address.create({
      data: {
        userId,
        label: label || 'Home',
        recipientName,
        phone,
        street,
        city,
        state,
        postalCode,
        country: country || 'Egypt',
        isDefault: markDefault,
      },
    });

    return sendSuccess(res, address, 'Address added successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) return sendError(res, 'Address not found', 404);

    const { label, recipientName, phone, street, city, state, postalCode, country, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(label && { label }),
        ...(recipientName && { recipientName }),
        ...(phone && { phone }),
        ...(street && { street }),
        ...(city && { city }),
        ...(state !== undefined && { state }),
        ...(postalCode !== undefined && { postalCode }),
        ...(country && { country }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return sendSuccess(res, updated, 'Address updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) return sendError(res, 'Address not found', 404);

    await prisma.address.delete({ where: { id } });

    return sendSuccess(res, null, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
}
