import { Router } from 'express'
import {
  adminGetAllCustomerController,
  adminGetAllProviderController,
  createAccountController,
  getAccountByRolesController,
  getAllAccountController,
  updateRoleAccountController
} from '~/controllers/account.controller'
import {
  accessTokenValidator,
  createAccountValidator,
  rolesValidator,
  userIdValidator,
  verifiedAdminValidator
} from '~/middlewares/auth.middleware'
import { paginationValidator } from '~/middlewares/product.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const adminAccountRouter = Router()

adminAccountRouter.post(
  '/create',
  accessTokenValidator,
  verifiedAdminValidator,
  createAccountValidator,
  wrapRequestHandler(createAccountController)
)

adminAccountRouter.post(
  '/update-roles/:user_id',
  accessTokenValidator,
  verifiedAdminValidator,
  userIdValidator,
  rolesValidator,
  wrapRequestHandler(updateRoleAccountController)
)

adminAccountRouter.get(
  '/get-role',
  accessTokenValidator,
  verifiedAdminValidator,
  rolesValidator,
  paginationValidator,
  wrapRequestHandler(getAccountByRolesController)
)

adminAccountRouter.get(
  '/get-all-account',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(getAllAccountController)
)

adminAccountRouter.get(
  '/get-all-customer',
  accessTokenValidator,
  verifiedAdminValidator,
  paginationValidator,
  wrapRequestHandler(adminGetAllCustomerController)
)

adminAccountRouter.get(
  '/get-all-providers',
  accessTokenValidator,
  verifiedAdminValidator,
  wrapRequestHandler(adminGetAllProviderController)
)

export default adminAccountRouter
