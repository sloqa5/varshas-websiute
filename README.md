# Procktails E-Commerce Platform

A modern, cinematic e-commerce platform for premium cocktail sachets built with React, TypeScript, Express.js, and Shopify integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Shopify store with API access

### Setup

1. **Install Dependencies**
   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Frontend
   cp .env.example .env
   # Edit .env with your configuration

   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your Shopify and database credentials
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb procktails

   # Run schema
   psql -d procktails -f backend/src/config/schema.sql
   ```

4. **Start Development Servers**
   ```bash
   # Backend (port 3001)
   cd backend
   npm run dev

   # Frontend (port 3000)
   cd ..
   npm run dev
   ```

Visit http://localhost:3000 to see the application.

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **Zustand** for state management
- **Framer Motion** for animations

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** for data persistence
- **JWT** for authentication
- **Shopify APIs** for e-commerce integration

### Key Features
- ✅ Cinematic product showcase
- ✅ Shopping cart with localStorage persistence
- ✅ User authentication via Shopify Customer API
- ✅ Product catalog from Shopify Storefront API
- ✅ Secure checkout through Shopify
- ✅ Order tracking via webhooks
- ✅ Mobile-responsive design

## 📁 Project Structure

```
varshas-websiute/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductModal.tsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Home.tsx
│   │   ├── Cart.tsx
│   │   ├── Login.tsx
│   │   └── Checkout.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.tsx
│   ├── store/              # Zustand stores
│   │   └── cartStore.ts
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   └── styles/             # CSS styles
│       └── globals.css
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── src/config/schema.sql
├── package.json
└── README.md
```

## 🔧 Configuration

### Shopify Setup

1. **Create Custom App** in your Shopify Admin
2. **Configure API Permissions**:
   - Storefront API: Products, Inventory
   - Admin API: Products, Orders, Customers

3. **Set Environment Variables**:
   ```bash
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_ADMIN_API_TOKEN=your_admin_api_token
   SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
   ```

### Webhook Configuration

Configure these webhooks in your Shopify app settings:

- `orders/create` → `http://your-domain.com/api/webhooks/shopify/orders/create`
- `orders/paid` → `http://your-domain.com/api/webhooks/shopify/orders/paid`
- `orders/updated` → `http://your-domain.com/api/webhooks/shopify/orders/updated`
- `inventory_levels/update` → `http://your-domain.com/api/webhooks/shopify/inventory_levels/update`

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
npm run build
npm start
```

Set production environment variables in your hosting platform.

## 🎨 Design System

### Color Palette
- Background: `#0f0a08`
- Card: `#1b1411`
- Text: `#f8f3ec`
- Muted: `#c8bfb5`
- Gold (accent): `#d6a354`

### Typography
- Font: Inter, Helvetica Neue, Arial
- Responsive sizing with CSS clamp()

### Animations
- Smooth scroll effects
- Hover transitions
- Loading states
- Modal animations

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions
- Accessible navigation

## 🔐 Security

- JWT-based authentication
- Rate limiting on API endpoints
- Input sanitization
- HTTPS enforcement
- Shopify handles all payment processing

## 🛍️ E-commerce Features

### Product Management
- Real-time inventory sync with Shopify
- Product variants and pricing
- Image galleries and hover effects
- Detailed product information tabs

### Shopping Experience
- Add to cart with optimistic updates
- Quantity controls
- Cart persistence across sessions
- Guest checkout support

### Order Processing
- Shopify checkout integration
- Order status tracking
- Customer account sync
- Email notifications (via Shopify)

## 🔄 Cart State Management

The cart uses Zustand for state management with:
- localStorage persistence for offline support
- Backend sync for authenticated users
- Optimistic updates for better UX
- Automatic cart merging on login

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Cart
- `GET /api/cart` - Get cart contents
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:id` - Remove item

### Checkout
- `POST /api/checkout/create` - Create checkout session
- `POST /api/checkout/validate` - Validate cart

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
```

## 📝 Development Notes

### Product Data Flow
1. Products fetched from Shopify API
2. Cached in PostgreSQL for 15 minutes
3. Served to frontend with inventory info
4. Real-time updates via webhooks

### Cart Persistence
- Anonymous users: localStorage only
- Authenticated users: database sync
- Automatic cart merging on login
- Clear cart after successful checkout

### Authentication Flow
1. User registers/logs in via Shopify Customer API
2. JWT token issued for session management
3. Customer data synced to our database
4. Cart merging and persistence

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests if applicable
5. Submit pull request

## 📄 License

Private project - All rights reserved.