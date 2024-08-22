import { Request, Response } from 'express'
import searchService from '~/services/search.services'

export const searchProductController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const name = String(req.query.name)
  const data = await searchService.searchProduct({
    limit,
    page,
    name
  })
  res.json({
    message: 'Search successfully',
    data: {
      products: data.result,
      limit,
      page,
      total_page: Math.ceil(data.total / limit),
      total_product: data.total
    }
  })
}

export const searchPurchaseController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const code_purchase = String(req.query.code_purchase)
  const data = await searchService.searchPurchase({
    limit,
    page,
    code_purchase
  })
  res.json({
    message: 'Search purchases successfully',
    data: {
      purchase: data.result,
      limit,
      page,
      total_page: Math.ceil(data.total / limit),
      total_product: data.total
    }
  })
}
