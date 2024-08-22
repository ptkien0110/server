import { ObjectId } from 'mongodb'

interface ReviewType {
  _id: ObjectId
  user_id: ObjectId
  product_id: ObjectId
  purchase_id: ObjectId
  rating: number
  comment?: string
  created_at?: Date
  updated_at?: Date
}

export default class Review {
  _id: ObjectId
  user_id: ObjectId
  product_id: ObjectId
  purchase_id: ObjectId
  rating: number
  comment?: string
  created_at?: Date
  updated_at?: Date
  constructor(review: ReviewType) {
    this._id = review._id
    this.user_id = review.user_id
    this.product_id = review.product_id
    this.purchase_id = review.purchase_id
    this.rating = this.validateRating(review.rating)
    this.comment = review.comment || ''
    this.created_at = review.created_at || new Date()
    this.updated_at = review.updated_at || new Date()
  }

  private validateRating(rating: number): number {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }
    return rating
  }
}
