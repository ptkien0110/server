import commonAuthRouter from '~/routes/common/common-auth.routes'
import commonCategoryRouter from '~/routes/common/common-category.routes'
import commonProductsRouter from '~/routes/common/common-products.routes'
import commonProvidersRouter from '~/routes/common/common-provider.routes'
import commonSearchRouter from '~/routes/common/common-search.routes'

const commonRoutes = {
  prefix: '/',
  routes: [
    {
      path: 'auth',
      route: commonAuthRouter
    },
    {
      path: 'products',
      route: commonProductsRouter
    },
    {
      path: 'categories',
      route: commonCategoryRouter
    },
    {
      path: 'providers',
      route: commonProvidersRouter
    },
    {
      path: 'search',
      route: commonSearchRouter
    }
  ]
}

export default commonRoutes
