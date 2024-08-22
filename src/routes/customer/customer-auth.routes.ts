import { Router } from 'express'
import { logoutController, refreshTokenController } from '~/controllers/auth.controller'
import {
  checkAccountController,
  createPasswordController,
  getMeController,
  loginCustomerController
} from '~/controllers/customer.controller'
import { accessTokenValidator, refreshTokenValidator } from '~/middlewares/auth.middleware'
import { createPasswordValidator, loginCustomerValidator } from '~/middlewares/customer.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const customerAuthRouter = Router()

customerAuthRouter.post('/check-account-customer', wrapRequestHandler(checkAccountController))

customerAuthRouter.post('/create-password', createPasswordValidator, wrapRequestHandler(createPasswordController))

customerAuthRouter.post('/login', loginCustomerValidator, wrapRequestHandler(loginCustomerController))

customerAuthRouter.get('/get-me', accessTokenValidator, wrapRequestHandler(getMeController))

customerAuthRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

customerAuthRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

export default customerAuthRouter
