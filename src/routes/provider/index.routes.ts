import providerAuthRouter from '~/routes/provider/provider-auth.routes'
import providerProductRouter from '~/routes/provider/provider-product.routes'
import providerPurchaseRouter from '~/routes/provider/provider-purchase.routes'
import providerStatisticRouter from '~/routes/provider/provider-statistic.routes'

const providerRoutes = {
  prefix: '/providers/',
  routes: [
    {
      path: 'auth',
      route: providerAuthRouter
    },
    {
      path: 'products',
      route: providerProductRouter
    },
    {
      path: 'purchases',
      route: providerPurchaseRouter
    },
    {
      path: 'statistics',
      route: providerStatisticRouter
    }
  ]
}

export default providerRoutes
