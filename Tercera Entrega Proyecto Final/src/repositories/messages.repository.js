export default class MessagesRepository {
    constructor(dao) {
        this.dao = dao
    }

    createMessage = async (user, message) => this.dao.create(user, message)
}