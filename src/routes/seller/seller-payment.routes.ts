import { Router } from 'express'
import {
  getAllCostBearerController,
  getAllPaymentMethodController,
  sentTransactionPurchaseController,
  sentTransactionUpgradeController
} from '~/controllers/payment.controller'
import { accessTokenValidator, verifiedAdminValidator, verifiedSellerValidator } from '~/middlewares/auth.middleware'
import uploadCloud from '~/utils/cloudinary'
import { wrapRequestHandler } from '~/utils/handler'

const sellerPaymentRouter = Router()

sellerPaymentRouter.get(
  '/get-all-payment-method',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(getAllPaymentMethodController)
)

sellerPaymentRouter.get(
  '/get-all-cost-bearer',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(getAllCostBearerController)
)

sellerPaymentRouter.post(
  '/send-transaction',
  accessTokenValidator,
  verifiedSellerValidator,
  uploadCloud.single('image'),
  wrapRequestHandler(sentTransactionPurchaseController)
)

sellerPaymentRouter.post(
  '/send-transaction-upgrade',
  accessTokenValidator,
  verifiedSellerValidator,
  uploadCloud.single('image'),
  wrapRequestHandler(sentTransactionUpgradeController)
)
export default sellerPaymentRouter
