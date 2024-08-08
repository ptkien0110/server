import { Router } from 'express'
import {
  checkUpgradeStatusController,
  createCustomerController,
  deleteCustomerController,
  getallPackageController,
  getAllUpgradeController,
  getCustomerController,
  getCustomersController,
  getSellerByRefController,
  getSellerRefController,
  getUpgradeController,
  updateCustomerController,
  upgradeSellerPackageController
} from '~/controllers/seller.controller'
import { accessTokenValidator, verifiedAdminValidator, verifiedSellerValidator } from '~/middlewares/auth.middleware'
import { filterMiddleware } from '~/middlewares/common.middleware'
import { upgradeIdValidator } from '~/middlewares/purchase.middleware'
import {
  createCustomerValidator,
  customerIdValidator,
  packageIdValidator,
  updateCustomerValidator
} from '~/middlewares/seller.middleware'
import { UpdateCustomerReqBody } from '~/models/requests/Seller.request'
import { wrapRequestHandler } from '~/utils/handler'

const sellerAuthRouter = Router()

sellerAuthRouter.post(
  '/customers',
  accessTokenValidator,
  verifiedSellerValidator,
  createCustomerValidator,
  wrapRequestHandler(createCustomerController)
)

sellerAuthRouter.get(
  '/customers',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(getCustomersController)
)

sellerAuthRouter.get(
  '/customers/:customer_id',
  accessTokenValidator,
  verifiedSellerValidator,
  customerIdValidator,
  wrapRequestHandler(getCustomerController)
)

sellerAuthRouter.put(
  '/customers/:customer_id',
  accessTokenValidator,
  verifiedSellerValidator,
  customerIdValidator,
  updateCustomerValidator,
  filterMiddleware<UpdateCustomerReqBody>(['name', 'address', 'phone', 'date_of_birth']),
  wrapRequestHandler(updateCustomerController)
)

sellerAuthRouter.delete(
  '/customers/:customer_id',
  accessTokenValidator,
  verifiedSellerValidator,
  customerIdValidator,
  wrapRequestHandler(deleteCustomerController)
)

sellerAuthRouter.post(
  '/upgrade',
  accessTokenValidator,
  verifiedSellerValidator,
  packageIdValidator,
  wrapRequestHandler(upgradeSellerPackageController)
)

sellerAuthRouter.get(
  '/check-upgrade-status',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(checkUpgradeStatusController)
)

sellerAuthRouter.get(
  '/get-all-package',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(getallPackageController)
)

sellerAuthRouter.get(
  '/get-upgrade/:upgrade_id',
  accessTokenValidator,
  verifiedSellerValidator,
  upgradeIdValidator,
  wrapRequestHandler(getUpgradeController)
)

sellerAuthRouter.get(
  '/get-all-upgrade',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(getAllUpgradeController)
)

sellerAuthRouter.get(
  '/get-seller/:seller_id',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(getSellerRefController)
)
export default sellerAuthRouter
