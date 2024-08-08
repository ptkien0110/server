import commonAuthRouter from '~/routes/common/common-auth.routes'

const commonRoutes = {
  prefix: '/',
  routes: [
    {
      path: 'auth',
      route: commonAuthRouter
    }
  ]
}

export default commonRoutes
