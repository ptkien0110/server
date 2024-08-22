import { Router } from 'express'
import { statisticRevenuesByProviderController } from '~/controllers/statistic.controller'
import { accessTokenValidator, userIdValidator, verifiedProviderValidator } from '~/middlewares/auth.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const providerStatisticRouter = Router()

providerStatisticRouter.post(
  '/statistic-revenues',
  accessTokenValidator,
  verifiedProviderValidator,
  wrapRequestHandler(statisticRevenuesByProviderController)
)
export default providerStatisticRouter
