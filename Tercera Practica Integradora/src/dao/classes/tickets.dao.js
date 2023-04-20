import TicketModel from "../models/ticket.model.js";

export default class Tickets {
    constructor() {}

    create = async (data) => await TicketModel.create(data)
}