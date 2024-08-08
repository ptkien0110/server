import { Router } from 'express'
import {
  countCustomerSellerPurchaseController,
  statisticRevenuesByProviderController,
  statisticRevenuesController
} from '~/controllers/statistic.controller'
import {
  accessTokenValidator,
  userIdValidator,
  verifiedProviderValidator,
  verifiedSellerValidator
} from '~/middlewares/auth.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const sellerStatisticRouter = Router()

sellerStatisticRouter.post(
  '/statistic-revenues',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(statisticRevenuesController)
)

sellerStatisticRouter.get(
  '/count-customer-seller-purchase',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(countCustomerSellerPurchaseController)
)

export default sellerStatisticRouter
