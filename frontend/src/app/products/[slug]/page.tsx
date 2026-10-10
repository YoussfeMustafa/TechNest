'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useStore } from '../../../lib/store';
import { translations } from '../../../lib/translations';
import { formatPrice } from '../../../lib/utils';
import { Product, ProductVariant } from '../../../types';
import { ProductCard } from '../../../components/product/ProductCard';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingCart,
  Check,
  Share2,
  Loader2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export default function ProductDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { language, currency, addToCart, toggleWishlist, isInWishlist, user } = useStore();
  const t = translations[language];

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await api.getProductBySlug(slug);
        if (res.data) {
          const prod: Product = res.data;
          setProduct(prod);
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }
          if (prod.images && prod.images.length > 0) {
            setActiveImage(prod.images[0].url);
          }

          // Fetch related
          const relRes = await api.getRelatedProducts(prod.id);
          if (relRes.data) setRelated(relRes.data);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
        <button
          onClick={() => router.push('/products')}
          className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm"
        >
          {t.continueShopping}
        </button>
      </div>
    );
  }

  // Calculate pricing with variant offset
  const basePrice = product.discountPrice || product.basePrice;
  const currentPrice = basePrice + (selectedVariant?.priceOffset || 0);
  const originalPrice = product.basePrice + (selectedVariant?.priceOffset || 0);
  const inWishlist = isInWishlist(product.id);
  const currentStock = selectedVariant ? selectedVariant.stock : 999;

  // Specs parser
  let specsObj: Record<string, string> = {};
  if (product.specs) {
    try {
      specsObj = JSON.parse(product.specs);
    } catch (e) {
      // Not JSON
    }
  }

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await addToCart(product.id, selectedVariant?.id || null, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!user) {
      setReviewError(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please sign in first');
      return;
    }

    try {
      setSubmittingReview(true);
      await api.addReview({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      setReviewComment('');
      setReviewTitle('');
      // Reload product to refresh reviews
      const res = await api.getProductBySlug(slug);
      if (res.data) setProduct(res.data);
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="py-6 space-y-12">
      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 flex items-center justify-center overflow-hidden shadow-sm">
            <img
              src={activeImage || product.images?.[0]?.url}
              alt={language === 'ar' ? product.nameAr : product.nameEn}
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 hover:scale-105"
            />
            {product.discountPrice && (
              <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-lg">
                {Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)}% {t.off}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border p-2 shrink-0 transition-all ${
                    activeImage === img.url
                      ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.altEn || ''}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Action Buttons */}
        <div className="space-y-6">
          {/* Brand & Stock */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
              {product.brand?.name}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                currentStock > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {currentStock > 0 ? `${t.inStock} (${currentStock})` : t.outOfStock}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {language === 'ar' ? product.nameAr : product.nameEn}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 text-xs font-semibold">
              {product.numReviews} {t.reviews}
            </span>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-baseline gap-3">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {formatPrice(currentPrice, currency, language)}
            </span>
            {product.discountPrice && (
              <span className="text-sm font-bold text-slate-400 line-through">
                {formatPrice(originalPrice, currency, language)}
              </span>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {language === 'ar' ? 'الخيارات المتاحة (اللون / السعة)' : 'Available Options'}
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const label = [
                    language === 'ar' ? v.colorAr : v.colorEn,
                    v.storage,
                    v.ram,
                  ]
                    .filter(Boolean)
                    .join(' - ');

                  const isSelected = selectedVariant?.id === v.id;

                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {v.colorHex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: v.colorHex }}
                        />
                      )}
                      <span>{label || v.sku}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="px-3 py-1 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  +
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition-all ${
                  inWishlist
                    ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500'
                }`}
                title={t.wishlist}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || currentStock <= 0}
                className={`py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 active:scale-98'
                }`}
              >
                {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                <span>{added ? t.addedToCart : t.addToCart}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="py-3.5 px-6 rounded-2xl font-black text-sm bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 transition-all active:scale-98"
              >
                {t.buyNow}
              </button>
            </div>
          </div>

          {/* Warranty & Delivery Info */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{language === 'ar' ? (product.warrantyAr || 'ضمان معتمد سنة') : (product.warrantyEn || '1 Year Official Warranty')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Truck className="w-4 h-4 text-blue-500" />
              <span>{language === 'ar' ? 'توصيل سريع خلال 24-48 ساعة' : 'Express Delivery in 24-48 hrs'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {Object.keys(specsObj).length > 0 && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {t.specs}
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Object.entries(specsObj).map(([key, val]) => (
              <div key={key} className="py-3 grid grid-cols-1 sm:grid-cols-3 text-xs sm:text-sm">
                <span className="font-bold text-slate-500 dark:text-slate-400">{key}</span>
                <span className="sm:col-span-2 font-medium text-slate-800 dark:text-slate-200">{val}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews & Form */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>{t.reviews}</span>
          </h3>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {product.reviews?.length || 0} {t.reviews}
          </span>
        </div>

        {/* Existing reviews */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {rev.user?.name || 'Customer'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold">
                      Verified Buyer
                    </span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                {rev.title && <h5 className="font-bold text-xs">{rev.title}</h5>}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No customer reviews yet. Be the first to review!</p>
          )}
        </div>

        {/* Submit Review Box */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{t.writeReview}</h4>
          <p className="text-xs text-slate-400 mb-4">{t.onlyVerifiedBuyers}</p>

          {reviewSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              Thank you! Your verified review has been submitted.
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {reviewError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Star Rating select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t.rating}:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`p-1 ${star <= reviewRating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Title (e.g. Outstanding battery life and display)"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <textarea
                required
                rows={3}
                placeholder={t.reviewComment}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : t.submitReview}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="my-12">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
            {t.relatedProducts}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
