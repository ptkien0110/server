import { ObjectId } from 'mongodb'
import { StatusUpgrade } from '~/constants/enum'

export interface UserUpgradeType {
  _id?: ObjectId
  user_id: ObjectId // ID của seller
  package_id: ObjectId // ID gói nâng cấp
  code_upgrade: string
  admin_handle_id?: ObjectId
  expiry_date?: Date // Ngày hết hạn
  status: StatusUpgrade
  upgrade_count: number
  in_use: boolean
  is_sent_payment: boolean
  revenue_distribution?: {
    referrer_id?: ObjectId // ID của người giới thiệu
    referrer_amount?: number // Số tiền người giới thiệu nhận được
    admin_amount: number // Số tiền admin nhận được
  }
  created_at: Date
  updated_at: Date
}

export default class UserUpgrade {
  _id?: ObjectId
  user_id: ObjectId
  package_id: ObjectId
  admin_handle_id?: ObjectId
  code_upgrade: string
  expiry_date?: Date
  status: StatusUpgrade
  upgrade_count: number
  in_use: boolean
  is_sent_payment: boolean
  revenue_distribution?: {
    referrer_id?: ObjectId // ID của người giới thiệu
    referrer_amount?: number // Số tiền người giới thiệu nhận được
    admin_amount: number // Số tiền admin nhận được
  }
  created_at: Date
  updated_at: Date

  constructor(userUpgrade: UserUpgradeType) {
    const date = new Date()
    this._id = userUpgrade._id
    this.user_id = userUpgrade.user_id
    this.package_id = userUpgrade.package_id
    this.admin_handle_id = userUpgrade.admin_handle_id
    this.code_upgrade = userUpgrade.code_upgrade
    this.expiry_date = userUpgrade.expiry_date || date
    this.status = userUpgrade.status || StatusUpgrade.Pending
    this.upgrade_count = userUpgrade.upgrade_count
    this.in_use = userUpgrade.in_use
    this.is_sent_payment = userUpgrade.is_sent_payment
    this.revenue_distribution = userUpgrade.revenue_distribution || { admin_amount: 0 }
    this.created_at = userUpgrade.created_at || date
    this.updated_at = userUpgrade.updated_at || date
  }
}
