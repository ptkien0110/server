import { ObjectId } from 'mongodb'
import { ROLE } from '~/constants/enum'

export interface RevenuesAffiliateType {
  _id?: ObjectId
  user_id: ObjectId
  roles: ROLE
  purchase_id: ObjectId
  point?: number
  money: number
  created_at?: Date
  updated_at?: Date
}

export default class RevenuesAffiliate {
  _id?: ObjectId
  user_id: ObjectId
  roles: ROLE
  purchase_id: ObjectId
  point?: number
  money: number
  created_at?: Date
  updated_at?: Date
  constructor(revenuesAffiliate: RevenuesAffiliateType) {
    this._id = revenuesAffiliate._id
    this.user_id = revenuesAffiliate.user_id
    this.roles = revenuesAffiliate.roles
    this.purchase_id = revenuesAffiliate.purchase_id || null
    this.point = revenuesAffiliate.point || 0
    this.money = revenuesAffiliate.money || 0
    this.created_at = revenuesAffiliate.created_at || new Date()
    this.updated_at = revenuesAffiliate.updated_at || new Date()
  }
}
