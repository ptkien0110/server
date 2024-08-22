import { ObjectId } from 'mongodb'
import { StatusCustomer } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/middlewares/error.middleware'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'

class CustomerServices {
  async checkAccountCustomer(phone: string) {
    const customer = await databaseService.customers.findOne({ phone })
    if (!customer) {
      throw new ErrorWithStatus({
        message: 'Customer not found',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return true
  }

  async createPassword(password: string, phone: string) {
    const user = await databaseService.customers.findOne({ phone })
    if (!user) {
      throw new Error('Customer not found')
    }
    if (user.password) {
      throw new Error('Customer has been linked')
    }
    await databaseService.customers.updateOne(
      {
        _id: new ObjectId(user?._id)
      },
      {
        $set: {
          password: hashPassword(password),
          status: StatusCustomer.Linked
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.CREATE_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    // const cus = await databaseService.customers.findOne(
    //   { _id: new ObjectId(user_id) },
    //   {
    //     projection: {
    //       password: 0
    //     }
    //   }
    // )

    const customer = await databaseService.customers
      .aggregate([
        {
          $match: {
            _id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'seller_id',
            foreignField: '_id',
            as: 'seller_info'
          }
        },
        {
          $unwind: '$seller_info'
        },
        {
          $project: {
            password: 0,
            seller_info: {
              referrer_id: 0,
              password: 0,
              date_of_birth: 0,
              aff_code: 0,
              parent_aff_code: 0,
              roles: 0,
              verify: 0,
              created_at: 0,
              updated_at: 0
            }
          }
        }
      ])
      .toArray()
    return customer[0]
  }
}

const customerService = new CustomerServices()
export default customerService
