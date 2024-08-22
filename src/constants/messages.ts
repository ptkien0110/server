export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  REGISTER_SUCCESS: 'Register success',
  GET_INFO_SUCCESS: 'Get info success',
  GET_ACCOUNTS_UPGRADED: 'Get accounts upgraded success',
  GET_ACCOUNT_UPGRADED: 'Get account upgraded success',
  UPDATE_INFO_SUCCESS: 'Update info success',
  CREATE_ACCOUNT_SUCCESS: 'Create account success',
  LOGIN_SUCCESS: 'Login success',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  EMAIL_OR_PHONE_MUST_BE_A_STRING: 'Email or phone must be a string',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50',
  PASSWORD_MUST_BE_STRONG:
    'Password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  PHONE_IS_REQUIRED: 'Phone is required',
  PHONE_NUMBER_INVALID: 'Phone number is invalid',
  PHONE_NUMBER_EXISTED: 'Phone number is existed',
  PHONE_NUMBER_IS_STRING: 'Phone number is existed',
  ADDRESS_IS_REQUIRED: 'Address is required',
  ADDRESS_INVALID: 'Address is invalid',
  ADDRESS_LENGTH_MUST_BE_FROM_1_255: 'Address length must be from 1 to 255',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  LOGOUT_SUCCESS: 'Logout success',
  ACCOUNT_NOT_ADMIN: 'Account not admin',
  ACCOUNT_NOT_SELLER: 'Account not seller',
  ACCOUNT_NOT_PROVIDER: 'Account not provider',
  INVALID_CUSTOMER_ID: 'Invalid customer id',
  INVALID_SELLER_ID: 'Invalid seller id',
  INVALID_UPGRADE_ID: 'Invalid upgrade id',
  INVALID_PACKAGE_ID: 'Invalid package id',
  INVALID_USER_ID: 'Invalid user id',
  CUSTOMER_NOT_FOUND: 'Customer not found',
  UPGRADE_NOT_FOUND: 'Upgrade not found',
  PACKAGE_NOT_FOUND: 'Package not found',
  SELLER_NOT_FOUND: 'Seller not found',
  PROVIDER_NOT_FOUND: 'Provider not found',
  ACCOUNT_HAS_BEEN_VERIFIED: 'Account has been verified',
  ACCOUNT_IS_SELLER: 'Account is seller',
  ACCOUNT_IS_PROVIDER: 'Account is provider',
  ACCOUNT_IS_CUSTOMER: 'Account is customer',
  ACCOUNT_HAS_BEEN_BANNED: 'Account has been banned',
  ROLES_IS_INVALID: 'Roles is invalid',
  UPDATE_ROLE_SUCCESS: 'Update role success',
  ACCOUNT_NOT_FOUND: 'Account not found',
  GET_ACCOUNT_BY_ROLE_SUCCESS: 'Get account by role success',
  GET_ALL_ACCOUNT_SUCCESS: 'Get all account success',
  GET_ALL_CUSTOMER_SUCCESS: 'Get all customer success',
  VERIFY_STATUS_INVALID: 'Verify status invalid',
  DURATION_IN_MONTHS_MUST_BE_NUMBER: 'Duration in months must be number',
  PRICE_MUST_BE_NUMBER: 'Price must be number',
  BENEFITS_MUST_BE_ARRAY: 'Benefits must be array',
  BENEFITS_CANNOT_BE_EMPTY: 'Benefits cannot be empty',
  BENEFITS_MUST_BE_NON_EMPTY_STRINGS: 'Benefits must be non empty strings',
  SELLER_HAS_NOT_UPGRADED: 'Seller has not upgraded',
  DELETE_AVATAR_SUCCESS: 'Delete avatar success',
  UPLOAD_AVATAR_SUCCESS: 'Upload avatar success',
  ADD_BANK_INFO_SUCCESS: 'Add bank info success',
  UPDATE_BANK_INFO_SUCCESS: 'Update bank info success',
  OLD_PASSWORD_NOT_MATCH: 'Old password not match',
  CHANGE_PASSWORD_SUCCESS: 'Change password success',
  CREATE_PASSWORD_SUCCESS: 'Create password success',
  USER_NOT_FOUND: 'User not found'
}

export const CATEGORY_MESSAGES = {
  NAME_IS_REQUIRED: 'Name is required',
  CATEGORY_IS_EXIST: 'Category is exist',
  ADD_CATEGORY_SUCCESS: 'Add category success',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
  GET_CATEGORIES_SUCCESS: 'Get categories success',
  GET_CATEGORY_SUCCESS: 'Get category success',
  INVALID_CATEGORY_ID: 'Invalid category id',
  CATEGORY_NOT_FOUND: 'Category not found',
  UPDATE_CATEGORY_SUCCESS: 'Update category success',
  DELETE_CATEGORY_SUCCESS: 'Delete category success'
}

export const PRODUCT_MESSAGES = {
  INVALID_PRODUCT_ID: 'Invalid product id',
  INVALID_STATUS_PRODUCT: 'Invalid status product',
  PRODUCT_NOT_FOUND: 'Product not found',
  NAME_PRODUCT_REQUIRED: 'Name is required',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
  DESCRIPTION_MUST_BE_A_STRING: 'Description must be a string',
  CONTENT_MUST_BE_A_STRING: 'Content must be a string',
  NOTE_MUST_BE_A_STRING: 'Note must be a string',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  PRICE_MUST_BE_A_NUMBER: 'Price must be a number',
  STOCK_MUST_BE_A_NUMBER: 'Stock must be a number',
  POINT_MUST_BE_A_NUMBER: 'Point must be a number',
  PROFIT_MUST_BE_A_NUMBER: 'Profit must be a number',
  PROFIT_FOR_SELLER_MUST_BE_A_NUMBER: 'Profit for seller must be a number',
  PROFIT_FOR_PDP_MUST_BE_A_NUMBER: 'Profit for pdp must be a number',
  DISCOUNT_MUST_BE_A_NUMBER: 'Discount must be a number',
  CATEGORY_MUST_BE_A_STRING: 'Category must be a string',
  CREATE_PRODUCT_SUCCESS: 'Create product success',
  GET_PRODUCTS_SUCCESS: 'Get products success',
  GET_PRODUCTS_OF_PROVIDER_SUCCESS: 'Get products of provider success',
  GET_PRODUCTS_BY_CATEGORY_SUCCESS: 'Get products by category success',
  GET_PRODUCT_SUCCESS: 'Get product success',
  UPDATE_PRODUCT_SUCCESS: 'Update product success',
  UPDATE_STATUS_PRODUCT_SUCCESS: 'Update status product success',
  DELETE_PRODUCT_SUCCESS: 'Delete product success',
  DELETE_IMAGES_PRODUCT_SUCCESS: 'Delete image product success',
  UPLOAD_IMAGES_SUCCESS: 'Upload images success',
  UPDATE_IMAGES_SUCCESS: 'Update images success',
  STORE_MUST_BE_AN_OBJECT: 'Store must be an object',
  STORE_ID_MUST_BE_A_STRING: 'Store id must be a string',
  STORE_NAME_MUST_BE_A_STRING: 'Store name must be a string',
  STORE_STOCK_MUST_BE_A_NUMBER: 'Store stock must be a number',
  STORE_INVALID_FORMAT: 'Store invalid format',
  CODE_MUST_BE_A_STRING: 'Code must be a string',
  PRODUCT_ALREADY_EXISTS: 'Product already exists'
}

export const PURCHASE_MESSAGES = {
  BUY_COUNT_NOT_EMPTY: 'Buy count not empty',
  BUY_COUNT_MUST_BE_A_NUMBER: 'Buy count must be a number',
  INVALID_BUY_COUNT: 'Invalid buy count',
  INVALID_STORE_ID: 'Invalid store id',
  INVALID_PURCHASE_ID: 'Invalid purchase id',
  STORE_ID_MUST_BE_A_STRING: 'Store id must be a string',
  PURCHASE_STATUS_INVALID: 'Purchase status invalid',
  PURCHASE_NOT_FOUND: 'Purchase not found'
}
