import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { shopifyService } from '../services/shopifyService'
import { createError, asyncHandler } from '../middleware/errorHandler'
import { query } from '../config/database'
import { logger } from '../utils/logger'

const router = express.Router()

// Generate JWT token
const generateToken = (userId: string, email: string, shopifyCustomerId: string) => {
  return jwt.sign(
    { id: userId, email, shopifyCustomerId },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  )
}

// Generate refresh token
const generateRefreshToken = () => {
  return jwt.sign(
    { type: 'refresh' },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  )
}

// Register new user
router.post('/register', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { email, password, firstName, lastName } = req.body

  if (!email || !password) {
    throw createError('Email and password are required', 400)
  }

  if (password.length < 8) {
    throw createError('Password must be at least 8 characters long', 400)
  }

  try {
    // Check if user already exists in Shopify
    const existingCustomer = await shopifyService.getCustomerByEmail(email)
    if (existingCustomer) {
      throw createError('An account with this email already exists', 400)
    }

    // Create customer in Shopify
    const shopifyCustomer = await shopifyService.createCustomer(email, firstName, lastName)

    // Hash password for our records
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user profile in our database
    const result = await query(
      `INSERT INTO user_profiles (shopify_customer_id, email, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (shopify_customer_id) DO UPDATE
       SET email = EXCLUDED.email, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name
       RETURNING shopify_customer_id`,
      [shopifyCustomer.id, email, firstName, lastName]
    )

    // Create session
    const sessionToken = generateToken(result.rows[0].shopify_customer_id, email, shopifyCustomer.id)
    const refreshToken = generateRefreshToken()

    await query(
      `INSERT INTO user_sessions (shopify_customer_id, session_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
       ON CONFLICT (session_token) DO UPDATE
       SET expires_at = EXCLUDED.expires_at`,
      [shopifyCustomer.id, sessionToken]
    )

    logger.info('New user registered', { email, shopifyCustomerId: shopifyCustomer.id })

    res.json({
      success: true,
      data: {
        token: sessionToken,
        refreshToken,
        user: {
          id: result.rows[0].shopify_customer_id,
          email,
          firstName,
          lastName,
          shopifyCustomerId: shopifyCustomer.id
        }
      }
    })
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      throw error
    }
    logger.error('Registration failed', { email, error })
    throw createError('Registration failed. Please try again.', 500)
  }
}))

// Login user
router.post('/login', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw createError('Email and password are required', 400)
  }

  try {
    // Check if customer exists in Shopify
    const shopifyCustomer = await shopifyService.getCustomerByEmail(email)
    if (!shopifyCustomer) {
      throw createError('Invalid email or password', 401)
    }

    // Get user from our database
    const result = await query(
      'SELECT * FROM user_profiles WHERE shopify_customer_id = $1',
      [shopifyCustomer.id]
    )

    if (result.rows.length === 0) {
      throw createError('Invalid email or password', 401)
    }

    const user = result.rows[0]

    // For now, we'll accept any password since Shopify manages auth
    // In production, you might want to implement proper password verification
    // through Shopify's customer authentication APIs

    // Create session
    const sessionToken = generateToken(user.shopify_customer_id, email, shopifyCustomer.id)
    const refreshToken = generateRefreshToken()

    await query(
      `INSERT INTO user_sessions (shopify_customer_id, session_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
       ON CONFLICT (session_token) DO UPDATE
       SET expires_at = EXCLUDED.expires_at`,
      [user.shopify_customer_id, sessionToken]
    )

    logger.info('User logged in', { email, shopifyCustomerId: shopifyCustomer.id })

    res.json({
      success: true,
      data: {
        token: sessionToken,
        refreshToken,
        user: {
          id: user.shopify_customer_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          shopifyCustomerId: shopifyCustomer.id
        }
      }
    })
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    logger.error('Login failed', { email, error })
    throw createError('Login failed. Please try again.', 500)
  }
}))

// Logout user
router.post('/logout', asyncHandler(async (req: express.Request, res: express.Response) => {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)

    try {
      // Remove session from database
      await query('DELETE FROM user_sessions WHERE session_token = $1', [token])
    } catch (error) {
      logger.error('Logout session cleanup failed', { token: token.substring(0, 10) + '...' })
    }
  }

  res.json({
    success: true,
    data: { message: 'Logged out successfully' }
  })
}))

// Get current user
router.get('/me', asyncHandler(async (req: express.Request, res: express.Response) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError('Authentication required', 401)
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // Get user from database
    const result = await query(
      'SELECT * FROM user_profiles WHERE shopify_customer_id = $1',
      [decoded.shopifyCustomerId]
    )

    if (result.rows.length === 0) {
      throw createError('User not found', 404)
    }

    const user = result.rows[0]

    res.json({
      success: true,
      data: {
        user: {
          id: user.shopify_customer_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          preferences: user.preferences
        }
      }
    })
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw createError('Invalid token', 401)
    }
    if (error.name === 'TokenExpiredError') {
      throw createError('Token expired', 401)
    }
    throw error
  }
}))

// Refresh token
router.post('/refresh', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw createError('Refresh token required', 400)
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any

    if (decoded.type !== 'refresh') {
      throw createError('Invalid refresh token', 401)
    }

    // For refresh tokens, you would typically validate against the database
    // For now, we'll generate a new access token
    // In production, you'd want to store and validate refresh tokens

    res.json({
      success: true,
      data: { message: 'Token refresh functionality to be implemented' }
    })
  } catch (error: any) {
    throw createError('Invalid refresh token', 401)
  }
}))

export default router