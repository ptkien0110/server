/* eslint-disable prefer-const */
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { CATEGORY_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/middlewares/error.middleware'
import { Image, ProductReqBody, UpdateProductReqBody } from '~/models/requests/Product.request'
import Product from '~/models/schemas/Product.schema'
import databaseService from '~/services/database.services'
import { v2 as cloudinary } from 'cloudinary'
import { ProductDestroyStatus, ProductStatus } from '~/constants/enum'
import { deleteImageFromCloud } from '~/utils/cloudinary'

class ProductService {
  async createProduct({ body, fileData, user_id }: { body: ProductReqBody; fileData: any; user_id: string }) {
    const categoryId = body.category

    if (!categoryId) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: 'Category is required'
      })
    }

    const category = await databaseService.categories.findOne({ _id: new ObjectId(categoryId) })

    if (!category) {
      const publicIds = [...(fileData.images || []), ...(fileData.invoice_images || [])].map(
        (file: any) => file.filename
      )
      await cloudinary.api.delete_resources(publicIds)
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: CATEGORY_MESSAGES.CATEGORY_NOT_FOUND
      })
    }

    let parsedStore = { id: '', name: '', stock: 0 }
    let parsedStoreCompany = { id: '', name: '', stock: 0 }

    if (body.store) {
      try {
        parsedStore = JSON.parse(body.store)
      } catch (error) {
        const publicIds = [...(fileData.images || []), ...(fileData.invoice_images || [])].map(
          (file: any) => file.filename
        )
        await cloudinary.api.delete_resources(publicIds)
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
          message: 'Invalid store format'
        })
      }
    }

    if (body.store_company) {
      try {
        parsedStoreCompany = JSON.parse(body.store_company)
      } catch (error) {
        const publicIds = [...(fileData.images || []), ...(fileData.invoice_images || [])].map(
          (file: any) => file.filename
        )
        await cloudinary.api.delete_resources(publicIds)
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
          message: 'Invalid store format'
        })
      }
    }

    const product = await databaseService.products.insertOne(
      new Product({
        provider_id: new ObjectId(user_id),
        code: body.code,
        content: body.content,
        name: body.name,
        images: (fileData.images || []).map((item: any) => ({ path: item.path, filename: item.filename })),
        invoice_images: (fileData.invoice_images || []).map((item: any) => ({
          path: item.path,
          filename: item.filename
        })),
        description: body.description,
        category: new ObjectId(categoryId),
        price_original: Number(body.price_original),
        profit_for_pdp: Number(body.price_original),
        store: {
          id: parsedStore.id,
          name: parsedStore.name,
          stock: parsedStore.stock
        },
        store_company: {
          id: parsedStoreCompany.id,
          name: parsedStoreCompany.name,
          stock: parsedStoreCompany.stock
        },
        note: body.note
      })
    )
    const data = await databaseService.products
      .aggregate([
        {
          $match: {
            _id: new ObjectId(product.insertedId)
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: '$category'
        }
      ])
      .toArray()

    return data[0]
  }

  async getProducts({
    limit,
    page,
    sort,
    status,
    date
  }: {
    limit: number
    page: number
    sort: 'asc' | 'desc'
    status?: number
    date: 'latest' | 'oldest'
  }) {
    const sortOrder = sort === 'asc' ? 1 : -1
    const dateOrder = date === 'oldest' ? 1 : -1

    const matchCondition: any = {
      destroy: { $ne: ProductDestroyStatus.AdminDeleted }
    }

    if (status !== undefined) {
      matchCondition.status = status
    }

    const sortCondition =
      status === undefined ? { status: sortOrder, created_at: dateOrder } : { created_at: dateOrder }

    const products = await databaseService.products
      .aggregate([
        {
          $match: matchCondition
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $sort: sortCondition
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await databaseService.products.countDocuments(matchCondition)
    return {
      products,
      total
    }
  }

  async getAllProduct({
    limit,
    page,
    sort,
    status,
    date
  }: {
    limit: number
    page: number
    sort: 'asc' | 'desc'
    status?: number
    date: 'latest' | 'oldest'
  }) {
    const sortOrder = sort === 'asc' ? 1 : -1
    const dateOrder = date === 'oldest' ? 1 : -1

    const matchCondition: any = {}

    if (status !== undefined) {
      matchCondition.status = status
    }

    const sortCondition =
      status === undefined ? { status: sortOrder, created_at: dateOrder } : { created_at: dateOrder }
    const products = await databaseService.products
      .aggregate([
        {
          $match: matchCondition
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'provider_id',
            foreignField: '_id',
            as: 'provider'
          }
        },

        {
          $unwind: '$provider'
        },

        {
          $project: {
            provider: {
              _id: 0,
              referrer_id: 0,
              email: 0,
              password: 0,
              address: 0,
              avatar: 0,
              phone: 0,
              date_of_birth: 0,
              aff_code: 0,
              parent_aff_code: 0,
              roles: 0,
              verify: 0,
              created_at: 0,
              updated_at: 0
            }
          }
        },
        {
          $sort: sortCondition
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await databaseService.products.countDocuments(matchCondition)
    return {
      products,
      total
    }
  }

  async getProductsBySeller({ limit, page }: { limit: number; page: number }) {
    const products = await databaseService.products
      .aggregate([
        {
          $match: {
            destroy: ProductDestroyStatus.Active,
            status: ProductStatus.Accept
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await databaseService.products.countDocuments({
      destroy: ProductDestroyStatus.Active,
      status: ProductStatus.Accept
    })
    return {
      products,
      total
    }
  }

  async getProductsByProvider({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const products = await databaseService.products
      .aggregate([
        {
          $match: {
            provider_id: new ObjectId(user_id),
            destroy: ProductDestroyStatus.Active
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await databaseService.products.countDocuments({
      provider_id: new ObjectId(user_id),
      destroy: ProductDestroyStatus.Active
    })
    return {
      products,
      total
    }
  }

  async getProductOfProvider({ provider_id, limit, page }: { provider_id: string; limit: number; page: number }) {
    const products = await databaseService.products
      .aggregate([
        {
          $match: {
            provider_id: new ObjectId(provider_id)
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await databaseService.products.countDocuments({ provider_id: new ObjectId(provider_id) })
    return {
      products,
      total
    }
  }

  async getAllProductOfProvider({ provider_id, limit, page }: { provider_id: string; limit: number; page: number }) {
    const products = await databaseService.products
      .aggregate([
        {
          $match: {
            provider_id: new ObjectId(provider_id),
            destroy: ProductDestroyStatus.Active,
            status: ProductStatus.Accept
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await databaseService.products.countDocuments({
      provider_id: new ObjectId(provider_id),
      destroy: ProductDestroyStatus.Active,
      status: ProductStatus.Accept
    })
    return {
      products,
      total
    }
  }

  async getAllProductByCategory({ category_id, limit, page }: { category_id: string; limit: number; page: number }) {
    const products = await databaseService.products
      .aggregate([
        {
          $match: {
            category: new ObjectId(category_id),
            destroy: ProductDestroyStatus.Active,
            status: ProductStatus.Accept
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            price_original: 0,
            price_for_seller: 0,
            price_points: 0,
            profit: 0,
            profit_for_admin: 0,
            profit_for_pdp: 0,
            discount_for_admin: 0,
            discount_for_point: 0,
            discount_for_seller: 0
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await databaseService.products.countDocuments({
      category: new ObjectId(category_id),
      destroy: ProductDestroyStatus.Active,
      status: ProductStatus.Accept
    })
    return {
      products,
      total
    }
  }

  async getProduct(product_id: string) {
    const product = await databaseService.products
      .aggregate([
        {
          $match: {
            _id: new ObjectId(product_id)
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()
    return product[0]
  }

  async getProductById(product_id: string) {
    const product = await databaseService.products
      .aggregate([
        {
          $match: {
            _id: new ObjectId(product_id),
            destroy: ProductDestroyStatus.Active,
            status: ProductStatus.Accept
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()
    return product[0]
  }

  async getProductByProvider(user_id: string, product_id: string) {
    const product = await databaseService.products
      .aggregate([
        {
          $match: {
            provider_id: new ObjectId(user_id)
          }
        },
        {
          $match: {
            _id: new ObjectId(product_id)
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()
    return product[0]
  }

  async updateProduct(product_id: string, payload: UpdateProductReqBody) {
    const updatePayload: any = {
      ...(payload as UpdateProductReqBody),
      ...(payload.category && { category: new ObjectId(payload.category) })
    }

    const productInDB = await databaseService.products.findOne({ _id: new ObjectId(product_id) })

    if (!productInDB) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: 'Product not found'
      })
    }

    if (payload.code) {
      const existingProduct = await databaseService.products.findOne({ code: payload.code })
      if (existingProduct && existingProduct._id.toString() !== product_id) {
        throw new Error('Code already exists')
      }
    }

    if (Object.keys(payload).some((key) => key !== 'name' && key !== 'description')) {
      updatePayload.status = ProductStatus.Pending
    } else {
      updatePayload.status = productInDB.status
    }

    if (payload.store) {
      try {
        const parsedStore = payload.store
        updatePayload.store = {
          id: parsedStore.id,
          name: parsedStore.name,
          stock: parsedStore.stock
        }
      } catch (error) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
          message: 'Invalid store format'
        })
      }
    }

    if (payload.store_company) {
      try {
        const parsedStoreCompany = payload.store_company
        updatePayload.store_company = {
          id: parsedStoreCompany.id,
          name: parsedStoreCompany.name,
          stock: parsedStoreCompany.stock
        }
      } catch (error) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
          message: 'Invalid store format'
        })
      }
    }

    // If sales or price_original is updated, recalculate price_for_customer and profits
    if (payload.sales !== undefined || payload.price_original !== undefined || payload.price_retail !== undefined) {
      const sales = payload.sales !== undefined ? payload.sales : productInDB.sales || 0
      const price_original = payload.price_original !== undefined ? payload.price_original : productInDB.price_original
      const price_retail = payload.price_retail !== undefined ? payload.price_retail : productInDB.price_retail
      let price_for_customer =
        price_retail !== undefined
          ? sales === 0
            ? price_retail
            : price_retail * (1 - sales / 100)
          : productInDB.price_for_customer

      // Update price_for_customer in payload
      updatePayload.price_for_customer = price_for_customer

      // Ensure price_for_customer is greater than price_original
      if (Number(price_for_customer) <= price_original) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Price for customer must be greater than the original price'
        })
      }

      // Calculate profit and related fields
      const profit = Number(price_for_customer) - price_original
      const discountForAdmin = productInDB.discount_for_admin || 0
      const discountForSeller = productInDB.discount_for_seller || 0
      const discountForPoint = 100 - discountForAdmin - discountForSeller

      const profitForAdmin = profit * (discountForAdmin / 100)
      const profitForSeller = profit * (discountForSeller / 100)
      const profitPoint = profit * (discountForPoint / 100)
      const point = (profitPoint * 120000000) / 14400000

      updatePayload.profit = profit
      updatePayload.profit_for_admin = profitForAdmin
      updatePayload.profit_for_seller = profitForSeller
      updatePayload.price_points = profitPoint
      updatePayload.point = point
      updatePayload.profit_for_pdp = price_original
      updatePayload.discount_for_point = discountForPoint
    }

    const updatedProduct = await databaseService.products.findOneAndUpdate(
      {
        _id: new ObjectId(product_id)
      },
      {
        $set: updatePayload,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )

    const data = await databaseService.products
      .aggregate([
        {
          $match: {
            _id: new ObjectId(product_id)
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()

    return data[0]
  }

  async adminUpdateProduct(product_id: string, payload: UpdateProductReqBody) {
    const updatePayload: any = {
      ...(payload as UpdateProductReqBody),
      ...(payload.category && { category: new ObjectId(payload.category) })
    }

    const productInDB = await databaseService.products.findOne({ _id: new ObjectId(product_id) })

    if (!productInDB) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: 'Product not found'
      })
    }

    if (payload.store) {
      try {
        const parsedStore = payload.store
        updatePayload.store = {
          id: parsedStore.id,
          name: parsedStore.name,
          stock: parsedStore.stock
        }
      } catch (error) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
          message: 'Invalid store format'
        })
      }
    }

    if (payload.store_company) {
      try {
        const parsedStoreCompany = payload.store_company
        updatePayload.store_company = {
          id: parsedStoreCompany.id,
          name: parsedStoreCompany.name,
          stock: parsedStoreCompany.stock
        }
      } catch (error) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
          message: 'Invalid store format'
        })
      }
    }

    const discountForAdmin =
      payload.discount_for_admin !== undefined ? payload.discount_for_admin : productInDB.discount_for_admin || 0
    const discountForSeller =
      payload.discount_for_seller !== undefined ? payload.discount_for_seller : productInDB.discount_for_seller || 0

    const discountForPoint = 100 - discountForAdmin - discountForSeller
    let price_for_customer =
      payload.price_for_customer !== undefined ? payload.price_for_customer : productInDB.price_for_customer
    const sales: number = payload.sales !== undefined ? payload.sales : productInDB.sales || 0
    const price_retail = payload.price_retail !== undefined ? payload.price_retail : productInDB.price_retail
    const price_original: number =
      payload.price_original !== undefined ? payload.price_original : productInDB.price_original

    // Cập nhật lại price_for_customer nếu price_retail hoặc sales thay đổi
    if (price_retail !== undefined || payload.sales !== undefined) {
      price_for_customer = sales === 0 ? price_retail : Number(price_retail) * (1 - sales / 100)
      updatePayload.price_for_customer = price_for_customer
    }

    // Kiểm tra nếu price_for_customer nhỏ hơn hoặc bằng price_original
    if (price_for_customer !== undefined && price_for_customer <= price_original) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Price for customer must be greater than the original price'
      })
    }

    // Tính toán lại profit và các giá trị liên quan
    if (
      price_for_customer !== undefined ||
      payload.discount_for_admin !== undefined ||
      payload.discount_for_seller !== undefined
    ) {
      const profit = Number(price_for_customer) - price_original
      const profitForAdmin = profit * (discountForAdmin / 100)
      const profitForSeller = profit * (discountForSeller / 100)
      const profitPoint = profit * (discountForPoint / 100)
      const point = (profitPoint * 120000000) / 14400000

      updatePayload.profit_for_admin = profitForAdmin
      updatePayload.profit_for_seller = profitForSeller
      updatePayload.price_points = profitPoint
      updatePayload.point = point
      updatePayload.profit = profit
      updatePayload.profit_for_pdp = price_original
      updatePayload.discount_for_point = discountForPoint
    }

    const updatedProduct = await databaseService.products.findOneAndUpdate(
      {
        _id: new ObjectId(product_id)
      },
      {
        $set: updatePayload,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )

    const data = await databaseService.products
      .aggregate([
        {
          $match: {
            _id: new ObjectId(product_id)
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()

    return data[0]
  }

  async adminChangeStatus(product_id: string, status: ProductStatus) {
    const existingProduct = await databaseService.products.findOne({ _id: new ObjectId(product_id) })
    if (!existingProduct) {
      throw new Error('Không tìm thấy sản phẩm')
    }
    if (existingProduct.status === status) {
      throw new Error('Trạng thái sản phẩm đã là trạng thái này, không thể cập nhật lại')
    }

    const product = await databaseService.products.findOneAndUpdate(
      { _id: new ObjectId(product_id) },
      {
        $set: {
          status
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return product
  }

  async deleteProduct(product_id: string) {
    const product = await databaseService.products.findOneAndUpdate(
      { _id: new ObjectId(product_id) },
      {
        $set: {
          destroy: ProductDestroyStatus.AdminDeleted
        }
      },
      {
        returnDocument: 'after'
      }
    )
    const data = await databaseService.products
      .aggregate([
        {
          $match: {
            _id: new ObjectId(product_id)
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()

    return data[0]
  }

  async deleteProductByProvider(user_id: string, product_id: string) {
    const product = await databaseService.products.findOneAndUpdate(
      { _id: new ObjectId(product_id) },
      {
        $set: {
          destroy: ProductDestroyStatus.ProviderDeleted
        }
      },
      {
        returnDocument: 'after'
      }
    )
    const data = await databaseService.products
      .aggregate([
        {
          $match: {
            provider_id: new ObjectId(user_id)
          }
        },
        {
          $match: {
            _id: new ObjectId(product_id)
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()

    return data[0]
  }

  // async deleteImagesProduct(product_id: string, public_id: string) {
  //   const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })

  //   if (!product) {
  //     throw new Error('Product not found')
  //   }

  //   if (!product.images || product.images.length === 0) {
  //     throw new Error('Product has no images')
  //   }

  //   // Tìm chỉ số của hình ảnh cần xóa trong mảng images
  //   const imageIndex = product.images.findIndex((image) => image.filename === public_id)
  //   if (imageIndex === -1) {
  //     throw new Error('Image not found')
  //   }

  //   const publicId = product.images[imageIndex].path // Lấy đường dẫn của hình ảnh để xóa
  //   await cloudinary.api.delete_resources([publicId])

  //   // Xóa hình ảnh khỏi mảng images
  //   product.images.splice(imageIndex, 1)
  //   await databaseService.products.updateOne({ _id: new ObjectId(product_id) }, { $set: { images: product.images } })

  //   // Truy vấn sản phẩm cùng với danh mục
  //   const data = await databaseService.products
  //     .aggregate([
  //       {
  //         $match: {
  //           _id: new ObjectId(product_id)
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: 'categories',
  //           localField: 'category',
  //           foreignField: '_id',
  //           as: 'category'
  //         }
  //       },
  //       {
  //         $unwind: {
  //           path: '$category',
  //           preserveNullAndEmptyArrays: true
  //         }
  //       }
  //     ])
  //     .toArray()

  //   return data[0]
  // }

  async deleteImagesProduct(product_id: string) {
    const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })

    if (!product) {
      throw new Error('Product not found')
    }

    if (!product.images || product.images.length === 0) {
      throw new Error('Product has no images')
    }

    //const publicIds = [...(fileData.images || []), ...(fileData.invoice_images || [])].map((file: any) => file.filename)
    //Xóa các image từ Cloudinary
    await Promise.all(
      product.images.map(async (file: any) => {
        file.filename
        await cloudinary.api.delete_resources([file.filename])
      })
    )

    // Cập nhật product trong database
    await databaseService.products.updateOne({ _id: new ObjectId(product_id) }, { $set: { images: [] } })

    // Lấy thông tin product mới nhất
    const data = await databaseService.products
      .aggregate([
        {
          $match: {
            _id: new ObjectId(product_id)
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()

    return data[0]
  }

  async deleteImageProduct(product_id: string, imagesToDelete: Image[], invoiceImagesToDelete: Image[]) {
    const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })

    if (!product) {
      throw new Error('Product not found')
    }

    // Đảm bảo rằng product.images và product.invoice_images là mảng
    const productImages = product.images || []
    const productInvoiceImages = product.invoice_images || []

    // Lấy các đường dẫn hình ảnh cần xóa
    const imagesToDeletePaths = imagesToDelete.map((image) => image.filename)
    const invoiceImagesToDeletePaths = invoiceImagesToDelete.map((image) => image.filename)

    // Kiểm tra xem tất cả các hình ảnh cần xóa có tồn tại trong cơ sở dữ liệu hay không
    const notFoundImages = imagesToDeletePaths.filter((path) => !productImages.some((image) => image.filename === path))
    const notFoundInvoiceImages = invoiceImagesToDeletePaths.filter(
      (path) => !productInvoiceImages.some((image: any) => image.filename === path)
    )

    if (notFoundImages.length > 0 || notFoundInvoiceImages.length > 0) {
      throw new Error('One or more images not found')
    }

    // Lọc các hình ảnh còn lại sau khi xóa
    const remainingImages = productImages.filter((image) => !imagesToDeletePaths.includes(image.filename))
    const remainingInvoiceImages = productInvoiceImages.filter(
      (image: any) => !invoiceImagesToDeletePaths.includes(image.filename)
    )

    // Xóa các hình ảnh từ Cloudinary
    await cloudinary.api.delete_resources([...imagesToDeletePaths, ...invoiceImagesToDeletePaths])

    // Cập nhật hình ảnh của sản phẩm
    await databaseService.products.updateOne(
      { _id: new ObjectId(product_id) },
      {
        $set: {
          images: remainingImages,
          invoice_images: remainingInvoiceImages
        }
      }
    )

    return {
      ...product,
      images: remainingImages,
      invoice_images: remainingInvoiceImages
    }
  }

  // async uploadImageProduct(product_id: string, imageFiles: any) {
  //   const MAX_IMAGE_COUNT = 4
  //   const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })

  //   if (!product) {
  //     throw new Error('Product not found')
  //   }

  //   const currentImageCount = product.images ? product.images.length : 0
  //   if (currentImageCount + imageFiles.length > MAX_IMAGE_COUNT) {
  //     throw new Error(`Số lượng ảnh không được vượt quá ${MAX_IMAGE_COUNT}`)
  //   }

  //   await databaseService.products.findOneAndUpdate(
  //     { _id: new ObjectId(product_id) },
  //     {
  //       $set: {
  //         images: imageFiles.map((item: any) => ({ path: item.path, filename: item.filename }))
  //       }
  //     }
  //   )

  //   const data = await databaseService.products
  //     .aggregate([
  //       {
  //         $match: {
  //           _id: new ObjectId(product_id)
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: 'categories',
  //           localField: 'category',
  //           foreignField: '_id',
  //           as: 'category'
  //         }
  //       },
  //       {
  //         $unwind: {
  //           path: '$category',
  //           preserveNullAndEmptyArrays: true
  //         }
  //       }
  //     ])
  //     .toArray()

  //   return data[0]
  // }

  async updateImageProduct(product_id: string, imageFiles: { [fieldname: string]: Express.Multer.File[] }) {
    const MAX_IMAGE_COUNT = 4

    // Tìm sản phẩm theo product_id
    const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })

    if (!product) {
      throw new Error('Product not found')
    }

    // Đảm bảo product.images và product.invoice_images là mảng các đối tượng Image
    const currentImages: Image[] = Array.isArray(product.images) ? product.images : []
    const currentInvoiceImages: Image[] = Array.isArray(product.invoice_images) ? product.invoice_images : []

    const newImageFiles = imageFiles['images'] || []
    const newInvoiceImageFiles = imageFiles['invoice_images'] || []

    const currentImageCount = currentImages.length
    const currentInvoiceImageCount = currentInvoiceImages.length

    // Kiểm tra số lượng hình ảnh tối đa
    if (currentImageCount + newImageFiles.length > MAX_IMAGE_COUNT) {
      throw new Error(`Số lượng ảnh không được vượt quá ${MAX_IMAGE_COUNT}`)
    }

    if (currentInvoiceImageCount + newInvoiceImageFiles.length > MAX_IMAGE_COUNT) {
      throw new Error(`Số lượng invoice ảnh không được vượt quá ${MAX_IMAGE_COUNT}`)
    }

    // Tạo mảng newImages từ imageFiles
    const newImages: Image[] = newImageFiles.map((item) => ({
      path: item.path,
      filename: item.filename
    }))

    const newInvoiceImages: Image[] = newInvoiceImageFiles.map((item) => ({
      path: item.path,
      filename: item.filename
    }))

    // Hợp nhất oldImages và newImages
    const mergedImages: Image[] = [...currentImages, ...newImages]
    const mergedInvoiceImages: Image[] = [...currentInvoiceImages, ...newInvoiceImages]

    // Cập nhật hình ảnh của sản phẩm
    await databaseService.products.updateOne(
      { _id: new ObjectId(product_id) },
      {
        $set: {
          images: mergedImages, // mergedImages bây giờ chỉ chứa các đối tượng Image
          invoice_images: mergedInvoiceImages // mergedInvoiceImages bây giờ chỉ chứa các đối tượng Image
        }
      }
    )

    // Trả về sản phẩm đã cập nhật
    return {
      ...product,
      images: mergedImages,
      invoice_images: mergedInvoiceImages
    }
  }

  // async updateImagesProduct({
  //   product_id,
  //   imageFiles,
  //   old_images,
  //   old_invoice_images
  // }: {
  //   product_id: string
  //   imageFiles: { [fieldname: string]: Express.Multer.File[] }
  //   old_images: Image[]
  //   old_invoice_images: Image[]
  // }) {
  //   const MAX_IMAGE_COUNT = 4

  //   // Tìm sản phẩm theo product_id
  //   const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })

  //   if (!product) {
  //     throw new Error('Product not found')
  //   }

  //   // Đảm bảo product.images và product.invoice_images là mảng các đối tượng Image
  //   const currentImages: Image[] = Array.isArray(product.images) ? product.images : []
  //   const currentInvoiceImages: Image[] = Array.isArray(product.invoice_images) ? product.invoice_images : []

  //   const newImageFiles = imageFiles['images'] || []
  //   const newInvoiceImageFiles = imageFiles['invoice_images'] || []

  //   // Kiểm tra số lượng hình ảnh tối đa
  //   if (old_images.length + newImageFiles.length > MAX_IMAGE_COUNT) {
  //     throw new Error(`Số lượng ảnh không được vượt quá ${MAX_IMAGE_COUNT}`)
  //   }

  //   if (old_invoice_images.length + newInvoiceImageFiles.length > MAX_IMAGE_COUNT) {
  //     throw new Error(`Số lượng invoice ảnh không được vượt quá ${MAX_IMAGE_COUNT}`)
  //   }

  //   // Tạo mảng newImages từ imageFiles
  //   const newImages: Image[] = newImageFiles.map((item) => ({
  //     path: item.path,
  //     filename: item.filename
  //   }))

  //   const newInvoiceImages: Image[] = newInvoiceImageFiles.map((item) => ({
  //     path: item.path,
  //     filename: item.filename
  //   }))

  //   // Hợp nhất oldImages và newImages
  //   const mergedImages: Image[] = [...old_images, ...newImages]
  //   const mergedInvoiceImages: Image[] = [...old_invoice_images, ...newInvoiceImages]

  //   // Cập nhật hình ảnh của sản phẩm
  //   await databaseService.products.updateOne(
  //     { _id: new ObjectId(product_id) },
  //     {
  //       $set: {
  //         images: mergedImages,
  //         invoice_images: mergedInvoiceImages
  //       }
  //     }
  //   )

  //   return {
  //     ...product,
  //     images: mergedImages,
  //     invoice_images: mergedInvoiceImages
  //   }
  // }
  async updateImagesProduct({
    product_id,
    imageFiles,
    old_images,
    old_invoice_images
  }: {
    product_id: string
    imageFiles: { [fieldname: string]: Express.Multer.File[] }
    old_images: Image[]
    old_invoice_images: Image[]
  }) {
    const MAX_IMAGE_COUNT = 4

    // Tìm sản phẩm theo product_id
    const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })

    if (!product) {
      throw new Error('Product not found')
    }

    const newImageFiles = imageFiles['images'] || []
    const newInvoiceImageFiles = imageFiles['invoice_images'] || []

    try {
      // Kiểm tra số lượng hình ảnh tối đa
      if (old_images.length + newImageFiles.length > MAX_IMAGE_COUNT) {
        throw new Error(`Số lượng ảnh không được vượt quá ${MAX_IMAGE_COUNT}`)
      }

      // if (old_invoice_images.length + newInvoiceImageFiles.length > MAX_IMAGE_COUNT) {
      //   throw new Error(`Số lượng invoice ảnh không được vượt quá ${MAX_IMAGE_COUNT}`)
      // }

      // Tạo mảng newImages từ imageFiles
      const newImages: Image[] = newImageFiles.map((item) => ({
        path: item.path,
        filename: item.filename
      }))

      const newInvoiceImages: Image[] = newInvoiceImageFiles.map((item) => ({
        path: item.path,
        filename: item.filename
      }))

      // Hợp nhất oldImages và newImages
      const mergedImages: Image[] = [...old_images, ...newImages]
      const mergedInvoiceImages: Image[] = [...old_invoice_images, ...newInvoiceImages]

      // Cập nhật hình ảnh của sản phẩm
      await databaseService.products.updateOne(
        { _id: new ObjectId(product_id) },
        {
          $set: {
            images: mergedImages,
            invoice_images: mergedInvoiceImages
          }
        }
      )

      return {
        ...product,
        images: mergedImages,
        invoice_images: mergedInvoiceImages
      }
    } catch (error) {
      // Xóa tất cả ảnh đã upload trên cloud nếu có lỗi xảy ra
      const allUploadedFiles = [...newImageFiles, ...newInvoiceImageFiles]
      await deleteImageFromCloud(allUploadedFiles.map((file) => file.filename))

      throw error // Ném lỗi để controller có thể xử lý tiếp
    }
  }
}

const productService = new ProductService()
export default productService
