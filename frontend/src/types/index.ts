export type Language = 'en' | 'ar';
export type Currency = 'EGP' | 'AED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  image?: string | null;
  icon?: string | null;
  parentId?: string | null;
  children?: Category[];
  _count?: { products: number };
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  colorEn?: string | null;
  colorAr?: string | null;
  colorHex?: string | null;
  storage?: string | null;
  ram?: string | null;
  priceOffset: number;
  stock: number;
  image?: string | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altEn?: string | null;
  altAr?: string | null;
  isPrimary: boolean;
  order: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: { id: string; name: string };
  rating: number;
  title?: string | null;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  brandId: string;
  brand?: Brand;
  categoryId: string;
  category?: Category;
  basePrice: number;
  discountPrice?: number | null;
  isFeatured: boolean;
  isFlashDeal: boolean;
  flashDealEnd?: string | null;
  rating: number;
  numReviews: number;
  isAvailable: boolean;
  warrantyEn?: string | null;
  warrantyAr?: string | null;
  specs?: string | null;
  variants: ProductVariant[];
  images: ProductImage[];
  reviews?: Review[];
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: {
    id: string;
    slug: string;
    nameEn: string;
    nameAr: string;
    image?: string | null;
    basePrice: number;
    discountPrice?: number | null;
  };
  variant?: {
    id: string;
    sku: string;
    colorEn?: string | null;
    colorAr?: string | null;
    colorHex?: string | null;
    storage?: string | null;
    ram?: string | null;
    priceOffset: number;
    stock: number;
  } | null;
  unitPrice: number;
  total: number;
}

export interface Cart {
  id?: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  productNameEn: string;
  productNameAr: string;
  variantInfoEn?: string | null;
  variantInfoAr?: string | null;
  image?: string | null;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressSnapshot: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  currency: 'EGP' | 'AED';
  notes?: string | null;
  cancelReason?: string | null;
  items: OrderItem[];
  payment?: {
    method: 'COD' | 'STRIPE';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    amount: number;
    currency: string;
  };
  createdAt: string;
}

export interface Banner {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string | null;
  subtitleAr?: string | null;
  imageEn: string;
  imageAr: string;
  link: string;
  buttonTextEn: string;
  buttonTextAr: string;
  position: 'HERO' | 'PROMO' | 'MIDDLE';
  order: number;
}
