import CartDTO from "../dao/DTO/cart.dto.js"
import CustomError from "../services/errors/CustomError.js"
import EErrors from "../services/errors/enums.js"
import {
  generateNullError,
  generatePurchaseError,
} from "../services/errors/info.js"
import { productsService, ticketsService } from "./index.js"
import mercadopago from 'mercadopago'
import config from '../config/config.js'
import Mail from '../services/mail.js'
const { FRONTEND_BASE_URL, BASE_URL } = config

export default class CartRepository {
  constructor(dao) {
    this.dao = dao
    this.mail = new Mail()
  }

  createCart = async () => {
    return await this.dao.create()
  }

  getCart = async (id) => {
    return await this.dao.getByID(id)
  }

  updateCart = async (id, data) => {
    await this.dao.update(id, data)
    const cart = { id, products: data.products }
    return new CartDTO(cart)
  }

  addProductToCart = async (user, cart, product, quantity) => {
    if (!cart) {
      CustomError.createError({
        name: "Cart error",
        cause: generateNullError("Cart"),
        message: "Error trying to find cart",
        code: EErrors.NULL_ERROR,
      })
    }

    if (!product) {
      CustomError.createError({
        name: "Product error",
        cause: generateNullError("Product"),
        message: "Error trying to find product",
        code: EErrors.NULL_ERROR,
      })
    }

    const userID = user.id.toString()
    const owner = product.owner?.toString()

    if (user.role === "premium" && owner === userID) CustomError.createError({
      name: "Authorization error",
      cause: generateAuthorizationError(),
      message: "You can't add your own product to your cart.",
      code: EErrors.AUTHORIZATION_ERROR
    })

    const productIndex = cart.products.findIndex((p) =>
      p.product?.equals(product._id)
    );
    if (productIndex === -1) {
      cart.products.push({ product: product._id, quantity: 1 });
      await this.updateCart(cart.id, cart);
    } else {
      cart.products[productIndex].quantity++;
      await this.updateCart(cart.id, cart);
    }
    return new CartDTO(cart);
  };

  prepareCheckout = async (cid, purchaser) => {
    const cart = await this.getCart(cid)
    if (cart.products.length === 0)
      CustomError.createError({
        name: 'Purchase error',
        cause: generatePurchaseError(cid),
        message: 'Error trying to purchase. Cart cannot be empty.',
        code: EErrors.PURCHASE_ERROR,
      })

    const cartProducts = await Promise.all(
      cart.products.map(async product => {
        const newObj = await productsService.getProduct(
          product.product || product._id
        )
        newObj.quantity = product.quantity
        return newObj
      })
    )

    const outOfStock = cartProducts
      .filter(p => p.stock < p.quantity)
      .map(p => ({ id: p._id, title: p.title, author: p.author }))
    const available = cartProducts.filter(p => p.stock >= p.quantity)

    if (outOfStock.length > 0) {
      const products = available.map(p => ({ product: p._id, quantity: p.quantity }))
      await this.updateCart(cid, { products })
      return { outOfStock }
    }

    const notificationURL = `${BASE_URL}/api/purchases/${cid}/finish_checkout?purchaser=${purchaser}`

    let preference = {
      items: [],
      back_urls: {
        "success": `${FRONTEND_BASE_URL}/checkout/success`,
        "failure": `${FRONTEND_BASE_URL}/checkout/failure`,
        "pending": `${FRONTEND_BASE_URL}/checkout/pending`
      },
      notification_url: notificationURL,
      auto_return: 'approved',
      statement_descriptor: 'CriptoStore'
    }

    available.forEach(prod => {
      preference.items.push({
        title: prod.title,
        unit_price: prod.price,
        quantity: prod.quantity,
        currency_id: 'ARS'
      })
    })

    const response = await mercadopago.preferences.create(preference)
    return { outOfStock, available, preferenceId: response.body.id }
  }

  finishCheckout = async (cid, paymentData, purchaser) => {
    const amount = paymentData.transaction_amount
    const payment_id = paymentData.id
    const status = paymentData.status

    if (status === 'approved') {
      const ticket = (await ticketsService.createTicket({ amount, purchaser, payment_id })).toObject()
      const cart = await this.getCart(cid)
      const products = cart.products.map(product => ({ id: product.product._id.toString(), quantity: product.quantity }))
      await Promise.all(
        products.map(async product => await productsService.updateStock(product.id, product.quantity))
      )
      await this.updateCart(cid, { products: [] })
      return ticket
    }
  }

  purchase = async (cid, purchaser) => {
    const cart = await this.getCart(cid);
    if (cart.products.length === 0)
      CustomError.createError({
        name: "Purchase error",
        cause: generatePurchaseError(cid),
        message: "Error trying to purchase. Cart cannot be empty.",
        code: EErrors.PURCHASE_ERROR,
      })

    const cartProducts = await Promise.all(
      cart.products.map(async (product) => {
        const newObj = await productsService.getProduct(
          product.product || product._id
        );
        newObj.quantity = product.quantity
        return newObj
      })
    )

    const outOfStock = cartProducts
      .filter(p => p.stock < p.quantity)
      .map(p => p._id)
    const available = cartProducts.filter(p => p.stock >= p.quantity)
    const amount = available.reduce((acc, product) => acc + product.price * product.quantity, 0)

    if (outOfStock.length > 0) {
      const products = available.map(p => ({ product: p._id, quantity: p.quantity }))
      await this.updateCart(cid, { products })
      return { outOfStock }
    }

    const ticket = (await ticketsService.createTicket({ amount, purchaser })).toObject()
    const products = cart.products.map(product => ({ id: product.product._id.toString(), quantity: product.quantity }))
    await Promise.all(
      products.map(async product => await productsService.updateStock(product.id, product.quantity))
    )
    await this.updateCart(cid, { products: [] })

    return { outOfStock, ticket }
  }

  sendPurchaseMail = async (products, amount, payment_id, email) => {
    const html = `<h1>¡Gracias por tu compra!</h1>
      <ul>Te compartimos los detalles del pedido:</ul>
      ${products.map(p => `<li><b>${p.title}</b> x${p.quantity}</li>`)}
      <p><b>Total:</b> $${amount}</p>
      <p><b>ID de la compra:</b> ${payment_id}</p>
      <br>
      <p>¡Saludos!</p>`

    return await this.mail.send(email, 'Compra realizada', html)
  }
}