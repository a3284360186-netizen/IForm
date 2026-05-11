import { Router, Request, Response } from 'express'
import db from '../db/index.js'
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth.js'

const router = Router()

interface PostAuthor {
  id: number
  nickname: string
  avatar: string
}

interface Post {
  id: number
  title: string
  content: string
  summary: string
  author_id: number
  category_id: number
  likes_count: number
  comments_count: number
  collects_count: number
  created_at: string
  updated_at: string
  category_slug?: string
  category_name?: string
  author?: PostAuthor
  isLiked?: boolean
  isCollected?: boolean
}

router.get('/', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { category, sort = 'latest', page = '1', limit = '10' } = req.query
    const pageNum = Math.max(1, parseInt(page as string))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)))
    const offset = (pageNum - 1) * limitNum

    let orderBy = 'p.created_at DESC'
    if (sort === 'popular') {
      orderBy = 'p.likes_count + p.comments_count DESC, p.created_at DESC'
    }

    let whereClause = ''
    const params: (string | number)[] = []

    if (category) {
      whereClause = 'WHERE c.slug = ?'
      params.push(category as string)
    }

    const countQuery = `
      SELECT COUNT(*) as total FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `
    const { total } = db.prepare(countQuery).get(...params) as { total: number }

    const postsQuery = `
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
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `

    const rawPosts = db.prepare(postsQuery).all(...params, limitNum, offset) as (Post & {
      author_id: number
      author_nickname: string
      author_avatar: string
    })[]

    const posts = rawPosts.map(post => {
      const isLiked = req.userId
        ? !!db.prepare('SELECT id FROM likes WHERE user_id = ? AND post_id = ?').get(req.userId, post.id)
        : false
      const isCollected = req.userId
        ? !!db.prepare('SELECT id FROM collects WHERE user_id = ? AND post_id = ?').get(req.userId, post.id)
        : false

      return {
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
        isLiked,
        isCollected
      }
    })

    res.json({
      success: true,
      data: {
        posts,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({ success: false, error: '获取帖子失败' })
  }
})

router.get('/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const postId = parseInt(id)

    if (isNaN(postId)) {
      res.status(400).json({ success: false, error: '无效的帖子ID' })
      return
    }

    const post = db.prepare(`
      SELECT 
        p.*,
        c.slug as category_slug,
        c.name as category_name,
        u.id as author_id,
        u.nickname as author_nickname,
        u.avatar as author_avatar,
        u.bio as author_bio
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `).get(postId) as (Post & {
      author_id: number
      author_nickname: string
      author_avatar: string
      author_bio: string
    }) | undefined

    if (!post) {
      res.status(404).json({ success: false, error: '帖子不存在' })
      return
    }

    const isLiked = req.userId
      ? !!db.prepare('SELECT id FROM likes WHERE user_id = ? AND post_id = ?').get(req.userId, postId)
      : false
    const isCollected = req.userId
      ? !!db.prepare('SELECT id FROM collects WHERE user_id = ? AND post_id = ?').get(req.userId, postId)
      : false

    res.json({
      success: true,
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        summary: post.summary,
        category: post.category_slug,
        categoryName: post.category_name,
        author: {
          id: post.author_id,
          nickname: post.author_nickname,
          avatar: post.author_avatar,
          bio: post.author_bio
        },
        likes: post.likes_count,
        comments: post.comments_count,
        collects: post.collects_count,
        createdAt: post.created_at,
        isLiked,
        isCollected
      }
    })
  } catch (error) {
    console.error('Get post error:', error)
    res.status(500).json({ success: false, error: '获取帖子失败' })
  }
})

router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category } = req.body
    const userId = req.userId!

    if (!title || !content || !category) {
      res.status(400).json({ success: false, error: '请填写标题、内容和分类' })
      return
    }

    const cat = db.prepare('SELECT id FROM categories WHERE slug = ?').get(category) as { id: number } | undefined
    if (!cat) {
      res.status(400).json({ success: false, error: '无效的分类' })
      return
    }

    const summary = content.slice(0, 200).replace(/[#*`]/g, '').trim() + '...'

    const result = db.prepare(`
      INSERT INTO posts (title, content, summary, author_id, category_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content, summary, userId, cat.id)

    const postId = result.lastInsertRowid as number

    const post = db.prepare(`
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
      WHERE p.id = ?
    `).get(postId) as Post & { author_id: number; author_nickname: string; author_avatar: string }

    res.status(201).json({
      success: true,
      data: {
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
        likes: 0,
        comments: 0,
        collects: 0,
        createdAt: post.created_at,
        isLiked: false,
        isCollected: false
      }
    })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ success: false, error: '创建帖子失败' })
  }
})

router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { title, content, category } = req.body
    const userId = req.userId!
    const postId = parseInt(id)

    if (isNaN(postId)) {
      res.status(400).json({ success: false, error: '无效的帖子ID' })
      return
    }

    const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(postId) as { author_id: number } | undefined
    if (!post) {
      res.status(404).json({ success: false, error: '帖子不存在' })
      return
    }

    if (post.author_id !== userId) {
      res.status(403).json({ success: false, error: '没有权限修改此帖子' })
      return
    }

    let categoryId: number | null = null
    if (category) {
      const cat = db.prepare('SELECT id FROM categories WHERE slug = ?').get(category) as { id: number } | undefined
      if (!cat) {
        res.status(400).json({ success: false, error: '无效的分类' })
        return
      }
      categoryId = cat.id
    }

    const summary = content ? content.slice(0, 200).replace(/[#*`]/g, '').trim() + '...' : undefined

    db.prepare(`
      UPDATE posts 
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          summary = COALESCE(?, summary),
          category_id = COALESCE(?, category_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, summary, categoryId, postId)

    const updatedPost = db.prepare(`
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
      WHERE p.id = ?
    `).get(postId) as Post & { author_id: number; author_nickname: string; author_avatar: string }

    res.json({
      success: true,
      data: {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        summary: updatedPost.summary,
        category: updatedPost.category_slug,
        categoryName: updatedPost.category_name,
        author: {
          id: updatedPost.author_id,
          nickname: updatedPost.author_nickname,
          avatar: updatedPost.author_avatar
        },
        likes: updatedPost.likes_count,
        comments: updatedPost.comments_count,
        collects: updatedPost.collects_count,
        createdAt: updatedPost.created_at,
        isLiked: false,
        isCollected: false
      }
    })
  } catch (error) {
    console.error('Update post error:', error)
    res.status(500).json({ success: false, error: '更新帖子失败' })
  }
})

router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId!
    const postId = parseInt(id)

    if (isNaN(postId)) {
      res.status(400).json({ success: false, error: '无效的帖子ID' })
      return
    }

    const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(postId) as { author_id: number } | undefined
    if (!post) {
      res.status(404).json({ success: false, error: '帖子不存在' })
      return
    }

    if (post.author_id !== userId) {
      res.status(403).json({ success: false, error: '没有权限删除此帖子' })
      return
    }

    db.prepare('DELETE FROM likes WHERE post_id = ?').run(postId)
    db.prepare('DELETE FROM collects WHERE post_id = ?').run(postId)
    db.prepare('DELETE FROM comments WHERE post_id = ?').run(postId)
    db.prepare('DELETE FROM posts WHERE id = ?').run(postId)

    res.json({ success: true, message: '帖子已删除' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ success: false, error: '删除帖子失败' })
  }
})

router.post('/:id/like', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId!
    const postId = parseInt(id)

    if (isNaN(postId)) {
      res.status(400).json({ success: false, error: '无效的帖子ID' })
      return
    }

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId)
    if (!post) {
      res.status(404).json({ success: false, error: '帖子不存在' })
      return
    }

    const existingLike = db.prepare('SELECT id FROM likes WHERE user_id = ? AND post_id = ?').get(userId, postId)

    if (existingLike) {
      db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(userId, postId)
      db.prepare('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?').run(postId)
      res.json({ success: true, data: { liked: false } })
    } else {
      db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, postId)
      db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId)
      res.json({ success: true, data: { liked: true } })
    }
  } catch (error) {
    console.error('Like post error:', error)
    res.status(500).json({ success: false, error: '操作失败' })
  }
})

router.post('/:id/collect', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId!
    const postId = parseInt(id)

    if (isNaN(postId)) {
      res.status(400).json({ success: false, error: '无效的帖子ID' })
      return
    }

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId)
    if (!post) {
      res.status(404).json({ success: false, error: '帖子不存在' })
      return
    }

    const existingCollect = db.prepare('SELECT id FROM collects WHERE user_id = ? AND post_id = ?').get(userId, postId)

    if (existingCollect) {
      db.prepare('DELETE FROM collects WHERE user_id = ? AND post_id = ?').run(userId, postId)
      db.prepare('UPDATE posts SET collects_count = collects_count - 1 WHERE id = ?').run(postId)
      res.json({ success: true, data: { collected: false } })
    } else {
      db.prepare('INSERT INTO collects (user_id, post_id) VALUES (?, ?)').run(userId, postId)
      db.prepare('UPDATE posts SET collects_count = collects_count + 1 WHERE id = ?').run(postId)
      res.json({ success: true, data: { collected: true } })
    }
  } catch (error) {
    console.error('Collect post error:', error)
    res.status(500).json({ success: false, error: '操作失败' })
  }
})

export default router
