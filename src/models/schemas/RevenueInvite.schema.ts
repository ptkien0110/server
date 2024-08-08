import { ObjectId } from 'mongodb'
import { ROLE } from '~/constants/enum'

export interface RevenuesInviteType {
  _id?: ObjectId
  user_id: ObjectId // Id của người nhận tiền (người giới thiệu)
  user_upgrade_id: ObjectId // Id của người nâng cấp tài khoản
  upgrade_package_id: ObjectId // Gói nâng cấp
  money: number
  created_at?: Date
}

export default class RevenuesInvite {
  _id?: ObjectId
  user_id: ObjectId
  user_upgrade_id: ObjectId
  upgrade_package_id: ObjectId
  money: number
  created_at?: Date
  constructor(revenuesInvite: RevenuesInviteType) {
    this._id = revenuesInvite._id
    this.user_id = revenuesInvite.user_id
    this.user_upgrade_id = revenuesInvite.user_upgrade_id
    this.upgrade_package_id = revenuesInvite.upgrade_package_id
    this.money = revenuesInvite.money || 0
    this.created_at = revenuesInvite.created_at || new Date()
  }
}
