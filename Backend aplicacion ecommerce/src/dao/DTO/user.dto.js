import mongoose from "mongoose"

export default class UserDTO {
    constructor(user) {
        this.id = user.id || mongoose.Types.ObjectId(user._id) || null
        this.first_name = user.first_name
        this.last_name = user.last_name
        this.email = user.email
        this.age = user.age
        this.role = user.role
        this.cart = user.cart
        this.token = user.token
        this.documents = user.documents || []
        this.last_connection = user.last_connection
    }
}