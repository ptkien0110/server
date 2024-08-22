import { Router } from 'express'
import { getAllProductByCategoryController, getAllProductsOfProviderController } from '~/controllers/product.controller'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { categoryIdValidator } from '~/middlewares/category.middlewares'
import { paginationValidator } from '~/middlewares/product.middlewares'
import { providerIdValidator } from '~/middlewares/provider.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const customerProductsRouter = Router()

customerProductsRouter.get(
  '/get-by-category/:category_id',
  categoryIdValidator,
  paginationValidator,
  wrapRequestHandler(getAllProductByCategoryController)
)

customerProductsRouter.get(
  '/get-by-provider/:provider_id',
  providerIdValidator,
  paginationValidator,
  wrapRequestHandler(getAllProductsOfProviderController)
)

export default customerProductsRouter
