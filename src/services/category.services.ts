import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Category from '~/models/schemas/Category.schema'
import { CategoryStatus } from '~/constants/enum'
import { v2 as cloudinary } from 'cloudinary'

class CategoryService {
  async createCategory(name: string, fileData: any) {
    try {
      const result = await databaseService.categories.insertOne(
        new Category({
          name,
          image: fileData.path
        })
      )
      const cate = await databaseService.categories.findOne({ _id: result.insertedId })
      return cate
    } catch (error) {
      await cloudinary.api.delete_resources([fileData.filename])
      throw error
    }
  }

  async getCategories() {
    const categories = await databaseService.categories
      .find({
        status: CategoryStatus.Visible
      })
      .toArray()
    return categories
  }

  async getCategory(category_id: string) {
    const category = await databaseService.categories.findOne({
      _id: new ObjectId(category_id)
    })

    return category
  }

  async updateCategory({ category_id, name, fileData }: { category_id: string; name: string; fileData: any }) {
    try {
      // Tạo một đối tượng update để chứa các giá trị cần cập nhật
      const updateFields: any = {}

      if (name) {
        updateFields.name = name
      }

      if (fileData) {
        updateFields.image = fileData.path
      }

      // Nếu không có gì để cập nhật thì trả về lỗi
      if (Object.keys(updateFields).length === 0) {
        throw new Error('Không có trường nào để cập nhật')
      }

      const category = await databaseService.categories.findOneAndUpdate(
        { _id: new ObjectId(category_id) },
        { $set: updateFields },
        {
          upsert: true,
          returnDocument: 'after'
        }
      )

      return category
    } catch (error) {
      if (fileData) {
        await cloudinary.api.delete_resources([fileData.filename])
      }
      throw error
    }
  }

  async deleteCategory(category_id: string) {
    const result = await databaseService.categories.findOneAndUpdate(
      { _id: new ObjectId(category_id) },
      { $set: { status: CategoryStatus.Hidden } },
      { returnDocument: 'after' }
    )
    console.log(result)
    return result
  }
}

const categoryService = new CategoryService()
export default categoryService
