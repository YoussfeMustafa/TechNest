import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/db.js';

describe('TechNest Backend Critical Integration Tests', () => {
  let customerToken: string;
  let testProductId: string;
  let testVariantId: string;
  let initialStock = 0;

  beforeAll(async () => {
    // Locate a product with variant
    const product = await prisma.product.findFirst({
      where: { variants: { some: { stock: { gt: 5 } } } },
      include: { variants: true },
    });
    if (product && product.variants.length > 0) {
      testProductId = product.id;
      testVariantId = product.variants[0].id;
      initialStock = product.variants[0].stock;
    }
  });

  it('1. Authentication Flow: Customer login returns JWT token and user profile', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'customer@technest.com',
        password: 'Customer@123456',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('customer@technest.com');
    customerToken = res.body.data.accessToken;
  });

  it('2. Products Catalog: Fetch products with filtering, search, and pagination', async () => {
    const res = await request(app)
      .get('/api/v1/products?limit=5&sort=price-asc');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('3. Cart Flow: Add item to user cart and verify calculated totals', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProductId,
        variantId: testVariantId,
        quantity: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.itemCount).toBeGreaterThan(0);
    expect(res.body.data.subtotal).toBeGreaterThan(0);
  });

  it('4. Checkout & Stock Decrement: Place order and verify atomic stock decrement', async () => {
    // Fetch variant stock before order
    const variantBefore = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    const stockBefore = variantBefore!.stock;

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        paymentMethod: 'COD',
        couponCode: 'WELCOME10',
        shippingAddress: {
          recipientName: 'Test Buyer',
          phone: '+201012345678',
          street: '10 Test St',
          city: 'Cairo',
          country: 'Egypt',
        },
        items: [
          {
            productId: testProductId,
            variantId: testVariantId,
            quantity: 1,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBeDefined();
    expect(res.body.data.status).toBe('PENDING');

    // Verify stock was decremented atomically in database
    const variantAfter = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    expect(variantAfter!.stock).toBe(stockBefore - 1);
  });

  it('5. Order Cancellation: Cancel order and verify stock restoration', async () => {
    // Fetch customer's latest order
    const ordersRes = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(ordersRes.status).toBe(200);
    const latestOrder = ordersRes.body.data[0];
    expect(latestOrder).toBeDefined();

    const variantBefore = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    const stockBeforeCancel = variantBefore!.stock;

    // Cancel the order
    const cancelRes = await request(app)
      .post(`/api/v1/orders/${latestOrder.id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Changed my mind' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');

    // Verify stock was restored
    const variantAfterCancel = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    expect(variantAfterCancel!.stock).toBe(stockBeforeCancel + 1);
  });
});
