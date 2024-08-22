import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validations'

export const searchProductValidator = validate(
  checkSchema(
    {
      name: {
        isString: {
          errorMessage: 'Name must be string'
        }
      }
    },
    ['query']
  )
)

export const searchPurchaseValidator = validate(
  checkSchema(
    {
      code_purchase: {
        isString: {
          errorMessage: 'Code purchase must be string'
        }
      }
    },
    ['query']
  )
)
