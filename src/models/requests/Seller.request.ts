export interface CustomerReqBody {
  name: string
  address: string
  phone: string
  date_of_birth?: Date
}

export interface UpdateCustomerReqBody {
  name?: string
  address?: string
  phone?: string
  date_of_birth?: Date
}
