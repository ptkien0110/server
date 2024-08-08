import adminAccountRouter from '~/routes/admin/admin-account.routes'
import adminCategoryRouter from '~/routes/admin/admin-category.routes'
import adminPaymentRouter from '~/routes/admin/admin-payment.routes'
import adminProductRouter from '~/routes/admin/admin-product.routes'
import adminPurchaseRouter from '~/routes/admin/admin-purchase.routes'
import adminSellerRouter from '~/routes/admin/admin-seller.routes'
import adminStatisticRouter from '~/routes/admin/admin-statistic.routes'

const adminRoutes = {
  prefix: '/admin/',
  routes: [
    {
      path: 'categories',
      route: adminCategoryRouter
    },
    {
      path: 'products',
      route: adminProductRouter
    },
    {
      path: 'sellers',
      route: adminSellerRouter
    },
    {
      path: 'accounts',
      route: adminAccountRouter
    },
    {
      path: 'purchases',
      route: adminPurchaseRouter
    },
    {
      path: 'statistics',
      route: adminStatisticRouter
    },
    {
      path: 'payments',
      route: adminPaymentRouter
    }
  ]
}

export default adminRoutes
