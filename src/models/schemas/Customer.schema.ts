import { ObjectId } from 'mongodb'
import { ROLE, UserVerifyStatus } from '~/constants/enum'

interface CustomerType {
  _id?: ObjectId
  seller_id: ObjectId
  name: string
  email?: string
  password?: string
  address: string
  phone: string
  date_of_birth?: Date
  created_at?: Date
  updated_at?: Date
}

export default class Customer {
  _id?: ObjectId
  seller_id: ObjectId
  name: string
  email?: string
  password?: string
  address: string
  phone: string
  date_of_birth?: Date
  created_at?: Date
  updated_at?: Date

  constructor(customer: CustomerType) {
    const date = new Date()
    this._id = customer._id
    this.seller_id = customer.seller_id
    this.name = customer.name || ''
    this.email = customer.email || ''
    this.password = customer.password || ''
    this.address = customer.address || ''
    this.phone = customer.phone || ''
    this.date_of_birth = customer.date_of_birth || date
    this.created_at = customer.created_at || date
    this.updated_at = customer.updated_at || date
  }
}
