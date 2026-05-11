import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'ai-forum-secret-key-2024'

export interface AuthRequest extends Request {
  userId?: number
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).json({ success: false, error: 'No token provided' })
    return
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ success: false, error: 'Token error' })
    return
  }

  const token = parts[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
}

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const parts = authHeader.split(' ')
    if (parts.length === 2 && parts[0] === 'Bearer') {
      try {
        const decoded = jwt.verify(parts[1], JWT_SECRET) as { userId: number }
        req.userId = decoded.userId
      } catch {
      }
    }
  }
  next()
}

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export { JWT_SECRET }
