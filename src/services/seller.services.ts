/* eslint-disable prefer-const */
import Customer from '~/models/schemas/Customer.schema'
import { ObjectId } from 'mongodb'
import { CustomerReqBody, UpdateCustomerReqBody } from '~/models/requests/Seller.request'
import { ROLE, StatusCustomer, StatusUpgrade, UserVerifyStatus } from '~/constants/enum'
import databaseService from '~/services/database.services'
import UpgradePackage, { UpgradePackageType } from '~/models/schemas/UpgradePackage.schema'
import UserUpgrade, { UserUpgradeType } from '~/models/schemas/UserUpgrade.schema'
import RevenuesInvite, { RevenuesInviteType } from '~/models/schemas/RevenueInvite.schema'
import TotalRevenues, { TotalRevenuesType } from '~/models/schemas/TotalRevenues.schema'

class SellerService {
  async createCustomer(user_id: string, payload: CustomerReqBody) {
    const customer = await databaseService.customers.insertOne(
      new Customer({
        seller_id: new ObjectId(user_id),
        name: payload.name,
        address: payload.address,
        phone: payload.phone,
        status: StatusCustomer.NotLinked
      })
    )
    const data = await databaseService.customers.findOne(
      { _id: new ObjectId(customer.insertedId) },
      {
        projection: {
          password: 0
        }
      }
    )
    return data
  }

  async getCustomers(user_id: string) {
    const customers = await databaseService.customers
      .find({ seller_id: new ObjectId(user_id) }, { projection: { password: 0 } })
      .toArray()
    return customers
  }

  async getCustomer(customer_id: string, user_id: string) {
    const customer = await databaseService.customers.findOne(
      { _id: new ObjectId(customer_id), seller_id: new ObjectId(user_id) },
      { projection: { password: 0 } }
    )
    return customer
  }

  async updateCustomer(customer_id: string, payload: UpdateCustomerReqBody) {
    const customer = await databaseService.customers.findOneAndUpdate(
      { _id: new ObjectId(customer_id) },
      {
        $set: { ...payload },
        $currentDate: {
          updated_at: true
        }
      },
      {
        projection: { password: 0 },
        upsert: true,
        returnDocument: 'after'
      }
    )
    return customer
  }

  async deleteCustomer(customer_id: string) {
    const customer = await databaseService.customers.findOneAndDelete({ _id: new ObjectId(customer_id) })
    return customer
  }

  async getSellers() {
    const sellers = await databaseService.users
      .find({ roles: { $ne: ROLE.ADMIN } }, { projection: { password: 0 } })
      .toArray()
    return sellers
  }

  async getSeller(seller_id: string) {
    const seller = await databaseService.users.findOne(
      { _id: new ObjectId(seller_id), roles: { $ne: ROLE.ADMIN } },
      { projection: { password: 0 } }
    )
    return seller
  }

  async verifySeller(seller_id: string, verify: number) {
    const seller = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(seller_id) },
      {
        $set: { verify },
        $currentDate: {
          updated_at: true
        }
      },
      { projection: { password: 0 }, returnDocument: 'after' }
    )

    return seller
  }

  async banSeller(seller_id: string) {
    const seller = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(seller_id) },
      {
        $set: { verify: UserVerifyStatus.Banned },
        $currentDate: {
          updated_at: true
        }
      },
      { projection: { password: 0 }, returnDocument: 'after' }
    )
    return seller
  }

  async unbanSeller(seller_id: string) {
    const seller = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(seller_id) },
      {
        $set: { verify: UserVerifyStatus.Verified },
        $currentDate: {
          updated_at: true
        }
      },
      { projection: { password: 0 }, returnDocument: 'after' }
    )
    return seller
  }

  async getBannedSellers() {
    const sellers = await databaseService.users
      .find({ verify: UserVerifyStatus.Banned, roles: { $ne: ROLE.ADMIN } }, { projection: { password: 0 } })
      .toArray()
    return sellers
  }

  async getVerifiedSellers() {
    const sellers = await databaseService.users
      .find({ verify: UserVerifyStatus.Verified, roles: { $ne: ROLE.ADMIN } }, { projection: { password: 0 } })
      .toArray()
    return sellers
  }

  async getUnverifiedSellers() {
    const sellers = await databaseService.users
      .find({ verify: UserVerifyStatus.Unverified, roles: { $ne: ROLE.ADMIN } }, { projection: { password: 0 } })
      .toArray()
    return sellers
  }

  async getStatusSeller(verify: number) {
    const sellers = await databaseService.users
      .find({ verify: verify, roles: { $ne: ROLE.ADMIN, $eq: ROLE.SELLER } }, { projection: { password: 0 } })
      .toArray()
    return sellers
  }

  async getCustomerOfSeller(seller_id: string) {
    const customer = await databaseService.customers
      .find({ seller_id: new ObjectId(seller_id) }, { projection: { password: 0 } })
      .toArray()
    const totalCustomer = await databaseService.customers.countDocuments({ seller_id: new ObjectId(seller_id) })
    return { customer, totalCustomer }
  }

  async getSellerByRef(seller_id: string) {
    const customer = await databaseService.users
      .find({ referrer_id: seller_id }, { projection: { password: 0 } })
      .toArray()
    return customer
  }

  async createUpgradePackage(payload: UpgradePackageType) {
    const upgradePackage = await databaseService.upgradePackages.insertOne(
      new UpgradePackage({
        ...payload,
        created_at: new Date(),
        updated_at: new Date()
      })
    )
    const result = await databaseService.upgradePackages.findOne({ _id: new ObjectId(upgradePackage.insertedId) })
    return result
  }

  async upgradeSeller(user_id: string, package_id: string) {
    const seller = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!seller) {
      throw new Error('Seller not found')
    }

    const upgradePackage = await databaseService.upgradePackages.findOne({ _id: new ObjectId(package_id) })
    if (!upgradePackage) {
      throw new Error('Upgrade package not found')
    }

    const currentDate = new Date()

    const existingActiveUpgrade = await databaseService.userUpgrades.findOne({
      package_id: new ObjectId(package_id),
      user_id: seller._id,
      status: StatusUpgrade.Accept,
      in_use: true,
      expiry_date: { $gt: currentDate }
    })

    if (existingActiveUpgrade) {
      throw new Error('User already has an active upgrade package that has not expired')
    }

    const existingPendingUpgrade = await databaseService.userUpgrades.findOne({
      user_id: seller._id,
      package_id: upgradePackage._id,
      status: StatusUpgrade.Pending
    })

    if (existingPendingUpgrade) {
      throw new Error('User already has a pending upgrade for this package')
    }

    const today = new Date()
    const year = today.getFullYear().toString().slice(-2)
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + today.getDate()).slice(-2)

    const dateStr = `${year}${month}${day}`

    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const count = await databaseService.userUpgrades.countDocuments({
      created_at: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    })

    const orderNumber = ('0000' + (count + 1)).slice(-5)
    const userUpgradeCode = `NC${dateStr}${orderNumber}`

    const userUpgrade = {
      user_id: seller._id,
      package_id: upgradePackage._id,
      admin_handle_id: undefined,
      code_upgrade: userUpgradeCode,
      status: StatusUpgrade.Pending,
      upgrade_count: 0,
      in_use: false,
      created_at: currentDate, // Đảm bảo thêm trường created_at
      updated_at: currentDate,
      is_sent_payment: false,
      expiry_date: undefined
    }

    const { insertedId } = await databaseService.userUpgrades.insertOne(userUpgrade)

    return { _id: insertedId, ...userUpgrade }
  }

  // async acceptPendingUpgrade(user_id: string, upgrade_id: string) {
  //   const accountAdmin = await databaseService.users.findOne({ _id: new ObjectId(user_id), roles: ROLE.ADMIN })
  //   if (!accountAdmin) {
  //     throw new Error('Bạn không có quyền thay đổi trạng thái nâng cấp')
  //   }
  //   const pendingUpgrade = await databaseService.userUpgrades.findOne({
  //     _id: new ObjectId(upgrade_id),
  //     status: StatusUpgrade.Pending
  //   })
  //   if (!pendingUpgrade) {
  //     throw new Error('Pending upgrade not found or already accepted')
  //   }

  //   const upgradePackage = await databaseService.upgradePackages.findOne({ _id: pendingUpgrade.package_id })
  //   if (!upgradePackage) {
  //     throw new Error('Upgrade package not found')
  //   }

  //   const currentDate = new Date()

  //   // Tìm gói nâng cấp hiện tại của người dùng
  //   const existingUpgrade = await databaseService.userUpgrades.findOne(
  //     {
  //       user_id: pendingUpgrade.user_id,
  //       status: StatusUpgrade.Accept,
  //       in_use: true
  //     },
  //     {
  //       sort: { expiry_date: -1 }
  //     }
  //   )

  //   // eslint-disable-next-line prefer-const
  //   let newExpiryDate = new Date(currentDate)

  //   newExpiryDate.setMonth(newExpiryDate.getMonth() + upgradePackage.duration_in_months)

  //   // Đặt thời gian của expiry_date về 23:59:59.999
  //   newExpiryDate.setHours(23, 59, 59, 999)

  //   // Tăng số lần nâng cấp
  //   const newUpgradeCount = (existingUpgrade?.upgrade_count || 0) + 1

  //   // Nếu có gói nâng cấp hiện tại, đặt in_use thành false
  //   if (existingUpgrade) {
  //     await databaseService.userUpgrades.updateOne(
  //       { _id: existingUpgrade._id },
  //       { $set: { admin_handle_id: accountAdmin._id, in_use: false, status: StatusUpgrade.Cancel } }
  //     )
  //   }

  //   // Cập nhật gói nâng cấp mới với trạng thái 'Accept', thời gian hết hạn mới, số lần nâng cấp và in_use thành true
  //   await databaseService.userUpgrades.updateOne(
  //     { _id: new ObjectId(upgrade_id) },
  //     {
  //       $set: {
  //         admin_handle_id: accountAdmin._id,
  //         status: StatusUpgrade.Accept,
  //         expiry_date: newExpiryDate,
  //         upgrade_count: newUpgradeCount,
  //         in_use: true
  //       }
  //     }
  //   )

  //   const updatedUpgrade = await databaseService.userUpgrades.findOne({ _id: new ObjectId(upgrade_id) })
  //   if (!updatedUpgrade) {
  //     throw new Error('Updated upgrade not found')
  //   }

  //   const user = await databaseService.users.findOne({ _id: new ObjectId(pendingUpgrade.user_id) })
  //   if (!user) {
  //     throw new Error('User not found')
  //   }

  //   if (user.referrer_id) {
  //     // Tìm người giới thiệu và cộng tiền cho họ
  //     const referrer = await databaseService.users.findOne({ _id: new ObjectId(user.referrer_id) })
  //     if (referrer) {
  //       const revenueInvite: RevenuesInviteType = {
  //         user_id: referrer._id,
  //         user_upgrade_id: user._id,
  //         upgrade_package_id: upgradePackage._id,
  //         money: upgradePackage.price * (upgradePackage.referral_commissions / 100),
  //         created_at: new Date()
  //       }
  //       const revenueInviteResult = await databaseService.revenuesInvite.insertOne(new RevenuesInvite(revenueInvite))

  //       // Tạo phiếu tính tiền cho người giới thiệu
  //       const sellerTotalRevenue = await databaseService.totalRevenues.findOne({ user_id: referrer._id })
  //       if (sellerTotalRevenue) {
  //         await databaseService.totalRevenues.updateOne(
  //           { user_id: referrer._id },
  //           {
  //             $inc: {
  //               money: revenueInvite.money
  //             },
  //             $set: { updated_at: new Date() },
  //             $push: { revenue_invite_id: revenueInviteResult.insertedId }
  //           }
  //         )
  //       } else {
  //         const newSellerTotalRevenue: TotalRevenuesType = {
  //           user_id: referrer._id,
  //           roles: referrer.roles, // Sử dụng roles của seller
  //           revenue_invite_id: [revenueInviteResult.insertedId], // Initialize as an array
  //           rank: '', // Assuming rank needs to be calculated and set elsewhere
  //           money: upgradePackage.price * (upgradePackage.referral_commissions / 100),
  //           created_at: new Date(),
  //           updated_at: new Date()
  //         }
  //         await databaseService.totalRevenues.insertOne(new TotalRevenues(newSellerTotalRevenue))
  //       }

  //       // Tính số tiền mà admin nhận được sau khi chia cho người giới thiệu

  //       const accountAdminRevenues: RevenuesInviteType = {
  //         user_id: accountAdmin._id,
  //         user_upgrade_id: user._id,
  //         upgrade_package_id: upgradePackage._id,
  //         money: upgradePackage.price * (1 - upgradePackage.referral_commissions / 100),
  //         created_at: new Date()
  //       }
  //       const accountAdminRevenueResult = await databaseService.revenuesInvite.insertOne(
  //         new RevenuesInvite(accountAdminRevenues)
  //       )

  //       // Cập nhật tổng doanh thu cho tài khoản admin cố định trong bảng TotalRevenues
  //       const accountAdminTotalRevenue = await databaseService.totalRevenues.findOne({ user_id: accountAdmin._id })
  //       if (accountAdminTotalRevenue) {
  //         if (!Array.isArray(accountAdminTotalRevenue.revenue_invite_id)) {
  //           accountAdminTotalRevenue.revenue_invite_id = []
  //         }
  //         await databaseService.totalRevenues.updateOne(
  //           { user_id: accountAdmin._id },
  //           {
  //             $inc: {
  //               money: upgradePackage.price * (1 - upgradePackage.referral_commissions / 100) // Cộng thêm số tiền của đơn hàng
  //             },
  //             $set: { updated_at: new Date() },
  //             $push: { revenue_invite_id: accountAdminRevenueResult.insertedId }
  //           }
  //         )
  //       } else {
  //         const newFixedAdminTotalRevenue: TotalRevenuesType = {
  //           user_id: accountAdmin._id,
  //           roles: 0,
  //           revenue_invite_id: [accountAdminRevenueResult.insertedId], // Initialize as an array
  //           rank: '', // Assuming rank needs to be calculated and set elsewhere
  //           money: upgradePackage.price * (1 - upgradePackage.referral_commissions / 100),
  //           created_at: new Date(),
  //           updated_at: new Date()
  //         }
  //         await databaseService.totalRevenues.insertOne(new TotalRevenues(newFixedAdminTotalRevenue))
  //       }
  //     }
  //   } else {
  //     const accountAdminRevenues: RevenuesInviteType = {
  //       user_id: accountAdmin._id,
  //       user_upgrade_id: user._id,
  //       upgrade_package_id: upgradePackage._id,
  //       money: upgradePackage.price,
  //       created_at: new Date()
  //     }
  //     const accountAdminRevenueResult = await databaseService.revenuesInvite.insertOne(
  //       new RevenuesInvite(accountAdminRevenues)
  //     )

  //     // Cập nhật tổng doanh thu cho tài khoản admin cố định trong bảng TotalRevenues
  //     const accountAdminTotalRevenue = await databaseService.totalRevenues.findOne({ user_id: accountAdmin._id })
  //     if (accountAdminTotalRevenue) {
  //       if (!Array.isArray(accountAdminTotalRevenue.revenue_invite_id)) {
  //         accountAdminTotalRevenue.revenue_invite_id = []
  //       }
  //       await databaseService.totalRevenues.updateOne(
  //         { user_id: accountAdmin._id },
  //         {
  //           $inc: {
  //             money: upgradePackage.price
  //           },
  //           $set: { updated_at: new Date() },
  //           $push: { revenue_invite_id: accountAdminRevenueResult.insertedId }
  //         }
  //       )
  //     } else {
  //       const newFixedAdminTotalRevenue: TotalRevenuesType = {
  //         user_id: accountAdmin._id,
  //         roles: 0,
  //         revenue_invite_id: [accountAdminRevenueResult.insertedId], // Initialize as an array
  //         rank: '', // Assuming rank needs to be calculated and set elsewhere
  //         money: upgradePackage.price * (1 - upgradePackage.referral_commissions / 100),
  //         created_at: new Date(),
  //         updated_at: new Date()
  //       }
  //       await databaseService.totalRevenues.insertOne(new TotalRevenues(newFixedAdminTotalRevenue))
  //     }
  //   }

  //   // Tạo phiếu tính tổng tiền cho người admin
  //   const fixedAdminId = new ObjectId('669671928edf75216c0f6e17') // Thay thế bằng ID admin cố định
  //   const fixedAdminRevenue: RevenuesInviteType = {
  //     user_id: fixedAdminId,
  //     user_upgrade_id: user._id,
  //     upgrade_package_id: upgradePackage._id,
  //     money: upgradePackage.price,
  //     created_at: new Date()
  //   }
  //   const fixedAdminRevenueResult = await databaseService.revenuesInvite.insertOne(
  //     new RevenuesInvite(fixedAdminRevenue)
  //   )

  //   // Cập nhật tổng doanh thu cho tài khoản admin cố định trong bảng TotalRevenues
  //   const fixedAdminTotalRevenue = await databaseService.totalRevenues.findOne({ user_id: fixedAdminId })
  //   if (fixedAdminTotalRevenue) {
  //     if (!Array.isArray(fixedAdminTotalRevenue.revenue_invite_id)) {
  //       fixedAdminTotalRevenue.revenue_invite_id = []
  //     }
  //     await databaseService.totalRevenues.updateOne(
  //       { user_id: fixedAdminId },
  //       {
  //         $inc: {
  //           money: upgradePackage.price // Cộng thêm số tiền của đơn hàng
  //         },
  //         $set: { updated_at: new Date() },
  //         $push: { revenue_invite_id: fixedAdminRevenueResult.insertedId }
  //       }
  //     )
  //   } else {
  //     const newFixedAdminTotalRevenue: TotalRevenuesType = {
  //       user_id: fixedAdminId,
  //       roles: 0,
  //       revenue_invite_id: [fixedAdminRevenueResult.insertedId], // Initialize as an array
  //       rank: '', // Assuming rank needs to be calculated and set elsewhere
  //       money: upgradePackage.price,
  //       created_at: new Date(),
  //       updated_at: new Date()
  //     }
  //     await databaseService.totalRevenues.insertOne(new TotalRevenues(newFixedAdminTotalRevenue))
  //   }

  //   return updatedUpgrade
  // }

  async acceptPendingUpgrade(user_id: string, upgrade_id: string) {
    // Kiểm tra xem yêu cầu có đến từ admin không
    const accountAdmin = await databaseService.users.findOne({ _id: new ObjectId(user_id), roles: ROLE.ADMIN })
    if (!accountAdmin) {
      throw new Error('Bạn không có quyền thay đổi trạng thái nâng cấp')
    }

    // Tìm yêu cầu nâng cấp đang chờ xử lý
    const pendingUpgrade = await databaseService.userUpgrades.findOne({
      _id: new ObjectId(upgrade_id),
      status: StatusUpgrade.Pending
    })
    if (!pendingUpgrade) {
      throw new Error('Pending upgrade not found or already accepted')
    }

    // Tìm chi tiết gói nâng cấp
    const upgradePackage = await databaseService.upgradePackages.findOne({ _id: pendingUpgrade.package_id })
    if (!upgradePackage) {
      throw new Error('Upgrade package not found')
    }

    const currentDate = new Date()

    // Tìm nâng cấp hiện tại của người dùng (nếu có)
    const existingUpgrade = await databaseService.userUpgrades.findOne(
      {
        user_id: pendingUpgrade.user_id,
        status: StatusUpgrade.Accept,
        in_use: true
      },
      {
        sort: { expiry_date: -1 }
      }
    )

    // Tính toán ngày hết hạn mới cho nâng cấp
    let newExpiryDate = new Date(currentDate)
    newExpiryDate.setMonth(newExpiryDate.getMonth() + upgradePackage.duration_in_months)
    newExpiryDate.setHours(23, 59, 59, 999)

    const newUpgradeCount = (existingUpgrade?.upgrade_count || 0) + 1

    // Đánh dấu nâng cấp hiện tại là không còn sử dụng nếu có
    if (existingUpgrade) {
      await databaseService.userUpgrades.updateOne(
        { _id: existingUpgrade._id },
        { $set: { admin_handle_id: accountAdmin._id, in_use: false, status: StatusUpgrade.Cancel } }
      )
    }

    // Tìm người dùng để lấy referrer nếu có
    const user = await databaseService.users.findOne({ _id: pendingUpgrade.user_id })
    if (!user) {
      throw new Error('User not found')
    }

    // Khởi tạo thông tin phân bổ doanh thu
    let referrer = null
    let referrerMoney = 0
    let adminMoney = upgradePackage.price
    const revenueDistribution: {
      referrer_id?: ObjectId
      referrer_amount?: number
      admin_amount: number
    } = { referrer_id: undefined, referrer_amount: undefined, admin_amount: adminMoney }

    // Tính toán doanh thu cho referrer và admin nếu có referrer
    if (user.referrer_id) {
      referrer = await databaseService.users.findOne({ _id: new ObjectId(user.referrer_id) })
      if (referrer) {
        referrerMoney = upgradePackage.price * (upgradePackage.referral_commissions / 100)
        adminMoney = upgradePackage.price - referrerMoney
        revenueDistribution.referrer_id = referrer._id
        revenueDistribution.referrer_amount = referrerMoney
        revenueDistribution.admin_amount = adminMoney

        // Lưu doanh thu của referrer
        const revenueInvite: RevenuesInviteType = {
          user_id: referrer._id,
          user_upgrade_id: user._id, // Sử dụng ID của người dùng thay vì ID của bản ghi nâng cấp
          upgrade_package_id: upgradePackage._id,
          money: referrerMoney,
          created_at: new Date()
        }
        const revenueInviteResult = await databaseService.revenuesInvite.insertOne(new RevenuesInvite(revenueInvite))

        const referrerTotalRevenue = await databaseService.totalRevenues.findOne({ user_id: referrer._id })
        if (referrerTotalRevenue) {
          await databaseService.totalRevenues.updateOne(
            { user_id: referrer._id },
            {
              $inc: { money: referrerMoney },
              $set: { updated_at: new Date() },
              $push: { revenue_invite_id: revenueInviteResult.insertedId }
            }
          )
        } else {
          const newReferrerTotalRevenue: TotalRevenuesType = {
            user_id: referrer._id,
            roles: referrer.roles,
            revenue_invite_id: [revenueInviteResult.insertedId],
            rank: '',
            money: referrerMoney,
            created_at: new Date(),
            updated_at: new Date()
          }
          await databaseService.totalRevenues.insertOne(new TotalRevenues(newReferrerTotalRevenue))
        }
      }
    }

    // Lưu doanh thu của admin
    const adminRevenue: RevenuesInviteType = {
      user_id: accountAdmin._id,
      user_upgrade_id: user._id, // Sử dụng ID của người dùng thay vì ID của bản ghi nâng cấp
      upgrade_package_id: upgradePackage._id,
      money: adminMoney,
      created_at: new Date()
    }
    const adminRevenueResult = await databaseService.revenuesInvite.insertOne(new RevenuesInvite(adminRevenue))

    const adminTotalRevenue = await databaseService.totalRevenues.findOne({ user_id: accountAdmin._id })
    if (adminTotalRevenue) {
      await databaseService.totalRevenues.updateOne(
        { user_id: accountAdmin._id },
        {
          $inc: { money: adminMoney },
          $set: { updated_at: new Date() },
          $push: { revenue_invite_id: adminRevenueResult.insertedId }
        }
      )
    } else {
      const newAdminTotalRevenue: TotalRevenuesType = {
        user_id: accountAdmin._id,
        roles: 0,
        revenue_invite_id: [adminRevenueResult.insertedId],
        rank: '',
        money: adminMoney,
        created_at: new Date(),
        updated_at: new Date()
      }
      await databaseService.totalRevenues.insertOne(new TotalRevenues(newAdminTotalRevenue))
    }

    const fixedAdminId = new ObjectId('669671928edf75216c0f6e17') // Thay thế bằng ID admin cố định
    const fixedAdminRevenue: RevenuesInviteType = {
      user_id: fixedAdminId,
      user_upgrade_id: user._id, // Sử dụng ID của người dùng thay vì ID của bản ghi nâng cấp
      upgrade_package_id: upgradePackage._id,
      money: upgradePackage.price,
      created_at: new Date()
    }
    const fixedAdminRevenueResult = await databaseService.revenuesInvite.insertOne(
      new RevenuesInvite(fixedAdminRevenue)
    )

    // Cập nhật tổng doanh thu cho tài khoản admin cố định trong bảng TotalRevenues
    const fixedAdminTotalRevenue = await databaseService.totalRevenues.findOne({ user_id: fixedAdminId })
    if (fixedAdminTotalRevenue) {
      if (!Array.isArray(fixedAdminTotalRevenue.revenue_invite_id)) {
        fixedAdminTotalRevenue.revenue_invite_id = []
      }
      await databaseService.totalRevenues.updateOne(
        { user_id: fixedAdminId },
        {
          $inc: {
            money: upgradePackage.price // Cộng thêm số tiền của đơn hàng
          },
          $set: { updated_at: new Date() },
          $push: { revenue_invite_id: fixedAdminRevenueResult.insertedId }
        }
      )
    } else {
      const newFixedAdminTotalRevenue: TotalRevenuesType = {
        user_id: fixedAdminId,
        roles: 0,
        revenue_invite_id: [fixedAdminRevenueResult.insertedId],
        rank: '',
        money: upgradePackage.price,
        created_at: new Date(),
        updated_at: new Date()
      }
      await databaseService.totalRevenues.insertOne(new TotalRevenues(newFixedAdminTotalRevenue))
    }

    // Cập nhật yêu cầu nâng cấp sang trạng thái đã chấp nhận
    await databaseService.userUpgrades.updateOne(
      { _id: new ObjectId(upgrade_id) },
      {
        $set: {
          admin_handle_id: accountAdmin._id,
          status: StatusUpgrade.Accept,
          expiry_date: newExpiryDate,
          upgrade_count: newUpgradeCount,
          in_use: true,
          revenue_distribution: revenueDistribution
        }
      }
    )

    // Trả về nâng cấp đã được cập nhật
    const updatedUpgrade = await databaseService.userUpgrades.findOne({ _id: new ObjectId(upgrade_id) })
    if (!updatedUpgrade) {
      throw new Error('Updated upgrade not found')
    }

    return updatedUpgrade
  }

  async checkUpgradeStatus(user_id: string) {
    const currentUpgrade = await databaseService.userUpgrades.findOne({
      user_id: new ObjectId(user_id),
      status: StatusUpgrade.Accept,
      in_use: true
    })

    if (!currentUpgrade) {
      throw new Error('No active upgrade found for this user')
    }

    const currentDate = new Date()

    if (!currentUpgrade.expiry_date || !(currentUpgrade.expiry_date instanceof Date)) {
      throw new Error('The expiry date of the current upgrade is invalid')
    }

    if (currentUpgrade.expiry_date < currentDate) {
      throw new Error('The current upgrade has expired')
    }

    const timeDiff = currentUpgrade.expiry_date.getTime() - currentDate.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return {
      message: 'The current upgrade is valid',
      user_id,
      expiry_date: currentUpgrade.expiry_date,
      days_remaining: daysRemaining
    }
  }

  async adminGetAllUpgradePending({
    limit,
    page,
    sort,
    status,
    date
  }: {
    limit: number
    page: number
    sort: 'asc' | 'desc'
    status?: number
    date?: 'latest' | 'oldest'
  }) {
    const sortOrder = sort === 'asc' ? 1 : -1
    const dateOrder = date === 'oldest' ? 1 : -1

    // Tạo điều kiện lọc cho status, nếu status không có giá trị thì bỏ qua lọc
    const matchCondition: any = {}
    const pipeline: any[] = []

    if (status !== undefined) {
      matchCondition.status = status
    }
    const sortCondition =
      status === undefined ? { status: sortOrder, created_at: dateOrder } : { created_at: dateOrder }

    pipeline.push(
      {
        $match: matchCondition
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'seller_info'
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
        $lookup: {
          from: 'upgradePackages',
          localField: 'package_id',
          foreignField: '_id',
          as: 'package_info'
        }
      },
      {
        $unwind: {
          path: '$package_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          package_info: {
            referral_commissions: 0,
            created_at: 0,
            updated_at: 0
          }
        }
      },
      {
        $sort: sortCondition
      },
      {
        $skip: limit * (page - 1)
      },
      {
        $limit: limit
      }
    )

    const result = await databaseService.userUpgrades.aggregate(pipeline).toArray()

    const total = await databaseService.userUpgrades.countDocuments(status !== undefined ? { status } : {})

    return {
      result,
      total
    }
  }

  async getAllProvider() {
    const result = await databaseService.users
      .aggregate([
        {
          $match: {
            roles: { $eq: ROLE.PROVIDER }
          }
        },
        {
          $project: {
            name: 1,
            avatar: 1
          }
        }
      ])
      .toArray()
    return result
  }

  async getProvider(provider_id: string) {
    const result = await databaseService.users
      .aggregate([
        {
          $match: {
            _id: new ObjectId(provider_id),
            roles: { $eq: ROLE.PROVIDER }
          }
        },
        {
          $project: {
            name: 1,
            avatar: 1
          }
        }
      ])
      .toArray()
    return result[0]
  }

  async getAllPackage() {
    const result = await databaseService.upgradePackages.find({}).toArray()
    return result
  }

  async getUpgrade(user_id: string, upgrade_id: string) {
    if (!ObjectId.isValid(user_id)) {
      throw new Error('Invalid user_id')
    }
    if (!ObjectId.isValid(upgrade_id)) {
      throw new Error('Invalid upgrade_id')
    }

    // Tạo ObjectId từ các chuỗi đầu vào
    const sellerObjectId = new ObjectId(user_id)
    const upgradeObjectId = new ObjectId(upgrade_id)

    // Tìm kiếm đơn hàng
    const upgrade = await databaseService.userUpgrades.findOne({
      user_id: sellerObjectId,
      _id: upgradeObjectId
    })

    // Kiểm tra xem đơn hàng có tồn tại không
    if (!upgrade) {
      throw new Error('Upgrade not found')
    }

    return upgrade
  }

  async adminGetUpgrade(upgrade_id: string) {
    if (!ObjectId.isValid(upgrade_id)) {
      throw new Error('Invalid upgrade_id')
    }

    const upgrade = await databaseService.userUpgrades
      .aggregate([
        {
          $match: {
            _id: new ObjectId(upgrade_id)
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'seller_info'
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
          $lookup: {
            from: 'upgradePackages',
            localField: 'package_id',
            foreignField: '_id',
            as: 'package_info'
          }
        },
        {
          $unwind: {
            path: '$package_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            package_info: {
              referral_commissions: 0,
              created_at: 0,
              updated_at: 0
            }
          }
        }
      ])
      .toArray()

    // Kiểm tra xem đơn hàng có tồn tại không
    if (!upgrade) {
      throw new Error('Upgrade not found')
    }

    return upgrade
  }

  async getAllUpgrade(user_id: string) {
    if (!ObjectId.isValid(user_id)) {
      throw new Error('Invalid user_id')
    }

    // Tạo ObjectId từ các chuỗi đầu vào
    const sellerObjectId = new ObjectId(user_id)

    // Tìm kiếm đơn hàng
    const upgrade = await databaseService.userUpgrades
      .aggregate([
        {
          $match: {
            user_id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'seller_info'
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
          $lookup: {
            from: 'upgradePackages',
            localField: 'package_id',
            foreignField: '_id',
            as: 'package_info'
          }
        },
        {
          $unwind: {
            path: '$package_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            package_info: {
              referral_commissions: 0,
              created_at: 0,
              updated_at: 0
            }
          }
        }
      ])
      .toArray()

    // Kiểm tra xem đơn hàng có tồn tại không
    if (!upgrade) {
      throw new Error('Upgrade not found')
    }

    return upgrade
  }
}

export const sellerService = new SellerService()
