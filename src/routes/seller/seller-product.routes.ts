import { Router } from 'express'
import {
  getAllProductByCategoryController,
  getAllProductsOfProviderController,
  getProductBySellerController,
  getProductsBySellerController,
  getProductsOfProviderController
} from '~/controllers/product.controller'
import { accessTokenValidator, verifiedSellerValidator } from '~/middlewares/auth.middleware'
import { categoryIdValidator } from '~/middlewares/category.middlewares'
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
  paginationValidator,
  wrapRequestHandler(getAllProductsOfProviderController)
)

sellerProductRouter.get(
  '/get-by-category/:category_id',
  accessTokenValidator,
  verifiedSellerValidator,
  categoryIdValidator,
  paginationValidator,
  wrapRequestHandler(getAllProductByCategoryController)
)
export default sellerProductRouter
