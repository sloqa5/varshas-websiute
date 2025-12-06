import express from 'express'
import { shopifyService } from '../services/shopifyService'
import { createError, asyncHandler } from '../middleware/errorHandler'
import { query } from '../config/database'
import { logger } from '../utils/logger'

const router = express.Router()

// Middleware to verify Shopify webhook signatures
const verifyShopifyWebhook = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const signature = req.headers['x-shopify-hmac-sha256'] as string
  const body = req.body

  if (!signature) {
    logger.warn('Webhook received without signature', { headers: req.headers })
    return res.status(401).json({ error: 'Missing signature' })
  }

  if (typeof body === 'object') {
    // If body was parsed as JSON, we need the raw body
    // This requires setting express.json with verify option in main server
    logger.warn('Webhook body was pre-parsed, signature verification may fail')
  }

  const isValid = shopifyService.verifyWebhookSignature(
    typeof body === 'string' ? body : JSON.stringify(body),
    signature
  )

  if (!isValid) {
    logger.warn('Invalid webhook signature', { signature: signature?.substring(0, 20) + '...' })
    return res.status(401).json({ error: 'Invalid signature' })
  }

  next()
}

// Apply webhook verification to all routes
router.use(verifyShopifyWebhook)

// Order created webhook
router.post('/shopify/orders/create', asyncHandler(async (req: express.Request, res: express.Response) => {
  const orderData = req.body

  try {
    logger.info('Order created webhook received', {
      orderId: orderData.id,
      email: orderData.email,
      total: orderData.total_price
    })

    // Extract customer information
    const customerId = orderData.customer?.id
    const customerEmail = orderData.customer?.email

    if (!customerId) {
      logger.warn('Order webhook missing customer ID', { orderId: orderData.id })
      return res.status(200).send('OK')
    }

    // Format order items
    const orderItems = orderData.line_items?.map((item: any) => ({
      variantId: item.variant_id,
      title: item.title,
      quantity: item.quantity,
      price: parseFloat(item.price),
      sku: item.sku
    })) || []

    // Store order in database
    await query(
      `INSERT INTO user_orders (
        shopify_customer_id, shopify_order_id, shopify_checkout_id,
        status, total_amount, currency, items, shipping_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (shopify_order_id) DO UPDATE
      SET
        status = EXCLUDED.status,
        total_amount = EXCLUDED.total_amount,
        items = EXCLUDED.items,
        updated_at = CURRENT_TIMESTAMP`,
      [
        customerId,
        orderData.id.toString(),
        orderData.checkout_id?.toString(),
        orderData.financial_status === 'paid' ? 'paid' : 'pending',
        parseFloat(orderData.total_price || '0'),
        orderData.currency || 'USD',
        JSON.stringify(orderItems),
        JSON.stringify({
          name: orderData.shipping_address?.name,
          address1: orderData.shipping_address?.address1,
          address2: orderData.shipping_address?.address2,
          city: orderData.shipping_address?.city,
          province: orderData.shipping_address?.province,
          country: orderData.shipping_address?.country,
          zip: orderData.shipping_address?.zip
        })
      ]
    )

    // Clear user's cart after successful order
    if (orderData.financial_status === 'paid') {
      await query(
        'UPDATE user_carts SET items = \'[]\'::jsonb WHERE shopify_customer_id = $1',
        [customerId]
      )
    }

    logger.info('Order processed successfully', {
      orderId: orderData.id,
      customerId,
      status: orderData.financial_status
    })

    res.status(200).send('OK')

  } catch (error: any) {
    logger.error('Failed to process order webhook', {
      error: error.message,
      orderId: orderData.id,
      customerId: orderData.customer?.id
    })

    // Still return 200 to Shopify to avoid redelivery
    res.status(200).send('OK')
  }
}))

// Order paid webhook
router.post('/shopify/orders/paid', asyncHandler(async (req: express.Request, res: express.Response) => {
  const orderData = req.body

  try {
    logger.info('Order paid webhook received', {
      orderId: orderData.id,
      email: orderData.email,
      total: orderData.total_price
    })

    const customerId = orderData.customer?.id

    if (!customerId) {
      logger.warn('Order paid webhook missing customer ID', { orderId: orderData.id })
      return res.status(200).send('OK')
    }

    // Update order status to paid
    const result = await query(
      `UPDATE user_orders
       SET status = 'paid', updated_at = CURRENT_TIMESTAMP
       WHERE shopify_order_id = $1 AND shopify_customer_id = $2
       RETURNING *`,
      [orderData.id.toString(), customerId]
    )

    if (result.rows.length === 0) {
      logger.warn('Order not found in database', { orderId: orderData.id, customerId })
    }

    // Clear user's cart after successful payment
    await query(
      'UPDATE user_carts SET items = \'[]\'::jsonb WHERE shopify_customer_id = $1',
      [customerId]
    )

    logger.info('Order payment processed successfully', {
      orderId: orderData.id,
      customerId,
      totalAmount: orderData.total_price
    })

    res.status(200).send('OK')

  } catch (error: any) {
    logger.error('Failed to process order payment webhook', {
      error: error.message,
      orderId: orderData.id,
      customerId: orderData.customer?.id
    })

    res.status(200).send('OK')
  }
}))

// Order updated webhook
router.post('/shopify/orders/updated', asyncHandler(async (req: express.Request, res: express.Response) => {
  const orderData = req.body

  try {
    logger.info('Order updated webhook received', {
      orderId: orderData.id,
      financialStatus: orderData.financial_status,
      fulfillmentStatus: orderData.fulfillment_status
    })

    const customerId = orderData.customer?.id

    if (!customerId) {
      return res.status(200).send('OK')
    }

    // Determine status based on financial and fulfillment status
    let status = 'pending'
    if (orderData.financial_status === 'paid') {
      status = orderData.fulfillment_status === 'fulfilled' ? 'completed' : 'paid'
    } else if (orderData.financial_status === 'refunded') {
      status = 'refunded'
    } else if (orderData.financial_status === 'partially_refunded') {
      status = 'partially_refunded'
    }

    // Update order status
    await query(
      `UPDATE user_orders
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE shopify_order_id = $2 AND shopify_customer_id = $3`,
      [status, orderData.id.toString(), customerId]
    )

    logger.info('Order update processed successfully', {
      orderId: orderData.id,
      customerId,
      newStatus: status
    })

    res.status(200).send('OK')

  } catch (error: any) {
    logger.error('Failed to process order update webhook', {
      error: error.message,
      orderId: orderData.id,
      customerId: orderData.customer?.id
    })

    res.status(200).send('OK')
  }
}))

// Order cancelled webhook
router.post('/shopify/orders/cancelled', asyncHandler(async (req: express.Request, res: express.Response) => {
  const orderData = req.body

  try {
    logger.info('Order cancelled webhook received', {
      orderId: orderData.id,
      reason: orderData.cancel_reason
    })

    const customerId = orderData.customer?.id

    if (!customerId) {
      return res.status(200).send('OK')
    }

    // Update order status to cancelled
    await query(
      `UPDATE user_orders
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE shopify_order_id = $1 AND shopify_customer_id = $2`,
      [orderData.id.toString(), customerId]
    )

    logger.info('Order cancellation processed successfully', {
      orderId: orderData.id,
      customerId
    })

    res.status(200).send('OK')

  } catch (error: any) {
    logger.error('Failed to process order cancellation webhook', {
      error: error.message,
      orderId: orderData.id,
      customerId: orderData.customer?.id
    })

    res.status(200).send('OK')
  }
}))

// Inventory levels update webhook
router.post('/shopify/inventory_levels/update', asyncHandler(async (req: express.Request, res: express.Response) => {
  const inventoryData = req.body

  try {
    logger.info('Inventory update webhook received', {
      inventoryItemId: inventoryData.inventory_item_id,
      locationId: inventoryData.location_id,
      available: inventoryData.available
    })

    // This webhook would be used to update our product cache
    // For now, we'll just log it and potentially invalidate cache
    const productId = inventoryData.inventory_item_id

    if (productId) {
      // Mark product cache as stale for next refresh
      await query(
        'UPDATE product_cache SET updated_at = CURRENT_TIMESTAMP - INTERVAL \'1 hour\' WHERE shopify_product_id LIKE $1',
        [`%${productId}%`]
      )
    }

    res.status(200).send('OK')

  } catch (error: any) {
    logger.error('Failed to process inventory update webhook', {
      error: error.message,
      inventoryData
    })

    res.status(200).send('OK')
  }
}))

// Customer created webhook
router.post('/shopify/customers/create', asyncHandler(async (req: express.Request, res: express.Response) => {
  const customerData = req.body

  try {
    logger.info('Customer created webhook received', {
      customerId: customerData.id,
      email: customerData.email
    })

    // Sync customer data to our database
    await query(
      `INSERT INTO user_profiles (shopify_customer_id, email, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (shopify_customer_id) DO UPDATE
       SET
         email = EXCLUDED.email,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         phone = EXCLUDED.phone,
         updated_at = CURRENT_TIMESTAMP`,
      [
        customerData.id.toString(),
        customerData.email,
        customerData.first_name,
        customerData.last_name,
        customerData.phone
      ]
    )

    logger.info('Customer sync completed', {
      customerId: customerData.id,
      email: customerData.email
    })

    res.status(200).send('OK')

  } catch (error: any) {
    logger.error('Failed to sync customer data', {
      error: error.message,
      customerId: customerData.id,
      email: customerData.email
    })

    res.status(200).send('OK')
  }
}))

export default router