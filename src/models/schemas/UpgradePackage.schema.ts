import { ObjectId } from 'mongodb'

export interface UpgradePackageType {
  _id?: ObjectId
  name: string
  duration_in_months: number // Thời lượng đăng ký
  price: number
  benefits: string[] // Danh sách lợi ích được nhận
  referral_commissions: number // Phần trăm hoa hồng người giới thiệu được nhận
  created_at?: Date // Ngày tạo
  updated_at?: Date
}

export default class UpgradePackage {
  _id?: ObjectId
  name: string
  duration_in_months: number
  price: number
  benefits: string[]
  referral_commissions: number
  created_at: Date
  updated_at: Date

  constructor(upgradePackage: UpgradePackageType) {
    const date = new Date()
    this._id = upgradePackage._id
    this.name = upgradePackage.name
    this.duration_in_months = upgradePackage.duration_in_months
    this.price = upgradePackage.price
    this.benefits = upgradePackage.benefits
    this.referral_commissions = upgradePackage.referral_commissions || 40
    this.created_at = upgradePackage.created_at || date
    this.updated_at = upgradePackage.updated_at || date
  }
}
