import MessageDTO from "../dao/DTO/message.dto.js"

export default class MessagesRepository {
    constructor(dao) {
        this.dao = dao
    }

    createMessage = async (user, message) => {
        const newMessage = new MessageDTO({user, message})
        this.dao.create(newMessage.user, newMessage.message)
    }
}