import { ObjectId } from 'mongodb'
import { StatusCostBearer } from '~/constants/enum'

interface CostBearerType {
  _id?: ObjectId
  name: string
  status?: StatusCostBearer
}

export default class CostBearer {
  _id?: ObjectId
  name: string
  status?: StatusCostBearer
  constructor({ _id, name, status }: CostBearerType) {
    this._id = _id
    this.name = name
    this.status = status || StatusCostBearer.Visible
  }
}
