import { Router } from 'express'
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriesController,
  getCategoryController,
  updateCategoryController
} from '~/controllers/category.controller'
import { accessTokenValidator, verifiedAdminValidator } from '~/middlewares/auth.middleware'
import { categoryIdValidator, categoryNameValidator } from '~/middlewares/category.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const adminCategoryRouter = Router()

adminCategoryRouter.post(
  '/',
  //accessTokenValidator,
  //verifiedAdminValidator,
  categoryNameValidator,
  wrapRequestHandler(createCategoryController)
)

adminCategoryRouter.get('/', wrapRequestHandler(getCategoriesController))
adminCategoryRouter.get(
  '/:category_id',
  //accessTokenValidator,
  // verifiedAdminValidator,
  categoryIdValidator,
  wrapRequestHandler(getCategoryController)
)

adminCategoryRouter.put(
  '/:category_id',
  // accessTokenValidator,
  //verifiedAdminValidator,
  categoryNameValidator,
  categoryIdValidator,
  wrapRequestHandler(updateCategoryController)
)

adminCategoryRouter.delete(
  '/:category_id',
  // accessTokenValidator,
  //verifiedAdminValidator,
  categoryIdValidator,
  wrapRequestHandler(deleteCategoryController)
)

export default adminCategoryRouter
