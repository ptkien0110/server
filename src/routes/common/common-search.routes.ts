import { Router } from 'express'
import { searchProductController, searchPurchaseController } from '~/controllers/search.controller'
import { accessTokenValidator, verifiedAdminValidator } from '~/middlewares/auth.middleware'
import { paginationValidator } from '~/middlewares/product.middlewares'
import { searchProductValidator, searchPurchaseValidator } from '~/middlewares/search.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const commonSearchRouter = Router()

commonSearchRouter.get(
  '/products',
  searchProductValidator,
  paginationValidator,
  wrapRequestHandler(searchProductController)
)

commonSearchRouter.get(
  '/purchases',
  accessTokenValidator,
  verifiedAdminValidator,
  searchPurchaseValidator,
  paginationValidator,
  wrapRequestHandler(searchPurchaseController)
)
export default commonSearchRouter
