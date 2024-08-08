import { Router } from 'express'
import { loginController, registerProviderController } from '~/controllers/auth.controller'

import { loginValidator, registerValidator } from '~/middlewares/auth.middleware'
import { wrapRequestHandler } from '~/utils/handler'

const providerAuthRouter = Router()

providerAuthRouter.post('/register', registerValidator, wrapRequestHandler(registerProviderController))

providerAuthRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

export default providerAuthRouter
