import { Router } from 'express'
import {
  adminGetAllTransactionController,
  adminGetTransactionController,
  confirmTransactionController,
  createCostBearerController,
  createPaymentMethodController,
  getAllCostBearerController,
  getAllPaymentMethodController
} from '~/controllers/payment.controller'
import { accessTokenValidator, verifiedAdminValidator } from '~/middlewares/auth.middleware'
import { paginationValidator } from '~/middlewares/product.middlewares'
import { transactionIdValidator } from '~/middlewares/seller.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const adminPaymentRouter = Router()

adminPaymentRouter.post(
  '/create-payment-method',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(createPaymentMethodController)
)

adminPaymentRouter.get(
  '/get-all-payment-method',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(getAllPaymentMethodController)
)

adminPaymentRouter.post(
  '/create-cost-bearer',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(createCostBearerController)
)

adminPaymentRouter.get(
  '/get-all-cost-bearer',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(getAllCostBearerController)
)

adminPaymentRouter.get(
  '/get-all-transaction',
  accessTokenValidator,
  verifiedAdminValidator,
  paginationValidator,
  wrapRequestHandler(adminGetAllTransactionController)
)

adminPaymentRouter.get(
  '/get-transaction/:transaction_id',
  accessTokenValidator,
  verifiedAdminValidator,
  transactionIdValidator,
  wrapRequestHandler(adminGetTransactionController)
)

adminPaymentRouter.post(
  '/confirm-transaction',
  accessTokenValidator,
  verifiedAdminValidator,
  // transactionIdValidator,
  wrapRequestHandler(confirmTransactionController)
)
export default adminPaymentRouter
