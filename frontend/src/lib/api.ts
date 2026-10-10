import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getOrCreateSessionId } from './utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL must be configured before using the API.');
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (token) {
        prom.resolve(token);
      } else {
        prom.reject(new Error('Token refresh did not return an access token.'));
      }
    }
  });
  failedQueue = [];
};

const SESSION_EXPIRED_MESSAGE = 'Your session expired. Please sign in again.';

function clearSessionAndRedirect() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('technest_access_token');
  localStorage.removeItem('technest_refresh_token');
  localStorage.removeItem('technest_user');

  const params = new URLSearchParams(window.location.search);
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const returnTo = window.location.pathname === '/login'
    ? params.get('returnTo')
    : currentPath;
  const query = new URLSearchParams({ message: 'session-expired' });
  if (returnTo?.startsWith('/') && !returnTo.startsWith('//')) {
    query.set('returnTo', returnTo);
  }
  window.location.replace(`/login?${query.toString()}`);
}

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('technest_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      config.headers.delete('Authorization');
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
    const originalRequest = error.config as RetryConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const requestUrl = originalRequest.url || '';
      if (
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/logout') ||
        requestUrl.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      const refreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('technest_refresh_token')
        : null;
      const hasStoredUser = typeof window !== 'undefined'
        && localStorage.getItem('technest_user') !== null;
      if (!hasStoredUser && !refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        originalRequest._retry = true;
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
            return apiClient(originalRequest);
          })
          .catch((err: Error) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken && typeof window !== 'undefined') {
          localStorage.setItem('technest_access_token', newAccessToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
          return apiClient(originalRequest);
        }
        throw new Error('The refresh endpoint did not return a new access token.');
      } catch (refreshErr) {
        const sessionError = new Error(SESSION_EXPIRED_MESSAGE);
        processQueue(sessionError, null);
        clearSessionAndRedirect();
        return Promise.reject(sessionError);
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
  logout: (refreshToken?: string | null) =>
    apiClient.post('/auth/logout', { refreshToken }).then((r) => r.data),
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
  mergeCart: (guestItems: any[]) =>
    apiClient.post('/cart/merge', { guestItems, sessionId: getOrCreateSessionId() }).then((r) => r.data),

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
