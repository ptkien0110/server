import { NextFunction, Request, Response } from 'express'
import paymentService from '~/services/payment.services'

export const createPaymentMethodController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body
  const data = await paymentService.createPaymentMethod(name)
  return res.json({
    message: 'Create payment method success',
    data
  })
}

export const getAllPaymentMethodController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await paymentService.getAllPaymentMethod()
  return res.json({
    message: 'Get all payment method success',
    data
  })
}

export const createCostBearerController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body
  const data = await paymentService.createCostBearer(name)
  return res.json({
    message: 'Create cost bearer success',
    data
  })
}

export const getAllCostBearerController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await paymentService.getAllCostBearer()
  return res.json({
    message: 'Get all cost bearer success',
    data
  })
}

export const sentTransactionUpgradeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const payload = req.body
  const fileData = req.file
  const data = await paymentService.sentTransactionUpgrade(user_id, payload, fileData)
  return res.json({
    message: 'Seller send transaction upgrade success',
    data
  })
}

export const sentTransactionPurchaseController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const payload = req.body
  const fileData = req.file
  const data = await paymentService.sentTransactionPurchase(user_id, payload, fileData)
  return res.json({
    message: 'Seller send transaction purchase success',
    data
  })
}

export const adminGetAllTransactionController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const date = (req.query.date as 'latest' | 'oldest') || 'latest'
  const data = await paymentService.adminGetAllTransaction({ limit, page, date })
  return res.json({
    message: 'Get all transaction success',
    data: {
      transactions: data.result,
      limit,
      page,
      total_page: Math.ceil(data.total / limit),
      total_transactions: data.total
    }
  })
}

export const adminGetTransactionController = async (req: Request, res: Response) => {
  const { transaction_id } = req.params
  const data = await paymentService.adminGetTransaction(transaction_id)
  return res.json({
    message: 'Get transaction success',
    data
  })
}

export const confirmTransactionController = async (req: Request, res: Response) => {
  const { code } = req.body
  const data = await paymentService.confirmTransaction(code)
  return res.json({
    message: 'Confirm transaction success',
    data
  })
}
