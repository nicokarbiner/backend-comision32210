import ProductsRepository from "./products.repository.js"
import UsersRepository from "./users.repository.js"
import CartRepository from "./carts.repository.js"
import MessagesRepository from "./messages.repository.js"
import TicketsRepository from "./tickets.repository.js"

import Product from "../dao/classes/products.dao.js"
import User from "../dao/classes/users.dao.js"
import Cart from "../dao/classes/carts.dao.js"
import Message from "../dao/classes/messages.dao.js"
import Ticket from "../dao/classes/tickets.dao.js"

export const productsService = new ProductsRepository(new Product())
export const usersService = new UsersRepository(new User())
export const cartsService = new CartRepository(new Cart())
export const messagesService = new MessagesRepository(new Message())
export const ticketsService = new TicketsRepository(new Ticket())