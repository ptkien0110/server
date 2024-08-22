import { Router } from 'express'
import { getProductController, getProductsBySellerController } from '~/controllers/product.controller'
import { getReviewsForProductController } from '~/controllers/review.controller'
import { paginationValidator, productIdValidator } from '~/middlewares/product.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const commonProductsRouter = Router()

commonProductsRouter.get('/get-all-product', paginationValidator, wrapRequestHandler(getProductsBySellerController))

commonProductsRouter.get('/get-product/:product_id', productIdValidator, wrapRequestHandler(getProductController))

commonProductsRouter.get(
  '/get-reviews/:product_id',
  paginationValidator,
  wrapRequestHandler(getReviewsForProductController)
)
export default commonProductsRouter
