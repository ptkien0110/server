import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validations'

export const addReviewValidator = validate(
  checkSchema(
    {
      comment: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: 'Name must be a string'
        }
      }
    },
    ['body']
  )
)
