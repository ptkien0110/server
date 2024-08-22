import { Router } from 'express'
import { getallProviderController, getProviderController } from '~/controllers/seller.controller'
import { providerIdValidator } from '~/middlewares/provider.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const commonProvidersRouter = Router()

commonProvidersRouter.get('/get-all-providers', wrapRequestHandler(getallProviderController))

commonProvidersRouter.get(
  '/get-provider-by-id/:provider_id',
  providerIdValidator,
  wrapRequestHandler(getProviderController)
)

export default commonProvidersRouter
