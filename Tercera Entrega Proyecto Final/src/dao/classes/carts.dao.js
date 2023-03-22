import CartModel from "../models/cart.model.js";

export default class Carts {
    constructor() {}

    create = async () => {
        const cart = await CartModel.create({ products: [] })
        return cart
    }

    getByID = async (id) => {
        return await CartModel.findById(id).populate("products.product")
    }

    update = async (id, data) => {
        return await CartModel.updateOne({ _id: id }, data)
    }
}