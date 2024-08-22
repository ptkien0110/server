import { ObjectId } from 'mongodb'
import { ROLE, TokenType, UserVerifyStatus } from '~/constants/enum'
import { USERS_MESSAGES } from '~/constants/messages'
import { BankInfoReqBody, CreateAccountReqBody, RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.request'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { v2 as cloudinary } from 'cloudinary'

class AuthService {
  private signAccessToken({ user_id, verify, roles }: { user_id: string; verify: UserVerifyStatus; roles: ROLE }) {
    return signToken({
      payload: {
        user_id,
        roles,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  private signRefreshToken({
    user_id,
    verify,
    exp,
    roles
  }: {
    user_id: string
    verify: UserVerifyStatus
    exp?: number
    roles: ROLE
  }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          roles,
          token_type: TokenType.RefreshToken,
          verify,
          exp
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify,
        roles
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  private signAccessTokenAndRefreshToken({
    user_id,
    verify,
    roles
  }: {
    user_id: string
    verify: UserVerifyStatus
    roles: ROLE
  }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify, roles }),
      this.signRefreshToken({ user_id, verify, roles })
    ])
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({
      email
    })
    return Boolean(user)
  }

  async register(payload: RegisterReqBody) {
    const user = await databaseService.users.insertOne(
      new User({
        ...payload,
        password: hashPassword(payload.password),
        roles: ROLE.SELLER,
        verify: UserVerifyStatus.Verified
      })
    )
    const result = await databaseService.users.findOne({ _id: new ObjectId(user.insertedId) })
    return result
  }

  async registerProvider(payload: RegisterReqBody) {
    const user = await databaseService.users.insertOne(
      new User({
        ...payload,
        password: hashPassword(payload.password),
        roles: ROLE.PROVIDER,
        verify: UserVerifyStatus.Unverified
      })
    )
    const result = await databaseService.users.findOne({ _id: new ObjectId(user.insertedId) })
    return result
  }

  async registry(ref: string, payload: RegisterReqBody) {
    const seller = await databaseService.users.findOne({ _id: new ObjectId(ref) })
    if (!seller) {
      throw Error('Seller not found')
    }

    const sellerId = seller._id
    const user = await databaseService.users.insertOne(
      new User({
        ...payload,
        referrer_id: String(sellerId),
        password: hashPassword(payload.password),
        roles: ROLE.SELLER,
        verify: UserVerifyStatus.Verified
      })
    )
    const result = await databaseService.users.findOne(
      { _id: new ObjectId(user.insertedId) },
      { projection: { password: 0 } }
    )
    return result
  }

  async login({ user_id, roles, verify }: { user_id: string; roles: ROLE; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id,
      roles,
      verify
    })

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )

    return {
      access_token,
      refresh_token
    }
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    roles,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    roles: ROLE
    exp: number
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify, roles }),
      this.signRefreshToken({ user_id, verify, exp, roles }),
      databaseService.refreshTokens.deleteOne({ token: refresh_token })
    ])
    const decoded_refresh_token = await this.decodeRefreshToken(new_refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token,
        iat: decoded_refresh_token.iat,
        exp: decoded_refresh_token.exp
      })
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async checkSeller(identifier: string) {
    const isPhoneNumber = /^\d+$/.test(identifier) // Kiểm tra xem identifier có phải là số
    const query = isPhoneNumber ? { phone: identifier } : { email: identifier }
    const seller = await databaseService.users.findOne(query)
    if (!seller) {
      throw Error('Phone not found')
    }
    if (seller.roles !== ROLE.SELLER) {
      throw Error('Account not seller')
    }
    return seller._id
  }

  async createAccount(payload: CreateAccountReqBody) {
    const user = await databaseService.users.insertOne(
      new User({
        ...payload,
        password: hashPassword(payload.password),
        roles: payload.roles ? payload.roles : ROLE.SELLER,
        verify: UserVerifyStatus.Verified
      })
    )
    const result = await databaseService.users.findOne({ _id: new ObjectId(user.insertedId) })
    return result
  }

  async updateRoleAccount(user_id: string, roles: number) {
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          roles
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return user
  }

  async getAccountByRole({
    page,
    limit,
    roles,
    date,
    sort
  }: {
    page: number
    limit: number
    roles: number
    sort: 'asc' | 'desc'
    date: 'latest' | 'oldest'
  }) {
    const sortOrder = sort === 'asc' ? 1 : -1
    const dateOrder = date === 'oldest' ? 1 : -1

    const matchCondition: any = {
      roles: roles
    }

    const sortCondition = { verify: sortOrder, created_at: dateOrder }

    // const result = await databaseService.users
    //   .find({ roles }, { projection: { password: 0 } })
    //   .sort(sortCondition)
    //   .skip(limit * (page - 1))
    //   .limit(limit)
    //   .toArray()

    const result = await databaseService.users
      .aggregate([
        {
          $match: matchCondition
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
      ])
      .toArray()
    const total = await databaseService.users.countDocuments({ roles })
    return { result, total }
  }

  async getAllAccount({ limit, page }: { limit: number; page: number }) {
    const result = await databaseService.users
      .aggregate([
        {
          $match: {
            roles: { $ne: ROLE.ADMIN }
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const total = await databaseService.users.countDocuments({ roles: { $ne: ROLE.ADMIN } })
    return {
      result,
      total
    }
  }

  async adminGetAllCustomer({ limit, page }: { limit: number; page: number }) {
    const result = await databaseService.customers
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
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const total = await databaseService.customers.countDocuments()
    return {
      result,
      total
    }
  }

  async adminGetAllProviders() {
    const result = await databaseService.users.find({ roles: ROLE.PROVIDER }, { projection: { password: 0 } }).toArray()
    return result
  }

  async uploadAvatar(user_id: string, fileData: any) {
    try {
      const result = await databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        { $set: { avatar: fileData.path } }
      )

      if (result.modifiedCount === 0) {
        throw new Error('Avatar update failed')
      }

      const updatedUser = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
      return updatedUser
    } catch (error) {
      await cloudinary.api.delete_resources([fileData.filename])
      throw error
    }
  }

  async deleteAvatar(user_id: string) {
    const user = await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, { $set: { avatar: '' } })
    const updatedUser = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    return updatedUser
  }

  async addBankInfo(user_id: string, bank_info: { bank_name: string; account_number: string; account_name: string }) {
    const currentUser = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!currentUser) {
      throw new Error('User not found')
    }

    // Kiểm tra xem bank_info đã tồn tại chưa
    if (currentUser.bank_info) {
      // Bank info đã tồn tại, không cho phép thêm mới
      throw new Error('Bank info already exist')
    }

    // Thực hiện thêm thông tin ngân hàng
    const result = await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, { $set: { bank_info } })

    // Lấy thông tin người dùng đã cập nhật
    const updatedUser = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    return updatedUser
  }

  async updateBankInfo(user_id: string, payload: BankInfoReqBody) {
    const currentUser = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!currentUser || !currentUser.bank_info) {
      throw new Error('User or bank information not found')
    }

    // Kết hợp thông tin hiện tại với payload
    const updatedBankInfo = {
      ...currentUser.bank_info, // Giữ nguyên thông tin hiện tại
      ...payload // Cập nhật thông tin từ payload
    }

    // Cập nhật thông tin ngân hàng của người dùng
    const result = await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { bank_info: updatedBankInfo } }
    )

    // Kiểm tra xem việc cập nhật có thành công không
    if (result.modifiedCount === 0) {
      throw new Error('Bank information update failed')
    }

    // Lấy thông tin người dùng đã cập nhật
    const updatedUser = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    return updatedUser
  }

  async getInfo(user_id: string) {
    // Lấy thông tin người dùng, bỏ qua các trường không cần thiết
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          aff_code: 0,
          parent_aff_code: 0
        }
      }
    )

    if (!user) {
      throw new Error('User not found')
    }

    // Lấy thông tin người giới thiệu
    let referrer = null
    if (user.referrer_id) {
      referrer = await databaseService.users.findOne(
        { _id: new ObjectId(user.referrer_id) },
        {
          projection: {
            name: 1,
            email: 1
          }
        }
      )
    }

    // Lấy thông tin gói nâng cấp hiện tại của người dùng
    const currentUpgrade = await databaseService.userUpgrades.findOne(
      { user_id: new ObjectId(user_id), in_use: true },
      {
        projection: {
          status: 1,
          expiry_date: 1,
          package_id: 1
        }
      }
    )

    let upgradeDetails = null
    if (currentUpgrade) {
      // Lấy thông tin chi tiết về gói nâng cấp
      const upgradePackage = await databaseService.upgradePackages.findOne(
        { _id: currentUpgrade.package_id },
        {
          projection: {
            name: 1,
            price: 1,
            duration_in_months: 1
          }
        }
      )

      // Tính ngày hết hạn
      let daysRemaining = null
      if (currentUpgrade.expiry_date) {
        const currentDate = new Date()
        const timeDiff = currentUpgrade.expiry_date.getTime() - currentDate.getTime()
        daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))
      }

      // Kết hợp thông tin gói nâng cấp và các chi tiết khác
      upgradeDetails = {
        status: currentUpgrade.status,
        days_remaining: daysRemaining,
        package: upgradePackage
      }
    }

    return {
      ...user,
      referrer,
      upgrade: upgradeDetails
    }
  }

  async getInfoSeller(user_id: string) {
    // Lấy thông tin người dùng, bỏ qua các trường không cần thiết
    const user = await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id),
        roles: ROLE.SELLER,
        verify: UserVerifyStatus.Verified
      },
      {
        projection: {
          password: 0,
          aff_code: 0,
          parent_aff_code: 0
        }
      }
    )

    if (!user) {
      throw new Error('Seller not found')
    }

    return user
  }
  async updateInfo(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0
        }
      }
    )
    return user
  }

  async changePassword(user_id: string, new_password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }

  async getAllAccountUpgraded({ page, limit }: { page: number; limit: number }) {
    const aggregateQuery = [
      {
        $lookup: {
          from: 'userUpgrades',
          localField: '_id',
          foreignField: 'user_id',
          as: 'upgrade_info'
        }
      },
      {
        $unwind: '$upgrade_info' // Unwind the upgrade_info array
      },
      {
        $lookup: {
          from: 'upgradePackages', // Name of the collection storing package details
          localField: 'upgrade_info.package_id',
          foreignField: '_id',
          as: 'package_info'
        }
      },
      {
        $unwind: '$package_info' // Unwind the package_info array to get package details
      },

      {
        $match: {
          roles: { $eq: ROLE.SELLER },
          'upgrade_info.in_use': true,
          'upgrade_info.status': 1
        }
      },
      {
        $addFields: {
          money: {
            $multiply: [
              {
                $floor: {
                  $add: [
                    100, // Minimum value divided by 1000 to handle rounding later
                    {
                      $multiply: [
                        { $subtract: [1500, 100] }, // Max and min divided by 1000
                        { $rand: [] }
                      ]
                    }
                  ]
                }
              },
              1000 // Multiply by 1000 to get the final value ending in 000
            ]
          }
        }
      }
    ]

    // Count the total number of users who have upgraded their accounts
    const countQuery = [...aggregateQuery, { $count: 'totalUpgradedUsers' }]
    const totalCountResult = await databaseService.users.aggregate(countQuery).toArray()
    const totalUpgradedUsers = totalCountResult.length > 0 ? totalCountResult[0].totalUpgradedUsers : 0

    // Get the paginated result
    const result = await databaseService.users
      .aggregate([
        ...aggregateQuery,
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        },
        {
          $project: {
            _id: 1,
            // referrer_id: 1,
            name: 1,
            // email: 1,
            // address: 1,
            avatar: 1,
            money: 1
            // phone: 1,
            // date_of_birth: 1,
            // 'upgrade_info._id': 1, // Only include the package_id from upgrade_info
            // 'upgrade_info.user_id': 1, // Include the upgrade_date from upgrade_info
            // 'upgrade_info.package_id': 1,
            // 'upgrade_info.code_upgrade': 1, // Only include the package_id from upgrade_info
            // 'upgrade_info.in_use': 1, // Include the upgrade_date from upgrade_info
            // 'upgrade_info.created_at': 1,
            // 'upgrade_info.expiry_date': 1,
            // 'upgrade_info.is_sent_payment': 1,
            // 'package_info._id': 1, // Only include the package_id from package_info
            // 'package_info.name': 1, // Include the upgrade_date from package_info
            // 'package_info.duration_in_months': 1,
            // 'package_info.price': 1, // Only include the package_id from package_info
            // 'package_info.benefits': 1, // Include the upgrade_date from package_info
            // 'package_info.created_at': 1
          }
        }
      ])
      .toArray()

    return {
      result,
      totalUpgradedUsers // Total number of users who have upgraded their accounts
    }
  }

  async getAccountUpgraded(seller_id: string) {
    const user = await databaseService.users
      .aggregate([
        {
          $lookup: {
            from: 'userUpgrades',
            localField: '_id',
            foreignField: 'user_id',
            as: 'upgrade_info'
          }
        },
        {
          $unwind: '$upgrade_info' // Unwind the upgrade_info array
        },
        {
          $lookup: {
            from: 'upgradePackages', // Name of the collection storing package details
            localField: 'upgrade_info.package_id',
            foreignField: '_id',
            as: 'package_info'
          }
        },
        {
          $unwind: '$package_info' // Unwind the package_info array to get package details
        },

        {
          $match: {
            _id: new ObjectId(seller_id),
            roles: { $eq: ROLE.SELLER }
          }
        },
        {
          $project: { password: 0 }
        }
      ])
      .toArray()

    if (!user) {
      throw new Error('Seller upgraded not found')
    }

    return user[0]
  }
}

const authService = new AuthService()
export default authService
