import { Pool } from 'pg'
import { logger } from '../utils/logger'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'procktails',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
})

// Test database connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export const query = async (text: string, params?: any[]) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    logger.info('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    const duration = Date.now() - start
    logger.error('Query failed', { text, duration, error })
    throw error
  }
}

export const getClient = () => {
  return pool.connect()
}

export default pool