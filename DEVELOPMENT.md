# Development Checklist

## 🧪 Testing Guide

### Phase 1: Frontend Testing
- [ ] **Homepage Rendering**
  - [ ] Hero section with video fallback animation
  - [ ] Product grid displays correctly
  - [ ] Recipe cards and benefits section
  - [ ] Video tutorials section
  - [ ] About section with split layout
  - [ ] Footer navigation

- [ ] **Product Interactions**
  - [ ] Product cards show hover effects
  - [ ] Click to open product modal
  - [ ] Modal tabs work (description, ingredients, benefits, etc.)
  - [ ] Add to cart functionality
  - [ ] Toast notifications appear
  - [ ] Cart count updates in header

- [ ] **Cart Management**
  - [ ] Cart page renders correctly
  - [ ] Add/remove items functionality
  - [ ] Quantity controls work
  - [ ] Subtotal calculation correct
  - [ ] Empty cart state shows correctly

- [ ] **Navigation**
  - [ ] Smooth scroll navigation works
  - [ ] Router navigation between pages
  - [ ] Mobile responsive navigation
  - [ ] Cart badge updates across pages

### Phase 2: Authentication Testing
- [ ] **Registration Flow**
  - [ ] Registration form validation
  - [ ] Successful registration redirects
  - [ ] Error handling for existing emails
  - [ ] Password requirements enforced

- [ ] **Login Flow**
  - [ ] Login form validation
  - [ ] Successful login redirects to home
  - [ ] Error handling for invalid credentials
  - [ ] Remember me functionality

- [ ] **User Session**
  - [ ] Session persistence across page refresh
  - [ ] Automatic logout on token expiry
  - [ ] Protected routes functionality

### Phase 3: Backend API Testing
- [ ] **Health Check**
  - [ ] GET /health returns 200
  - [ ] CORS headers configured correctly
  - [ ] Rate limiting active

- [ ] **Product API**
  - [ ] GET /api/products returns product list
  - [ ] Product caching works (15-minute TTL)
  - [ ] Individual product fetching
  - [ ] Cache invalidation on updates

- [ ] **Cart API**
  - [ ] POST /api/cart/add adds items correctly
  - [ ] POST /api/cart/update updates quantities
  - [ ] DELETE /api/cart/remove removes items
  - [ ] Anonymous cart support
  - [ ] Authenticated cart sync
  - [ ] Cart merging on login

- [ ] **Authentication API**
  - [ ] POST /api/auth/register creates users
  - [ ] POST /api/auth/login authenticates users
  - [ ] GET /api/auth/me returns user info
  - [ ] JWT token validation
  - [ ] Error handling for invalid tokens

### Phase 4: Shopify Integration Testing
- [ ] **Product Sync**
  - [ ] Products fetch from Shopify Storefront API
  - [ ] Product caching in database
  - [ ] Inventory updates via webhooks
  - [ ] Product images and variants handled

- [ ] **Customer Integration**
  - [ ] Customer creation via Shopify Customer API
  - [ ] Customer authentication flow
  - [ ] Profile data synchronization

- [ ] **Checkout Integration**
  - [ ] Shopify checkout creation
  - [ ] Cart items passed correctly
  - [ ] Customer email passed to checkout
  - [ ] Redirect to Shopify checkout

### Phase 5: Webhook Testing
- [ ] **Order Webhooks**
  - [ ] orders/create webhook processes correctly
  - [ ] orders/paid webhook updates order status
  - [ ] orders/updated webhook handles changes
  - [ ] orders/cancelled webhook processes cancellations

- [ ] **Inventory Webhooks**
  - [ ] inventory_levels/update webhook received
  - [ ] Product cache invalidated on updates

- [ ] **Customer Webhooks**
  - [ ] customers/create webhook syncs customer data

### Phase 6: End-to-End Testing
- [ ] **Complete User Journey**
  - [ ] Anonymous user browses products
  - [ ] Adds items to cart
  - [ ] Registers account
  - [ ] Cart merges correctly
  - [ ] Proceeds to checkout
  - [ ] Completes purchase via Shopify
  - [ ] Order appears in order history

- [ ] **Error Scenarios**
  - [ ] Network error handling
  - [ ] Shopify API failure fallback
  - [ ] Database connection errors
  - [ ] Invalid webhook signatures
  - [ ] Cart conflicts resolution

### Phase 7: Performance Testing
- [ ] **Loading Performance**
  - [ ] Initial page load under 3 seconds
  - [ ] Product images load progressively
  - [ ] API responses under 1 second
  - [ ] Database query optimization

- [ ] **Cart Performance**
  - [ ] Large cart handling (50+ items)
  - [ ] Optimistic updates feel instant
  - [ ] Backend sync doesn't block UI

### Phase 8: Security Testing
- [ ] **Authentication Security**
  - [ ] Password requirements enforced
  - [ ] JWT tokens expire correctly
  - [ ] Rate limiting on auth endpoints
  - [ ] Session management secure

- [ ] **API Security**
  - [ ] Input validation on all endpoints
  - [ ] SQL injection protection
  - [ ] XSS prevention in frontend
  - [ ] CSRF protection

### Phase 9: Mobile Testing
- [ ] **Responsive Design**
  - [ ] Mobile layout works correctly
  - [ ] Touch interactions work
  - [ ] Modals display properly on mobile
  - [ ] Cart is usable on mobile devices

- [ ] **Mobile Performance**
  - [ ] Fast loading on mobile networks
  - [ ] Optimized images for mobile
  - [ ] Smooth scrolling performance

## 🔧 Development Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
npm test             # Run tests
npm run lint         # Run ESLint
```

## 🐛 Common Issues & Solutions

### Frontend Issues
- **Products not loading**: Check Shopify API credentials in .env
- **Cart not persisting**: Check localStorage permissions
- **Modal not opening**: Check for JavaScript errors in console

### Backend Issues
- **Database connection**: Check DATABASE_URL in backend/.env
- **Shopify API errors**: Verify API tokens and permissions
- **Webhook failures**: Check webhook URL and secret configuration

### Integration Issues
- **CORS errors**: Verify FRONTEND_URL configuration
- **Authentication failures**: Check JWT_SECRET and token logic
- **Checkout issues**: Verify Shopify webhook configuration

## 📝 Notes for Production Deployment

1. **Environment Variables**
   - Set all required environment variables
   - Use strong secrets for JWT and webhooks
   - Configure production database connection

2. **Security**
   - Enable HTTPS everywhere
   - Configure firewall rules
   - Set up monitoring and logging

3. **Performance**
   - Enable CDN for static assets
   - Configure database connection pooling
   - Set up proper caching strategies

4. **Monitoring**
   - Monitor API response times
   - Track error rates
   - Set up alerts for critical issues