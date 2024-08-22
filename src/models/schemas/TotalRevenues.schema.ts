import { ObjectId } from 'mongodb'
import { ROLE } from '~/constants/enum'

export interface TotalRevenuesType {
  _id?: ObjectId
  user_id: ObjectId
  roles: ROLE
  revenue_invite_id?: ObjectId[]
  revenue_affiliate_id?: ObjectId[]
  point?: number
  rank: string
  money: number
  created_at?: Date
  updated_at?: Date
}

export default class TotalRevenues {
  _id?: ObjectId
  user_id: ObjectId
  roles: ROLE
  revenue_invite_id?: ObjectId[]
  revenue_affiliate_id?: ObjectId[]
  point?: number
  rank?: string
  money: number
  created_at?: Date
  updated_at?: Date
  constructor(totalRevenues: TotalRevenuesType) {
    this._id = totalRevenues._id
    this.user_id = totalRevenues.user_id || ''
    this.roles = totalRevenues.roles
    this.revenue_invite_id = totalRevenues.revenue_invite_id || []
    this.revenue_affiliate_id = totalRevenues.revenue_affiliate_id || []
    this.point = totalRevenues.point || 0
    this.rank = totalRevenues.rank || ''
    this.money = totalRevenues.money || 0
    this.created_at = totalRevenues.created_at || new Date()
    this.updated_at = totalRevenues.updated_at || new Date()
  }
}
