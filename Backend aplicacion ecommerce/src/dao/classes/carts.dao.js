import CartModel from "../models/cart.model.js";

export default class Cart {
    constructor() { }

    create = async () => {
        const cart = await CartModel.create({ products: [] })
        return cart
    }

    getByID = async id => {
        return await CartModel.findById(id).populate({
            path: 'products.product',
            model: 'Products',
        })
    }

    update = async (id, data) => {
        return await CartModel.updateOne(
            { _id: id },
            { $set: { products: data.products, quantity: data.quantity } }
        )
    }
}