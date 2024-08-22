import { ObjectId } from 'mongodb'
import { ROLE, StatusPurchase, StatusUpgrade } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/middlewares/error.middleware'
import databaseService from '~/services/database.services'

class StatisticService {
  async adminStatisticRevenuesPDPByTime(user_id: string, startTime: Date, endTime: Date) {
    const regexStart = new Date(startTime)
    regexStart.setHours(0, 0, 0, 0)
    const regexEnd = new Date(endTime)
    regexEnd.setHours(23, 59, 59, 999)

    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id), roles: ROLE.PROVIDER })
    if (!user) {
      throw new ErrorWithStatus({
        message: 'Account not provider',
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const aggregatePipeline = [
      {
        $match: {
          user_id: new ObjectId(user_id),
          revenue_affiliate_id: { $exists: true, $ne: [] } // Chỉ lấy những bản ghi có revenue_affiliate_id không rỗng
        }
      },
      {
        $lookup: {
          from: 'revenuesAffiliate',
          localField: 'revenue_affiliate_id',
          foreignField: '_id',
          as: 'revenues_affiliates'
        }
      },
      {
        $unwind: '$revenues_affiliates'
      },
      {
        $lookup: {
          from: 'purchases',
          localField: 'revenues_affiliates.purchase_id',
          foreignField: '_id',
          as: 'purchases'
        }
      },
      {
        $unwind: '$purchases'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'purchases.seller_id',
          foreignField: '_id',
          as: 'seller_info'
        }
      },
      {
        $unwind: '$seller_info'
      },
      {
        $match: {
          'revenues_affiliates.created_at': {
            $gte: regexStart,
            $lte: regexEnd
          }
        }
      },
      {
        $group: {
          _id: '$_id', // Dùng _id của TotalRevenues làm key group
          totalMoney: { $sum: '$revenues_affiliates.money' },
          purchases: {
            $push: {
              $mergeObjects: [
                '$purchases',
                {
                  seller_info: { name: '$seller_info.name', phone: '$seller_info.phone' }
                }
              ]
            }
          } // Gom tất cả thông tin đơn hàng
        }
      }
    ]

    const result = await databaseService.totalRevenues.aggregate(aggregatePipeline).toArray()

    return result[0]
  }

  // async adminStatisticRevenuesPDPByTime(user_id: string, startTime: Date, endTime: Date) {
  //   const regexStart = new Date(startTime)
  //   regexStart.setHours(0, 0, 0, 0)
  //   const regexEnd = new Date(endTime)
  //   regexEnd.setHours(23, 59, 59, 999)

  //   const user = await databaseService.users.findOne({ _id: new ObjectId(user_id), roles: ROLE.PROVIDER })
  //   if (!user) {
  //     throw new ErrorWithStatus({
  //       message: 'Account not provider',
  //       status: HTTP_STATUS.NOT_FOUND
  //     })
  //   }

  //   const aggregatePipeline = [
  //     {
  //       $match: {
  //         user_id: new ObjectId(user_id),
  //         revenue_affiliate_id: { $exists: true, $ne: [] } // Chỉ lấy những bản ghi có revenue_affiliate_id không rỗng
  //       }
  //     },
  //     {
  //       $lookup: {
  //         from: 'revenuesAffiliate',
  //         localField: 'revenue_affiliate_id',
  //         foreignField: '_id',
  //         as: 'revenues_affiliates'
  //       }
  //     },
  //     {
  //       $unwind: '$revenues_affiliates'
  //     },
  //     {
  //       $lookup: {
  //         from: 'purchases',
  //         localField: 'revenues_affiliates.purchase_id',
  //         foreignField: '_id',
  //         as: 'purchases'
  //       }
  //     },
  //     {
  //       $unwind: '$purchases'
  //     },
  //     {
  //       $match: {
  //         'revenues_affiliates.created_at': {
  //           $gte: regexStart,
  //           $lte: regexEnd
  //         }
  //       }
  //     },
  //     {
  //       $group: {
  //         _id: '$_id', // Dùng _id của TotalRevenues làm key group
  //         totalMoney: { $sum: '$revenues_affiliates.money' },
  //         purchase: { $push: '$purchases' } // Gom tất cả thông tin đơn hàng
  //       }
  //     }
  //   ]

  //   const result = await databaseService.totalRevenues.aggregate(aggregatePipeline).toArray()

  //   return result[0] || { totalMoney: 0, purchases: [], totalProfitForPDP: 0 }
  // }

  async statisticRevenuesByTime(user_id: string, startTime: Date, endTime: Date) {
    const regexStart = new Date(startTime)
    regexStart.setHours(0, 0, 0, 0)
    const regexEnd = new Date(endTime)
    regexEnd.setHours(23, 59, 59, 999)

    const aggregatePipeline = [
      {
        $match: {
          user_id: new ObjectId(user_id),
          revenue_affiliate_id: { $exists: true, $ne: [] } // Chỉ lấy những bản ghi có revenue_affiliate_id không rỗng
        }
      },
      {
        $lookup: {
          from: 'revenuesAffiliate', // Tên collection của RevenuesAffiliate
          localField: 'revenue_affiliate_id',
          foreignField: '_id',
          as: 'revenues_affiliates'
        }
      },
      {
        $unwind: '$revenues_affiliates'
      },
      {
        $lookup: {
          from: 'purchases',
          localField: 'revenues_affiliates.purchase_id',
          foreignField: '_id',
          as: 'purchases'
        }
      },
      {
        $unwind: '$purchases'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'purchases.seller_id',
          foreignField: '_id',
          as: 'seller_info'
        }
      },
      {
        $unwind: '$seller_info'
      },
      {
        $match: {
          'revenues_affiliates.created_at': {
            $gte: regexStart,
            $lte: regexEnd
          }
        }
      },

      {
        $group: {
          _id: '$_id', // Dùng _id của TotalRevenues làm key group
          totalMoney: { $sum: '$revenues_affiliates.money' },
          purchases: {
            $push: {
              $mergeObjects: [
                '$purchases',
                {
                  seller_info: { name: '$seller_info.name', phone: '$seller_info.phone' }
                }
              ]
            }
          }
        }
      }
    ]

    const result = await databaseService.totalRevenues.aggregate(aggregatePipeline).toArray()

    return result[0]
  }

  async adminStatisticRevenuesSellerByTime(user_id: string, startTime: Date, endTime: Date) {
    const regexStart = new Date(startTime)
    regexStart.setHours(0, 0, 0, 0)
    const regexEnd = new Date(endTime)
    regexEnd.setHours(23, 59, 59, 999)

    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id), roles: ROLE.SELLER })
    if (!user) {
      throw new ErrorWithStatus({
        message: 'Account not seller',
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const aggregatePipeline = [
      {
        $match: {
          user_id: new ObjectId(user_id),
          revenue_affiliate_id: { $exists: true, $ne: [] } // Chỉ lấy những bản ghi có revenue_affiliate_id không rỗng
        }
      },
      {
        $lookup: {
          from: 'revenuesAffiliate',
          localField: 'revenue_affiliate_id',
          foreignField: '_id',
          as: 'revenues_affiliates'
        }
      },
      {
        $unwind: '$revenues_affiliates'
      },
      {
        $lookup: {
          from: 'purchases',
          localField: 'revenues_affiliates.purchase_id',
          foreignField: '_id',
          as: 'purchases'
        }
      },
      {
        $unwind: '$purchases'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'purchases.seller_id',
          foreignField: '_id',
          as: 'seller_info'
        }
      },
      {
        $unwind: '$seller_info'
      },
      {
        $match: {
          'revenues_affiliates.created_at': {
            $gte: regexStart,
            $lte: regexEnd
          }
        }
      },
      {
        $group: {
          _id: '$_id', // Dùng _id của TotalRevenues làm key group
          totalMoney: { $sum: '$revenues_affiliates.money' },
          purchases: {
            $push: {
              $mergeObjects: [
                '$purchases',
                {
                  seller_info: { name: '$seller_info.name', phone: '$seller_info.phone' }
                }
              ]
            }
          } // Gom tất cả thông tin đơn hàng
        }
      }
    ]

    const result = await databaseService.totalRevenues.aggregate(aggregatePipeline).toArray()

    return result[0]
  }

  async adminStatisticRevenuesInvite(user_id: string, startTime: Date, endTime: Date) {
    const regexStart = new Date(startTime)
    regexStart.setHours(0, 0, 0, 0)
    const regexEnd = new Date(endTime)
    regexEnd.setHours(23, 59, 59, 999)

    // const user = await databaseService.users.findOne({ _id: new ObjectId(user_id), roles: ROLE.SELLER })
    // if (!user) {
    //   throw new ErrorWithStatus({
    //     message: 'Account not seller',
    //     status: HTTP_STATUS.NOT_FOUND
    //   })
    // }
    const aggregatePipeline = [
      {
        $match: {
          user_id: new ObjectId(user_id),
          revenue_invite_id: { $exists: true, $ne: [] } // Chỉ lấy những bản ghi có revenue_affiliate_id không rỗng
        }
      },
      {
        $lookup: {
          from: 'revenuesInvite',
          localField: 'revenue_invite_id',
          foreignField: '_id',
          as: 'revenues_invite'
        }
      },
      {
        $unwind: '$revenues_invite'
      },
      {
        $lookup: {
          from: 'userUpgrades',
          localField: 'revenues_invite.user_upgrade_id',
          foreignField: 'user_id',
          as: 'upgrade'
        }
      },
      {
        $unwind: '$upgrade'
      },
      {
        $lookup: {
          from: 'upgradePackages', // Collection chứa thông tin gói
          localField: 'upgrade.package_id',
          foreignField: '_id',
          as: 'package_info'
        }
      },
      {
        $unwind: '$package_info'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'upgrade.user_id',
          foreignField: '_id',
          as: 'seller_info'
        }
      },
      {
        $unwind: '$seller_info'
      },
      {
        $match: {
          'revenues_invite.created_at': {
            $gte: regexStart,
            $lte: regexEnd
          },
          'upgrade.status': {
            $ne: StatusUpgrade.Pending
          }
        }
      },
      {
        $group: {
          _id: '$_id', // Dùng _id của TotalRevenues làm key group
          totalMoney: { $sum: '$revenues_invite.money' },
          upgrade: {
            $push: {
              $mergeObjects: [
                '$upgrade',
                {
                  seller_info: { name: '$seller_info.name', phone: '$seller_info.phone' },
                  package_info: {
                    name: '$package_info.name',
                    price: '$package_info.price',
                    duration_in_months: '$package_info.duration_in_months',
                    benefits: '$package_info.benefits',
                    referral_commissions: '$package_info.referral_commissions'
                  }
                }
              ]
            }
          }
        }
      }
    ]

    const result = await databaseService.totalRevenues.aggregate(aggregatePipeline).toArray()

    return result[0]
  }

  async countCustomerSellerPurchase(user_id: string) {
    const [countCus, countSeller, countPurchase] = await Promise.all([
      databaseService.customers.countDocuments({ seller_id: new ObjectId(user_id) }),
      databaseService.users.countDocuments({ referrer_id: user_id }),
      databaseService.purchases.countDocuments({
        seller_id: new ObjectId(user_id),
        status: StatusPurchase.DELIVERED
      })
    ])

    return { count_customer: countCus, count_my_seller: countSeller, count_purchase: countPurchase }
  }

  async newsFeed({ limit, page, date }: { limit: number; page: number; date?: 'latest' | 'oldest' }) {
    const sortDate = date === 'latest' ? -1 : 1

    const result = await databaseService.purchases
      .aggregate([
        {
          $match: {
            status: {
              $nin: [StatusPurchase.CANCELLED, StatusPurchase.IN_CART]
            }
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
            purchase_total_price: 1,
            created_at: 1,
            'seller_info.name': 1,
            'seller_info.avatar': 1
          }
        },
        {
          $sort: { created_at: sortDate }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await databaseService.purchases.countDocuments({
      status: {
        $nin: [StatusPurchase.CANCELLED, StatusPurchase.IN_CART]
      }
    })
    return { result, total }
  }
}

const statisticService = new StatisticService()
export default statisticService
