import mongoose from "mongoose"

const cartCollection = 'Carts'

const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Products"
                },
                quantity: Number,
            },
        ],
        default: [],
    },
})

mongoose.set("strictQuery", false);
const CartModel = mongoose.model(cartCollection, cartSchema)

export default CartModel