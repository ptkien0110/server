import express from 'express'
import { defaultErrorHandler } from '~/middlewares/error.middleware'
import commonRoutes from '~/routes/common/index.routes'
import databaseService from '~/services/database.services'
import cors, { CorsOptions } from 'cors'
import cookieParser from 'cookie-parser'
import adminRoutes from '~/routes/admin/index.routes'
import sellerRoutes from '~/routes/seller/index.routes'
import customerRoutes from '~/routes/customer/index.routes'
import providerRoutes from '~/routes/provider/index.routes'
import { updateExpiredStatus } from '~/utils/cronjob'
import rateLimit from 'express-rate-limit'
import cron from 'node-cron'
import { addRatingFieldToExistingProducts } from '~/utils/insert-data'
const app = express()
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false // Disable the `X-RateLimit-*` headers
//   // store: ... , // Use an external store for more precise rate limiting
// })
// app.use(limiter)
const port = 4000

databaseService.connect().then(() => {
  databaseService.indexNameProduct()
  databaseService.indexCodePurchaseProduct()
})


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
const corsOptions = {
  origin:[ 
  "http://localhost:3001", "http://localhost:3000","https://pdptikpii.netlify.app", "https://mybiztikpii.netlify.app","https://biztikpii.netlify.app"],  // Đổi theo frontend của bạn
  credentials: true, // Cho phép gửi cookie
};

app.use(cors(corsOptions))

cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running updateExpiredStatus job...')
    await updateExpiredStatus()
    console.log('updateExpiredStatus job completed.')
  } catch (error) {
    console.error('Error running updateExpiredStatus job:', error)
  }
})

const routes = [
  { ...customerRoutes },
  { ...commonRoutes },
  { ...adminRoutes },
  { ...sellerRoutes },
  { ...providerRoutes }
]

routes.forEach((item) => item.routes.forEach((route) => app.use(item.prefix + route.path, route.route)))

//addRatingFieldToExistingProducts()

app.use(defaultErrorHandler)
app.get("/", (req, res) => {
  res.send("Hello World! back end ");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
