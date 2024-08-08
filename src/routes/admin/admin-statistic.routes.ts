import { Router } from 'express'
import {
  adminStatisticRevenuesByProviderController,
  adminStatisticRevenuesBySellerController,
  adminStatisticRevenuesInviteByAdminController,
  adminStatisticRevenuesInviteBySellerController,
  adminStatisticRevenuesInviteController,
  statisticRevenuesByAdminController,
  statisticRevenuesController
} from '~/controllers/statistic.controller'
import { accessTokenValidator, userIdValidator, verifiedAdminValidator } from '~/middlewares/auth.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const adminStatisticRouter = Router()

adminStatisticRouter.post(
  '/statistic-revenues',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(statisticRevenuesController)
)

adminStatisticRouter.post(
  '/statistic-revenues-by-admin',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(statisticRevenuesByAdminController)
)

adminStatisticRouter.post(
  '/statistic-revenues-by-pdp',
  accessTokenValidator,
  verifiedAdminValidator,
  userIdValidator,
  wrapRequestHandler(adminStatisticRevenuesByProviderController)
)

adminStatisticRouter.post(
  '/statistic-revenues-by-seller',
  accessTokenValidator,
  verifiedAdminValidator,
  userIdValidator,
  wrapRequestHandler(adminStatisticRevenuesBySellerController)
)

adminStatisticRouter.post(
  '/statistic-revenues-invite',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(adminStatisticRevenuesInviteController)
)

adminStatisticRouter.post(
  '/statistic-revenues-invite-by-seller',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(adminStatisticRevenuesInviteBySellerController)
)

adminStatisticRouter.post(
  '/statistic-revenues-invite-by-admin',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(adminStatisticRevenuesInviteByAdminController)
)

export default adminStatisticRouter
