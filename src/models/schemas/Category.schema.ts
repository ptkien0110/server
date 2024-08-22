import { ObjectId } from 'mongodb'
import { CategoryStatus } from '~/constants/enum'

interface CategoryType {
  _id?: ObjectId
  name: string
  image: string
  status?: CategoryStatus
}

export default class Category {
  _id?: ObjectId
  name: string
  image: string
  status?: CategoryStatus
  constructor({ _id, name, image, status }: CategoryType) {
    this._id = _id
    this.name = name
    this.image = image
    this.status = status || CategoryStatus.Visible
  }
}
