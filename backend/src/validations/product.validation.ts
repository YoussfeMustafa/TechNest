import { z } from 'zod';

export const listProductsQuerySchema = z.object({
  query: z.object({
    category: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    rating: z.string().regex(/^\d+$/).optional(),
    inStock: z.enum(['true', 'false']).optional(),
    isFeatured: z.enum(['true', 'false']).optional(),
    isFlashDeal: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
    sort: z.enum(['newest', 'price-asc', 'price-desc', 'rating', 'popularity']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }).optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    nameEn: z.string().min(2),
    nameAr: z.string().min(2),
    slug: z.string().min(2),
    descriptionEn: z.string().min(10),
    descriptionAr: z.string().min(10),
    brandId: z.string(),
    categoryId: z.string(),
    basePrice: z.number().positive(),
    discountPrice: z.number().positive().optional(),
    isFeatured: z.boolean().optional(),
    isFlashDeal: z.boolean().optional(),
    flashDealEnd: z.string().datetime().optional(),
    warrantyEn: z.string().optional(),
    warrantyAr: z.string().optional(),
    specs: z.string().optional(),
    variants: z.array(
      z.object({
        sku: z.string(),
        colorEn: z.string().optional(),
        colorAr: z.string().optional(),
        colorHex: z.string().optional(),
        storage: z.string().optional(),
        ram: z.string().optional(),
        priceOffset: z.number().default(0),
        stock: z.number().int().min(0).default(0),
        image: z.string().optional(),
      })
    ).optional(),
    images: z.array(
      z.object({
        url: z.string(),
        altEn: z.string().optional(),
        altAr: z.string().optional(),
        isPrimary: z.boolean().optional(),
        order: z.number().int().optional(),
      })
    ).optional(),
  }),
});
