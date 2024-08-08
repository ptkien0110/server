import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CATEGORY_MESSAGES } from '~/constants/messages'
import { CategoryIDReqParams, CategoryNameReqBody } from '~/models/requests/Category.request'
import categoryService from '~/services/category.services'

export const createCategoryController = async (
  req: Request<ParamsDictionary, any, CategoryNameReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body
  const data = await categoryService.createCategory(name)
  return res.json({
    message: CATEGORY_MESSAGES.ADD_CATEGORY_SUCCESS,
    data
  })
}

export const getCategoriesController = async (
  req: Request<ParamsDictionary, any, any, CategoryIDReqParams>,
  res: Response,
  next: NextFunction
) => {
  const data = await categoryService.getCategories()
  return res.json({
    message: CATEGORY_MESSAGES.GET_CATEGORIES_SUCCESS,
    data
  })
}

export const getCategoryController = async (
  req: Request<ParamsDictionary, any, any, CategoryIDReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { category_id } = req.params
  const data = await categoryService.getCategory(category_id)
  return res.json({
    message: CATEGORY_MESSAGES.GET_CATEGORY_SUCCESS,
    data
  })
}

export const updateCategoryController = async (
  req: Request<ParamsDictionary, any, CategoryNameReqBody, CategoryIDReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { category_id } = req.params
  const { name } = req.body
  const result = await categoryService.updateCategory(category_id, name)
  return res.json({
    message: CATEGORY_MESSAGES.UPDATE_CATEGORY_SUCCESS,
    result: result
  })
}

export const deleteCategoryController = async (
  req: Request<ParamsDictionary, any, any, CategoryIDReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { category_id } = req.params
  const data = await categoryService.deleteCategory(category_id)
  return res.json({
    message: CATEGORY_MESSAGES.DELETE_CATEGORY_SUCCESS,
    data
  })
}
