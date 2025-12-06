import { shopify, Session } from '@shopify/shopify-api'
import { logger } from '../utils/logger'
import { createError } from '../middleware/errorHandler'

// Initialize Shopify API
const initializeShopify = () => {
  try {
    shopify.custom.addConfig({
      hostName: process.env.SHOPIFY_STORE_DOMAIN!,
      apiKey: process.env.SHOPIFY_ADMIN_API_TOKEN!,
      apiSecretKey: process.env.SHOPIFY_WEBHOOK_SECRET!,
    })
  } catch (error) {
    logger.error('Failed to initialize Shopify API', error)
    throw createError('Shopify configuration error', 500)
  }
}

// Create a fake session for API calls
const createOfflineSession = (shopDomain: string): Session => {
  return new Session({
    id: 'offline-session',
    shop: shopDomain,
    state: 'offline',
    accessToken: process.env.SHOPIFY_ADMIN_API_TOKEN!,
    isOnline: false,
  })
}

export class ShopifyService {
  private shopDomain: string

  constructor() {
    this.shopDomain = process.env.SHOPIFY_STORE_DOMAIN!
    initializeShopify()
  }

  // Fetch products from Shopify Storefront API
  async getProducts(): Promise<any[]> {
    try {
      const session = createOfflineSession(this.shopDomain)

      const client = new shopify.clients.Storefront({
        session: session,
        apiVersion: '2024-01',
      })

      const response = await client.query({
        data: `
          query getProducts($first: Int!) {
            products(first: $first) {
              edges {
                node {
                  id
                  title
                  description
                  handle
                  priceRangeV2 {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  images(first: 5) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  variants(first: 10) {
                    edges {
                      node {
                        id
                        title
                        sku
                        price
                        compareAtPrice
                        currentlyNotInStock
                        quantityAvailable
                      }
                    }
                  }
                  tags
                }
              }
            }
          }
        `,
        variables: {
          first: 50
        }
      })

      return response.body.data.products.edges.map((edge: any) => ({
        shopifyId: edge.node.id,
        title: edge.node.title,
        description: edge.node.description,
        handle: edge.node.handle,
        price: parseFloat(edge.node.priceRangeV2.minVariantPrice.amount),
        currency: edge.node.priceRangeV2.minVariantPrice.currencyCode,
        images: edge.node.images.edges.map((img: any) => ({
          url: img.node.url,
          alt: img.node.altText
        })),
        variants: edge.node.variants.edges.map((variant: any) => ({
          shopifyId: variant.node.id,
          title: variant.node.title,
          sku: variant.node.sku,
          price: parseFloat(variant.node.price),
          compareAtPrice: variant.node.compareAtPrice ? parseFloat(variant.node.compareAtPrice) : null,
          inStock: !variant.node.currentlyNotInStock,
          quantityAvailable: variant.node.quantityAvailable
        })),
        tags: edge.node.tags
      }))
    } catch (error) {
      logger.error('Failed to fetch products from Shopify', error)
      throw createError('Failed to fetch products', 500)
    }
  }

  // Create checkout session
  async createCheckout(items: any[], customerEmail?: string): Promise<string> {
    try {
      const session = createOfflineSession(this.shopDomain)

      const client = new shopify.clients.Storefront({
        session: session,
        apiVersion: '2024-01',
      })

      const lineItems = items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }))

      const response = await client.query({
        data: `
          mutation checkoutCreate($input: CheckoutCreateInput!) {
            checkoutCreate(input: $input) {
              checkout {
                id
                webUrl
              }
              checkoutUserErrors {
                code
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            lineItems,
            ...(customerEmail && { email: customerEmail })
          }
        }
      })

      const errors = response.body.data.checkoutCreate.checkoutUserErrors
      if (errors && errors.length > 0) {
        throw createError(errors[0].message, 400)
      }

      return response.body.data.checkoutCreate.checkout.webUrl
    } catch (error) {
      logger.error('Failed to create checkout', error)
      throw createError('Failed to create checkout', 500)
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      return shopify.webhooks.validate({
        rawBody: body,
        signature,
        secret: process.env.SHOPIFY_WEBHOOK_SECRET!
      })
    } catch (error) {
      logger.error('Webhook signature verification failed', error)
      return false
    }
  }

  // Create customer via Customer API
  async createCustomer(email: string, firstName?: string, lastName?: string): Promise<any> {
    try {
      const session = createOfflineSession(this.shopDomain)

      const client = new shopify.clients.Rest({
        session: session,
        apiVersion: '2024-01',
      })

      const response = await client.post({
        path: 'customers',
        data: {
          customer: {
            email,
            first_name: firstName,
            last_name: lastName
          }
        }
      })

      return response.body.customer
    } catch (error) {
      logger.error('Failed to create customer', error)
      throw createError('Failed to create customer account', 500)
    }
  }

  // Get customer by email
  async getCustomerByEmail(email: string): Promise<any> {
    try {
      const session = createOfflineSession(this.shopDomain)

      const client = new shopify.clients.Rest({
        session: session,
        apiVersion: '2024-01',
      })

      const response = await client.get({
        path: 'customers/search',
        query: {
          query: `email:${email}`
        }
      })

      return response.body.customers.length > 0 ? response.body.customers[0] : null
    } catch (error) {
      logger.error('Failed to fetch customer', error)
      throw createError('Failed to fetch customer', 500)
    }
  }
}

export const shopifyService = new ShopifyService()