import { Request, Response } from 'express'
import { LoginReqBody } from '~/models/requests/User.request'
import customerService from '~/services/customer.services'
import { ParamsDictionary } from 'express-serve-static-core'
import User from '~/models/schemas/User.schema'
import { ObjectId } from 'mongodb'
import authService from '~/services/auth.services'
import { ROLE, UserVerifyStatus } from '~/constants/enum'
import { USERS_MESSAGES } from '~/constants/messages'

export const checkAccountController = async (req: Request, res: Response) => {
  const { phone } = req.body
  const data = await customerService.checkAccountCustomer(phone)
  return res.json({
    message: 'Correct account information'
  })
}

export const createPasswordController = async (req: Request, res: Response) => {
  const { password, phone } = req.body
  const data = await customerService.createPassword(password, phone)
  return res.json({
    message: 'Create password success'
  })
}

export const loginCustomerController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId

  const data = await authService.login({
    user_id: user_id.toString(),
    roles: user.roles as ROLE,
    verify: user.verify as UserVerifyStatus
  })

  await res.cookie('refresh_token', data.refresh_token, { httpOnly: true })

  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    data: {
      access_token: data.access_token
    }
  })
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const data = await customerService.getMe(user_id)
  return res.json({
    message: 'Get me success',
    data
  })
}
