import { Router } from 'express'
import { getCategoriesController } from '~/controllers/category.controller'
import { wrapRequestHandler } from '~/utils/handler'

const commonCategoryRouter = Router()

commonCategoryRouter.get('/get-all-categories', wrapRequestHandler(getCategoriesController))

export default commonCategoryRouter
