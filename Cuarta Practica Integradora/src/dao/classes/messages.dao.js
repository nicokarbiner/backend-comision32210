import MessageModel from "../models/message.model.js"

export default class Messages {
    constructor () {}

    create = async (user, message) => {
        return await MessageModel.create({ user, message })
    }
}