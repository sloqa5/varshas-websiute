import express from 'express'
import { shopifyService } from '../services/shopifyService'
import { createError, asyncHandler } from '../middleware/errorHandler'
import { query } from '../config/database'
import { logger } from '../utils/logger'

const router = express.Router()

// Cache duration in minutes
const CACHE_DURATION = 15

// Get all products
router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    // Check if we have cached products that are still fresh
    const cachedResult = await query(
      `SELECT *, EXTRACT(EPOCH FROM (updated_at + INTERVAL '${CACHE_DURATION} minutes' - NOW())) as ttl_seconds
       FROM product_cache
       ORDER BY updated_at DESC
       LIMIT 1`
    )

    // If we have fresh cached data, return it
    if (cachedResult.rows.length > 0 && cachedResult.rows[0].ttl_seconds > 0) {
      logger.info('Serving products from cache')
      return res.json({
        success: true,
        data: {
          products: cachedResult.rows.map(row => ({
            id: row.shopify_product_id,
            title: row.title,
            description: row.description,
            price: parseFloat(row.price),
            images: row.images,
            variants: row.variants,
            inventoryCount: row.inventory_count,
            cached: true
          }))
        }
      })
    }

    // Fetch fresh data from Shopify
    logger.info('Fetching products from Shopify')
    const shopifyProducts = await shopifyService.getProducts()

    // Update cache with fresh data
    for (const product of shopifyProducts) {
      await query(
        `INSERT INTO product_cache (
          shopify_product_id, title, description, price, images, variants, inventory_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (shopify_product_id) DO UPDATE
        SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          images = EXCLUDED.images,
          variants = EXCLUDED.variants,
          inventory_count = EXCLUDED.inventory_count,
          updated_at = CURRENT_TIMESTAMP`,
        [
          product.shopifyId,
          product.title,
          product.description,
          product.price,
          JSON.stringify(product.images),
          JSON.stringify(product.variants),
          product.variants.reduce((sum: number, v: any) => sum + (v.quantityAvailable || 0), 0)
        ]
      )
    }

    // Return fresh data
    res.json({
      success: true,
      data: {
        products: shopifyProducts.map(product => ({
          id: product.shopifyId,
          title: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          images: product.images,
          variants: product.variants,
          tags: product.tags,
          cached: false
        }))
      }
    })

  } catch (error: any) {
    logger.error('Failed to fetch products', error)

    // If Shopify fails, try to serve stale cached data
    const staleCache = await query(
      'SELECT * FROM product_cache ORDER BY updated_at DESC LIMIT 50'
    )

    if (staleCache.rows.length > 0) {
      logger.warn('Serving stale cached products due to Shopify API failure')
      return res.json({
        success: true,
        data: {
          products: staleCache.rows.map(row => ({
            id: row.shopify_product_id,
            title: row.title,
            description: row.description,
            price: parseFloat(row.price),
            images: row.images,
            variants: row.variants,
            inventoryCount: row.inventory_count,
            cached: true,
            stale: true
          }))
        },
        warning: 'Showing cached data due to temporary service issues'
      })
    }

    throw createError('Failed to fetch products', 500)
  }
}))

// Get single product by ID
router.get('/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { id } = req.params

  try {
    // Try to get from cache first
    const cachedResult = await query(
      'SELECT * FROM product_cache WHERE shopify_product_id = $1',
      [id]
    )

    if (cachedResult.rows.length > 0) {
      const product = cachedResult.rows[0]
      const ttlSeconds = Math.max(0, CACHE_DURATION * 60 - Math.floor((Date.now() - new Date(product.updated_at).getTime()) / 1000))

      if (ttlSeconds > 0) {
        return res.json({
          success: true,
          data: {
            id: product.shopify_product_id,
            title: product.title,
            description: product.description,
            price: parseFloat(product.price),
            images: product.images,
            variants: product.variants,
            inventoryCount: product.inventory_count,
            cached: true,
            ttlSeconds
          }
        })
      }
    }

    // If not in cache or cache expired, fetch from Shopify
    const shopifyProducts = await shopifyService.getProducts()
    const product = shopifyProducts.find((p: any) => p.shopifyId === id)

    if (!product) {
      throw createError('Product not found', 404)
    }

    // Update cache
    await query(
      `INSERT INTO product_cache (
        shopify_product_id, title, description, price, images, variants, inventory_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (shopify_product_id) DO UPDATE
      SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        images = EXCLUDED.images,
        variants = EXCLUDED.variants,
        inventory_count = EXCLUDED.inventory_count,
        updated_at = CURRENT_TIMESTAMP`,
      [
        product.shopifyId,
        product.title,
        product.description,
        product.price,
        JSON.stringify(product.images),
        JSON.stringify(product.variants),
        product.variants.reduce((sum: number, v: any) => sum + (v.quantityAvailable || 0), 0)
      ]
    )

    res.json({
      success: true,
      data: {
        id: product.shopifyId,
        title: product.title,
        description: product.description,
        price: product.price,
        currency: product.currency,
        images: product.images,
        variants: product.variants,
        tags: product.tags,
        cached: false
      }
    })

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    logger.error('Failed to fetch product', { id, error })
    throw createError('Failed to fetch product', 500)
  }
}))

// Clear product cache (admin endpoint)
router.delete('/cache', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    await query('DELETE FROM product_cache')
    logger.info('Product cache cleared')

    res.json({
      success: true,
      data: { message: 'Product cache cleared successfully' }
    })
  } catch (error: any) {
    logger.error('Failed to clear product cache', error)
    throw createError('Failed to clear product cache', 500)
  }
}))

// Get inventory levels for all products
router.get('/inventory/levels', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const result = await query(
      'SELECT shopify_product_id, title, inventory_count FROM product_cache ORDER BY title'
    )

    res.json({
      success: true,
      data: {
        inventory: result.rows.map(row => ({
          productId: row.shopify_product_id,
          title: row.title,
          inventoryCount: row.inventory_count
        }))
      }
    })
  } catch (error: any) {
    logger.error('Failed to fetch inventory levels', error)
    throw createError('Failed to fetch inventory levels', 500)
  }
}))

export default router