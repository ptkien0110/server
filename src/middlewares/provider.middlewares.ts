import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/middlewares/error.middleware'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validations'

export const providerIdValidator = validate(
  checkSchema(
    {
      provider_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.INVALID_SELLER_ID
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.INVALID_SELLER_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const providerInDn = await databaseService.users.findOne({ _id: new ObjectId(value) })
            if (providerInDn == null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.PROVIDER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)
