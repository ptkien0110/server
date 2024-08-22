import sellerAuthRouter from '~/routes/seller/seller-auth.routes'
import sellerPaymentRouter from '~/routes/seller/seller-payment.routes'
import sellerProductRouter from '~/routes/seller/seller-product.routes'
import sellerPurchaseRouter from '~/routes/seller/seller-purchase.routes'
import sellerReviewRouter from '~/routes/seller/seller-review.routes'
import sellerStatisticRouter from '~/routes/seller/seller-statistic.routes'

const sellerRoutes = {
  prefix: '/sellers/',
  routes: [
    {
      path: '',
      route: sellerAuthRouter
    },
    {
      path: 'purchases',
      route: sellerPurchaseRouter
    },
    {
      path: 'products',
      route: sellerProductRouter
    },
    {
      path: 'statistics',
      route: sellerStatisticRouter
    },
    {
      path: 'payments',
      route: sellerPaymentRouter
    },
    {
      path: 'reviews',
      route: sellerReviewRouter
    }
  ]
}

export default sellerRoutes
