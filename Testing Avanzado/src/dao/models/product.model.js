import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const productCollection = 'products';

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    lang: {
        type: String,
        enum: ['en', 'es'],
        default: 'es'
    },
    code: {
        type: String,
        unique: true,
    },
    price: Number,
    status: {
        type: Boolean,
        default: true,
    },
    stock: Number,
    category: [String],
    thumbnails: [String],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: "admin"
    }
});

productSchema.plugin(mongoosePaginate);

mongoose.set("strictQuery", false);
const productModel = mongoose.model(productCollection, productSchema);

export default productModel;