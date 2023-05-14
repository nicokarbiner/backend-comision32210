import TicketModel from "../models/ticket.model.js"

export default class Ticket {
    constructor() { }

    create = async data => await TicketModel.create(data)
}