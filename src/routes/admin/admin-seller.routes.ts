import { Router } from 'express'
import {
  acceptPendingUpgradeController,
  adminCheckUpgradeStatusController,
  adminGetAllUpgradePendingController,
  adminGetUpgradeController,
  checkUpgradeStatusController,
  createUpgradePackageController,
  getCustomerOfSellerController,
  getSellerByRefController,
  getSellerController,
  getSellersController,
  getStatusVerifySellerController,
  upgradeSellerPackageController,
  verifySellerController
} from '~/controllers/seller.controller'
import { accessTokenValidator, verifiedAdminValidator } from '~/middlewares/auth.middleware'
import { paginationValidator, verifyStatusValidator } from '~/middlewares/product.middlewares'
import { createUpgradePackageValidator, sellerIdValidator, upgradeIdValidator } from '~/middlewares/seller.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const adminSellerRouter = Router()

adminSellerRouter.get('/', accessTokenValidator, verifiedAdminValidator, wrapRequestHandler(getSellersController))

adminSellerRouter.get(
  '/seller/:seller_id',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(getSellerController)
)

// adminSellerRouter.put(
//   '/verify/:seller_id',
//   accessTokenValidator,
//   verifiedAdminValidator,
//   sellerIdValidator,
//   wrapRequestHandler(verifySellerController)
// )

// adminSellerRouter.put(
//   '/ban/:seller_id',
//   accessTokenValidator,
//   verifiedAdminValidator,
//   sellerIdValidator,
//   wrapRequestHandler(banSellerController)
// )

// adminSellerRouter.put(
//   '/unban/:seller_id',
//   accessTokenValidator,
//   verifiedAdminValidator,
//   sellerIdValidator,
//   wrapRequestHandler(unbanSellerController)
//)

adminSellerRouter.put(
  '/verify/:seller_id',
  accessTokenValidator,
  verifiedAdminValidator,
  verifyStatusValidator,
  wrapRequestHandler(verifySellerController)
)
// adminSellerRouter.get(
//   '/account-banned',
//   accessTokenValidator,
//   verifiedAdminValidator,
//   wrapRequestHandler(getBannedSellersController)
// )

// adminSellerRouter.get(
//   '/account-verified',
//   accessTokenValidator,
//   verifiedAdminValidator,
//   wrapRequestHandler(getVerifiedSellersController)
// )

// adminSellerRouter.get(
//   '/account-unverified',
//   accessTokenValidator,
//   verifiedAdminValidator,
//   wrapRequestHandler(getUnverifiedSellersController)
// )

adminSellerRouter.get(
  '/account-verify-status',
  accessTokenValidator,
  verifiedAdminValidator,
  verifyStatusValidator,
  wrapRequestHandler(getStatusVerifySellerController)
)

adminSellerRouter.get(
  '/get-customer-of-seller',
  accessTokenValidator,
  verifiedAdminValidator,
  sellerIdValidator,
  wrapRequestHandler(getCustomerOfSellerController)
)

adminSellerRouter.post(
  '/get-seller-by-ref',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(getSellerByRefController)
)

adminSellerRouter.post(
  '/create-upgrade-package',
  accessTokenValidator,
  verifiedAdminValidator,
  createUpgradePackageValidator,
  wrapRequestHandler(createUpgradePackageController)
)

adminSellerRouter.post(
  '/confirm-upgrade-seller',
  accessTokenValidator,
  verifiedAdminValidator,
  upgradeIdValidator,
  wrapRequestHandler(acceptPendingUpgradeController)
)

adminSellerRouter.post(
  '/check-upgrade-status',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(adminCheckUpgradeStatusController)
)

adminSellerRouter.get(
  '/get-all-upgrade',
  accessTokenValidator,
  verifiedAdminValidator,
  paginationValidator,
  wrapRequestHandler(adminGetAllUpgradePendingController)
)

adminSellerRouter.get(
  '/get-upgrade/:upgrade_id',
  accessTokenValidator,
  verifiedAdminValidator,
  upgradeIdValidator,
  wrapRequestHandler(adminGetUpgradeController)
)
export default adminSellerRouter
