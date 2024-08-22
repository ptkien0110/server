import { Request, Response } from 'express'
import {
  BankInfoReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload
} from '~/models/requests/User.request'
import { ParamsDictionary } from 'express-serve-static-core'
import authService from '~/services/auth.services'
import { USERS_MESSAGES } from '~/constants/messages'
import { ROLE, UserVerifyStatus } from '~/constants/enum'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import HTTP_STATUS from '~/constants/httpStatus'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const data = await authService.register(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    data
  })
}

export const registerProviderController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response
) => {
  const data = await authService.registerProvider(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    data
  })
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId

  const data = await authService.login({
    user_id: user_id.toString(),
    roles: user.roles as ROLE,
    verify: user.verify as UserVerifyStatus
  })

  // await res.cookie('refresh_token', data.refresh_token, { httpOnly: true })

  await res.cookie('refresh_token', data.refresh_token, {
    // httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // chỉ gửi qua HTTPS nếu đang ở môi trường production
    sameSite:"strict",
  });

  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    data: {
      access_token: data.access_token
    }
  })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refresh_token } = req.cookies
  const { user_id, exp, roles, verify } = req.decoded_refresh_token as TokenPayload

  const data = await authService.refreshToken({ refresh_token, user_id, exp, roles, verify })
  await res.cookie('refresh_token', data.refresh_token)
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    data: {
      access_token: data.access_token
    }
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await authService.logout(refresh_token)
  return res.json(result)
}

export const checkSellerController = async (req: Request, res: Response) => {
  const { identifier } = req.body
  const data = await authService.checkSeller(identifier)
  const redirectUrl = `/registry?ref=${data}`
  return res.json({
    message: 'Find seller success',
    data: {
      redirectUrl
    }
  })
}

export const registryController = async (req: Request, res: Response) => {
  const payload = req.body
  const ref = String(req.query.ref)
  const data = await authService.registry(ref, payload)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    data
  })
}

export const uploadAvatarController = async (req: Request, res: Response) => {
  const fileData = req.file
  const { user_id } = req.decoded_authorization
  const data = await authService.uploadAvatar(user_id, fileData)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_AVATAR_SUCCESS,
    data
  })
}
export const deleteAvatarController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization

  const data = await authService.deleteAvatar(user_id)
  return res.json({
    message: USERS_MESSAGES.DELETE_AVATAR_SUCCESS,
    data
  })
}

export const addBankInfoController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { bank_name, account_number, account_name } = req.body
  if (!bank_name || !account_number || !account_name) {
    return res.status(400).json({ message: 'All bank information fields are required' })
  }

  const data = await authService.addBankInfo(user_id, { bank_name, account_number, account_name })
  return res.json({
    message: USERS_MESSAGES.ADD_BANK_INFO_SUCCESS,
    data
  })
}

export const updateBankInfoController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const payload: BankInfoReqBody = req.body
  const data = await authService.updateBankInfo(user_id, payload)
  return res.json({
    message: USERS_MESSAGES.UPDATE_BANK_INFO_SUCCESS,
    data
  })
}

export const getInfoController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const data = await authService.getInfo(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_INFO_SUCCESS,
    data
  })
}

export const updateInfoController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const payload = req.body
  const data = await authService.updateInfo(user_id, payload)
  return res.json({
    message: USERS_MESSAGES.UPDATE_INFO_SUCCESS,
    data
  })
}

export const changePasswordController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await authService.changePassword(user_id, password)
  return res.json(result)
}

export const getAllAccountUpgradedController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const data = await authService.getAllAccountUpgraded({ page, limit })
  return res.json({
    message: USERS_MESSAGES.GET_ACCOUNTS_UPGRADED,
    data: {
      users: data.result,
      limit,
      page,
      total_page: Math.ceil(data.totalUpgradedUsers / limit),
      total_users: data.totalUpgradedUsers
    }
  })
}

export const getAccountUpgradedController = async (req: Request, res: Response) => {
  const { seller_id } = req.params
  const data = await authService.getAccountUpgraded(seller_id)
  return res.json({
    message: USERS_MESSAGES.GET_ACCOUNT_UPGRADED,
    data
  })
}
