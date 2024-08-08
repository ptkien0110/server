import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Category from '~/models/schemas/Category.schema'
import { CategoryStatus } from '~/constants/enum'

class CategoryService {
  async createCategory(name: string) {
    const result = await databaseService.categories.insertOne(
      new Category({
        name
      })
    )
    const cate = await databaseService.categories.findOne({ _id: result.insertedId })
    return cate
  }

  async getCategories() {
    const categories = await databaseService.categories.find({}).toArray()
    return categories
  }

  async getCategory(category_id: string) {
    const category = await databaseService.categories
      .find({
        _id: new ObjectId(category_id)
      })
      .toArray()

    return category[0]
  }

  async updateCategory(category_id: string, new_name: string) {
    const category = await databaseService.categories.findOneAndUpdate(
      { _id: new ObjectId(category_id) },
      { $set: { name: new_name } },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return category
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
