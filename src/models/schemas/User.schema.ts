import { ObjectId } from 'mongodb'
import { ROLE, UserVerifyStatus } from '~/constants/enum'

interface BankInfoType {
  bank_name: string
  account_number: string
  account_name: string
}

interface UserType {
  _id?: ObjectId
  referrer_id?: string
  name: string
  email: string
  password: string
  address?: string
  avatar?: string
  phone?: string
  bank_info?: BankInfoType
  date_of_birth?: Date
  aff_code?: string
  parent_aff_code?: string
  roles: ROLE
  verify: UserVerifyStatus
  created_at?: Date
  updated_at?: Date
}

export default class User {
  _id?: ObjectId
  referrer_id?: string
  name: string
  email: string
  password: string
  address?: string
  avatar?: string
  phone?: string
  bank_info?: BankInfoType
  date_of_birth?: Date
  aff_code?: string
  parent_aff_code?: string
  roles: ROLE
  verify: UserVerifyStatus
  created_at?: Date
  updated_at?: Date

  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id
    this.referrer_id = user.referrer_id || ''
    this.name = user.name
    this.email = user.email
    this.password = user.password
    this.address = user.address || ''
    this.avatar = user.avatar || ''
    this.phone = user.phone || ''
    this.bank_info = user.bank_info
    this.date_of_birth = user.date_of_birth || date
    this.aff_code = user.aff_code || ''
    this.parent_aff_code = user.parent_aff_code || ''
    this.roles = user.roles || ROLE.SELLER
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
  }
}
