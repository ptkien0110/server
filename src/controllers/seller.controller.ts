import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import authService from '~/services/auth.services'
import databaseService from '~/services/database.services'
import { sellerService } from '~/services/seller.services'

export const createCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization
  const payload = req.body
  const data = await sellerService.createCustomer(user_id, payload)
  return res.json({
    message: 'Create customer success',
    data
  })
}

export const getCustomersController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization
  const data = await sellerService.getCustomers(user_id)
  return res.json({
    message: 'Get customers success',
    data
  })
}

export const getCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization
  const { customer_id } = req.params
  const data = await sellerService.getCustomer(customer_id, user_id)
  return res.json({
    message: 'Get customer success',
    data
  })
}

export const updateCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  const { customer_id } = req.params
  const payload = req.body
  const data = await sellerService.updateCustomer(customer_id, payload)
  return res.json({
    message: 'Update customer success',
    data
  })
}

export const deleteCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  const { customer_id } = req.params
  const data = await sellerService.deleteCustomer(customer_id)
  return res.json({
    message: 'Delete customer success',
    data
  })
}

export const getSellersController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await sellerService.getSellers()
  return res.json({
    message: 'Get sellers success',
    data
  })
}

export const getSellerController = async (req: Request, res: Response, next: NextFunction) => {
  const { seller_id } = req.params
  const data = await sellerService.getSeller(seller_id)
  return res.json({
    message: 'Get seller success',
    data
  })
}

// export const verifySellerController = async (req: Request, res: Response, next: NextFunction) => {
//   const { seller_id } = req.params
//   const seller = await databaseService.users.findOne({ _id: new ObjectId(seller_id) })
//   if (!seller) {
//     return res.status(HTTP_STATUS.NOT_FOUND).json({
//       message: USERS_MESSAGES.SELLER_NOT_FOUND
//     })
//   }

//   if (seller.verify === UserVerifyStatus.Verified) {
//     return res.json({
//       message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_VERIFIED
//     })
//   }

//   if (seller.verify === UserVerifyStatus.Banned) {
//     return res.json({
//       message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED
//     })
//   }
//   const data = await sellerService.verifySeller(seller_id)
//   return res.json({
//     message: 'Verify seller success',
//     data
//   })
// }

export const verifySellerController = async (req: Request, res: Response, next: NextFunction) => {
  const { seller_id } = req.params
  const { verify } = req.body
  const seller = await databaseService.users.findOne({ _id: new ObjectId(seller_id) })
  if (!seller) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.SELLER_NOT_FOUND
    })
  }

  const data = await sellerService.verifySeller(seller_id, verify)
  return res.json({
    message: 'Verify seller success',
    data
  })
}

export const banSellerController = async (req: Request, res: Response, next: NextFunction) => {
  const { seller_id } = req.params
  const seller = await databaseService.users.findOne({ _id: new ObjectId(seller_id) })
  if (!seller) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.SELLER_NOT_FOUND
    })
  }

  if (seller.verify === UserVerifyStatus.Banned) {
    return res.json({
      message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED
    })
  }
  const data = await sellerService.banSeller(seller_id)
  return res.json({
    message: 'Ban seller success',
    data
  })
}

export const unbanSellerController = async (req: Request, res: Response, next: NextFunction) => {
  const { seller_id } = req.params
  const seller = await databaseService.users.findOne({ _id: new ObjectId(seller_id) })
  if (!seller) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.SELLER_NOT_FOUND
    })
  }

  if (seller.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_VERIFIED
    })
  }

  const data = await sellerService.unbanSeller(seller_id)
  return res.json({
    message: 'Unban seller success',
    data
  })
}

// export const getBannedSellersController = async (req: Request, res: Response, next: NextFunction) => {
//   const data = await sellerService.getBannedSellers()
//   return res.json({
//     message: 'Get banned sellers success',
//     data
//   })
// }

// export const getVerifiedSellersController = async (req: Request, res: Response, next: NextFunction) => {
//   const data = await sellerService.getVerifiedSellers()
//   return res.json({
//     message: 'Get verified sellers success',
//     data
//   })
// }

// export const getUnverifiedSellersController = async (req: Request, res: Response, next: NextFunction) => {
//   const data = await sellerService.getUnverifiedSellers()
//   return res.json({
//     message: 'Get unverified sellers success',
//     data
//   })
// }

export const getStatusVerifySellerController = async (req: Request, res: Response, next: NextFunction) => {
  const verify = Number(req.query.verify)
  const data = await sellerService.getStatusSeller(verify)
  return res.json({
    message: 'Get  sellers success',
    data
  })
}

export const getCustomerOfSellerController = async (req: Request, res: Response, next: NextFunction) => {
  const { seller_id } = req.body
  const data = await sellerService.getCustomerOfSeller(seller_id)
  if (data.totalCustomer === 0) {
    return res.json({
      message: 'Seller has no customers'
    })
  }
  return res.json({
    message: 'Get customer of seller success',
    data: data.customer
  })
}

export const getSellerByRefController = async (req: Request, res: Response, next: NextFunction) => {
  const { seller_id } = req.body
  const data = await sellerService.getSellerByRef(seller_id)

  return res.json({
    message: 'Get seller of seller success',
    data
  })
}

export const getSellerRefController = async (req: Request, res: Response, next: NextFunction) => {
  const { seller_id } = req.params
  const data = await authService.getInfoSeller(seller_id)

  return res.json({
    message: 'Get info seller success',
    data
  })
}

export const createUpgradePackageController = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body
  const data = await sellerService.createUpgradePackage(payload)
  return res.json({
    message: 'Create upgrade package success',
    data
  })
}

export const upgradeSellerPackageController = async (req: Request, res: Response, next: NextFunction) => {
  const { package_id } = req.body
  const { user_id } = req.decoded_authorization
  const data = await sellerService.upgradeSeller(user_id, package_id)
  return res.json({
    message: 'Upgrade seller success',
    data
  })
}

export const acceptPendingUpgradeController = async (req: Request, res: Response, next: NextFunction) => {
  const { upgrade_id } = req.body
  const { user_id } = req.decoded_authorization
  const data = await sellerService.acceptPendingUpgrade(user_id, upgrade_id)
  return res.json({
    message: 'Admin confirm upgrade seller success',
    data
  })
}

export const checkUpgradeStatusController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization
  const data = await sellerService.checkUpgradeStatus(user_id)
  return res.json({
    message: 'Check upgrade status success',
    data
  })
}

export const adminCheckUpgradeStatusController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.body
  const data = await sellerService.checkUpgradeStatus(user_id)
  return res.json({
    message: 'Admin check upgrade status success',
    data
  })
}

export const adminGetAllUpgradePendingController = async (req: Request, res: Response, next: NextFunction) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const sort = req.query.sort === 'asc' ? 'asc' : 'desc'
  const status = req.query.status ? Number(req.query.status) : undefined
  const date = req.query.date === 'oldest' ? 'oldest' : 'latest'
  const data = await sellerService.adminGetAllUpgradePending({ limit, page, sort, status, date })
  return res.json({
    message: 'Admin check upgrade status pending success',
    data: {
      upgrade: data.result,
      limit,
      page,
      total_page: Math.ceil(data.total / limit),
      total_upgrade: data.total
    }
  })
}

export const getallProviderController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await sellerService.getAllProvider()
  return res.json({
    message: 'Get all provider success',
    data
  })
}

export const getProviderController = async (req: Request, res: Response, next: NextFunction) => {
  const { provider_id } = req.params
  const data = await sellerService.getProvider(provider_id)
  return res.json({
    message: 'Get provider success',
    data
  })
}

export const getallPackageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await sellerService.getAllPackage()
  return res.json({
    message: 'Get all package success',
    data
  })
}

export const getUpgradeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization
  const { upgrade_id } = req.params
  const data = await sellerService.getUpgrade(user_id, upgrade_id)
  return res.json({
    message: 'Get upgrade success',
    data
  })
}

export const adminGetUpgradeController = async (req: Request, res: Response, next: NextFunction) => {
  const { upgrade_id } = req.params
  const data = await sellerService.adminGetUpgrade(upgrade_id)
  return res.json({
    message: 'Admin get upgrade success',
    data
  })
}

export const getAllUpgradeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization
  const data = await sellerService.getAllUpgrade(user_id)
  return res.json({
    message: 'Get all upgrade success',
    data
  })
}
