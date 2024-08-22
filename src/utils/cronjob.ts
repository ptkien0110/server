import cron from 'node-cron'
import { ObjectId } from 'mongodb'
import { StatusUpgrade } from '~/constants/enum'
import databaseService from '~/services/database.services'

// Hàm cập nhật status khi hết hạn
async function updateExpiredStatus() {
  const currentDate = new Date()
  // Tìm tất cả các gói nâng cấp đã hết hạn
  const expiredUpgrades = await databaseService.userUpgrades
    .find({
      expiry_date: { $lt: currentDate }, // Gói nâng cấp đã hết hạn
      status: { $eq: StatusUpgrade.Accept }, // Chỉ cập nhật nếu chưa được đánh dấu là Expired
      in_use: { $eq: true }
    })
    .toArray()

  // Cập nhật status cho các gói nâng cấp đã hết hạn
  for (const upgrade of expiredUpgrades) {
    await databaseService.userUpgrades.updateOne(
      { _id: new ObjectId(upgrade._id) },
      { $set: { status: StatusUpgrade.Expired } }
    )
    console.log(`User ID ${upgrade.user_id} status updated to Expired.`) // Log ID của user đã được cập nhật
  }

  console.log(`Updated status for ${expiredUpgrades.length} expired upgrades.`)
}

// Hàm kiểm tra các gói nâng cấp sắp hết hạn
async function checkExpiringUpgrades(user_id: string) {
  const currentDate = new Date()

  // Kiểm tra gói nâng cấp của người dùng trong khoảng thời gian gần hết hạn (ví dụ là trong vòng 7 ngày tới)
  const expiringUpgrade = await databaseService.userUpgrades.findOne({
    user_id: new ObjectId(user_id),
    expiry_date: {
      $gt: currentDate,
      $lte: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 ngày tới
    },
    status: StatusUpgrade.Accept
  })

  if (expiringUpgrade) {
    // Hiển thị thông báo cho người dùng
    console.log(`Your upgrade (${expiringUpgrade._id}) is expiring soon.`)
  }
}

export { updateExpiredStatus, checkExpiringUpgrades }
