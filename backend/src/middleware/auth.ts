import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createError, asyncHandler } from './errorHandler'
import { logger } from '../utils/logger'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    shopifyCustomerId?: string
  }
}

export const authenticate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError('Access token required', 401)
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = {
      id: decoded.id,
      email: decoded.email,
      shopifyCustomerId: decoded.shopifyCustomerId
    }
    next()
  } catch (error) {
    logger.warn('Invalid token attempt', { token: token.substring(0, 10) + '...' })
    throw createError('Invalid or expired token', 401)
  }
})

export const optionalAuth = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next() // Continue without authentication
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = {
      id: decoded.id,
      email: decoded.email,
      shopifyCustomerId: decoded.shopifyCustomerId
    }
  } catch (error) {
    // Log but don't throw error for optional auth
    logger.warn('Invalid optional token', { token: token.substring(0, 10) + '...' })
  }

  next()
})