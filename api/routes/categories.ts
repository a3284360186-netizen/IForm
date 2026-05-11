import { Router, Request, Response } from 'express'
import db from '../db/index.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY id').all() as {
      id: number
      name: string
      slug: string
      icon: string
    }[]

    res.json({
      success: true,
      data: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon
      }))
    })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ success: false, error: '获取分类失败' })
  }
})

export default router
