import { ClientSession, ObjectId } from 'mongodb'
import { StatusPurchase, StatusTransaction, StatusUpgrade } from '~/constants/enum'
import Purchase, { PurchaseItemType, PurchaseType } from '~/models/schemas/Purchase.schema'
import RevenuesAffiliate, { RevenuesAffiliateType } from '~/models/schemas/RevenueAffiliate.schema'
import TotalRevenues, { TotalRevenuesType } from '~/models/schemas/TotalRevenues.schema'
import Transaction, { TransactionType } from '~/models/schemas/Transaction.schema'
import databaseService from '~/services/database.services'
import { v2 as cloudinary } from 'cloudinary'
class SellerPurchaseService {
  // async createOrder({
  //   user_id,
  //   customer_id,
  //   payment_method_id,
  //   cost_bearer_id,
  //   purchase_items
  // }: {
  //   user_id: string
  //   customer_id: string
  //   payment_method_id: string
  //   cost_bearer_id: string
  //   purchase_items: PurchaseItemType[]
  // }) {
  //   const customer = await databaseService.customers.findOne({ _id: new ObjectId(customer_id) })
  //   if (!customer) {
  //     throw new Error('Customer not found')
  //   }

  //   const paymentMethod = await databaseService.paymentMethods.findOne({ _id: new ObjectId(payment_method_id) })
  //   if (!paymentMethod) {
  //     throw new Error('Payment method not fount')
  //   }
  //   const costBearer = await databaseService.costBearers.findOne({ _id: new ObjectId(cost_bearer_id) })
  //   if (!costBearer) {
  //     throw new Error('Cost bearer not fount')
  //   }

  //   const session: ClientSession = await databaseService.startSession()
  //   const order: PurchaseType = {
  //     _id: new ObjectId(),
  //     seller_id: new ObjectId(user_id),
  //     customer: {
  //       _id: customer._id,
  //       name: customer.name,
  //       phone: customer.phone,
  //       address: customer.address
  //     },
  //     payment_method: {
  //       _id: paymentMethod._id,
  //       name: paymentMethod.name
  //     },
  //     cost_bearer: {
  //       _id: costBearer._id,
  //       name: costBearer.name
  //     },
  //     purchase_items: purchase_items,
  //     purchase_total_price_original: 0,
  //     purchase_total_price: 0,
  //     purchase_total_price_points: 0,
  //     purchase_total_profit_for_seller: 0,
  //     purchase_total_profit_for_admin: 0,
  //     purchase_total_point: 0,
  //     provider_profits: {},
  //     status: StatusPurchase.WAIT_FOR_CONFIRMATION,
  //     created_at: new Date(),
  //     updated_at: new Date()
  //   }

  //   const productErrors: string[] = []

  //   try {
  //     await databaseService.withTransaction(async (session) => {
  //       for (const item of purchase_items) {
  //         const { product_id, buy_count, store_id } = item
  //         const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) }, { session })

  //         if (!product) {
  //           productErrors.push(`${product_id}`)
  //           continue
  //         }

  //         if (product.destroy !== 0 || product.status !== 2) {
  //           productErrors.push(`${product_id}`)
  //           continue
  //         }

  //         let store = null
  //         let storeName = ''
  //         if (product.store && product.store.id && product.store.id.toString() === store_id) {
  //           store = product.store
  //           storeName = product.store.name
  //         } else if (
  //           product.store_company &&
  //           product.store_company.id &&
  //           product.store_company.id.toString() === store_id
  //         ) {
  //           store = product.store_company
  //           storeName = product.store_company.name
  //         }

  //         if (!store) {
  //           productErrors.push(`Store ${store_id} not found for product ${product_id}`)
  //           continue
  //         }

  //         if (store.stock === null || store.stock === undefined) {
  //           productErrors.push(`Stock information is missing for store ${store_id}`)
  //           continue
  //         }

  //         if (buy_count > store.stock) {
  //           productErrors.push(`Purchase quantity for product ${product_id} exceeds limit in store ${store_id}`)
  //           continue
  //         }

  //         item.store_name = storeName
  //         item.initial_stock = store.stock - buy_count
  //         item.total_price_original = Number(product.price_original) * buy_count
  //         item.total_price = Number(product.price_for_customer) * buy_count
  //         item.total_profit_for_seller = Number(product.profit_for_seller) * buy_count
  //         item.total_profit_for_pdp = Number(product.price_original) * buy_count
  //         item.total_profit_for_admin = Number(product.profit_for_admin) * buy_count
  //         item.total_price_points = Number(product.price_points) * buy_count
  //         item.total_point = Number(product.point) * buy_count
  //         item.product_images = product.images?.[0] ? [product.images[0]] : []
  //         item.product_name = product.name
  //         item.product_price_for_customer = Number(product.price_for_customer)
  //         item.provider_id = product.provider_id

  //         order.purchase_total_price_original += item.total_price_original
  //         order.purchase_total_price += item.total_price
  //         order.purchase_total_profit_for_seller += item.total_profit_for_seller
  //         order.purchase_total_profit_for_admin += item.total_profit_for_admin
  //         order.purchase_total_price_points += item.total_price_points
  //         order.purchase_total_point += item.total_point

  //         if (product.provider_id) {
  //           const providerId = product.provider_id.toString()
  //           if (!order.provider_profits[providerId]) {
  //             order.provider_profits[providerId] = 0
  //           }
  //           order.provider_profits[providerId] += item.total_profit_for_pdp
  //         }

  //         const shippingFee = 30000 // 30k shipping fee
  //         if (order.purchase_total_price > 2000000) {
  //           order.purchase_total_profit_for_admin -= shippingFee
  //         } else {
  //           console.log(costBearer._id)
  //           if (costBearer._id === new ObjectId('669fc269b373e28b740eecf0')) {
  //             order.purchase_total_profit_for_seller -= shippingFee
  //           } else if (costBearer._id === new ObjectId('669fc27cb373e28b740eecf1')) {
  //             order.purchase_total_price += shippingFee
  //           }
  //         }

  //         const updateField =
  //           product.store && product.store.id && product.store.id.toString() === store_id
  //             ? 'store.stock'
  //             : 'store_company.stock'
  //         await databaseService.products.updateOne(
  //           { _id: new ObjectId(product_id) },
  //           { $inc: { [updateField]: -buy_count } },
  //           { session }
  //         )
  //       }

  //       const cart = await databaseService.purchases.findOne({
  //         seller_id: new ObjectId(user_id),
  //         status: StatusPurchase.IN_CART
  //       })

  //       if (cart) {
  //         for (const cartItem of cart.purchase_items) {
  //           const orderItem = order.purchase_items.find(
  //             (item) => item.product_id === cartItem.product_id && item.store_id === cartItem.store_id
  //           )
  //           if (orderItem) {
  //             cartItem.initial_stock = orderItem.initial_stock
  //           }
  //         }

  //         await databaseService.purchases.updateOne(
  //           { _id: cart._id },
  //           { $set: { purchase_items: cart.purchase_items } },
  //           { session }
  //         )
  //       }

  //       if (productErrors.length > 0) {
  //         throw new Error(`Product errors: ${productErrors.join(', ')}`)
  //       }

  //       await databaseService.purchases.insertOne(new Purchase(order), { session })
  //     }, session)
  //   } finally {
  //     await session.endSession()
  //   }

  //   return await databaseService.purchases.findOne({ _id: order._id })
  // }

  async createOrder({
    user_id,
    customer_id,
    payment_method_id,
    cost_bearer_id,
    purchase_items
  }: {
    user_id: string
    customer_id: string
    payment_method_id: string
    cost_bearer_id: string
    purchase_items: PurchaseItemType[]
  }) {
    const customer = await databaseService.customers.findOne({ _id: new ObjectId(customer_id) })
    if (!customer) {
      throw new Error('Customer not found')
    }

    const paymentMethod = await databaseService.paymentMethods.findOne({ _id: new ObjectId(payment_method_id) })
    if (!paymentMethod) {
      throw new Error('Payment method not found')
    }
    const costBearer = await databaseService.costBearers.findOne({ _id: new ObjectId(cost_bearer_id) })
    if (!costBearer) {
      throw new Error('Cost bearer not found')
    }

    const session: ClientSession = await databaseService.startSession()
    const order: PurchaseType = {
      _id: new ObjectId(),
      seller_id: new ObjectId(user_id),
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address
      },
      payment_method: {
        _id: paymentMethod._id,
        name: paymentMethod.name
      },
      cost_bearer: {
        _id: costBearer._id,
        name: costBearer.name
      },
      purchase_items: purchase_items,
      purchase_total_price_original: 0,
      purchase_total_price: 0,
      purchase_total_price_points: 0,
      purchase_total_profit_for_seller: 0,
      purchase_total_profit_for_admin: 0,
      purchase_total_point: 0,
      provider_profits: {},
      status: StatusPurchase.WAIT_FOR_CONFIRMATION,
      created_at: new Date(),
      updated_at: new Date(),
      code_purchase: ''
    }

    const productErrors: string[] = []
    const stockErrors: string[] = []
    try {
      await databaseService.withTransaction(async (session) => {
        for (const item of purchase_items) {
          const { product_id, buy_count, store_id } = item
          const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) }, { session })

          if (!product) {
            productErrors.push(`${product_id}`)
            continue
          }

          if (product.destroy !== 0 || product.status !== 2) {
            productErrors.push(`${product_id}`)
            continue
          }

          let store = null
          let storeName = ''
          if (product.store && product.store.id && product.store.id.toString() === store_id) {
            store = product.store
            storeName = product.store.name
          } else if (
            product.store_company &&
            product.store_company.id &&
            product.store_company.id.toString() === store_id
          ) {
            store = product.store_company
            storeName = product.store_company.name
          }

          if (!store) {
            stockErrors.push(`Store ${store_id} not found for product ${product_id}`)
            continue
          }

          if (store.stock === null || store.stock === undefined) {
            stockErrors.push(`Stock information is missing for store ${store_id}`)
            continue
          }

          if (buy_count > store.stock) {
            stockErrors.push(`${product_id}`)
            continue
          }

          item.store_name = storeName
          item.initial_stock = store.stock - buy_count
          item.total_price_original = Number(product.price_original) * buy_count
          item.total_price = Number(product.price_for_customer) * buy_count
          item.total_profit_for_seller = Number(product.profit_for_seller) * buy_count
          item.total_profit_for_pdp = Number(product.price_original) * buy_count
          item.total_profit_for_admin = Number(product.profit_for_admin) * buy_count
          item.total_price_points = Number(product.price_points) * buy_count
          item.total_point = Number(product.point) * buy_count
          item.product_images = product.images?.[0] ? [product.images[0]] : []
          item.product_name = product.name
          item.product_price_for_customer = Number(product.price_for_customer)
          item.provider_id = product.provider_id
          item.code = product.code

          order.purchase_total_price_original += item.total_price_original
          order.purchase_total_price += item.total_price
          order.purchase_total_profit_for_seller += item.total_profit_for_seller
          order.purchase_total_profit_for_admin += item.total_profit_for_admin
          order.purchase_total_price_points += item.total_price_points
          order.purchase_total_point += item.total_point

          if (product.provider_id) {
            const providerId = product.provider_id.toString()
            if (!order.provider_profits[providerId]) {
              order.provider_profits[providerId] = 0
            }
            order.provider_profits[providerId] += item.total_profit_for_pdp
          }

          const updateField =
            product.store && product.store.id && product.store.id.toString() === store_id
              ? 'store.stock'
              : 'store_company.stock'
          await databaseService.products.updateOne(
            { _id: new ObjectId(product_id) },
            { $inc: { [updateField]: -buy_count } },
            { session }
          )
        }

        // Apply shipping fee logic
        const shippingFee = 30000 // 30k shipping fee
        if (order.purchase_total_price > 2000000) {
          order.purchase_total_profit_for_admin -= shippingFee
          order.shipping_fee = 0 // Miễn phí ship nếu đơn hàng trên 2 triệu
        } else {
          order.shipping_fee = shippingFee
          if (costBearer.name === 'Người bán chịu phí') {
            order.purchase_total_profit_for_seller -= shippingFee
          } else if (costBearer.name === 'Khách hàng chịu phí') {
            order.purchase_total_price += shippingFee
          }
        }

        const cart = await databaseService.purchases.findOne({
          seller_id: new ObjectId(user_id),
          status: StatusPurchase.IN_CART
        })

        if (cart) {
          for (const cartItem of cart.purchase_items) {
            const orderItem = order.purchase_items.find(
              (item) => item.product_id === cartItem.product_id && item.store_id === cartItem.store_id
            )
            if (orderItem) {
              cartItem.initial_stock = orderItem.initial_stock
            }
          }

          await databaseService.purchases.updateOne(
            { _id: cart._id },
            { $set: { purchase_items: cart.purchase_items } },
            { session }
          )
        }
        // Lấy ra ngày tháng năm hiện tại
        const today = new Date()
        const year = today.getFullYear().toString().slice(-2)
        const month = ('0' + (today.getMonth() + 1)).slice(-2)
        const day = ('0' + today.getDate()).slice(-2)

        const dateStr = `${year}${month}${day}`
        // Đếm số đơn hàng trong ngày hiện tại để tạo số thứ tự
        const count = await databaseService.purchases.countDocuments({
          status: { $ne: StatusPurchase.IN_CART },
          created_at: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          }
        })

        const orderNumber = ('0000' + (count + 1)).slice(-5)
        order.code_purchase = `DH${dateStr}${orderNumber}`

        if (productErrors.length > 0) {
          throw new Error(`Product errors: ${productErrors.join(', ')}`)
        }
        if (stockErrors.length > 0) {
          throw new Error(`Stock errors: ${stockErrors.join(', ')}`)
        }

        await databaseService.purchases.insertOne(new Purchase(order), { session })
      }, session)
    } finally {
      await session.endSession()
    }

    return await databaseService.purchases.findOne({ _id: order._id })
  }

  async addToCart({ user_id, purchase_items }: { user_id: string; purchase_items: PurchaseItemType[] }) {
    const session = await databaseService.startSession()
    session.startTransaction()

    try {
      // eslint-disable-next-line prefer-const
      let existingCart = await databaseService.purchases.findOne(
        {
          seller_id: new ObjectId(user_id),
          status: StatusPurchase.IN_CART
        },
        { session }
      )

      const providerProfits = existingCart?.provider_profits || {}

      if (existingCart) {
        // Có sẵn giỏ hàng, cập nhật sản phẩm vào giỏ hàng hiện tại
        for (const item of purchase_items) {
          const { product_id, buy_count, store_id } = item
          const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) }, { session })

          if (!product) {
            throw new Error(`Product ${product_id} not found`)
          }

          let store = null
          let storeName = ''
          if (product.store && product.store.id && product.store.id.toString() === store_id) {
            store = product.store
            storeName = product.store.name
          } else if (
            product.store_company &&
            product.store_company.id &&
            product.store_company.id.toString() === store_id
          ) {
            store = product.store_company
            storeName = product.store_company.name
          }

          if (!store) {
            throw new Error(`Store ${store_id} not found for product ${product_id}`)
          }

          if (store.stock === null || store.stock === undefined) {
            throw new Error(`Stock information is missing for store ${store_id}`)
          }

          // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
          const existingItemIndex = existingCart.purchase_items.findIndex(
            (i) => i.product_id === product_id && i.store_id === store_id
          )
          if (existingItemIndex !== -1) {
            // Nếu đã có sản phẩm này trong giỏ hàng, chỉ cập nhật số lượng mua và giá tiền
            const existingItem = existingCart.purchase_items[existingItemIndex]

            // Cập nhật số lượng mua
            existingItem.buy_count += buy_count

            // Tính lại giá tiền, lợi nhuận, điểm của sản phẩm
            const priceOriginal = product.price_original
            const pricePerItem = Number(product.price_for_customer)
            const profitForSellerPerItem = Number(product.profit_for_seller)
            const profitForPdPPerItem = Number(product.price_original)
            const profitForAdminPerItem = Number(product.profit_for_admin)
            const pointPerItem = Number(product.point)
            const pricePoints = Number(product.price_points)

            existingItem.total_price_original = existingItem.buy_count * priceOriginal
            existingItem.total_price = existingItem.buy_count * pricePerItem
            existingItem.total_profit_for_seller = existingItem.buy_count * profitForSellerPerItem
            existingItem.total_profit_for_pdp = existingItem.buy_count * profitForPdPPerItem
            existingItem.total_profit_for_admin = existingItem.buy_count * profitForAdminPerItem
            existingItem.total_point = existingItem.buy_count * pointPerItem
            existingItem.total_price_points = existingItem.buy_count * pricePoints

            // Cập nhật lại tổng giá trị của giỏ hàng
            existingCart.purchase_total_price_original = existingCart.purchase_items.reduce(
              (total, item) => total + (item.total_price_original || 0),
              0
            )
            existingCart.purchase_total_price = existingCart.purchase_items.reduce(
              (total, item) => total + (item.total_price || 0),
              0
            )
            existingCart.purchase_total_profit_for_seller = existingCart.purchase_items.reduce(
              (total, item) => total + (item.total_profit_for_seller || 0),
              0
            )
            existingCart.purchase_total_profit_for_admin = existingCart.purchase_items.reduce(
              (total, item) => total + (item.total_profit_for_admin || 0),
              0
            )
            existingCart.purchase_total_point = existingCart.purchase_items.reduce(
              (total, item) => total + (item.total_point || 0),
              0
            )
            existingCart.purchase_total_price_points = existingCart.purchase_items.reduce(
              (total, item) => total + (item.total_price_points || 0),
              0
            )

            // Cập nhật lợi nhuận của nhà cung cấp
            const providerId = product.provider_id.toString()
            providerProfits[providerId] = (providerProfits[providerId] || 0) + buy_count * profitForPdPPerItem
          } else {
            // Nếu chưa có, thêm mới sản phẩm vào giỏ hàng
            item.store_name = storeName
            item.initial_stock = store.stock
            item.total_price_original = product.price_original * buy_count
            item.total_price = Number(product.price_for_customer) * buy_count
            item.total_profit_for_seller = Number(product.profit_for_seller) * buy_count
            item.total_profit_for_pdp = Number(product.price_original) * buy_count
            item.total_profit_for_admin = Number(product.profit_for_admin) * buy_count
            item.total_price_points = Number(product.price_points) * buy_count
            item.total_point = Number(product.point) * buy_count
            item.product_images = product.images?.[0] ? [product.images[0]] : []
            item.product_name = product.name
            item.provider_id = product.provider_id
            item.code = product.code
            item.product_price_for_customer = Number(product.price_for_customer)
            existingCart.purchase_items.push(item)

            // Cập nhật lại tổng giá trị của giỏ hàng
            existingCart.purchase_total_price_original += item.total_price_original
            existingCart.purchase_total_price += item.total_price
            existingCart.purchase_total_profit_for_seller += item.total_profit_for_seller
            existingCart.purchase_total_profit_for_admin += item.total_profit_for_admin
            existingCart.purchase_total_point += item.total_point
            existingCart.purchase_total_price_points += item.total_price_points

            // Cập nhật lợi nhuận của nhà cung cấp
            const providerId = product.provider_id.toString()
            providerProfits[providerId] = (providerProfits[providerId] || 0) + item.total_profit_for_pdp
          }
        }

        // Cập nhật giỏ hàng trong cơ sở dữ liệu
        await databaseService.purchases.findOneAndUpdate(
          { _id: existingCart._id },
          {
            $set: {
              purchase_items: existingCart.purchase_items,
              purchase_total_price_original: existingCart.purchase_total_price_original,
              purchase_total_price: existingCart.purchase_total_price,
              purchase_total_profit_for_seller: existingCart.purchase_total_profit_for_seller,
              purchase_total_profit_for_admin: existingCart.purchase_total_profit_for_admin,
              purchase_total_point: existingCart.purchase_total_point,
              purchase_total_price_points: existingCart.purchase_total_price_points,
              provider_profits: providerProfits
            },
            $currentDate: {
              updated_at: true
            }
          },
          {
            session,
            returnDocument: 'after'
          }
        )

        // Commit transaction
        await session.commitTransaction()

        // Trả về giỏ hàng đã cập nhật
        return existingCart
      } else {
        // Chưa có giỏ hàng, tạo mới giỏ hàng
        const cart: PurchaseType = {
          _id: new ObjectId(), // Khởi tạo một ObjectId mới cho cart
          code_purchase: '',
          seller_id: new ObjectId(user_id),
          purchase_items: [],
          purchase_total_price_original: 0,
          purchase_total_price: 0,
          provider_profits: {},
          purchase_total_profit_for_seller: 0,
          purchase_total_profit_for_admin: 0,
          purchase_total_price_points: 0,
          purchase_total_point: 0,
          status: StatusPurchase.IN_CART, // Trạng thái giỏ hàng
          created_at: new Date(),
          updated_at: new Date()
        }

        for (const item of purchase_items) {
          const { product_id, buy_count, store_id } = item
          const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) }, { session })

          if (!product) {
            throw new Error(`Product ${product_id} not found`)
          }

          let store = null
          let storeName = ''
          if (product.store && product.store.id && product.store.id.toString() === store_id) {
            store = product.store
            storeName = product.store.name
          } else if (
            product.store_company &&
            product.store_company.id &&
            product.store_company.id.toString() === store_id
          ) {
            store = product.store_company
            storeName = product.store_company.name
          }

          if (!store) {
            throw new Error(`Store ${store_id} not found for product ${product_id}`)
          }

          if (store.stock === null || store.stock === undefined) {
            throw new Error(`Stock information is missing for store ${store_id}`)
          }

          item.store_name = storeName
          item.initial_stock = store.stock
          item.total_price_original = product.price_original * buy_count
          item.total_price = Number(product.price_for_customer) * buy_count
          item.total_profit_for_seller = Number(product.profit_for_seller) * buy_count
          item.total_profit_for_pdp = Number(product.price_original) * buy_count
          item.total_profit_for_admin = Number(product.profit_for_admin) * buy_count
          item.total_price_points = Number(product.price_points) * buy_count
          item.total_point = Number(product.point) * buy_count
          item.product_images = product.images?.[0] ? [product.images[0]] : []
          item.product_name = product.name
          item.product_price_for_customer = Number(product.price_for_customer)
          item.provider_id = product.provider_id
          item.code = product.code

          cart.purchase_items.push(item)
          cart.purchase_total_price_original += item.total_price_original
          cart.purchase_total_price += item.total_price
          cart.purchase_total_profit_for_seller += item.total_profit_for_seller
          cart.purchase_total_profit_for_admin += item.total_profit_for_admin
          cart.purchase_total_price_points += item.total_price_points
          cart.purchase_total_point += item.total_point

          // Cập nhật lợi nhuận của nhà cung cấp
          const providerId = product.provider_id.toString()
          cart.provider_profits[providerId] = (cart.provider_profits[providerId] || 0) + item.total_profit_for_pdp
        }

        // Insert giỏ hàng mới vào cơ sở dữ liệu
        await databaseService.purchases.insertOne(new Purchase(cart), { session })

        // Commit transaction
        await session.commitTransaction()

        // Trả về giỏ hàng mới đã tạo
        return cart
      }
    } catch (error) {
      // Rollback transaction
      await session.abortTransaction()
      throw error
    } finally {
      // Kết thúc session
      await session.endSession()
    }
  }

  async changeStatusPurchase({
    purchase_id,
    user_id,
    status
  }: {
    purchase_id: string
    user_id: string
    status: StatusPurchase
  }) {
    // 1. Kiểm tra quyền người duyệt
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new Error('Bạn không có quyền thay đổi trạng thái đơn hàng')
    }

    // 2. Lấy thông tin đơn hàng
    const purchase = await databaseService.purchases.findOne({ _id: new ObjectId(purchase_id) })
    if (!purchase) {
      throw new Error('Không tìm thấy đơn hàng')
    }

    if (purchase.status === StatusPurchase.DELIVERED && status !== StatusPurchase.DELIVERED) {
      throw new Error('Đơn hàng đã được giao thành công, không thể cập nhật trạng thái khác')
    }

    // 3. Kiểm tra nếu trạng thái hiện tại là trạng thái cần cập nhật thì không cho phép thay đổi
    if (purchase.status === status) {
      throw new Error('Trạng thái đơn hàng đã là trạng thái này, không thể cập nhật lại')
    }

    // 4. Cập nhật trạng thái đơn hàng
    const updatedPurchase = await databaseService.purchases.findOneAndUpdate(
      { _id: new ObjectId(purchase_id) },
      {
        $set: {
          user_handle_id: new ObjectId(user_id),
          status,
          updated_at: new Date()
        }
      },
      {
        returnDocument: 'after'
      }
    )

    if (!updatedPurchase) {
      throw new Error('Không tìm thấy đơn hàng sau khi cập nhật')
    }

    // 5. Xử lý hoàn trả số lượng trong kho (nếu trạng thái là "Hủy")
    if (status === StatusPurchase.CANCELLED) {
      const session: ClientSession = await databaseService.startSession()
      try {
        await databaseService.withTransaction(async (session) => {
          for (const item of updatedPurchase.purchase_items) {
            const product = await databaseService.products.findOne({ _id: new ObjectId(item.product_id) }, { session })

            if (!product) {
              throw new Error(`Không tìm thấy sản phẩm ${item.product_id}`)
            }

            let store = null
            if (product.store && product.store.id && product.store.id.toString() === item.store_id) {
              store = product.store
            } else if (
              product.store_company &&
              product.store_company.id &&
              product.store_company.id.toString() === item.store_id
            ) {
              store = product.store_company
            }

            if (!store) {
              throw new Error(`Không tìm thấy thông tin cửa hàng cho sản phẩm ${item.product_id}`)
            }

            if (store.stock === null || store.stock === undefined) {
              throw new Error(`Thiếu thông tin số lượng tồn kho cho cửa hàng ${item.store_id}`)
            }

            // Update stock
            const updateField =
              product.store && product.store.id && product.store.id.toString() === item.store_id
                ? 'store.stock'
                : 'store_company.stock'
            await databaseService.products.updateOne(
              { _id: new ObjectId(item.product_id) },
              { $inc: { [updateField]: item.buy_count } },
              { session }
            )
          }
        }, session)
      } finally {
        await session.endSession()
      }
    }

    // 6. Xử lý doanh thu khi đơn hàng được giao thành công
    if (status === StatusPurchase.DELIVERED) {
      const session: ClientSession = await databaseService.startSession()
      try {
        await databaseService.withTransaction(async (session) => {
          // Tạo và lưu thông tin doanh thu cho người bán hàng (seller)
          const seller = await databaseService.users.findOne({ _id: updatedPurchase.seller_id }, { session })
          if (!seller) {
            throw new Error(`Seller with ID ${updatedPurchase.seller_id} not found`)
          }

          const isSellerUpgrade = await databaseService.userUpgrades.findOne({
            user_id: updatedPurchase.seller_id,
            status: StatusUpgrade.Accept,
            in_use: true
          })
          const sellerRevenue: RevenuesAffiliateType = {
            user_id: updatedPurchase.seller_id,
            roles: seller.roles, // Sử dụng roles của seller
            purchase_id: updatedPurchase._id,
            point: isSellerUpgrade ? updatedPurchase.purchase_total_point : 0,
            money: updatedPurchase.purchase_total_profit_for_seller,
            created_at: new Date(),
            updated_at: new Date()
          }
          const sellerRevenueResult = await databaseService.revenuesAffiliate.insertOne(
            new RevenuesAffiliate(sellerRevenue),
            { session }
          )

          // Cập nhật tổng doanh thu cho người bán hàng (seller) trong bảng TotalRevenues
          const sellerTotalRevenue = await databaseService.totalRevenues.findOne(
            { user_id: updatedPurchase.seller_id },
            { session }
          )
          if (sellerTotalRevenue) {
            await databaseService.totalRevenues.updateOne(
              { user_id: updatedPurchase.seller_id },
              {
                $inc: {
                  point: updatedPurchase.purchase_total_point,
                  money: updatedPurchase.purchase_total_profit_for_seller
                },
                $set: { updated_at: new Date() },
                $push: { revenue_affiliate_id: sellerRevenueResult.insertedId }
              },
              { session }
            )
          } else {
            const newSellerTotalRevenue: TotalRevenuesType = {
              user_id: updatedPurchase.seller_id,
              roles: seller.roles, // Sử dụng roles của seller
              revenue_invite_id: undefined, // Assuming this is not being updated here
              revenue_affiliate_id: [sellerRevenueResult.insertedId],
              point: updatedPurchase.purchase_total_point,
              rank: '', // Assuming rank needs to be calculated and set elsewhere
              money: updatedPurchase.purchase_total_profit_for_seller,
              created_at: new Date(),
              updated_at: new Date()
            }
            await databaseService.totalRevenues.insertOne(new TotalRevenues(newSellerTotalRevenue), { session })
          }

          // Tạo và lưu thông tin doanh thu cho người quản lý đơn hàng (admin)
          if (updatedPurchase.user_handle_id) {
            const admin = await databaseService.users.findOne({ _id: updatedPurchase.user_handle_id }, { session })
            if (!admin) {
              throw new Error(`Admin with ID ${updatedPurchase.user_handle_id} not found`)
            }
            const adminRevenue: RevenuesAffiliateType = {
              user_id: updatedPurchase.user_handle_id,
              roles: admin.roles, // Sử dụng roles của admin
              purchase_id: updatedPurchase._id,
              money: updatedPurchase.purchase_total_profit_for_admin,
              created_at: new Date(),
              updated_at: new Date()
            }
            const adminRevenueResult = await databaseService.revenuesAffiliate.insertOne(
              new RevenuesAffiliate(adminRevenue),
              { session }
            )

            // Cập nhật tổng doanh thu cho người quản lý đơn hàng (admin) trong bảng TotalRevenues
            const adminTotalRevenue = await databaseService.totalRevenues.findOne(
              { user_id: updatedPurchase.user_handle_id },
              { session }
            )
            if (adminTotalRevenue) {
              await databaseService.totalRevenues.updateOne(
                { user_id: updatedPurchase.user_handle_id },
                {
                  $inc: {
                    // point: updatedPurchase.purchase_total_point,
                    money: updatedPurchase.purchase_total_profit_for_admin
                  },
                  $set: { updated_at: new Date() },
                  $push: { revenue_affiliate_id: adminRevenueResult.insertedId }
                },
                { session }
              )
            } else {
              const newAdminTotalRevenue: TotalRevenuesType = {
                user_id: updatedPurchase.user_handle_id,
                roles: admin.roles, // Sử dụng roles của admin
                revenue_invite_id: undefined, // Assuming this is not being updated here
                revenue_affiliate_id: [adminRevenueResult.insertedId],
                //point: updatedPurchase.purchase_total_point,
                rank: '', // Assuming rank needs to be calculated and set elsewhere
                money: updatedPurchase.purchase_total_profit_for_admin,
                created_at: new Date(),
                updated_at: new Date()
              }
              await databaseService.totalRevenues.insertOne(new TotalRevenues(newAdminTotalRevenue), { session })
            }
          }

          // Tạo và lưu thông tin doanh thu cho từng nhà cung cấp (providers)
          for (const providerId of Object.keys(updatedPurchase.provider_profits)) {
            const providerProfit = updatedPurchase.provider_profits[providerId]
            const provider = await databaseService.users.findOne({ _id: new ObjectId(providerId) }, { session })
            if (!provider) {
              throw new Error(`Provider with ID ${providerId} not found`)
            }
            const providerRevenue: RevenuesAffiliateType = {
              user_id: new ObjectId(providerId),
              roles: provider.roles, // Sử dụng roles của provider
              purchase_id: updatedPurchase._id,
              money: providerProfit,
              created_at: new Date(),
              updated_at: new Date()
            }
            const providerRevenueResult = await databaseService.revenuesAffiliate.insertOne(
              new RevenuesAffiliate(providerRevenue),
              { session }
            )

            // Cập nhật tổng doanh thu cho từng nhà cung cấp (providers) trong bảng TotalRevenues
            const providerTotalRevenue = await databaseService.totalRevenues.findOne(
              { user_id: new ObjectId(providerId) },
              { session }
            )
            if (providerTotalRevenue) {
              await databaseService.totalRevenues.updateOne(
                { user_id: new ObjectId(providerId) },
                {
                  $inc: {
                    //point: updatedPurchase.purchase_total_point,
                    money: providerProfit
                  },
                  $set: { updated_at: new Date() },
                  $push: { revenue_affiliate_id: providerRevenueResult.insertedId }
                },
                { session }
              )
            } else {
              const newProviderTotalRevenue: TotalRevenuesType = {
                user_id: new ObjectId(providerId),
                roles: provider.roles, // Sử dụng roles của provider
                revenue_invite_id: undefined, // Assuming this is not being updated here
                revenue_affiliate_id: [providerRevenueResult.insertedId],
                //point: updatedPurchase.purchase_total_point,
                rank: '', // Assuming rank needs to be calculated and set elsewhere
                money: providerProfit,
                created_at: new Date(),
                updated_at: new Date()
              }
              await databaseService.totalRevenues.insertOne(new TotalRevenues(newProviderTotalRevenue), { session })
            }
          }
          const fixedAdminId = new ObjectId('669671928edf75216c0f6e17') // Thay thế bằng ID admin cố định
          const fixedAdminRevenue: RevenuesAffiliateType = {
            user_id: fixedAdminId,
            roles: 0,
            purchase_id: updatedPurchase._id,
            money: updatedPurchase.purchase_total_price, // Sử dụng toàn bộ số tiền đơn hàng
            created_at: new Date(),
            updated_at: new Date()
          }
          const fixedAdminRevenueResult = await databaseService.revenuesAffiliate.insertOne(
            new RevenuesAffiliate(fixedAdminRevenue),
            { session }
          )

          // Cập nhật tổng doanh thu cho tài khoản admin cố định trong bảng TotalRevenues
          const fixedAdminTotalRevenue = await databaseService.totalRevenues.findOne(
            { user_id: fixedAdminId },
            { session }
          )
          if (fixedAdminTotalRevenue) {
            await databaseService.totalRevenues.updateOne(
              { user_id: fixedAdminId },
              {
                $inc: {
                  money: updatedPurchase.purchase_total_price // Cộng thêm số tiền của đơn hàng
                },
                $set: { updated_at: new Date() },
                $push: { revenue_affiliate_id: fixedAdminRevenueResult.insertedId }
              },
              { session }
            )
          } else {
            const newFixedAdminTotalRevenue: TotalRevenuesType = {
              user_id: fixedAdminId,
              roles: 0,
              revenue_invite_id: undefined, // Assuming this is not being updated here
              revenue_affiliate_id: [fixedAdminRevenueResult.insertedId],
              point: 0, // Không cập nhật điểm cho admin
              rank: '', // Assuming rank needs to be calculated and set elsewhere
              money: updatedPurchase.purchase_total_price,
              created_at: new Date(),
              updated_at: new Date()
            }
            await databaseService.totalRevenues.insertOne(new TotalRevenues(newFixedAdminTotalRevenue), { session })
          }
          for (const item of updatedPurchase.purchase_items) {
            await databaseService.products.updateOne(
              { _id: new ObjectId(item.product_id) },
              { $inc: { sold: item.buy_count } },
              { session }
            )
          }
        }, session)
      } finally {
        await session.endSession()
      }
    }

    // 7. Trả về đối tượng đơn hàng đã cập nhật
    return updatedPurchase
  }

  async cancelOrder(user_id: string, purchase_id: string) {
    let session: ClientSession

    try {
      const purchase = await databaseService.purchases.findOneAndUpdate(
        { seller_id: new ObjectId(user_id), _id: new ObjectId(purchase_id), user_handle_id: new ObjectId(user_id) },
        { $set: { status: StatusPurchase.CANCELLED }, $currentDate: { updated_at: true } },
        { returnDocument: 'after' }
      )

      if (!purchase) {
        throw new Error('Không tìm thấy đơn hàng để hủy')
      }

      if (purchase.status === StatusPurchase.WAIT_FOR_CONFIRMATION) {
        throw new Error('Chỉ có thể hủy đơn hàng ở trạng thái đang chờ xác nhận')
      }

      // Bắt đầu giao dịch
      session = await databaseService.startSession()

      await session.withTransaction(async () => {
        // Cập nhật lại stock cho các sản phẩm trong đơn hàng
        for (const item of purchase.purchase_items) {
          const product = await databaseService.products.findOne({ _id: new ObjectId(item.product_id) }, { session })

          if (!product) {
            throw new Error(`Không tìm thấy sản phẩm ${item.product_id}`)
          }

          let store = null
          if (product.store && product.store.id && product.store.id.toString() === item.store_id) {
            store = product.store
          } else if (
            product.store_company &&
            product.store_company.id &&
            product.store_company.id.toString() === item.store_id
          ) {
            store = product.store_company
          }

          if (!store) {
            throw new Error(`Không tìm thấy cửa hàng ${item.store_id} cho sản phẩm ${item.product_id}`)
          }

          if (store.stock === null || store.stock === undefined) {
            throw new Error(`Thông tin về stock bị thiếu cho cửa hàng ${item.store_id}`)
          }

          // Cập nhật lại stock
          const updateField =
            product.store && product.store.id && product.store.id.toString() === item.store_id
              ? 'store.stock'
              : 'store_company.stock'
          await databaseService.products.updateOne(
            { _id: new ObjectId(item.product_id) },
            { $inc: { [updateField]: item.buy_count } },
            { session }
          )
        }

        // Thực hiện các logic hủy đơn hàng khác ở đây
      })

      return purchase
    } catch (error) {
      throw new Error('Không thể hủy đơn hàng')
    }
  }

  async getAllPurchaseOfSeller({
    user_id,
    limit,
    page,
    sort,
    status,
    date
  }: {
    user_id: string
    limit: number
    page: number
    sort: 'asc' | 'desc'
    status?: number
    date: 'latest' | 'oldest'
  }) {
    const sortOrder = sort === 'asc' ? 1 : -1
    const dateOrder = date === 'oldest' ? 1 : -1

    // Create the match condition, including status if provided
    const matchCondition: any = {
      seller_id: new ObjectId(user_id),
      status: { $ne: StatusPurchase.IN_CART }
    }
    if (status !== undefined) {
      matchCondition.status = status
    }

    const sortCondition =
      status === undefined ? { status: sortOrder, created_at: dateOrder } : { created_at: dateOrder }

    const purchases = await databaseService.purchases
      .aggregate([
        {
          $match: matchCondition
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

    const successfulProfitAggregation = await databaseService.purchases
      .aggregate([
        {
          $match: {
            seller_id: new ObjectId(user_id),
            status: 4
          }
        },
        {
          $group: {
            _id: null,
            total_successful_profit: { $sum: '$purchase_total_profit_for_seller' }
          }
        }
      ])
      .toArray()

    const total = await databaseService.purchases.countDocuments(matchCondition)
    const total_successful_profit =
      successfulProfitAggregation.length > 0 ? successfulProfitAggregation[0].total_successful_profit : 0

    return { purchases, total, total_successful_profit }
  }

  async getPurchasesOfSeller({
    seller_id,
    limit,
    page,
    status
  }: {
    seller_id: string
    limit: number
    page: number
    status?: number
  }) {
    const matchQuery: any = {
      seller_id: new ObjectId(seller_id),
      status: { $ne: StatusPurchase.IN_CART }
    }

    // Check if status is NaN and handle accordingly
    if (status !== undefined && status !== null && !Number.isNaN(status)) {
      matchQuery.status = status
    }

    const purchases = await databaseService.purchases
      .aggregate([
        {
          $match: matchQuery
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await databaseService.purchases.countDocuments(matchQuery)

    return { purchases, total }
  }

  async adminGetAllPurchases({ limit, page }: { limit: number; page: number }) {
    const matchQuery = {
      status: { $ne: StatusPurchase.IN_CART }
    }

    const purchases = await databaseService.purchases
      .aggregate([
        {
          $match: matchQuery
        },
        {
          $lookup: {
            from: 'users',
            localField: 'seller_id',
            foreignField: '_id',
            as: 'seller_info'
          }
        },
        {
          $unwind: '$seller_info'
        },
        {
          $project: {
            'seller_info.referrer_id': 0,
            'seller_info.email': 0,
            'seller_info.password': 0,
            'seller_info.address': 0,
            'seller_info.avatar': 0,
            'seller_info.phone': 0,
            'seller_info.date_of_birth': 0,
            'seller_info.aff_code': 0,
            'seller_info.parent_aff_code': 0,
            'seller_info.roles': 0,
            'seller_info.verify': 0,
            'seller_info.created_at': 0,
            'seller_info.updated_at': 0
          }
        },
        {
          $unwind: '$purchase_items'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'purchase_items.provider_id',
            foreignField: '_id',
            as: 'provider_info'
          }
        },
        {
          $unwind: {
            path: '$provider_info',
            preserveNullAndEmptyArrays: true // In case some items don't have provider info
          }
        },
        {
          $group: {
            _id: '$_id',
            code_purchase: { $first: '$code_purchase' },
            seller_id: { $first: '$seller_id' },
            user_handle_id: { $first: '$user_handle_id' },
            customer: { $first: '$customer' },
            payment_method: { $first: '$payment_method' },
            cost_bearer: { $first: '$cost_bearer' },
            shipping_fee: { $first: '$shipping_fee' },
            purchase_total_price_original: { $first: '$purchase_total_price_original' },
            purchase_total_price: { $first: '$purchase_total_price' },
            purchase_total_price_points: { $first: '$purchase_total_price_points' },
            purchase_total_profit_for_seller: { $first: '$purchase_total_profit_for_seller' },
            purchase_total_profit_for_admin: { $first: '$purchase_total_profit_for_admin' },
            purchase_total_point: { $first: '$purchase_total_point' },
            provider_profits: { $first: '$provider_profits' },
            status: { $first: '$status' },
            purchase_items: {
              $push: {
                product_id: '$purchase_items.product_id',
                code: '$purchase_items.code',
                buy_count: '$purchase_items.buy_count',
                store_id: '$purchase_items.store_id',
                store_name: '$purchase_items.store_name',
                initial_stock: '$purchase_items.initial_stock',
                total_price_original: '$purchase_items.total_price_original',
                total_price: '$purchase_items.total_price',
                total_price_points: '$purchase_items.total_price_points',
                total_profit_for_seller: '$purchase_items.total_profit_for_seller',
                total_profit_for_pdp: '$purchase_items.total_profit_for_pdp',
                total_profit_for_admin: '$purchase_items.total_profit_for_admin',
                total_point: '$purchase_items.total_point',
                product_images: '$purchase_items.product_images',
                product_name: '$purchase_items.product_name',
                product_price_for_customer: '$purchase_items.product_price_for_customer',
                provider_id: '$purchase_items.provider_id',
                provider_info: {
                  name: '$provider_info.name',
                  phone: '$provider_info.phone'
                }
              }
            },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' },
            seller_info: { $first: '$seller_info' }
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
    purchases.sort((a, b) => a.status - b.status)

    const total = await databaseService.purchases.countDocuments(matchQuery)

    return { purchases, total }
  }

  async providerGetAllPurchases({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const userObjectId = new ObjectId(user_id)

    const revenuesAffiliate = await databaseService.revenuesAffiliate
      .aggregate([
        {
          $match: {
            user_id: userObjectId
          }
        },
        {
          $lookup: {
            from: 'purchases',
            localField: 'purchase_id',
            foreignField: '_id',
            as: 'purchases'
          }
        },
        {
          $unwind: '$purchases'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'purchases.seller_id',
            foreignField: '_id',
            as: 'seller_info'
          }
        },
        {
          $unwind: '$seller_info'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'provider_info'
          }
        },
        {
          $unwind: '$provider_info'
        },
        {
          $addFields: {
            'purchases.purchase_items': {
              $filter: {
                input: '$purchases.purchase_items',
                as: 'item',
                cond: { $eq: ['$$item.provider_id', userObjectId] }
              }
            }
          }
        },
        {
          $project: {
            user_id: 1,
            code_purchase: '$purchases.code_purchase',
            provider_info: {
              name: 1,
              phone: 1
            },
            roles: 1,
            purchase_id: 1,
            money: 1,
            created_at: 1,
            updated_at: 1,
            purchase_items: {
              $map: {
                input: '$purchases.purchase_items',
                as: 'item',
                in: {
                  product_id: '$$item.product_id',
                  code: '$$item.code',
                  buy_count: '$$item.buy_count',
                  store_id: '$$item.store_id',
                  store_name: '$$item.store_name',
                  initial_stock: '$$item.initial_stock',
                  total_profit_for_pdp: '$$item.total_profit_for_pdp',
                  product_images: '$$item.product_images',
                  product_name: '$$item.product_name'
                }
              }
            },
            seller_info: {
              name: '$seller_info.name',
              phone: '$seller_info.phone'
            }
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

    const total = await databaseService.revenuesAffiliate
      .aggregate([
        {
          $match: {
            user_id: userObjectId
          }
        },
        {
          $lookup: {
            from: 'purchases',
            localField: 'purchase_id',
            foreignField: '_id',
            as: 'purchases'
          }
        },
        {
          $unwind: '$purchases'
        },
        {
          $addFields: {
            'purchases.purchase_items': {
              $filter: {
                input: '$purchases.purchase_items',
                as: 'item',
                cond: { $eq: ['$$item.provider_id', userObjectId] }
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 }
          }
        }
      ])
      .toArray()

    return { revenuesAffiliate, total: total[0] ? total[0].total : 0 }
  }

  async getCartOfSeller(user_id: string) {
    const purchases = await databaseService.purchases
      .find({
        seller_id: new ObjectId(user_id),
        status: StatusPurchase.IN_CART
      })
      .toArray()

    return purchases
  }

  async removeAllFromCart({ user_id, purchase_items }: { user_id: string; purchase_items: PurchaseItemType[] }) {
    const session = await databaseService.startSession()
    session.startTransaction()

    try {
      const existingCart = await databaseService.purchases.findOne(
        {
          seller_id: new ObjectId(user_id),
          status: StatusPurchase.IN_CART
        },
        { session }
      )

      if (!existingCart) {
        throw new Error('No active cart found for this user')
      }

      for (const item of purchase_items) {
        const { product_id } = item

        // Chuyển đổi product_id từ string sang ObjectId
        const productIdObj = new ObjectId(product_id)

        // Tìm vị trí của item trong cart
        const itemIndex = existingCart.purchase_items.findIndex(
          (cartItem) => cartItem.product_id.toString() === productIdObj.toString() // So sánh ObjectId với ObjectId
        )

        if (itemIndex === -1) {
          throw new Error(`Item not found in cart for product ${product_id}`)
        }

        // Xóa item khỏi cart
        existingCart.purchase_items.splice(itemIndex, 1)
      }

      // Tính lại tổng số trong cart

      existingCart.purchase_total_price_original = existingCart.purchase_items.reduce(
        (total, item) => total + (item.total_price_original || 0),
        0
      )
      existingCart.purchase_total_price = existingCart.purchase_items.reduce(
        (total, item) => total + (item.total_price || 0),
        0
      )
      existingCart.purchase_total_profit_for_seller = existingCart.purchase_items.reduce(
        (total, item) => total + (item.total_profit_for_seller || 0),
        0
      )

      existingCart.purchase_total_price_points = existingCart.purchase_items.reduce(
        (total, item) => total + (item.total_price_points || 0),
        0
      )

      existingCart.purchase_total_profit_for_admin = existingCart.purchase_items.reduce(
        (total, item) => total + (item.total_profit_for_admin || 0),
        0
      )
      existingCart.purchase_total_point = existingCart.purchase_items.reduce(
        (total, item) => total + (item.total_point || 0),
        0
      )

      // Cập nhật cart trong database
      await databaseService.purchases.findOneAndUpdate(
        { _id: existingCart._id },
        {
          $set: {
            purchase_items: existingCart.purchase_items,
            purchase_total_price_original: existingCart.purchase_total_price_original,
            purchase_total_price: existingCart.purchase_total_price,
            purchase_total_price_points: existingCart.purchase_total_price_points,
            purchase_total_profit_for_seller: existingCart.purchase_total_profit_for_seller,
            //purchase_total_profit_for_pdp: existingCart.purchase_total_profit_for_pdp,
            purchase_total_profit_for_admin: existingCart.purchase_total_profit_for_admin,
            purchase_total_point: existingCart.purchase_total_point
          },
          $currentDate: {
            updated_at: true
          }
        },
        {
          session,
          returnDocument: 'after'
        }
      )

      // Commit transaction
      await session.commitTransaction()

      // Trả về cart đã cập nhật
      return existingCart
    } catch (error) {
      // Rollback transaction
      await session.abortTransaction()
      throw error
    } finally {
      // Kết thúc session
      await session.endSession()
    }
  }

  async removeCart(user_id: string) {
    const cart = await databaseService.purchases.findOneAndDelete({
      seller_id: new ObjectId(user_id),
      status: StatusPurchase.IN_CART
    })

    if (!cart) {
      throw new Error('Cart not found')
    }

    return {
      message: 'Delete cart success'
    }
  }

  async getPurchase(user_id: string, purchase_id: string) {
    // Kiểm tra xem user_id và purchase_id có hợp lệ không
    if (!ObjectId.isValid(user_id)) {
      throw new Error('Invalid user_id')
    }
    if (!ObjectId.isValid(purchase_id)) {
      throw new Error('Invalid purchase_id')
    }

    // Tạo ObjectId từ các chuỗi đầu vào
    const sellerObjectId = new ObjectId(user_id)
    const purchaseObjectId = new ObjectId(purchase_id)

    // Tìm kiếm đơn hàng
    const purchase = await databaseService.purchases.findOne({
      seller_id: sellerObjectId,
      _id: purchaseObjectId
    })

    // Kiểm tra xem đơn hàng có tồn tại không
    if (!purchase) {
      throw new Error('Purchase not found')
    }

    return purchase
  }

  async adminGetPurchase(purchase_id: string) {
    // Kiểm tra xem user_id và purchase_id có hợp lệ không

    if (!ObjectId.isValid(purchase_id)) {
      throw new Error('Invalid purchase_id')
    }

    // Tạo ObjectId từ các chuỗi đầu vào
    const purchaseObjectId = new ObjectId(purchase_id)

    // Tìm kiếm đơn hàng
    const purchase = await databaseService.purchases.findOne({
      _id: purchaseObjectId
    })

    // Kiểm tra xem đơn hàng có tồn tại không
    if (!purchase) {
      throw new Error('Purchase not found')
    }

    return purchase
  }
}

export const sellerPurchaseService = new SellerPurchaseService()
