import { Request, Response } from 'express'
import databaseService from '~/services/database.services'
import statisticService from '~/services/statistic.services'

export const statisticRevenuesController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { startTime, endTime } = req.body
  const data = await statisticService.statisticRevenuesByTime(user_id, startTime, endTime)

  if (!data) {
    // Nếu không có doanh thu trong khoảng thời gian đã cho trả về message và totalMoney = 0
    return res.json({
      message: 'Không có doanh thu trong khoảng thời gian đã cho',
      data: { totalMoney: 0 } //
    })
  }
  return res.json({
    message: 'Statistic revenues success',
    data
  })
}

export const statisticRevenuesByAdminController = async (req: Request, res: Response) => {
  const { startTime, endTime, user_id } = req.body
  const data = await statisticService.statisticRevenuesByTime(user_id, startTime, endTime)

  if (!data) {
    // Nếu không có doanh thu trong khoảng thời gian đã cho trả về message và totalMoney = 0
    return res.json({
      message: 'Không có doanh thu trong khoảng thời gian đã cho',
      data: { totalMoney: 0 } //
    })
  }
  return res.json({
    message: 'Statistic revenues success',
    data
  })
}

export const adminStatisticRevenuesByProviderController = async (req: Request, res: Response) => {
  const { user_id } = req.body
  const { startTime, endTime } = req.body

  const data = await statisticService.adminStatisticRevenuesPDPByTime(user_id, startTime, endTime)

  if (!data) {
    // Nếu không có doanh thu trong khoảng thời gian đã cho trả về message và totalMoney = 0
    return res.json({
      message: 'Không có doanh thu trong khoảng thời gian đã cho',
      data: { totalMoney: 0 } //
    })
  }
  return res.json({
    message: 'Statistic revenues by provider success',
    data
  })
}

export const statisticRevenuesByProviderController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { startTime, endTime } = req.body

  const data = await statisticService.adminStatisticRevenuesPDPByTime(user_id, startTime, endTime)

  if (!data) {
    // Nếu không có doanh thu trong khoảng thời gian đã cho trả về message và totalMoney = 0
    return res.json({
      message: 'Không có doanh thu trong khoảng thời gian đã cho',
      data: { totalMoney: 0 } //
    })
  }
  return res.json({
    message: 'Statistic revenues success',
    data
  })
}

export const adminStatisticRevenuesBySellerController = async (req: Request, res: Response) => {
  const { user_id } = req.body
  const { startTime, endTime } = req.body

  const data = await statisticService.adminStatisticRevenuesSellerByTime(user_id, startTime, endTime)

  if (!data) {
    // Nếu không có doanh thu trong khoảng thời gian đã cho trả về message và totalMoney = 0
    return res.json({
      message: 'Không có doanh thu trong khoảng thời gian đã cho',
      data: { totalMoney: 0 } //
    })
  }
  return res.json({
    message: 'Statistic revenues by seller success',
    data
  })
}

export const adminStatisticRevenuesInviteController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { startTime, endTime } = req.body

  const data = await statisticService.adminStatisticRevenuesInvite(user_id, startTime, endTime)

  if (!data) {
    // Nếu không có doanh thu trong khoảng thời gian đã cho trả về message và totalMoney = 0
    return res.json({
      message: 'Không có doanh thu trong khoảng thời gian đã cho',
      data: { totalMoney: 0 } //
    })
  }
  return res.json({
    message: 'Statistic revenues invite success',
    data
  })
}

export const adminStatisticRevenuesInviteByAdminController = async (req: Request, res: Response) => {
  const { startTime, endTime, user_id } = req.body

  const data = await statisticService.adminStatisticRevenuesInvite(user_id, startTime, endTime)

  if (!data) {
    // Nếu không có doanh thu trong khoảng thời gian đã cho trả về message và totalMoney = 0
    return res.json({
      message: 'Không có doanh thu trong khoảng thời gian đã cho',
      data: { totalMoney: 0 } //
    })
  }
  return res.json({
    message: 'Statistic revenues invite admin success',
    data
  })
}

export const adminStatisticRevenuesInviteBySellerController = async (req: Request, res: Response) => {
  const { user_id } = req.body
  const { startTime, endTime } = req.body

  const data = await statisticService.adminStatisticRevenuesInvite(user_id, startTime, endTime)

  if (!data) {
    // Nếu không có doanh thu trong khoảng thời gian đã cho trả về message và totalMoney = 0
    return res.json({
      message: 'Không có doanh thu trong khoảng thời gian đã cho',
      data: { totalMoney: 0 } //
    })
  }
  return res.json({
    message: 'Statistic revenues invite by seller success',
    data
  })
}

export const countCustomerSellerPurchaseController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const data = await statisticService.countCustomerSellerPurchase(user_id)
  return res.json({
    message: 'Count customer, my seller and purchase success',
    data
  })
}

export const getNewsFeedController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const date = req.query.date === 'oldest' ? 'oldest' : 'latest'

  const data = await statisticService.newsFeed({ page, limit, date })
  return res.json({
    message: 'Get news feed success',
    data: {
      news_feed: data.result,
      limit,
      page,
      total_page: Math.ceil(data.total / limit),
      total_news: data.total
    }
  })
}
