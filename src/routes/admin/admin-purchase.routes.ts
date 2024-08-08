import { Router } from 'express'
import {
  adminGetAllPurchaseByProviderController,
  adminGetAllPurchaseController,
  adminGetPurchaseController,
  changeStatusPurchaseController,
  getPurchasesOfSellerController
} from '~/controllers/purchase.controller'
import { accessTokenValidator, verifiedAdminValidator } from '~/middlewares/auth.middleware'
import { paginationValidator } from '~/middlewares/product.middlewares'
import { purchaseIdValidator, verifyStatusPurchaseValidator } from '~/middlewares/purchase.middleware'
import { sellerIdValidator } from '~/middlewares/seller.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const adminPurchaseRouter = Router()

adminPurchaseRouter.post(
  '/change-status',
  accessTokenValidator,
  verifiedAdminValidator,
  purchaseIdValidator,
  verifyStatusPurchaseValidator,
  wrapRequestHandler(changeStatusPurchaseController)
)

adminPurchaseRouter.get(
  '/get-purchase-of-seller/:seller_id',
  accessTokenValidator,
  verifiedAdminValidator,
  sellerIdValidator,
  verifyStatusPurchaseValidator,
  wrapRequestHandler(getPurchasesOfSellerController)
)

adminPurchaseRouter.get(
  '/get-all',
  accessTokenValidator,
  verifiedAdminValidator,
  paginationValidator,
  wrapRequestHandler(adminGetAllPurchaseController)
)

adminPurchaseRouter.get(
  '/get-all-by-provider/:user_id',
  accessTokenValidator,
  verifiedAdminValidator,
  paginationValidator,
  wrapRequestHandler(adminGetAllPurchaseByProviderController)
)

adminPurchaseRouter.get(
  '/get-purchase/:purchase_id',
  accessTokenValidator,
  verifiedAdminValidator,
  purchaseIdValidator,
  wrapRequestHandler(adminGetPurchaseController)
)
export default adminPurchaseRouter
