import mongoose from 'mongoose'

const userCollection = 'Users'

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: {
    type: String,
    unique: true,
  },
  age: Number,
  password: String,
  role: {
    type: String,
    enum: ['user', 'premium', 'admin'],
    default: 'user',
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carts',
  },
  documents: {
    type: [
      {
        name: String,
        reference: String,
      },
    ],
    default: [],
  },
  last_connection: String,
})

mongoose.set('strictQuery', false)
const UserModel = mongoose.model(userCollection, userSchema)

export default UserModel