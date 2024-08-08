import { Router } from 'express'
import { changeStatusPurchaseController, providerGetAllPurchaseController } from '~/controllers/purchase.controller'
import { accessTokenValidator, verifiedProviderValidator, verifiedSellerValidator } from '~/middlewares/auth.middleware'
import { paginationValidator } from '~/middlewares/product.middlewares'
import { purchaseIdValidator, verifyStatusPurchaseValidator } from '~/middlewares/purchase.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const providerPurchaseRouter = Router()

providerPurchaseRouter.post(
  '/change-status',
  accessTokenValidator,
  verifiedProviderValidator,
  purchaseIdValidator,
  verifyStatusPurchaseValidator,
  wrapRequestHandler(changeStatusPurchaseController)
)

providerPurchaseRouter.get(
  '/get-all',
  accessTokenValidator,
  verifiedProviderValidator,
  paginationValidator,
  wrapRequestHandler(providerGetAllPurchaseController)
)
export default providerPurchaseRouter
