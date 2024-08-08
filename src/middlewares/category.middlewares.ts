import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { CATEGORY_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validations'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/middlewares/error.middleware'

export const categoryNameValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: CATEGORY_MESSAGES.NAME_IS_REQUIRED
        },
        trim: true,
        isString: {
          errorMessage: CATEGORY_MESSAGES.NAME_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: CATEGORY_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
        },
        custom: {
          options: async (value: string, { req }) => {
            const cateInDB = await databaseService.categories.findOne({ name: value })
            if (cateInDB) {
              throw Error(CATEGORY_MESSAGES.CATEGORY_IS_EXIST)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const categoryIdValidator = validate(
  checkSchema(
    {
      category_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: CATEGORY_MESSAGES.INVALID_CATEGORY_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const cateInDB = await databaseService.categories.findOne({ _id: new ObjectId(value) })
            if (!cateInDB) {
              throw new ErrorWithStatus({
                message: CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
