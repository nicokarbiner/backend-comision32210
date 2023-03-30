import ProductModel from "../models/product.model.js";

export default class Products {
    constructor() {}

    get = async () => {
        return await ProductModel.find()
    }

    getPaginate = async(search, options) => {
        return await ProductModel.paginate(search, options)
    }

    getByID = async (id) => {
        return await ProductModel.findById(id).lean().exec()
    }

    create = async (data) => {
        return await ProductModel.create(data)
    }

    update = async (id, data) => {
        return await ProductModel.updateOne({ _id: id }, data)
    }

    delete =  async (id) => {
        return await ProductModel.deleteOne({ _id: id })
    }
}