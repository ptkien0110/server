import { ProductDestroyStatus, ProductStatus } from '~/constants/enum'
import { StoreType } from '~/models/schemas/Product.schema'

// export interface ProductReqBody {
//   name: string
//   images?: string[]
//   description?: string
//   category: string
//   price_original: number
//   price_for_customer: number
//   price_for_seller: number
//   point?: number
//   profit_for_admin?: number
//   profit_for_pdp?: number
//   profit_for_seller?: number
//   discount_for_admin?: number
//   discount_for_pdp?: number
//   discount_for_seller?: number
//   sales?: number
//   store?: string
//   store_company?: string
// }

export interface ProductReqBody {
  code: string
  content: string
  name: string
  images: string[]
  description: string
  category: string
  price_original: number
  store?: string
  store_company?: string
  note?: string
}
export interface UpdateProductReqBody {
  name?: string
  code?: string
  content?: string
  description?: string
  category?: string
  price_original?: number
  price_retail?: number
  price_for_customer?: number
  price_for_seller?: number
  point?: number
  profit_for_admin?: number
  profit_for_pdp?: number
  profit_for_seller?: number
  destroy?: ProductDestroyStatus
  discount_for_admin?: number
  discount_for_pdp?: number
  discount_for_seller?: number
  sales?: number
  status?: ProductStatus
  store?: StoreType
  store_company?: StoreType
  note?: string
}

export interface Image {
  path: string
  filename: string
}
