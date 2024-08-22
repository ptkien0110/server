import { ObjectId } from 'mongodb'
import { ProductDestroyStatus, ProductStatus } from '~/constants/enum'
import { Image } from '~/models/requests/Product.request'

export interface StoreType {
  id: string
  name: string
  stock: number
}
interface ProductType {
  _id?: ObjectId
  provider_id: ObjectId
  code: string
  content?: string
  name: string
  images?: Image[]
  description?: string
  category: ObjectId
  price_original: number
  price_retail?: number
  price_for_customer?: number
  price_for_seller?: number
  price_points?: number
  sold?: number
  view?: number
  point?: number
  profit?: number
  profit_for_admin?: number
  profit_for_pdp?: number
  profit_for_seller?: number
  discount_for_admin?: number
  discount_for_point?: number
  discount_for_seller?: number
  sales?: number
  destroy?: ProductDestroyStatus
  status?: ProductStatus
  created_at?: Date
  updated_at?: Date
  store?: StoreType
  store_company?: StoreType
  invoice_images: Image[]
  note?: string
  rating?: number
  total_rating?: number
}

export default class Product {
  _id?: ObjectId
  provider_id: ObjectId
  code: string
  content?: string
  name: string
  images?: Image[]
  description?: string
  category: ObjectId
  price_original: number
  price_retail?: number
  price_for_customer?: number
  price_for_seller?: number
  price_points?: number
  sold?: number
  view?: number
  point?: number
  profit?: number
  profit_for_admin?: number
  profit_for_pdp?: number
  profit_for_seller?: number
  discount_for_admin?: number
  discount_for_point?: number
  discount_for_seller?: number
  sales?: number
  destroy?: ProductDestroyStatus
  status?: ProductStatus
  created_at?: Date
  updated_at?: Date
  store?: StoreType
  store_company?: StoreType
  invoice_images: Image[]
  note?: string
  rating?: number
  total_rating?: number
  constructor(product: ProductType) {
    this._id = product._id
    this.provider_id = product.provider_id
    this.code = product.code
    this.content = product.content || ''
    this.name = product.name || ''
    this.images = product.images || []
    this.description = product.description || ''
    this.category = product.category
    this.sales = product.sales || 0
    this.price_original = product.price_original || 0
    this.price_retail = product.price_retail || 0
    this.price_for_customer = this.price_for_customer || 0
    this.profit = this.calculateProfit()
    this.price_for_seller = product.price_for_seller || 0
    this.price_points = product.price_points || 0
    this.sold = product.sold || 0
    this.view = product.view || 0
    this.point = product.point || 0
    this.discount_for_admin = product.discount_for_admin || 0
    this.discount_for_point = product.discount_for_point || 0
    this.discount_for_seller = product.discount_for_seller || 0
    this.profit_for_admin = this.profit_for_admin || 0
    this.profit_for_pdp = product.profit_for_pdp || 0
    this.profit_for_seller = product.profit_for_seller || 0
    this.destroy = product.destroy || ProductDestroyStatus.Active
    this.status = product.status || ProductStatus.Pending
    this.created_at = product.created_at || new Date()
    this.updated_at = product.updated_at || new Date()
    this.store = product.store
    this.store_company = product.store_company
    this.invoice_images = product.invoice_images || []
    this.note = product.note || ''
    this.rating = product.rating || 0
    this.total_rating = product.total_rating || 0
  }

  calculateProfit(): number {
    const discount = this.sales || 0
    const calculatedProfit = Number(this.price_for_customer) * (Number(this.sales) / 100) - Number(this.profit)
    return calculatedProfit || 0
  }
}
