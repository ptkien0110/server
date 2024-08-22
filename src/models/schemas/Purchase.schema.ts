import { ObjectId } from 'mongodb'
import { StatusPurchase } from '~/constants/enum'
import { Image } from '~/models/requests/Product.request'

export interface PaymentMethodType {
  _id: ObjectId
  name: string
}

export interface CostBearerType {
  _id: ObjectId
  name: string
}

export interface CustomerType {
  _id: ObjectId
  name: string
  email?: string
  address: string
  phone: string
  date_of_birth?: Date
}
export interface ProviderProfits {
  [providerId: string]: number
}

export interface PurchaseItemType {
  product_id: ObjectId
  provider_id: ObjectId
  code: string
  initial_stock: number // Số lượng tồn kho ban đầu
  store_id: string
  store_name: string
  buy_count: number
  total_price_original: number
  total_price_points: number
  total_price: number
  total_profit_for_seller: number
  total_profit_for_pdp: number
  total_profit_for_admin: number
  total_point: number
  product_name: string
  product_images: Image[]
  product_price_for_customer: number
}

export interface PurchaseType {
  _id: ObjectId
  code_purchase: string
  seller_id: ObjectId
  user_handle_id?: ObjectId
  payment_method?: PaymentMethodType
  cost_bearer?: CostBearerType
  customer?: CustomerType
  shipping_fee?: number
  purchase_items: PurchaseItemType[]
  purchase_total_price_original: number
  purchase_total_price: number
  purchase_total_price_points: number
  purchase_total_profit_for_seller: number
  purchase_total_profit_for_admin: number
  purchase_total_point: number
  provider_profits: ProviderProfits
  status: StatusPurchase
  created_at?: Date
  updated_at?: Date
}

export default class Purchase {
  _id: ObjectId
  code_purchase: string
  seller_id: ObjectId
  user_handle_id?: ObjectId
  payment_method?: PaymentMethodType
  cost_bearer?: CostBearerType
  customer?: CustomerType
  shipping_fee?: number
  purchase_total_price_original: number
  purchase_total_price: number
  purchase_total_price_points: number
  purchase_total_profit_for_seller: number
  purchase_total_profit_for_admin: number
  purchase_total_point: number
  provider_profits: ProviderProfits
  status: StatusPurchase
  purchase_items: PurchaseItemType[]
  created_at?: Date
  updated_at?: Date

  constructor(purchase: PurchaseType) {
    this._id = purchase._id
    this.code_purchase = purchase.code_purchase || ''
    this.seller_id = purchase.seller_id
    this.user_handle_id = purchase.user_handle_id
    this.payment_method = purchase.payment_method
    this.cost_bearer = purchase.cost_bearer
    this.customer = purchase.customer
    this.shipping_fee = purchase.shipping_fee
    this.purchase_items = purchase.purchase_items
    this.provider_profits = purchase.provider_profits
    this.purchase_total_price_original = purchase.purchase_total_price_original
    this.purchase_total_price = purchase.purchase_total_price
    this.purchase_total_price_points = purchase.purchase_total_price_points
    this.purchase_total_profit_for_seller = purchase.purchase_total_profit_for_seller
    this.purchase_total_profit_for_admin = purchase.purchase_total_profit_for_admin
    this.purchase_total_point = purchase.purchase_total_point
    this.status = purchase.status
    this.created_at = purchase.created_at || new Date()
    this.updated_at = purchase.updated_at || new Date()
  }
}
