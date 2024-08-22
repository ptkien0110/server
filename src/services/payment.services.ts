import { ObjectId } from 'mongodb'
import { StatusTransaction } from '~/constants/enum'
import CostBearer from '~/models/schemas/CostBearer.schema'
import PaymentMethod from '~/models/schemas/PaymentMethod.schema'
import { TransactionType } from '~/models/schemas/Transaction.schema'
import databaseService from '~/services/database.services'
import { v2 as cloudinary } from 'cloudinary'

class PaymentService {
  async createPaymentMethod(name: string) {
    const result = await databaseService.paymentMethods.insertOne(
      new PaymentMethod({
        name
      })
    )
    const data = await databaseService.paymentMethods.findOne({ _id: result.insertedId })
    return data
  }

  async getAllPaymentMethod() {
    const result = await databaseService.paymentMethods.find({}).toArray()
    return result
  }

  async createCostBearer(name: string) {
    const result = await databaseService.costBearers.insertOne(
      new CostBearer({
        name
      })
    )
    const data = await databaseService.costBearers.findOne({ _id: result.insertedId })
    return data
  }

  async getAllCostBearer() {
    const result = await databaseService.costBearers.find({}).toArray()
    return result
  }

  async sentTransactionUpgrade(user_id: string, payload: TransactionType, fileData: any) {
    const session = await databaseService.startSession()

    let result // Biến để lưu trữ kết quả bên ngoài giao dịch

    try {
      await session.withTransaction(async () => {
        const upgrade = await databaseService.userUpgrades.findOne(
          { _id: new ObjectId(payload.upgrade_id) },
          { session }
        )

        if (!upgrade) {
          throw new Error('Upgrade not found')
        }

        // Lấy thông tin upgradePackage dựa trên package_id trong userUpgrade
        const upgradePackage = await databaseService.upgradePackages.findOne({ _id: upgrade.package_id }, { session })

        if (!upgradePackage) {
          throw new Error('Upgrade package not found')
        }

        // Kiểm tra xem đã có giao dịch nào với upgrade này chưa
        const existingTransaction = await databaseService.transactions.findOne({ upgrade_id: upgrade._id }, { session })

        if (existingTransaction) {
          throw new Error('Transaction already exists for this upgrade')
        }

        const today = new Date()
        const year = today.getFullYear().toString().slice(-2)
        const month = ('0' + (today.getMonth() + 1)).slice(-2)
        const day = ('0' + today.getDate()).slice(-2)

        const dateStr = `${year}${month}${day}`
        // Đếm số đơn hàng trong ngày hiện tại để tạo số thứ tự
        const count = await databaseService.transactions.countDocuments(
          {
            created_at: {
              $gte: new Date(today.setHours(0, 0, 0, 0)),
              $lt: new Date(today.setHours(23, 59, 59, 999))
            }
          },
          { session }
        )

        const orderNumber = ('0000' + (count + 1)).slice(-5)
        const transactionCode = `GDNC${dateStr}${orderNumber}`

        const transactionData = {
          seller_id: new ObjectId(user_id),
          purchase_id: undefined,
          upgrade_id: upgrade._id,
          transaction_code: transactionCode,
          code_upgrade: upgrade.code_upgrade,
          total_price: upgradePackage.price, // Sử dụng giá từ upgradePackage
          status: StatusTransaction.Pending,
          transfer_image: fileData.path,
          created_at: new Date(),
          updated_at: new Date()
        }

        const trans = await databaseService.transactions.insertOne(transactionData, { session })

        await databaseService.userUpgrades.updateOne(
          { _id: upgrade._id },
          { $set: { is_sent_payment: true } },
          { session }
        )
        // Lấy kết quả và lưu trữ vào biến bên ngoài giao dịch
        result = await databaseService.transactions.findOne({ _id: trans.insertedId }, { session })
      })
    } catch (error) {
      // Xóa ảnh khi gặp lỗi
      try {
        await cloudinary.api.delete_resources(fileData.filename) // Xóa ảnh sử dụng mảng để tương thích với API Cloudinary
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError)
      }

      throw error
    } finally {
      session.endSession()
    }

    // Trả về kết quả sau khi giao dịch hoàn thành
    return result
  }

  async sentTransactionPurchase(user_id: string, payload: TransactionType, fileData: any) {
    const session = await databaseService.startSession()

    let result // Biến để lưu trữ kết quả bên ngoài giao dịch

    try {
      await session.withTransaction(async () => {
        const purchase = await databaseService.purchases.findOne(
          { _id: new ObjectId(payload.purchase_id) },
          { session }
        )

        if (!purchase) {
          throw new Error('Purchase not found')
        }

        // Kiểm tra xem đã có giao dịch nào với purchase_id này chưa
        const existingTransaction = await databaseService.transactions.findOne(
          { purchase_id: purchase._id },
          { session }
        )

        if (existingTransaction) {
          throw new Error('Transaction already exists for this purchase')
        }

        const today = new Date()
        const year = today.getFullYear().toString().slice(-2)
        const month = ('0' + (today.getMonth() + 1)).slice(-2)
        const day = ('0' + today.getDate()).slice(-2)

        const dateStr = `${year}${month}${day}`
        // Đếm số đơn hàng trong ngày hiện tại để tạo số thứ tự
        const count = await databaseService.transactions.countDocuments(
          {
            created_at: {
              $gte: new Date(today.setHours(0, 0, 0, 0)),
              $lt: new Date(today.setHours(23, 59, 59, 999))
            }
          },
          { session }
        )

        const orderNumber = ('0000' + (count + 1)).slice(-5)
        const transactionCode = `GDDH${dateStr}${orderNumber}`

        const transactionData = {
          seller_id: new ObjectId(user_id),
          purchase_id: purchase._id,
          upgrade_id: undefined,
          transaction_code: transactionCode,
          code_purchase: purchase.code_purchase,
          total_price: Number(purchase.purchase_total_price),
          status: StatusTransaction.Pending,
          transfer_image: fileData.path,
          created_at: new Date(),
          updated_at: new Date()
        }

        const trans = await databaseService.transactions.insertOne(transactionData, { session })

        // Lấy kết quả và lưu trữ vào biến bên ngoài giao dịch
        result = await databaseService.transactions.findOne({ _id: trans.insertedId }, { session })
      })
    } catch (error) {
      // Xóa ảnh khi gặp lỗi
      try {
        await cloudinary.api.delete_resources(fileData.filename) // Xóa ảnh sử dụng mảng để tương thích với API Cloudinary
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError)
      }

      throw error
    } finally {
      session.endSession()
    }

    // Trả về kết quả sau khi giao dịch hoàn thành
    return result
  }

  async adminGetAllTransaction({ page, limit, date }: { page: number; limit: number; date: 'latest' | 'oldest' }) {
    const sortOrder = date === 'latest' ? -1 : 1
    const result = await databaseService.transactions
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'seller_id',
            foreignField: '_id',
            as: 'seller_info'
          }
        },

        {
          $lookup: {
            from: 'purchases',
            localField: 'purchase_id',
            foreignField: '_id',
            as: 'purchase_info'
          }
        },
        {
          $lookup: {
            from: 'userUpgrades',
            localField: 'upgrade_id',
            foreignField: '_id',
            as: 'upgrade_info'
          }
        },
        {
          $unwind: {
            path: '$upgrade_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$purchase_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$seller_info',
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $project: {
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
        },
        {
          $sort: { created_at: sortOrder }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await databaseService.transactions.countDocuments()
    return {
      result,
      total
    }
  }

  async adminGetTransaction(transaction_id: string) {
    const result = await databaseService.transactions
      .aggregate([
        {
          $match: {
            _id: new ObjectId(transaction_id)
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
          $lookup: {
            from: 'purchases',
            localField: 'purchase_id',
            foreignField: '_id',
            as: 'purchase_info'
          }
        },
        {
          $lookup: {
            from: 'userUpgrades',
            localField: 'upgrade_id',
            foreignField: '_id',
            as: 'upgrade_info'
          }
        },
        {
          $unwind: {
            path: '$upgrade_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$purchase_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$seller_info',
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $project: {
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
    return result
  }

  async confirmTransaction(code: string) {
    const trans = await databaseService.transactions.findOne({
      $or: [{ code_purchase: code }, { code_upgrade: code }]
    })
    if (!trans) {
      throw new Error('Không tìm thấy giao dịch')
    }
    if (trans.status === StatusTransaction.Done) {
      throw new Error('Giao dịch này đã được xác nhận')
    }

    const updateTrans = await databaseService.transactions.findOneAndUpdate(
      {
        $or: [{ code_purchase: code }, { code_upgrade: code }]
      },
      {
        $set: {
          status: StatusTransaction.Done,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )
    return updateTrans
  }
}

const paymentService = new PaymentService()
export default paymentService
