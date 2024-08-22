import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { REGEX_PHONE_NUMBER } from '~/constants/regex'
import { ErrorWithStatus } from '~/middlewares/error.middleware'
import authService from '~/services/auth.services'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validations'

export const createCustomerValidator = validate(
  checkSchema({
    name: {
      isString: {
        errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
      }
    },
    email: {
      optional: true,
      isEmail: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
      },
      trim: true,
      custom: {
        options: async (value: string) => {
          const isExistEmail = await authService.checkEmailExist(value)
          if (isExistEmail) {
            throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
          }
          return true
        }
      }
    },
    phone: {
      isString: {
        errorMessage: USERS_MESSAGES.PHONE_NUMBER_IS_STRING
      },
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!REGEX_PHONE_NUMBER.test(value)) {
            throw new Error(USERS_MESSAGES.PHONE_NUMBER_INVALID)
          }
          const user = await databaseService.customers.findOne({ phone: value })
          if (user) {
            throw Error(USERS_MESSAGES.PHONE_NUMBER_EXISTED)
          }
          return true
        }
      }
    },
    date_of_birth: {
      optional: true,
      custom: {
        options: (value: string) => {
          const dateOfBirth = new Date(value)
          if (isNaN(dateOfBirth.getTime())) {
            throw new Error('Invalid date_of_birth')
          }
          return true
        }
      }
    }
  })
)

export const customerIdValidator = validate(
  checkSchema(
    {
      customer_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.INVALID_CUSTOMER_ID
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.INVALID_CUSTOMER_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const customerInDB = await databaseService.customers.findOne({ _id: new ObjectId(value) })
            if (customerInDB == null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.CUSTOMER_NOT_FOUND,
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

export const updateCustomerValidator = validate(
  checkSchema({
    name: {
      optional: true,
      isString: {
        errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
      }
    },
    email: {
      optional: true,
      isEmail: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
      },
      trim: true,
      custom: {
        options: async (value: string) => {
          const isExistEmail = await authService.checkEmailExist(value)
          if (isExistEmail) {
            throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
          }
          return true
        }
      }
    },
    phone: {
      optional: true,
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!REGEX_PHONE_NUMBER.test(value)) {
            throw new Error(USERS_MESSAGES.PHONE_NUMBER_INVALID)
          }
          const user = await databaseService.customers.findOne({ phone: value })
          if (user) {
            throw Error(USERS_MESSAGES.PHONE_NUMBER_EXISTED)
          }
          return true
        }
      }
    },
    date_of_birth: {
      optional: true,
      custom: {
        options: (value: string) => {
          const dateOfBirth = new Date(value)
          if (isNaN(dateOfBirth.getTime())) {
            throw new Error('Invalid date_of_birth')
          }
          return true
        }
      }
    }
  })
)

export const sellerIdValidator = validate(
  checkSchema(
    {
      seller_id: {
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
            const sellInDn = await databaseService.users.findOne({ _id: new ObjectId(value) })
            if (sellInDn === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.SELLER_NOT_FOUND,
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

export const createUpgradePackageValidator = validate(
  checkSchema({
    name: {
      isString: {
        errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
      }
    },
    duration_in_months: {
      isInt: {
        errorMessage: USERS_MESSAGES.DURATION_IN_MONTHS_MUST_BE_NUMBER
      },
      toInt: true
    },
    price: {
      isNumeric: {
        errorMessage: USERS_MESSAGES.PRICE_MUST_BE_NUMBER
      },
      toFloat: true
    },
    benefits: {
      isArray: {
        errorMessage: USERS_MESSAGES.BENEFITS_MUST_BE_ARRAY
      },
      custom: {
        options: (benefits) => {
          if (!Array.isArray(benefits) || benefits.length === 0) {
            throw new Error(USERS_MESSAGES.BENEFITS_CANNOT_BE_EMPTY)
          }
          return benefits.every((benefit) => typeof benefit === 'string' && benefit.trim().length > 0)
        },
        errorMessage: USERS_MESSAGES.BENEFITS_MUST_BE_NON_EMPTY_STRINGS
      }
    }
  })
)

export const upgradeIdValidator = validate(
  checkSchema(
    {
      upgrade_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.INVALID_UPGRADE_ID
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.INVALID_UPGRADE_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const upgradeInDB = await databaseService.userUpgrades.findOne({ _id: new ObjectId(value) })
            if (upgradeInDB === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.UPGRADE_NOT_FOUND,
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

export const packageIdValidator = validate(
  checkSchema(
    {
      package_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.INVALID_PACKAGE_ID
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.INVALID_PACKAGE_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const packageInDB = await databaseService.upgradePackages.findOne({ _id: new ObjectId(value) })
            if (packageInDB === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.PACKAGE_NOT_FOUND,
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

export const transactionIdValidator = validate(
  checkSchema(
    {
      transaction_id: {
        notEmpty: {
          errorMessage: 'Invalid transaction_id'
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'Invalid transaction_id',
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const transactionInDB = await databaseService.transactions.findOne({ _id: new ObjectId(value) })
            if (transactionInDB == null) {
              throw new ErrorWithStatus({
                message: 'Transaction not found',
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
