import { Router } from 'express'
import {
  adminUpdateProductController,
  changeStatusProductController,
  createProductController,
  deleteProductController,
  deleteProductImagesController,
  getAllProductController,
  getProductController,
  getProductsController,
  getProductsOfProviderController,
  updateProductController,
  uploadProductImagesController
} from '~/controllers/product.controller'
import { wrapRequestHandler } from './../../utils/handler'
import uploadCloud from '~/utils/cloudinary'
import {
  paginationValidator,
  productIdValidator,
  productValidator,
  verifyStatusProductValidator
} from '~/middlewares/product.middlewares'
import { UpdateProductReqBody } from '~/models/requests/Product.request'
import { filterMiddleware } from '~/middlewares/common.middleware'
import { accessTokenValidator, verifiedAdminValidator } from '~/middlewares/auth.middleware'
import { providerIdValidator } from '~/middlewares/provider.middlewares'

const adminProductRouter = Router()

// adminProductRouter.post(
//   '/',
//   accessTokenValidator,
//   verifiedAdminValidator,
//   uploadCloud.array('images', 4),
//   wrapRequestHandler(createProductController)
// )

adminProductRouter.get(
  '/',
  accessTokenValidator,
  verifiedAdminValidator,
  paginationValidator,
  wrapRequestHandler(getProductsController)
)

adminProductRouter.get(
  '/get-all',
  accessTokenValidator,
  verifiedAdminValidator,
  paginationValidator,
  wrapRequestHandler(getAllProductController)
)

// adminProductRouter.get(
//   '/:product_id',
//   accessTokenValidator,
//   verifiedAdminValidator,
//   productIdValidator,
//   wrapRequestHandler(getProductController)
// )

adminProductRouter.put(
  '/:product_id',
  accessTokenValidator,
  verifiedAdminValidator,
  productValidator,
  filterMiddleware<UpdateProductReqBody>([
    'name',
    'description',
    'category',
    'price_original',
    'price_retail',
    'price_for_seller',
    'point',
    'discount_for_admin',
    'price_for_customer',
    'discount_for_pdp',
    'discount_for_seller',
    'sales',
    'destroy'
  ]),
  wrapRequestHandler(adminUpdateProductController)
)

adminProductRouter.put(
  '/change-status/:product_id',
  accessTokenValidator,
  verifiedAdminValidator,
  productIdValidator,
  verifyStatusProductValidator,
  wrapRequestHandler(changeStatusProductController)
)

// adminProductRouter.delete(
//   '/delete/:product_id',
//   accessTokenValidator,
//   verifiedAdminValidator,
//   productIdValidator,
//   wrapRequestHandler(deleteProductController)
// )

// adminProductRouter.delete(
//   '/delete/:product_id/images',
//   accessTokenValidator,
//   verifiedAdminValidator,
//   productIdValidator,
//   wrapRequestHandler(deleteProductImagesController)
// )

// adminProductRouter.post(
//   '/:product_id/images',
//   accessTokenValidator,
//   verifiedAdminValidator,
//   uploadCloud.array('images'),
//   wrapRequestHandler(uploadProductImagesController)
// )

adminProductRouter.post(
  '/',
  accessTokenValidator,
  verifiedAdminValidator,
  providerIdValidator,
  wrapRequestHandler(getProductsOfProviderController)
)

adminProductRouter.get(
  '/get-by-id/:product_id',
  accessTokenValidator,
  verifiedAdminValidator,
  productIdValidator,
  wrapRequestHandler(getProductController)
)
export default adminProductRouter
