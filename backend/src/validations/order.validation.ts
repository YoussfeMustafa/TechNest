import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string().optional(),
    shippingAddress: z.object({
      recipientName: z.string().min(2),
      phone: z.string().min(6),
      street: z.string().min(3),
      city: z.string().min(2),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().default('Egypt'),
    }).optional(),
    paymentMethod: z.enum(['COD', 'STRIPE']).default('COD'),
    couponCode: z.string().optional(),
    notes: z.string().optional(),
    currency: z.enum(['EGP', 'AED']).default('EGP'),
    items: z.array(
      z.object({
        productId: z.string(),
        variantId: z.string().nullable().optional(),
        quantity: z.number().int().positive(),
      })
    ).optional(), // If not provided, items from user's cart are used
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    cancelReason: z.string().optional(),
  }),
});
