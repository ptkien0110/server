import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { StatusPurchase } from '~/constants/enum'
import Purchase from '~/models/schemas/Purchase.schema'
import databaseService from '~/services/database.services'
import { sellerPurchaseService } from '~/services/purchase.services'

// export const createOrderController = async (req: Request, res: Response) => {
//   const { purchase_items, customer_id } = req.body
//   const { user_id } = req.decoded_authorization

//   if (!Array.isArray(purchase_items) || purchase_items.length === 0) {
//     return res.status(400).json({ message: 'Dữ liệu không hợp lệ, cần phải là một mảng các sản phẩm' })
//   }

//   if (!customer_id) {
//     return res.status(400).json({ message: 'Thiếu thông tin customer_id' })
//   }

//   const order = await sellerPurchaseService.createOrder({ user_id, customer_id, purchase_items })
//   return res.status(201).json({
//     message: 'Create order success',
//     data: order
//   })
// }

export const createOrderController = async (req: Request, res: Response) => {
  const { purchase_items, customer_id, cost_bearer_id, payment_method_id } = req.body
  const { user_id } = req.decoded_authorization

  if (!Array.isArray(purchase_items) || purchase_items.length === 0) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ, cần phải là một mảng các sản phẩm' })
  }

  if (!customer_id) {
    return res.status(400).json({ message: 'Thiếu thông tin customer_id' })
  }

  if (!cost_bearer_id) {
    return res.status(400).json({ message: 'Thiếu thông tin cost_bearer_id' })
  }

  if (!payment_method_id) {
    return res.status(400).json({ message: 'Thiếu thông tin payment_method_id' })
  }

  try {
    const order = await sellerPurchaseService.createOrder({
      user_id,
      customer_id,
      cost_bearer_id,
      payment_method_id,
      purchase_items
    })
    return res.status(201).json({
      message: 'Create order success',
      data: order
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith('Stock errors:')) {
        const stockErrors = error.message.replace('Stock errors: ', '').split(', ')
        return res.status(400).json({
          message: 'Out of stock',
          errors: stockErrors
        })
      }

      if (error.message.startsWith('Product errors:')) {
        const productErrors = error.message.replace('Product errors: ', '').split(', ')
        return res.status(400).json({
          message: 'Có lỗi với các sản phẩm',
          errors: productErrors
        })
      }
    }

    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const addToCartController = async (req: Request, res: Response) => {
  const { purchase_items } = req.body
  const { user_id } = req.decoded_authorization

  if (!Array.isArray(purchase_items) || purchase_items.length === 0) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ, cần phải là một mảng các sản phẩm' })
  }

  const order = await sellerPurchaseService.addToCart({ user_id, purchase_items })
  return res.status(201).json({
    message: 'Add to cart success',
    data: order
  })
}

export const removeFromCartController = async (req: Request, res: Response) => {
  const { purchase_items } = req.body
  const { user_id } = req.decoded_authorization

  if (!Array.isArray(purchase_items) || purchase_items.length === 0) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ, cần phải là một mảng các sản phẩm' })
  }

  const order = await sellerPurchaseService.removeAllFromCart({ user_id, purchase_items })
  return res.status(201).json({
    message: 'Remove product from cart success',
    data: order
  })
}

export const removeCartController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const order = await sellerPurchaseService.removeCart(user_id)
  return res.json({
    message: 'Remove cart success'
  })
}

export const changeStatusPurchaseController = async (req: Request, res: Response) => {
  const { status, purchase_id } = req.body
  const { user_id } = req.decoded_authorization

  const data = await sellerPurchaseService.changeStatusPurchase({ purchase_id, user_id, status })
  return res.json({
    message: 'Change status success',
    data
  })
}

export const cancelOrderController = async (req: Request, res: Response) => {
  const { purchase_id } = req.body
  const { user_id } = req.decoded_authorization
  const data = await sellerPurchaseService.cancelOrder(user_id, purchase_id)
  return res.json({
    message: 'Cancel order success',
    data
  })
}

export const getAllPurchaseOfSellerController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { user_id } = req.decoded_authorization
  const sort = req.query.sort === 'asc' ? 'asc' : 'desc'
  const status = req.query.status ? Number(req.query.status) : undefined
  const date = req.query.date === 'oldest' ? 'oldest' : 'latest'

  const data = await sellerPurchaseService.getAllPurchaseOfSeller({ user_id, limit, page, sort, status, date })

  return res.json({
    message: 'Get all purchase success',
    data: {
      total_profit_for_seller: data.total_successful_profit,
      purchases: data.purchases,
      limit,
      page,
      total_page: Math.ceil(data.total / limit),
      total_purchase: data.total
    }
  })
}

export const getPurchasesOfSellerController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const status = Number(req.query.status)
  const { seller_id } = req.params
  const data = await sellerPurchaseService.getPurchasesOfSeller({ seller_id, limit, page, status })
  return res.json({
    message: 'Get purchase of seller success',
    data: {
      purchases: data.purchases,
      limit,
      page,
      total_page: Math.ceil(data.total / limit),
      total_purchase: data.total
    }
  })
}

export const adminGetAllPurchaseController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const data = await sellerPurchaseService.adminGetAllPurchases({ limit, page })
  return res.json({
    message: 'Get all purchases success',
    data: {
      purchases: data.purchases,
      limit,
      page,
      total_page: Math.ceil(data.total / limit),
      total_purchase: data.total
    }
  })
}

export const providerGetAllPurchaseController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { user_id } = req.decoded_authorization
  const data = await sellerPurchaseService.providerGetAllPurchases({ user_id, limit, page })
  return res.json({
    message: 'Get all purchases success',
    data: {
      revenuesAffiliate: data.revenuesAffiliate,
      limit,
      page,
      total_page: Math.ceil(data.total / limit),
      total_purchase: data.total
    }
  })
}

export const adminGetAllPurchaseByProviderController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { user_id } = req.params
  const data = await sellerPurchaseService.providerGetAllPurchases({ user_id, limit, page })
  return res.json({
    message: 'Get all purchases by provider success',
    data: {
      revenuesAffiliate: data.revenuesAffiliate,
      limit,
      page,
      total_page: Math.ceil(data.total / limit),
      total_purchase: data.total
    }
  })
}

export const getCartOfSellerController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const data = await sellerPurchaseService.getCartOfSeller(user_id)
  return res.json({
    message: 'Get product in cart success',
    data
  })
}

export const getPurchaseController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { purchase_id } = req.params
  const data = await sellerPurchaseService.getPurchase(user_id, purchase_id)
  return res.json({
    message: 'Get purchase success',
    data
  })
}

export const adminGetPurchaseController = async (req: Request, res: Response) => {
  const { purchase_id } = req.params
  const data = await sellerPurchaseService.adminGetPurchase(purchase_id)
  return res.json({
    message: 'Admin get purchase success',
    data
  })
}
