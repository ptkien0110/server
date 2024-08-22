import customerAuthRouter from '~/routes/customer/customer-auth.routes'
import customerProductsRouter from '~/routes/customer/customer-product.routes'

const customerRoutes = {
  prefix: '/customers/',
  routes: [
    {
      path: 'auth',
      route: customerAuthRouter
    },
    {
      path: 'products',
      route: customerProductsRouter
    }
  ]
}

export default customerRoutes
