import { Router } from 'express'

export const customerRouter = Router()
customerRouter.get('/products', (req, res) => {
  res.json({
    id: 1,
    text: 'hello world'
  })
})
