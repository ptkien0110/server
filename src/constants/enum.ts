export enum ROLE {
  ADMIN,
  SELLER,
  PROVIDER
}

export enum UserVerifyStatus {
  Unverified, // chưa xác thực bởi admin, mặc định = 0
  Verified, // đã xác thực bởi admin
  Banned // bị khóa
}

export enum TokenType {
  AccessToken,
  RefreshToken
}

export enum CategoryStatus {
  Visible,
  Hidden
}

export enum ProductDestroyStatus {
  Active, // Hiện = 0
  AdminDeleted, // Khi Admin delete = 1
  ProviderDeleted // Khi Provider delete = 2
}

export enum ProductStatus {
  Pending,
  Cancel,
  Accept
}

export enum StatusPurchase {
  IN_CART, // Trong giỏ hàng
  WAIT_FOR_CONFIRMATION, // Đang chờ xác nhận
  WAIT_FOR_GETTING, // Đang được lấy hàng
  IN_PROGRESS, // Sản phẩm đang vận chuyển
  DELIVERED, // Đã giao
  CANCELLED // Đã hủy
}

export enum StatusUpgrade {
  Pending,
  Accept,
  Expired,
  Cancel
}
export enum StatusPaymentMethod {
  Visible,
  Hidden
}

export enum StatusCostBearer {
  Visible,
  Hidden
}

export enum StatusTransaction {
  Pending,
  Done
}

export enum StatusCustomer {
  NotLinked,
  Linked,
  Active
}
