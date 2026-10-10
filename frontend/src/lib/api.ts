import axios, { AxiosError } from 'axios';
import { getOrCreateSessionId } from './utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('technest_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const sessionId = getOrCreateSessionId();
    if (sessionId) {
      config.headers['x-session-id'] = sessionId;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken && typeof window !== 'undefined') {
          localStorage.setItem('technest_access_token', newAccessToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('technest_access_token');
          localStorage.removeItem('technest_user');
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Typed API services
export const api = {
  // Auth
  register: (data: any) => apiClient.post('/auth/register', data).then((r) => r.data),
  login: (data: any) => apiClient.post('/auth/login', data).then((r) => r.data),
  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
  getMe: () => apiClient.get('/auth/me').then((r) => r.data),
  updateProfile: (data: any) => apiClient.put('/auth/profile', data).then((r) => r.data),
  changePassword: (data: any) => apiClient.put('/auth/change-password', data).then((r) => r.data),

  // Products
  getProducts: (params?: Record<string, any>) => apiClient.get('/products', { params }).then((r) => r.data),
  getProductBySlug: (slug: string) => apiClient.get(`/products/slug/${slug}`).then((r) => r.data),
  getRelatedProducts: (id: string) => apiClient.get(`/products/${id}/related`).then((r) => r.data),
  getFeaturedProducts: () => apiClient.get('/products/featured').then((r) => r.data),
  getFlashDeals: () => apiClient.get('/products/flash-deals').then((r) => r.data),
  getSearchSuggestions: (q: string) => apiClient.get('/products/search/suggestions', { params: { q } }).then((r) => r.data),

  // Categories & Brands
  getCategories: () => apiClient.get('/categories').then((r) => r.data),
  getCategoryBySlug: (slug: string) => apiClient.get(`/categories/slug/${slug}`).then((r) => r.data),
  getBrands: () => apiClient.get('/brands').then((r) => r.data),

  // Cart
  getCart: () => apiClient.get('/cart').then((r) => r.data),
  addToCart: (data: { productId: string; variantId?: string | null; quantity: number }) =>
    apiClient.post('/cart/items', data).then((r) => r.data),
  updateCartItem: (itemId: string, quantity: number) =>
    apiClient.put(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  removeCartItem: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`).then((r) => r.data),
  clearCart: () => apiClient.delete('/cart').then((r) => r.data),
  mergeCart: (guestItems: any[]) => apiClient.post('/cart/merge', { guestItems }).then((r) => r.data),

  // Orders
  createOrder: (data: any) => apiClient.post('/orders', data).then((r) => r.data),
  getOrders: () => apiClient.get('/orders').then((r) => r.data),
  getOrderById: (id: string) => apiClient.get(`/orders/${id}`).then((r) => r.data),
  cancelOrder: (id: string, reason?: string) => apiClient.post(`/orders/${id}/cancel`, { reason }).then((r) => r.data),

  // Wishlist
  getWishlist: () => apiClient.get('/wishlist').then((r) => r.data),
  toggleWishlist: (productId: string) => apiClient.post('/wishlist/toggle', { productId }).then((r) => r.data),

  // Reviews
  getProductReviews: (productId: string) => apiClient.get(`/reviews/product/${productId}`).then((r) => r.data),
  addReview: (data: any) => apiClient.post('/reviews', data).then((r) => r.data),

  // Coupons
  validateCoupon: (code: string, amount: number) => apiClient.post('/coupons/validate', { code, amount }).then((r) => r.data),

  // Addresses
  getAddresses: () => apiClient.get('/addresses').then((r) => r.data),
  addAddress: (data: any) => apiClient.post('/addresses', data).then((r) => r.data),
  updateAddress: (id: string, data: any) => apiClient.put(`/addresses/${id}`, data).then((r) => r.data),
  deleteAddress: (id: string) => apiClient.delete(`/addresses/${id}`).then((r) => r.data),

  // Banners & Contact
  getBanners: (position?: string) => apiClient.get('/banners', { params: { position } }).then((r) => r.data),
  submitContact: (data: any) => apiClient.post('/contact', data).then((r) => r.data),

  // Admin
  getAdminStats: () => apiClient.get('/admin/stats').then((r) => r.data),
  getAdminOrders: (params?: any) => apiClient.get('/admin/orders', { params }).then((r) => r.data),
  updateOrderStatus: (id: string, status: string) => apiClient.put(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
  createProduct: (data: any) => apiClient.post('/admin/products', data).then((r) => r.data),
};
