import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { verifyAccessToken } from '~/constants/common'
import { ROLE, StatusUpgrade } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { REGEX_PHONE_NUMBER } from '~/constants/regex'
import { ErrorWithStatus } from '~/middlewares/error.middleware'
import { TokenPayload } from '~/models/requests/User.request'
import authService from '~/services/auth.services'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validations'

const validRoles = Object.values(ROLE).filter((role) => role !== ROLE.ADMIN)

export const phoneValidator = validate(
  checkSchema(
    {
      identifier: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!REGEX_PHONE_NUMBER.test(value)) {
              throw new Error(USERS_MESSAGES.PHONE_NUMBER_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
        },
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
      phone: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!REGEX_PHONE_NUMBER.test(value)) {
              throw new Error(USERS_MESSAGES.PHONE_NUMBER_INVALID)
            }
            const user = await databaseService.users.findOne({ phone: value })
            if (user) {
              throw Error(USERS_MESSAGES.PHONE_NUMBER_EXISTED)
            }
            return true
          }
        }
      },
      email: {
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
      date_of_birth: {
        custom: {
          options: (value: string) => {
            const dateOfBirth = new Date(value)
            if (isNaN(dateOfBirth.getTime())) {
              throw new Error('Invalid date_of_birth')
            }
            return true
          }
        }
      },
      address: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ADDRESS_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.ADDRESS_INVALID
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: USERS_MESSAGES.ADDRESS_LENGTH_MUST_BE_FROM_1_255
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isString: {
          errorMessage: USERS_MESSAGES.EMAIL_OR_PHONE_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              $or: [{ email: value }, { phone: value }],
              password: hashPassword(req.body.password)
            })
            if (user == null) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const refreshTokenValidator = validate(
  checkSchema({
    refresh_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          try {
            const [decoded_refresh_token, refresh_token] = await Promise.all([
              verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
              }),
              databaseService.refreshTokens.findOne({ token: value })
            ])
            if (refresh_token === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            ;(req as Request).decoded_refresh_token = decoded_refresh_token
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: capitalize(error.message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            throw error
          }
          return true
        }
      }
    }
  })
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            return await verifyAccessToken(access_token, req as Request)
          }
        }
      }
    },
    ['headers']
  )
)

export const verifiedAdminValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { roles } = req.decoded_authorization as TokenPayload
  if (roles !== ROLE.ADMIN) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_NOT_ADMIN,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const verifiedSellerValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { roles } = req.decoded_authorization as TokenPayload
  if (roles !== ROLE.SELLER) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_NOT_SELLER,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const verifiedProviderValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { roles } = req.decoded_authorization as TokenPayload
  if (roles !== ROLE.PROVIDER) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_NOT_PROVIDER,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const registryValidator = validate(
  checkSchema(
    {
      phone: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!REGEX_PHONE_NUMBER.test(value)) {
              throw new Error(USERS_MESSAGES.PHONE_NUMBER_INVALID)
            }
            const user = await databaseService.users.findOne({ phone: value })
            if (user) {
              throw Error(USERS_MESSAGES.PHONE_NUMBER_EXISTED)
            }
            return
          }
        }
      },
      email: {
        optional: true,
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const isExistEmail = await authService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const createAccountValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
        },
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
          options: async (value: string, { req }) => {
            const isExistEmail = await authService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      },
      roles: {
        optional: true,
        isIn: {
          options: [validRoles],
          errorMessage: USERS_MESSAGES.ROLES_IS_INVALID
        }
      }
    },
    ['body']
  )
)

export const userIdValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.INVALID_USER_ID
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.INVALID_USER_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const user = await databaseService.users.findOne({ _id: new ObjectId(value) })
            if (user == null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCOUNT_NOT_FOUND,
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

export const customerIdValidator = validate(
  checkSchema(
    {
      customer_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.INVALID_USER_ID
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.INVALID_USER_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const user = await databaseService.customers.findOne({ _id: new ObjectId(value) })
            if (user == null) {
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

export const rolesValidator = validate(
  checkSchema(
    {
      roles: {
        optional: true,
        isIn: {
          options: [validRoles],
          errorMessage: USERS_MESSAGES.ROLES_IS_INVALID
        }
      }
    },
    ['body', 'query']
  )
)

export const checkUserUpgrade = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization
  const currentUpgrade = await databaseService.userUpgrades.findOne({
    user_id: new ObjectId(user_id),
    status: StatusUpgrade.Accept,
    in_use: true
  })
  if (!currentUpgrade) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.SELLER_HAS_NOT_UPGRADED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const bankInfoValidator = validate(
  checkSchema(
    {
      bank_name: {
        isString: {
          errorMessage: 'Bank name must be a string'
        },
        notEmpty: {
          errorMessage: 'Bank name is required'
        }
      },
      account_number: {
        isString: {
          errorMessage: 'Account number must be a string'
        },
        notEmpty: {
          errorMessage: 'Account number is required'
        },
        isLength: {
          options: { min: 6 },
          errorMessage: 'Account number must be at least 6 characters long'
        }
      },
      account_name: {
        isString: {
          errorMessage: 'Account name must be a string'
        },
        notEmpty: {
          errorMessage: 'Account name is required'
        }
      }
    },
    ['body']
  )
)

export const updateBankInfoValidator = validate(
  checkSchema(
    {
      bank_name: {
        optional: true,
        isString: {
          errorMessage: 'Bank name must be a string'
        },
        notEmpty: {
          errorMessage: 'Bank name is required'
        }
      },
      account_number: {
        optional: true,
        isString: {
          errorMessage: 'Account number must be a string'
        },
        notEmpty: {
          errorMessage: 'Account number is required'
        },
        isLength: {
          options: { min: 6 },
          errorMessage: 'Account number must be at least 6 characters long'
        }
      },
      account_name: {
        optional: true,
        isString: {
          errorMessage: 'Account name must be a string'
        },
        notEmpty: {
          errorMessage: 'Account name is required'
        }
      }
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema({
    old_password: {
      custom: {
        options: async (value, { req }) => {
          const { user_id } = (req as Request).decoded_authorization as TokenPayload
          const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

          if (!user) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }

          const { password } = user
          const isMatch = hashPassword(value) === password

          if (!isMatch) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 6,
          max: 50
        },
        errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
      }
    },
    confirm_password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
          }
          return true
        }
      }
    }
  })
)
