import { NextFunction, Request, Response } from 'express'
import reviewService from '~/services/review.services'

export const addReviewController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { product_id, purchase_id, rating, comment } = req.body
  const data = await reviewService.addReview({ user_id, product_id, purchase_id, rating, comment })
  return res.json({
    message: 'Add review success',
    data
  })
}

export const getReviewsForProductController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const date = req.query.date === 'oldest' ? 'oldest' : 'latest'
  const { product_id } = req.params
  const data = await reviewService.getReviews({ product_id, page, limit, date })
  return res.json({
    message: 'Get reviews success',
    data: {
      avg_rating: data.average_rating,
      reviews: data.reviewsData,
      limit,
      page,
      total_page: Math.ceil(data.total / limit),
      total_reviews: data.total
    }
  })
}
