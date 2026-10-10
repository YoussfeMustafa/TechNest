import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export async function submitContactMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return sendError(res, 'Please provide name, email, subject, and message', 400);
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
      },
    });

    return sendSuccess(res, contact, 'Message sent successfully. We will contact you soon.', 201);
  } catch (error) {
    next(error);
  }
}
