import ProductsRepository from "./products.repository.js";
import UsersRepository from "./users.repository.js";
import CartRepository from "./carts.repository.js";
import MessagesRepository from "./messages.repository.js";
import TicketsRepository from "./tickets.repository.js";

import Products from "../dao/classes/products.dao.js";
import Users from "../dao/classes/users.dao.js";
import Carts from "../dao/classes/carts.dao.js";
import Messages from "../dao/classes/messages.dao.js";
import Tickets from "../dao/classes/tickets.dao.js";

export const productsService = new ProductsRepository(new Products)
export const usersService = new UsersRepository(new Users)
export const cartsService = new CartRepository(new Carts)
export const messagesService = new MessagesRepository(new Messages)
export const ticketsService = new TicketsRepository(new Tickets)