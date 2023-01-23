import mongoose from "mongoose";

const productCollection = 'products'

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    code: {
        type: String,
        unique: true
    },
    price: Number,
    status: {
        type: Boolean,
        default: true
    },
    stock: Number,
    category: [String],
    thumbnails: [String]
})

mongoose.set("strictQuery", false);
const productModel = mongoose.model(productCollection, productSchema)

export default productModel