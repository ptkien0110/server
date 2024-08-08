import { ObjectId } from 'mongodb'
import { StatusPaymentMethod } from '~/constants/enum'

interface PaymentMethodType {
  _id?: ObjectId
  name: string
  status?: StatusPaymentMethod
}

export default class PaymentMethod {
  _id?: ObjectId
  name: string
  status?: StatusPaymentMethod
  constructor({ _id, name, status }: PaymentMethodType) {
    this._id = _id
    this.name = name
    this.status = status || StatusPaymentMethod.Visible
  }
}
