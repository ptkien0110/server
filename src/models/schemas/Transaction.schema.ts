import { ObjectId } from 'mongodb'
import { StatusTransaction } from '~/constants/enum'

export interface TransactionType {
  _id?: ObjectId
  seller_id: ObjectId
  purchase_id?: ObjectId
  upgrade_id?: ObjectId
  transaction_code?: string
  code_purchase?: string
  code_upgrade?: string
  total_price: number
  transfer_image?: string
  status: StatusTransaction
  created_at?: Date
  updated_at?: Date
}

export default class Transaction {
  _id?: ObjectId
  seller_id: ObjectId
  purchase_id?: ObjectId
  upgrade_id?: ObjectId
  transaction_code?: string
  code_purchase?: string
  code_upgrade?: string
  total_price: number
  status: StatusTransaction
  transfer_image?: string
  created_at?: Date
  updated_at?: Date

  constructor(transaction: TransactionType) {
    const date = new Date()
    this._id = transaction._id
    this.seller_id = transaction.seller_id
    this.purchase_id = transaction.purchase_id
    this.upgrade_id = transaction.upgrade_id
    this.transaction_code = transaction.transaction_code
    this.code_purchase = transaction.code_purchase || ''
    this.code_upgrade = transaction.code_upgrade || ''
    this.total_price = transaction.total_price
    this.transfer_image = transaction.transfer_image
    this.status = transaction.status || StatusTransaction.Pending
    this.created_at = transaction.created_at || date
    this.updated_at = transaction.updated_at || date
  }
}
