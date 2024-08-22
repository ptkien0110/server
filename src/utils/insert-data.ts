import databaseService from '~/services/database.services'

export async function addRatingFieldToExistingProducts() {
  const products = await databaseService.products.find({}).toArray()

  for (const product of products) {
    // Tính toán rating trung bình và tổng số lượng đánh giá cho mỗi sản phẩm
    const ratingData = await databaseService.reviews
      .aggregate([
        {
          $match: {
            product_id: product._id
          }
        },
        {
          $group: {
            _id: null,
            average_rating: { $avg: '$rating' },
            total_rating: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const average_rating = ratingData.length > 0 ? ratingData[0].average_rating : 0
    const total_rating = ratingData.length > 0 ? ratingData[0].total_rating : 0

    // Cập nhật product với các trường rating và total_rating
    await databaseService.products.updateOne(
      { _id: product._id },
      { $set: { rating: average_rating, total_rating: total_rating } }
    )
  }
  console.log('Rating and total_rating fields have been added to all products.')
}

export async function updateProductRatings() {
  const products = await databaseService.products.find({ rating: { $exists: false } }).toArray()

  for (const product of products) {
    const averageRatingData = await databaseService.reviews
      .aggregate([
        {
          $match: {
            product_id: product._id
          }
        },
        {
          $group: {
            _id: null,
            average_rating: { $avg: '$rating' }
          }
        }
      ])
      .toArray()

    const average_rating = averageRatingData.length > 0 ? averageRatingData[0].average_rating : 0

    await databaseService.products.updateOne({ _id: product._id }, { $set: { rating: average_rating } })
  }

  console.log('Cập nhật rating cho các sản phẩm cũ hoàn tất.')
}

// // Chạy hàm cập nhật
// updateProductRatings()
//   .then(() => console.log('Rating update complete'))
//   .catch((error) => console.error('Error updating ratings:', error))
