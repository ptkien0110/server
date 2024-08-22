import { Router } from 'express'
import {
  addBankInfoController,
  changePasswordController,
  checkSellerController,
  deleteAvatarController,
  getAccountUpgradedController,
  getAllAccountUpgradedController,
  getInfoController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  registryController,
  updateBankInfoController,
  updateInfoController,
  uploadAvatarController
} from '~/controllers/auth.controller'
import {
  accessTokenValidator,
  bankInfoValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  updateBankInfoValidator
} from '~/middlewares/auth.middleware'
import { wrapRequestHandler } from './../../utils/handler'
import uploadCloud from '~/utils/cloudinary'
import { getallProviderController } from '~/controllers/seller.controller'
import { filterMiddleware } from '~/middlewares/common.middleware'
import { UpdateMeReqBody } from '~/models/requests/User.request'
import { changePasswordValidator } from './../../middlewares/auth.middleware'
import { sellerIdValidator } from '~/middlewares/seller.middleware'

const commonAuthRouter = Router()

commonAuthRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

commonAuthRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

commonAuthRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

commonAuthRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

commonAuthRouter.post('/check-seller', wrapRequestHandler(checkSellerController))

commonAuthRouter.post('/registry', registerValidator, wrapRequestHandler(registryController))

commonAuthRouter.post(
  '/upload-avatar',
  accessTokenValidator,
  uploadCloud.single('image'),
  wrapRequestHandler(uploadAvatarController)
)

commonAuthRouter.delete('/delete-avatar', accessTokenValidator, wrapRequestHandler(deleteAvatarController))

commonAuthRouter.post(
  '/add-bank-info',
  accessTokenValidator,
  bankInfoValidator,
  wrapRequestHandler(addBankInfoController)
)

commonAuthRouter.put(
  '/update-bank-info',
  accessTokenValidator,
  updateBankInfoValidator,
  wrapRequestHandler(updateBankInfoController)
)

commonAuthRouter.get('/get-all-provider', accessTokenValidator, wrapRequestHandler(getallProviderController))

commonAuthRouter.get('/get-me', accessTokenValidator, wrapRequestHandler(getInfoController))
commonAuthRouter.put(
  '/update-me',
  accessTokenValidator,
  filterMiddleware<UpdateMeReqBody>(['name', 'date_of_birth', 'address']),
  wrapRequestHandler(updateInfoController)
)

commonAuthRouter.put(
  '/change-password',
  accessTokenValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

commonAuthRouter.get('/get-accounts-upgraded', wrapRequestHandler(getAllAccountUpgradedController))
commonAuthRouter.get(
  '/get-account-upgraded-by-id/:seller_id',
  sellerIdValidator,
  wrapRequestHandler(getAccountUpgradedController)
)

export default commonAuthRouter
