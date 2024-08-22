import { ProductDestroyStatus, ProductStatus } from '~/constants/enum'
import databaseService from '~/services/database.services'

class SearchService {
  async searchProduct({ limit, page, name }: { limit: number; page: number; name: string }) {
    const regex = new RegExp(name, 'i')

    const [result, total] = await Promise.all([
      databaseService.products
        .aggregate([
          {
            $match: {
              name: { $regex: regex },
              destroy: ProductDestroyStatus.Active,
              status: ProductStatus.Accept
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              price_original: 0,
              price_for_seller: 0,
              price_points: 0,
              profit: 0,
              profit_for_admin: 0,
              profit_for_pdp: 0,
              discount_for_admin: 0,
              discount_for_point: 0,
              discount_for_seller: 0
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.products
        .aggregate([
          {
            $match: {
              name: { $regex: regex }, // Tìm kiếm bằng regex
              destroy: ProductDestroyStatus.Active,
              status: ProductStatus.Accept
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])

    return { result, total: total[0] ? total[0].total : 0 }
  }

  async searchPurchase({ limit, page, code_purchase }: { limit: number; page: number; code_purchase: string }) {
    const regex = new RegExp(code_purchase, 'i')

    const [result, total] = await Promise.all([
      databaseService.purchases
        .aggregate([
          {
            $match: {
              code_purchase: { $regex: regex }
            }
          },

          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.purchases
        .aggregate([
          {
            $match: {
              code_purchase: { $regex: regex }
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])

    return { result, total: total[0] ? total[0].total : 0 }
  }
}

const searchService = new SearchService()

export default searchService
