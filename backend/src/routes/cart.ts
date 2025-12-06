import express from 'express'
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

// Get cart contents
router.get('/', optionalAuth, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const user = req.user
  const sessionId = getOrCreateSessionId(req)

  try {
    let cartItems = []

    if (user) {
      // Get user's cart from database
      const result = await query(
        'SELECT items FROM user_carts WHERE shopify_customer_id = $1',
        [user.shopifyCustomerId]
      )

      if (result.rows.length > 0) {
        cartItems = result.rows[0].items || []
      }
    } else {
      // Get anonymous cart from database
      const result = await query(
        'SELECT items FROM user_carts WHERE session_id = $1 AND shopify_customer_id IS NULL',
        [sessionId]
      )

      if (result.rows.length > 0) {
        cartItems = result.rows[0].items || []
      }
    }

    // Calculate totals
    const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
    const totalPrice = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

    res.json({
      success: true,
      data: {
        items: cartItems,
        totalItems,
        totalPrice,
        isEmpty: cartItems.length === 0
      }
    })
  } catch (error: any) {
    logger.error('Failed to fetch cart', { error, userId: user?.id, sessionId })
    throw createError('Failed to fetch cart', 500)
  }
}))

// Add item to cart
router.post('/add', optionalAuth, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { productId, quantity, productData } = req.body
  const user = req.user
  const sessionId = getOrCreateSessionId(req)

  if (!productId || !quantity || quantity < 1) {
    throw createError('Product ID and valid quantity are required', 400)
  }

  if (!productData || !productData.id || !productData.name || !productData.price) {
    throw createError('Valid product data is required', 400)
  }

  try {
    const cartItem = {
      id: productId,
      quantity,
      product: {
        id: productData.id,
        name: productData.name,
        price: productData.price,
        badge: productData.badge || '',
        palette: productData.palette || []
      },
      addedAt: new Date().toISOString()
    }

    let customerColumn = 'session_id'
    let customerValue = sessionId

    if (user) {
      customerColumn = 'shopify_customer_id'
      customerValue = user.shopifyCustomerId

      // If user is logging in and has an anonymous cart, merge them
      const anonymousCart = await query(
        'SELECT items FROM user_carts WHERE session_id = $1 AND shopify_customer_id IS NULL',
        [sessionId]
      )

      if (anonymousCart.rows.length > 0) {
        // Merge anonymous cart with user cart
        await query(
          `INSERT INTO user_carts (shopify_customer_id, items)
           VALUES ($1, $2)
           ON CONFLICT (shopify_customer_id) DO UPDATE
           SET items = user_carts.items || EXCLUDED.items`,
          [user.shopifyCustomerId, anonymousCart.rows[0].items]
        )

        // Clean up anonymous cart
        await query('DELETE FROM user_carts WHERE session_id = $1 AND shopify_customer_id IS NULL', [sessionId])
      }
    }

    // Add item to cart
    await query(
      `INSERT INTO user_carts (${customerColumn}, items)
       VALUES ($1, $2)
       ON CONFLICT (${customerColumn}, session_id) DO UPDATE
       SET items = (
         SELECT jsonb_agg(
           CASE
             WHEN item->>'id' = $3 THEN
               jsonb_set(
                 jsonb_set(item, '{quantity}', (COALESCE((item->>'quantity')::int, 0) + $4)::text::jsonb),
                 '{product}', $5::jsonb
               )
             ELSE item
           END
         )
         FROM jsonb_array_elements(user_carts.items) AS item
       )
       WHERE ${customerColumn} = $1`,
      [customerValue, [cartItem], productId, quantity, JSON.stringify(cartItem.product)]
    )

    // Get updated cart
    const result = await query(
      `SELECT items FROM user_carts WHERE ${customerColumn} = $1`,
      [customerValue]
    )

    const cartItems = result.rows.length > 0 ? result.rows[0].items : [cartItem]

    res.json({
      success: true,
      data: {
        message: 'Item added to cart',
        item: cartItem,
        totalItems: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
      }
    })

    logger.info('Item added to cart', {
      productId,
      quantity,
      userId: user?.id,
      sessionId: user ? undefined : sessionId
    })

  } catch (error: any) {
    logger.error('Failed to add item to cart', { error, productId, quantity, userId: user?.id })
    throw createError('Failed to add item to cart', 500)
  }
}))

// Update cart item quantity
router.post('/update', optionalAuth, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { productId, quantity } = req.body
  const user = req.user
  const sessionId = getOrCreateSessionId(req)

  if (!productId || quantity < 0) {
    throw createError('Product ID and valid quantity are required', 400)
  }

  try {
    let customerColumn = 'session_id'
    let customerValue = sessionId

    if (user) {
      customerColumn = 'shopify_customer_id'
      customerValue = user.shopifyCustomerId
    }

    if (quantity === 0) {
      // Remove item from cart
      await query(
        `UPDATE user_carts
         SET items = (
           SELECT jsonb_agg(item)
           FROM jsonb_array_elements(user_carts.items) AS item
           WHERE item->>'id' != $1
         )
         WHERE ${customerColumn} = $2`,
        [productId, customerValue]
      )
    } else {
      // Update item quantity
      await query(
        `UPDATE user_carts
         SET items = (
           SELECT jsonb_agg(
             jsonb_set(item, '{quantity}', $1::text::jsonb)
           )
           FROM jsonb_array_elements(user_carts.items) AS item
           WHERE item->>'id' = $2
         )
         WHERE ${customerColumn} = $3`,
        [quantity, productId, customerValue]
      )
    }

    // Get updated cart
    const result = await query(
      `SELECT items FROM user_carts WHERE ${customerColumn} = $1`,
      [customerValue]
    )

    const cartItems = result.rows.length > 0 ? result.rows[0].items : []

    res.json({
      success: true,
      data: {
        message: quantity === 0 ? 'Item removed from cart' : 'Item quantity updated',
        totalItems: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
      }
    })

  } catch (error: any) {
    logger.error('Failed to update cart item', { error, productId, quantity, userId: user?.id })
    throw createError('Failed to update cart item', 500)
  }
}))

// Remove item from cart
router.delete('/remove/:productId', optionalAuth, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { productId } = req.params
  const user = req.user
  const sessionId = getOrCreateSessionId(req)

  if (!productId) {
    throw createError('Product ID is required', 400)
  }

  try {
    let customerColumn = 'session_id'
    let customerValue = sessionId

    if (user) {
      customerColumn = 'shopify_customer_id'
      customerValue = user.shopifyCustomerId
    }

    await query(
      `UPDATE user_carts
       SET items = (
         SELECT jsonb_agg(item)
         FROM jsonb_array_elements(user_carts.items) AS item
         WHERE item->>'id' != $1
       )
       WHERE ${customerColumn} = $2`,
      [productId, customerValue]
    )

    // Get updated cart
    const result = await query(
      `SELECT items FROM user_carts WHERE ${customerColumn} = $1`,
      [customerValue]
    )

    const cartItems = result.rows.length > 0 ? result.rows[0].items : []

    res.json({
      success: true,
      data: {
        message: 'Item removed from cart',
        totalItems: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
      }
    })

  } catch (error: any) {
    logger.error('Failed to remove cart item', { error, productId, userId: user?.id })
    throw createError('Failed to remove cart item', 500)
  }
}))

// Clear cart
router.delete('/clear', optionalAuth, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const user = req.user
  const sessionId = getOrCreateSessionId(req)

  try {
    let customerColumn = 'session_id'
    let customerValue = sessionId

    if (user) {
      customerColumn = 'shopify_customer_id'
      customerValue = user.shopifyCustomerId
    }

    await query(
      `UPDATE user_carts SET items = '[]'::jsonb WHERE ${customerColumn} = $1`,
      [customerValue]
    )

    res.json({
      success: true,
      data: {
        message: 'Cart cleared'
      }
    })

  } catch (error: any) {
    logger.error('Failed to clear cart', { error, userId: user?.id })
    throw createError('Failed to clear cart', 500)
  }
}))

export default router