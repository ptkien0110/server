import { Router } from 'express'
import { addReviewController } from '~/controllers/review.controller'
import { accessTokenValidator, verifiedSellerValidator } from '~/middlewares/auth.middleware'
import { productIdValidator } from '~/middlewares/product.middlewares'
import { purchaseIdValidator } from '~/middlewares/purchase.middleware'
import { addReviewValidator } from '~/middlewares/review.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const sellerReviewRouter = Router()

sellerReviewRouter.post(
  '/add-review',
  accessTokenValidator,
  verifiedSellerValidator,
  purchaseIdValidator,
  productIdValidator,
  addReviewValidator,
  wrapRequestHandler(addReviewController)
)

export default sellerReviewRouter
