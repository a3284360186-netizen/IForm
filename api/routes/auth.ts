import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db/index.js'
import { authMiddleware, generateToken, AuthRequest } from '../middleware/auth.js'

const router = Router()

interface User {
  id: number
  email: string
  nickname: string
  avatar: string
  bio: string
  created_at: string
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, nickname } = req.body

    if (!email || !password || !nickname) {
      res.status(400).json({ success: false, error: '请填写所有必填字段' })
      return
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existingUser) {
      res.status(400).json({ success: false, error: '该邮箱已被注册' })
      return
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const result = db.prepare(
      'INSERT INTO users (email, nickname, password) VALUES (?, ?, ?)'
    ).run(email, nickname, hashedPassword)

    const userId = result.lastInsertRowid as number
    const token = generateToken(userId)

    const user = db.prepare('SELECT id, email, nickname, avatar FROM users WHERE id = ?').get(userId) as User

    res.status(201).json({
      success: true,
      data: { user, token }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, error: '注册失败' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, error: '请填写邮箱和密码' })
      return
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as (User & { password: string }) | undefined

    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ success: false, error: '邮箱或密码错误' })
      return
    }

    const token = generateToken(user.id)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar
        },
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: '登录失败' })
  }
})

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare(
      'SELECT id, email, nickname, avatar, bio, created_at FROM users WHERE id = ?'
    ).get(req.userId) as User | undefined

    if (!user) {
      res.status(404).json({ success: false, error: '用户不存在' })
      return
    }

    res.json({ success: true, data: user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ success: false, error: '获取用户信息失败' })
  }
})

export default router
