# TechNest E-Commerce Platform (Dubai Phone Alternative)

**TechNest** is a full-stack, production-quality electronics and smart gadgets retail platform inspired by the structure of [Dubai Phone](https://dubaiphone.net), featuring an original, state-of-the-art modern brand identity, full bilingual internationalization (Arabic RTL + English LTR), dual currency support (EGP & AED), comprehensive dark/light mode tokens, guest cart persistence with automatic account merging, atomic database inventory management, and an admin dashboard.

---

## ⚡ Quick Start (Run Locally)

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### 1. Backend Setup & Run (One Command)
```bash
cd backend
npm install
npm run setup    # Generates Prisma client, pushes SQLite schema, and seeds 69+ products & users
npm run dev      # Starts API server on http://localhost:5000
```
- API Docs (Swagger / OpenAPI): **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**
- Health Check: **[http://localhost:5000/health](http://localhost:5000/health)**

### 2. Frontend Setup & Run (One Command)
```bash
cd frontend
npm install
npm run dev      # Starts Next.js storefront on http://localhost:3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Seed Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@technest.com` | `Admin@123456` | Full Admin Dashboard (`/admin`), product CRUD, order status management, metrics |
| **Customer** | `customer@technest.com` | `Customer@123456` | Profile, addresses, order history, reviews, shopping cart & checkout |

> 💡 **Tip:** On the `/login` page, click the **"Admin Demo"** or **"Customer Demo"** button to auto-fill the credentials instantly with zero typing!

### Active Promo Coupons (Seeded)
- `WELCOME10`: 10% off orders over 1,000 EGP (capped at 500 EGP)
- `TECH50`: 50 EGP flat discount on orders over 500 EGP
- `SUPERDEAL`: 15% off orders over 5,000 EGP (capped at 1,500 EGP)

---

## 🌍 Language & Currency Switching

- **Language (Arabic / English):**
  - Click the **Language switcher** in the top bar or header.
  - Arabic uses an authentic RTL layout with the **Cairo** typography and mirrored carousels/drawers.
  - English uses an LTR layout with **Inter** typography.
  - The language preference is saved to `localStorage` and a persistent cookie.
  - All product titles, descriptions, categories, banners, and specifications are stored bilingually in the database (`nameEn` / `nameAr`, `descriptionEn` / `descriptionAr`).

- **Currency (EGP / AED):**
  - Switch between Egyptian Pounds (**EGP / ج.م**) and UAE Dirhams (**AED / د.إ**) with a single click in the header.
  - All store prices and checkout totals recalculate dynamically across the whole application.

- **Theme (Light / Dark):**
  - Click the sun/moon icon in the header for smooth, tokenized dark/light mode transitions without visual flash.

---

## 🧱 Architecture & Project Structure

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # SQLite/PostgreSQL schema with 18 models
│   │   └── seed.ts             # 69+ bilingual products, 9 categories, 10 brands, coupons, banners
│   ├── src/
│   │   ├── config/             # DB, environment, Swagger specs
│   │   ├── controllers/        # Auth, product, category, brand, cart, order, wishlist, review, admin
│   │   ├── middlewares/        # Auth (JWT Bearer/cookie), rate limiter, error handler, Zod validate
│   │   ├── routes/             # Versioned REST endpoints (/api/v1/...)
│   │   ├── utils/              # JWT token generator, API response helpers, mock mailer
│   │   ├── validations/        # Zod request validation schemas
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server bootstrap
│   └── tests/
│       └── api.test.ts         # Vitest integration tests for auth, cart, stock decrement, cancellation
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router (home, products, slug, cart, checkout, profile, admin)
│   │   ├── components/
│   │   │   ├── layout/         # Header, MegaMenu, MobileDrawer, Footer
│   │   │   ├── home/           # HeroSlider, FlashDeals, CategoryGrid, BrandStrip, Newsletter
│   │   │   ├── product/        # ProductCard, Gallery, VariantSelector, Specs, Reviews
│   │   │   ├── cart/           # CartDrawer (sliding drawer)
│   │   │   └── ui/             # ThemeToggle, LanguageToggle, CurrencyToggle, SearchModal
│   │   ├── lib/
│   │   │   ├── api.ts          # Typed Axios client with auth refresh interceptors
│   │   │   ├── store.ts        # Zustand global state (cart, wishlist, language, currency, auth)
│   │   │   ├── translations.ts # Full bilingual Arabic & English dictionaries
│   │   │   └── utils.ts        # Currency formatting and helpers
│   │   └── types/              # Comprehensive TypeScript interfaces
├── docker-compose.yml          # Multi-container orchestration (PostgreSQL + backend + frontend)
└── README.md
```

---

## 🔌 API Documentation (v1)

All endpoints reside under `/api/v1`:

| Area | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | POST | `/auth/register` | Register customer |
| | POST | `/auth/login` | Login (returns access token & sets refresh cookie) |
| | POST | `/auth/refresh` | Rotate access token via refresh token |
| | GET | `/auth/me` | Current authenticated user profile |
| **Catalog** | GET | `/products` | Filter by category, brand, price range, stock, sort, search |
| | GET | `/products/slug/:slug`| Full product details with variants, images & reviews |
| | GET | `/products/flash-deals`| Time-limited deals |
| | GET | `/products/search/suggestions`| Live debounced search suggestions |
| | GET | `/categories` | Category tree |
| | GET | `/brands` | Brand catalog |
| **Cart** | GET | `/cart` | Fetch guest or authenticated cart |
| | POST | `/cart/items` | Add product/variant to cart with stock check |
| | PUT | `/cart/items/:id` | Update quantity |
| | DELETE | `/cart/items/:id` | Remove item |
| | POST | `/cart/merge` | Merge guest items into account on login |
| **Orders** | POST | `/orders` | Place order (atomic stock decrement in transaction) |
| | GET | `/orders` | User order history with status timeline |
| | POST | `/orders/:id/cancel` | Cancel pending order and roll back stock |
| **Admin** | GET | `/admin/stats` | Dashboard revenue, orders, catalog and users KPIs |
| | GET | `/admin/orders` | Admin orders list |
| | PUT | `/admin/orders/:id/status` | Update order delivery status |

Full interactive Swagger API docs are available at: `http://localhost:5000/api/docs`.

---

## 🐳 Docker Deployment

To launch the full environment with PostgreSQL:
```bash
docker-compose up --build
```

---

## 🧪 Testing

- **Backend Integration Tests:**
  ```bash
  cd backend
  npm test
  ```
  Tests cover: Customer authentication, product filtering, cart totals calculation, order transaction with atomic stock decrement, and order cancellation stock rollback.

---

## 💡 Decisions Made & Implementation Highlights

1. **Zero-Dependency Local Setup:** SQLite via Prisma ORM is configured as the default database, allowing anyone to clone and run the backend immediately without having to run or configure an external PostgreSQL server. PostgreSQL is also fully supported via `docker-compose.yml` and `.env`.
2. **Atomic Inventory Decrement:** Checkout operations decrement variant stock inside a `prisma.$transaction`. If an order is cancelled, stock is restored automatically.
3. **Guest-to-User Cart Continuity:** Guest visitors can add products to cart using a generated persistent session ID; upon logging in, their guest items are merged into their account cart seamlessly.
4. **Rich RTL/LTR Localization:** Rather than naive text replacement, the layout responds with full RTL CSS classes, mirrored animation slides, and culturally accurate currency labels (`ج.م` / `د.إ`).
