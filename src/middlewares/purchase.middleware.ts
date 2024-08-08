import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { StatusPurchase } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCT_MESSAGES, PURCHASE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/middlewares/error.middleware'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validations'

export const purchaseItemsValidator = validate(
  checkSchema(
    {
      'purchase_items.*.product_id': {
        notEmpty: {
          errorMessage: PRODUCT_MESSAGES.INVALID_PRODUCT_ID
        },
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: PRODUCT_MESSAGES.INVALID_PRODUCT_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const product = await databaseService.products.findOne({ _id: new ObjectId(value) })
            if (product == null) {
              throw new ErrorWithStatus({
                message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      },
      'purchase_items.*.store_id': {
        notEmpty: {
          errorMessage: PURCHASE_MESSAGES.INVALID_STORE_ID
        },
        isString: {
          errorMessage: PRODUCT_MESSAGES.STORE_ID_MUST_BE_A_STRING
        }
      }
    },
    ['body']
  )
)

const validStatusPurchase = Object.keys(StatusPurchase)
  .map((key) => parseInt(key, 10))
  .filter((value) => value !== 0)
export const verifyStatusPurchaseValidator = validate(
  checkSchema(
    {
      status: {
        isIn: {
          options: [validStatusPurchase],
          errorMessage: PURCHASE_MESSAGES.PURCHASE_STATUS_INVALID
        }
      }
    },
    ['body', 'query']
  )
)

export const purchaseIdValidator = validate(
  checkSchema(
    {
      purchase_id: {
        notEmpty: {
          errorMessage: PURCHASE_MESSAGES.INVALID_PURCHASE_ID
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: PURCHASE_MESSAGES.INVALID_PURCHASE_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const purchaseInDB = await databaseService.purchases.findOne({ _id: new ObjectId(value) })
            if (purchaseInDB == null) {
              throw new ErrorWithStatus({
                message: PURCHASE_MESSAGES.PURCHASE_NOT_FOUND,
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

export const upgradeIdValidator = validate(
  checkSchema(
    {
      upgrade_id: {
        notEmpty: {
          errorMessage: 'Invalid upgrade_id'
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'Invalid upgrade_id',
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const upgradeInDB = await databaseService.userUpgrades.findOne({ _id: new ObjectId(value) })
            if (upgradeInDB == null) {
              throw new ErrorWithStatus({
                message: 'Upgrade not found',
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
