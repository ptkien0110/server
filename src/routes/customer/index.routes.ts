import { customerRouter } from '~/routes/customer/user-user.routes'

const customerRoutes = {
  prefix: '/',
  routes: [
    {
      path: 'customers',
      route: customerRouter
    }
  ]
}

export default customerRoutes
