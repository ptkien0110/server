import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import multer from 'multer'
import { ProductStatus, UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { CATEGORY_MESSAGES, PRODUCT_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/middlewares/error.middleware'
import { TokenPayload } from '~/models/requests/User.request'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validations'

const upload = multer()
export const productValidator = validate(
  checkSchema({
    name: {
      optional: true,
      isString: {
        errorMessage: PRODUCT_MESSAGES.NAME_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: PRODUCT_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
      }
    },
    description: {
      optional: true,
      isString: {
        errorMessage: PRODUCT_MESSAGES.NAME_MUST_BE_A_STRING
      },
      trim: true
    },
    category: {
      optional: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!ObjectId.isValid(new ObjectId(value))) {
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
    },
    price_for_customer: {
      optional: true,
      isNumeric: {
        errorMessage: PRODUCT_MESSAGES.PRICE_MUST_BE_A_NUMBER
      }
    },
    price_for_seller: {
      optional: true,
      isNumeric: {
        errorMessage: PRODUCT_MESSAGES.PRICE_MUST_BE_A_NUMBER
      }
    },
    stock: {
      optional: true,
      isNumeric: {
        errorMessage: PRODUCT_MESSAGES.STOCK_MUST_BE_A_NUMBER
      }
    },
    point: {
      optional: true,
      isNumeric: {
        errorMessage: PRODUCT_MESSAGES.POINT_MUST_BE_A_NUMBER
      }
    },
    profit: {
      optional: true,
      isNumeric: {
        errorMessage: PRODUCT_MESSAGES.PROFIT_MUST_BE_A_NUMBER
      }
    },
    profit_for_pdp: {
      optional: true,
      isNumeric: {
        errorMessage: PRODUCT_MESSAGES.PROFIT_FOR_PDP_MUST_BE_A_NUMBER
      }
    },
    profit_for_seller: {
      optional: true,
      isNumeric: {
        errorMessage: PRODUCT_MESSAGES.PROFIT_FOR_SELLER_MUST_BE_A_NUMBER
      }
    },
    discount: {
      optional: true,
      isNumeric: {
        errorMessage: PRODUCT_MESSAGES.DISCOUNT_MUST_BE_A_NUMBER
      }
    },
    discount_for_pdp: {
      optional: true,
      isNumeric: {
        errorMessage: PRODUCT_MESSAGES.DISCOUNT_MUST_BE_A_NUMBER
      }
    },
    discount_for_seller: {
      optional: true,
      isNumeric: {
        errorMessage: PRODUCT_MESSAGES.DISCOUNT_MUST_BE_A_NUMBER
      }
    },
    store_company: {
      optional: true,
      custom: {
        options: (value: any) => {
          if (typeof value !== 'object' || value === null) {
            throw new Error(PRODUCT_MESSAGES.STORE_MUST_BE_AN_OBJECT)
          }
          const { id, name, stock } = value
          if (typeof id !== 'string') {
            throw new Error(PRODUCT_MESSAGES.STORE_ID_MUST_BE_A_STRING)
          }
          if (typeof name !== 'string') {
            throw new Error(PRODUCT_MESSAGES.STORE_NAME_MUST_BE_A_STRING)
          }
          if (typeof stock !== 'number') {
            throw new Error(PRODUCT_MESSAGES.STORE_STOCK_MUST_BE_A_NUMBER)
          }
          return true
        }
      }
    }
  })
)

export const createProductValidator = validate(
  checkSchema({
    code: {
      customSanitizer: {
        options: (value) => String(value)
      },
      isString: {
        errorMessage: PRODUCT_MESSAGES.CODE_MUST_BE_A_STRING
      },
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          const { user_id } = (req as Request).decoded_authorization as TokenPayload
          const productInDB = await databaseService.products.findOne({
            code: value,
            provider_id: new ObjectId(user_id)
          })
          if (productInDB) {
            throw new Error(PRODUCT_MESSAGES.PRODUCT_ALREADY_EXISTS)
          }
          return true
        }
      }
    },
    content: {
      optional: true,
      customSanitizer: {
        options: (value) => String(value)
      },
      isString: {
        errorMessage: PRODUCT_MESSAGES.CONTENT_MUST_BE_A_STRING
      },
      trim: true
    },
    name: {
      customSanitizer: {
        options: (value) => String(value)
      },
      isString: {
        errorMessage: PRODUCT_MESSAGES.NAME_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: PRODUCT_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
      }
    },
    description: {
      optional: true,
      customSanitizer: {
        options: (value) => String(value)
      },
      isString: {
        errorMessage: PRODUCT_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
      },
      trim: true
    },
    category: {
      custom: {
        options: async (value: string, { req }) => {
          let categoryId
          try {
            categoryId = new ObjectId(value)
          } catch (error) {
            throw new ErrorWithStatus({
              message: CATEGORY_MESSAGES.INVALID_CATEGORY_ID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }

          const cateInDB = await databaseService.categories.findOne({ _id: categoryId })
          if (!cateInDB) {
            throw new ErrorWithStatus({
              message: CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    },
    price_original: {
      customSanitizer: {
        options: (value) => Number(value)
      }
    },
    note: {
      optional: true,
      customSanitizer: {
        options: (value) => String(value)
      },
      isString: {
        errorMessage: PRODUCT_MESSAGES.NOTE_MUST_BE_A_STRING
      },
      trim: true
    }
  })
)

export const productIdValidator = validate(
  checkSchema(
    {
      product_id: {
        notEmpty: {
          errorMessage: PRODUCT_MESSAGES.INVALID_PRODUCT_ID
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: PRODUCT_MESSAGES.INVALID_PRODUCT_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const productInDB = await databaseService.products.findOne({ _id: new ObjectId(value) })
            if (productInDB == null) {
              throw new ErrorWithStatus({
                message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
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

export const paginationValidator = validate(
  checkSchema({
    limit: {
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const num = Number(value)
          if (num > 100 || num < 1) {
            throw new Error('1 <= limit <= 100')
          }
          return true
        }
      }
    },
    page: {
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const num = Number(value)
          if (num < 1) {
            throw new Error('page >= 1')
          }
          return true
        }
      }
    }
  })
)

const validRoles = Object.keys(UserVerifyStatus)
  .map((key) => parseInt(key, 10))
  .filter((value) => !isNaN(value))
export const verifyStatusValidator = validate(
  checkSchema(
    {
      verify: {
        optional: true,
        isIn: {
          options: [validRoles],
          errorMessage: USERS_MESSAGES.VERIFY_STATUS_INVALID
        }
      }
    },
    ['body', 'query']
  )
)

const validStatusProduct = Object.keys(ProductStatus)
  .map((key) => parseInt(key, 10))
  .filter((value) => !isNaN(value))
export const verifyStatusProductValidator = validate(
  checkSchema(
    {
      status: {
        optional: true,
        isIn: {
          options: [validStatusProduct],
          errorMessage: PRODUCT_MESSAGES.INVALID_STATUS_PRODUCT
        }
      }
    },
    ['body', 'query']
  )
)
