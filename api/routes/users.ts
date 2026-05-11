import { Router, Request, Response } from 'express'
import db from '../db/index.js'
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth.js'

const router = Router()

interface User {
  id: number
  email: string
  nickname: string
  avatar: string
  bio: string
  created_at: string
}

router.get('/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      res.status(400).json({ success: false, error: '无效的用户ID' })
      return
    }

    const user = db.prepare(
      'SELECT id, nickname, avatar, bio, created_at FROM users WHERE id = ?'
    ).get(userId) as Omit<User, 'email'> | undefined

    if (!user) {
      res.status(404).json({ success: false, error: '用户不存在' })
      return
    }

    const postsCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE author_id = ?').get(userId) as { count: number }

    const commentsCount = db.prepare('SELECT COUNT(*) as count FROM comments WHERE author_id = ?').get(userId) as { count: number }

    const collectsCount = db.prepare('SELECT COUNT(*) as count FROM collects WHERE user_id = ?').get(userId) as { count: number }

    res.json({
      success: true,
      data: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        postsCount: postsCount.count,
        commentsCount: commentsCount.count,
        collectsCount: collectsCount.count,
        createdAt: user.created_at
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ success: false, error: '获取用户信息失败' })
  }
})

router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { nickname, bio, avatar } = req.body
    const currentUserId = req.userId!
    const targetUserId = parseInt(id)

    if (isNaN(targetUserId)) {
      res.status(400).json({ success: false, error: '无效的用户ID' })
      return
    }

    if (currentUserId !== targetUserId) {
      res.status(403).json({ success: false, error: '没有权限修改此用户信息' })
      return
    }

    db.prepare(`
      UPDATE users 
      SET nickname = COALESCE(?, nickname),
          bio = COALESCE(?, bio),
          avatar = COALESCE(?, avatar)
      WHERE id = ?
    `).run(nickname, bio, avatar, targetUserId)

    const user = db.prepare(
      'SELECT id, email, nickname, avatar, bio, created_at FROM users WHERE id = ?'
    ).get(targetUserId) as User

    res.json({ success: true, data: user })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ success: false, error: '更新用户信息失败' })
  }
})

router.get('/:id/posts', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      res.status(400).json({ success: false, error: '无效的用户ID' })
      return
    }

    const posts = db.prepare(`
      SELECT 
        p.*,
        c.slug as category_slug,
        c.name as category_name,
        u.id as author_id,
        u.nickname as author_nickname,
        u.avatar as author_avatar
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.author_id = ?
      ORDER BY p.created_at DESC
    `).all(userId) as any[]

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      summary: post.summary,
      category: post.category_slug,
      categoryName: post.category_name,
      author: {
        id: post.author_id,
        nickname: post.author_nickname,
        avatar: post.author_avatar
      },
      likes: post.likes_count,
      comments: post.comments_count,
      collects: post.collects_count,
      createdAt: post.created_at,
      isLiked: req.userId
        ? !!db.prepare('SELECT id FROM likes WHERE user_id = ? AND post_id = ?').get(req.userId, post.id)
        : false,
      isCollected: req.userId
        ? !!db.prepare('SELECT id FROM collects WHERE user_id = ? AND post_id = ?').get(req.userId, post.id)
        : false
    }))

    res.json({ success: true, data: formattedPosts })
  } catch (error) {
    console.error('Get user posts error:', error)
    res.status(500).json({ success: false, error: '获取用户帖子失败' })
  }
})

router.get('/:id/collects', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = parseInt(id)
    const currentUserId = req.userId!

    if (isNaN(userId)) {
      res.status(400).json({ success: false, error: '无效的用户ID' })
      return
    }

    if (currentUserId !== userId) {
      res.status(403).json({ success: false, error: '没有权限查看此用户的收藏' })
      return
    }

    const collects = db.prepare(`
      SELECT 
        p.*,
        c.slug as category_slug,
        c.name as category_name,
        u.id as author_id,
        u.nickname as author_nickname,
        u.avatar as author_avatar
      FROM collects co
      LEFT JOIN posts p ON co.post_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE co.user_id = ?
      ORDER BY co.created_at DESC
    `).all(userId) as any[]

    const formattedPosts = collects.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      summary: post.summary,
      category: post.category_slug,
      categoryName: post.category_name,
      author: {
        id: post.author_id,
        nickname: post.author_nickname,
        avatar: post.author_avatar
      },
      likes: post.likes_count,
      comments: post.comments_count,
      collects: post.collects_count,
      createdAt: post.created_at,
      isLiked: true,
      isCollected: true
    }))

    res.json({ success: true, data: formattedPosts })
  } catch (error) {
    console.error('Get user collects error:', error)
    res.status(500).json({ success: false, error: '获取用户收藏失败' })
  }
})

export default router
