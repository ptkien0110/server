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
import uploadCloud from '~/utils/cloudinary'
import { wrapRequestHandler } from '~/utils/handler'

const adminCategoryRouter = Router()

adminCategoryRouter.post(
  '/',
  accessTokenValidator,
  verifiedAdminValidator,
  categoryNameValidator,
  uploadCloud.single('image'),
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
  accessTokenValidator,
  verifiedAdminValidator,
  categoryNameValidator,
  categoryIdValidator,
  uploadCloud.single('image'),
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
