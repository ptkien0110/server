import { ObjectId } from 'mongodb'
import { StatusPurchase } from '~/constants/enum'
import Review from '~/models/schemas/Review.schema'
import databaseService from '~/services/database.services'

class ReviewService {
  async addReview({
    user_id,
    product_id,
    purchase_id,
    rating,
    comment
  }: {
    user_id: string
    product_id: string
    purchase_id: string
    rating: number
    comment: string
  }) {
    const purchase = await databaseService.purchases.findOne({
      _id: new ObjectId(purchase_id),
      seller_id: new ObjectId(user_id),
      status: StatusPurchase.DELIVERED,
      purchase_items: {
        $elemMatch: { product_id: product_id }
      }
    })

    if (!purchase) {
      throw new Error('Product not found in this purchase or purchase not completed')
    }

    const existingReview = await databaseService.reviews.findOne({
      user_id: new ObjectId(user_id),
      product_id: new ObjectId(product_id),
      purchase_id: new ObjectId(purchase_id)
    })

    if (existingReview) {
      throw new Error('You have already reviewed this product')
    }

    const review = await databaseService.reviews.insertOne(
      new Review({
        _id: new ObjectId(),
        user_id: new ObjectId(user_id),
        product_id: new ObjectId(product_id),
        purchase_id: new ObjectId(purchase_id),
        rating,
        comment,
        created_at: new Date(),
        updated_at: new Date()
      })
    )
    const ratingData = await databaseService.reviews
      .aggregate([
        {
          $match: {
            product_id: new ObjectId(product_id)
          }
        },
        {
          $group: {
            _id: null,
            average_rating: { $avg: '$rating' },
            total_rating: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const average_rating = ratingData.length > 0 ? ratingData[0].average_rating : 0
    const total_rating = ratingData.length > 0 ? ratingData[0].total_rating : 0

    await databaseService.products.updateOne(
      { _id: new ObjectId(product_id) },
      { $set: { rating: average_rating, total_rating: total_rating } }
    )

    const data = await databaseService.reviews.findOne({ _id: new ObjectId(review.insertedId) })
    return data
  }

  async getReviews({
    product_id,
    page,
    limit,
    date
  }: {
    product_id: string
    page: number
    limit: number
    date: 'latest' | 'oldest'
  }) {
    const dateOrder = date === 'oldest' ? 1 : -1

    // Lấy danh sách đánh giá và tính toán average_rating
    const [reviewsData, averageRatingData] = await Promise.all([
      databaseService.reviews
        .aggregate([
          {
            $match: {
              product_id: new ObjectId(product_id)
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'seller_info'
            }
          },
          {
            $unwind: '$seller_info'
          },
          {
            $project: {
              seller_info: {
                referrer_id: 0,
                address: 0,
                email: 0,
                password: 0,
                date_of_birth: 0,
                aff_code: 0,
                parent_aff_code: 0,
                roles: 0,
                verify: 0,
                bank_info: 0,
                money: 0,
                created_at: 0,
                updated_at: 0
              }
            }
          },
          {
            $sort: { created_at: dateOrder }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),

      databaseService.reviews
        .aggregate([
          {
            $match: {
              product_id: new ObjectId(product_id)
            }
          },
          {
            $group: {
              _id: null,
              average_rating: { $avg: '$rating' }
            }
          }
        ])
        .toArray()
    ])

    const average_rating = averageRatingData.length > 0 ? averageRatingData[0].average_rating : 0
    const total = await databaseService.reviews.countDocuments({ product_id: new ObjectId(product_id) })

    return { reviewsData, average_rating, total }
  }
}

const reviewService = new ReviewService()
export default reviewService
