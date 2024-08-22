import { Router } from 'express'
import {
  addToCartController,
  cancelOrderController,
  createOrderController,
  getAllPurchaseOfSellerController,
  getCartOfSellerController,
  getPurchaseController,
  removeCartController,
  removeFromCartController
} from '~/controllers/purchase.controller'
import { accessTokenValidator, customerIdValidator, verifiedSellerValidator } from '~/middlewares/auth.middleware'
import { paginationValidator, productIdValidator } from '~/middlewares/product.middlewares'
import { purchaseIdValidator, purchaseItemsValidator } from '~/middlewares/purchase.middleware'
import uploadCloud from '~/utils/cloudinary'
import { wrapRequestHandler } from '~/utils/handler'

const sellerPurchaseRouter = Router()

sellerPurchaseRouter.post(
  '/create-order',
  accessTokenValidator,
  verifiedSellerValidator,
  customerIdValidator,
  //purchaseItemsValidator,
  wrapRequestHandler(createOrderController)
)

sellerPurchaseRouter.post(
  '/add-to-cart',
  accessTokenValidator,
  verifiedSellerValidator,
  purchaseItemsValidator,
  wrapRequestHandler(addToCartController)
)

sellerPurchaseRouter.post(
  '/cancel-order',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(cancelOrderController)
)

sellerPurchaseRouter.get(
  '/get-all-purchase',
  accessTokenValidator,
  verifiedSellerValidator,
  paginationValidator,
  wrapRequestHandler(getAllPurchaseOfSellerController)
)

sellerPurchaseRouter.get(
  '/get-cart',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(getCartOfSellerController)
)

sellerPurchaseRouter.post(
  '/remove-from-cart',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(removeFromCartController)
)

sellerPurchaseRouter.delete(
  '/remove-cart',
  accessTokenValidator,
  verifiedSellerValidator,
  wrapRequestHandler(removeCartController)
)

sellerPurchaseRouter.get(
  '/get-purchase/:purchase_id',
  accessTokenValidator,
  verifiedSellerValidator,
  purchaseIdValidator,
  wrapRequestHandler(getPurchaseController)
)
export default sellerPurchaseRouter
