import { Router } from 'express'
import {
  getAllProductsOfProviderController,
  getProductBySellerController,
  getProductsBySellerController,
  getProductsOfProviderController
} from '~/controllers/product.controller'
import { accessTokenValidator, verifiedSellerValidator } from '~/middlewares/auth.middleware'
import { paginationValidator, productIdValidator } from '~/middlewares/product.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const sellerProductRouter = Router()

sellerProductRouter.get(
  '/',
  accessTokenValidator,
  verifiedSellerValidator,
  paginationValidator,
  wrapRequestHandler(getProductsBySellerController)
)
sellerProductRouter.get(
  '/:product_id',
  accessTokenValidator,
  verifiedSellerValidator,
  productIdValidator,
  wrapRequestHandler(getProductBySellerController)
)

sellerProductRouter.get(
  '/get-by-provider/:provider_id',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(getAllProductsOfProviderController)
)
export default sellerProductRouter
