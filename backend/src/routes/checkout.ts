import express from 'express'
import { shopifyService } from '../services/shopifyService'
import { createError, asyncHandler } from '../middleware/errorHandler'
import { AuthRequest, optionalAuth } from '../middleware/auth'
import { query } from '../config/database'
import { logger } from '../utils/logger'

const router = express.Router()

// Helper function to generate session ID for anonymous users
const getOrCreateSessionId = (req: express.Request): string => {
  let sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string

  if (!sessionId) {
    sessionId = 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  return sessionId
}

// Create Shopify checkout session
router.post('/create', optionalAuth, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const user = req.user
  const sessionId = getOrCreateSessionId(req)
  const { items, customerEmail } = req.body

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createError('Cart items are required', 400)
  }

  // Validate each item
  for (const item of items) {
    if (!item.variantId || !item.quantity || item.quantity < 1) {
      throw createError('Each item must have a valid variantId and quantity', 400)
    }
  }

  try {
    // Get user's cart to validate items
    let customerColumn = 'session_id'
    let customerValue = sessionId

    if (user) {
      customerColumn = 'shopify_customer_id'
      customerValue = user.shopifyCustomerId
    }

    const cartResult = await query(
      `SELECT items FROM user_carts WHERE ${customerColumn} = $1`,
      [customerValue]
    )

    if (cartResult.rows.length === 0) {
      throw createError('No cart found', 404)
    }

    const cartItems = cartResult.rows[0].items || []

    // Validate that checkout items match cart items
    const checkoutMap = new Map(items.map(item => [item.variantId, item.quantity]))
    const cartMap = new Map(cartItems.map((item: any) => [item.id, item.quantity]))

    for (const [variantId, quantity] of checkoutMap) {
      const cartQuantity = cartMap.get(variantId)
      if (!cartQuantity || cartQuantity < quantity) {
        throw createError(`Invalid quantity for item ${variantId}`, 400)
      }
    }

    // Create Shopify checkout
    const checkoutUrl = await shopifyService.createCheckout(
      items,
      customerEmail || user?.email
    )

    // Store checkout reference in database for tracking
    const checkoutId = checkoutUrl.split('/').pop() || 'unknown'

    if (user) {
      await query(
        `INSERT INTO user_orders (shopify_customer_id, shopify_checkout_id, status, items, total_amount)
         VALUES ($1, $2, 'pending', $3, $4)
         ON CONFLICT (shopify_checkout_id) DO UPDATE
         SET updated_at = CURRENT_TIMESTAMP`,
        [
          user.shopifyCustomerId,
          checkoutId,
          JSON.stringify(items),
          items.reduce((total: number, item: any) => {
            const cartItem = cartItems.find((ci: any) => ci.id === item.variantId)
            return total + (cartItem ? cartItem.product.price * item.quantity : 0)
          }, 0)
        ]
      )
    }

    logger.info('Checkout created', {
      checkoutId,
      itemsCount: items.length,
      userId: user?.id,
      sessionId: user ? undefined : sessionId
    })

    res.json({
      success: true,
      data: {
        checkoutUrl,
        checkoutId,
        message: 'Checkout created successfully'
      }
    })

  } catch (error: any) {
    logger.error('Failed to create checkout', { error, items, userId: user?.id })

    if (error.statusCode) {
      throw error
    }

    throw createError('Failed to create checkout session', 500)
  }
}))

// Validate checkout data
router.post('/validate', optionalAuth, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const user = req.user
  const sessionId = getOrCreateSessionId(req)
  const { items } = req.body

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createError('Cart items are required', 400)
  }

  try {
    // Get user's cart
    let customerColumn = 'session_id'
    let customerValue = sessionId

    if (user) {
      customerColumn = 'shopify_customer_id'
      customerValue = user.shopifyCustomerId
    }

    const cartResult = await query(
      `SELECT items FROM user_carts WHERE ${customerColumn} = $1`,
      [customerValue]
    )

    if (cartResult.rows.length === 0) {
      throw createError('No cart found', 404)
    }

    const cartItems = cartResult.rows[0].items || []

    // Validate items and calculate totals
    let isValid = true
    let validationErrors: string[] = []
    let totalAmount = 0

    for (const checkoutItem of items) {
      const cartItem = cartItems.find((item: any) => item.id === checkoutItem.variantId)

      if (!cartItem) {
        isValid = false
        validationErrors.push(`Item ${checkoutItem.variantId} not found in cart`)
        continue
      }

      if (cartItem.quantity < checkoutItem.quantity) {
        isValid = false
        validationErrors.push(`Insufficient quantity for item ${cartItem.product.name}`)
        continue
      }

      totalAmount += cartItem.product.price * checkoutItem.quantity
    }

    res.json({
      success: true,
      data: {
        isValid,
        validationErrors,
        totalAmount,
        itemsCount: items.length,
        message: isValid ? 'Cart is valid for checkout' : 'Cart validation failed'
      }
    })

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    logger.error('Failed to validate checkout', { error, items, userId: user?.id })
    throw createError('Failed to validate checkout', 500)
  }
}))

// Get checkout status
router.get('/status/:checkoutId', optionalAuth, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { checkoutId } = req.params
  const user = req.user

  if (!checkoutId) {
    throw createError('Checkout ID is required', 400)
  }

  try {
    let orderResult

    if (user) {
      orderResult = await query(
        `SELECT * FROM user_orders
         WHERE shopify_checkout_id = $1 AND shopify_customer_id = $2`,
        [checkoutId, user.shopifyCustomerId]
      )
    } else {
      // For anonymous users, we can only check by checkout ID
      // This is limited functionality for guest checkouts
      orderResult = await query(
        `SELECT status, total_amount, created_at FROM user_orders
         WHERE shopify_checkout_id = $1 AND shopify_customer_id IS NULL`,
        [checkoutId]
      )
    }

    if (orderResult.rows.length === 0) {
      throw createError('Checkout not found', 404)
    }

    const order = orderResult.rows[0]

    res.json({
      success: true,
      data: {
        checkoutId,
        status: order.status,
        totalAmount: order.total_amount,
        createdAt: order.created_at,
        shopifyOrderId: order.shopify_order_id
      }
    })

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    logger.error('Failed to get checkout status', { error, checkoutId, userId: user?.id })
    throw createError('Failed to get checkout status', 500)
  }
}))

// Calculate shipping estimate (mock implementation)
router.post('/shipping', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { items, address } = req.body

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createError('Cart items are required', 400)
  }

  if (!address || !address.postalCode || !address.country) {
    throw createError('Valid shipping address is required', 400)
  }

  try {
    // Mock shipping calculation
    // In production, this would integrate with Shopify's shipping API
    const baseShipping = 9.99
    const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
    const weightMultiplier = itemCount > 5 ? 1.5 : 1.0

    const shippingCost = baseShipping * weightMultiplier

    res.json({
      success: true,
      data: {
        shippingCost,
        estimatedDelivery: '3-5 business days',
        availableRates: [
          {
            id: 'standard',
            name: 'Standard Shipping',
            cost: shippingCost,
            estimatedDelivery: '3-5 business days'
          },
          {
            id: 'express',
            name: 'Express Shipping',
            cost: shippingCost * 2,
            estimatedDelivery: '1-2 business days'
          }
        ]
      }
    })

  } catch (error: any) {
    logger.error('Failed to calculate shipping', { error, items, address })
    throw createError('Failed to calculate shipping', 500)
  }
}))

export default router