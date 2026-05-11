import { Router, Request, Response } from 'express'
import db from '../db/index.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

interface Comment {
  id: number
  content: string
  author_id: number
  post_id: number
  parent_id: number | null
  created_at: string
}

router.get('/:id/comments', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const postId = parseInt(id)

    if (isNaN(postId)) {
      res.status(400).json({ success: false, error: '无效的帖子ID' })
      return
    }

    const comments = db.prepare(`
      SELECT 
        c.*,
        u.id as author_id,
        u.nickname as author_nickname,
        u.avatar as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(postId) as (Comment & {
      author_id: number
      author_nickname: string
      author_avatar: string
    })[]

    const commentMap = new Map<number, any>()
    const rootComments: any[] = []

    comments.forEach(comment => {
      commentMap.set(comment.id, {
        id: comment.id,
        content: comment.content,
        postId: comment.post_id,
        parentId: comment.parent_id,
        createdAt: comment.created_at,
        author: {
          id: comment.author_id,
          nickname: comment.author_nickname,
          avatar: comment.author_avatar
        },
        replies: []
      })
    })

    commentMap.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies.push(comment)
        } else {
          rootComments.push(comment)
        }
      } else {
        rootComments.push(comment)
      }
    })

    res.json({ success: true, data: rootComments })
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ success: false, error: '获取评论失败' })
  }
})

router.post('/:id/comments', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { content, parentId } = req.body
    const userId = req.userId!
    const postId = parseInt(id)

    if (isNaN(postId)) {
      res.status(400).json({ success: false, error: '无效的帖子ID' })
      return
    }

    if (!content || content.trim() === '') {
      res.status(400).json({ success: false, error: '评论内容不能为空' })
      return
    }

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId)
    if (!post) {
      res.status(404).json({ success: false, error: '帖子不存在' })
      return
    }

    if (parentId) {
      const parentComment = db.prepare('SELECT id FROM comments WHERE id = ? AND post_id = ?').get(parentId, postId)
      if (!parentComment) {
        res.status(400).json({ success: false, error: '无效的父评论' })
        return
      }
    }

    const result = db.prepare(`
      INSERT INTO comments (content, author_id, post_id, parent_id)
      VALUES (?, ?, ?, ?)
    `).run(content.trim(), userId, postId, parentId || null)

    const commentId = result.lastInsertRowid as number

    db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').run(postId)

    const comment = db.prepare(`
      SELECT 
        c.*,
        u.id as author_id,
        u.nickname as author_nickname,
        u.avatar as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `).get(commentId) as Comment & {
      author_id: number
      author_nickname: string
      author_avatar: string
    }

    res.status(201).json({
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        postId: comment.post_id,
        parentId: comment.parent_id,
        createdAt: comment.created_at,
        author: {
          id: comment.author_id,
          nickname: comment.author_nickname,
          avatar: comment.author_avatar
        },
        replies: []
      }
    })
  } catch (error) {
    console.error('Create comment error:', error)
    res.status(500).json({ success: false, error: '创建评论失败' })
  }
})

router.delete('/:postId/comments/:commentId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { postId, commentId } = req.params
    const userId = req.userId!

    const comment = db.prepare('SELECT author_id FROM comments WHERE id = ?').get(parseInt(commentId)) as { author_id: number } | undefined

    if (!comment) {
      res.status(404).json({ success: false, error: '评论不存在' })
      return
    }

    if (comment.author_id !== userId) {
      res.status(403).json({ success: false, error: '没有权限删除此评论' })
      return
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(parseInt(commentId))
    db.prepare('UPDATE posts SET comments_count = comments_count - 1 WHERE id = ?').run(parseInt(postId))

    res.json({ success: true, message: '评论已删除' })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ success: false, error: '删除评论失败' })
  }
})

export default router
