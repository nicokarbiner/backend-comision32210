import TicketDTO from '../dao/DTO/ticket.dto.js'

export default class TicketsRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTicket = async (data) => {
        const ticket = new TicketDTO(data)
        return await this.dao.create(ticket)
    }
}