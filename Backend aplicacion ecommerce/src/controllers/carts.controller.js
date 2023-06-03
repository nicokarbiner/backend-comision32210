import CartModel from '../dao/models/cart.model.js'
import ProductModel from '../dao/models/product.model.js'
import { productsService, cartsService } from '../repositories/index.js'
import CustomError from '../services/errors/CustomError.js'
import EErrors from '../services/errors/enums.js'
import {
    generateAuthorizationError,
    generateNullError,
} from '../services/errors/info.js'
import config from '../config/config.js'
import mercadopago from 'mercadopago'
const { MP_ACCESS_TOKEN } = config

// Crear carrito
export const createCart = async (req, res) => {
    try {
        const cart = await cartsService.createCart()
        res.json({ status: 'success', payload: cart })
    } catch (error) {
        req.logger.error(error.toString())
        res.json({ status: 'error', error })
    }
}

// Obtener productos de un carrito
export const getProducts = async (req, res) => {
    try {
        const cid = req.params.cid
        const userCart = req.user.cart.toString()

        if (cid !== userCart)
            CustomError.createError({
                name: 'Authorization error',
                cause: generateAuthorizationError(),
                message: 'You only have access to your own cart.',
                code: EErrors.AUTHORIZATION_ERROR,
            })
        const cart = await cartsService.getCart(cid)
        res.json({ status: 'success', payload: cart })
    } catch (error) {
        req.logger.error(error.toString())
        res.json({ status: 'error', error })
    }
}

// Agregar producto a un carrito
export const addProduct = async (req, res) => {
    try {
        const { cid, pid } = req.params
        const user = req.user
        const userCart = user.cart.toString()
        const quantity = req.body.quantity || 1

        if (cid !== userCart)
            CustomError.createError({
                name: 'Authorization error',
                cause: generateAuthorizationError(),
                message: 'You only have access to your own cart.',
                code: EErrors.AUTHORIZATION_ERROR,
            })

        const cart = await cartsService.getCart(cid)
        const product = await productsService.getProduct(pid)

        const updatedCart = await cartsService.addProductToCart(user, cart, product, quantity)
        res.json({ status: 'success', payload: updatedCart })
    } catch (error) {
        req.logger.error(error.toString())
        res.json({ status: 'error', error })
    }
}

// Actualizar carrito con un arreglo de productos
export const updateCart = async (req, res) => {
    try {
        const cid = req.params.cid
        const products = req.body
        const userCart = req.user.cart.toString()

        if (cid !== userCart)
            CustomError.createError({
                name: 'Authorization error',
                cause: generateAuthorizationError(),
                message: 'You only have access to your own cart.',
                code: EErrors.AUTHORIZATION_ERROR,
            })

        const prod = await Promise.all(
            products.map(async p => await productsService.getProduct(p.product))
        )
        if (prod.some(p => p === null))
            CustomError.createError({
                name: 'Product error',
                cause: generateNullError('Product'),
                message: 'One or more products were not found.',
                code: EErrors.NULL_ERROR,
            })

        const cart = await cartsService.updateCart(cid, { products })

        res.json({ status: 'success', payload: cart })
    } catch (error) {
        req.logger.error(error.toString())
        res.json({ status: 'error', error })
    }
}

// Actualizar la cantidad
export const updateQuantity = async (req, res) => {
    try {
        const { cid, pid } = req.params
        const { quantity } = req.body
        const userCart = req.user.cart.toString()

        if (cid !== userCart)
            CustomError.createError({
                name: 'Authorization error',
                cause: generateAuthorizationError(),
                message: 'You only have access to your own cart.',
                code: EErrors.AUTHORIZATION_ERROR,
            })

        const cart = await cartsService.getCart(cid)
        const product = await productsService.getProduct(pid)

        if (!cart)
            CustomError.createError({
                name: 'Cart error',
                cause: generateNullError('Cart'),
                message: 'Error trying to find cart',
                code: EErrors.NULL_ERROR,
            })
        if (!product)
            CustomError.createError({
                name: 'Product error',
                cause: generateNullError('Product'),
                message: 'Error trying to find product',
                code: EErrors.NULL_ERROR,
            })

        const productIndex = cart.products.findIndex(p =>
            p.product.equals(product._id)
        )
        cart.products[productIndex].quantity = parseInt(quantity)
        const updatedCart = await cartsService.updateCart(cid, cart)

        res.json({ status: 'success', payload: updatedCart })
    } catch (error) {
        req.logger.error(error.toString())
        res.json({ status: 'error', error })
    }
}

// Vaciar carrito
export const emptyCart = async (req, res) => {
    try {
        const cid = req.params.cid
        const userCart = req.user.cart.toString()

        if (cid !== userCart)
            CustomError.createError({
                name: 'Authorization error',
                cause: generateAuthorizationError(),
                message: 'You only have access to your own cart.',
                code: EErrors.AUTHORIZATION_ERROR,
            })

        const cart = await cartsService.updateCart(cid, { products: [] })
        res.json({ status: 'success', payload: cart })
    } catch (error) {
        req.logger.error(error.toString())
        res.json({ status: 'error', error })
    }
}

// Eliminar producto seleccionado
export const deleteProduct = async (req, res) => {
    try {
        const { cid, pid } = req.params
        const userCart = req.user.cart.toString()

        if (cid !== userCart)
            CustomError.createError({
                name: 'Authorization error',
                cause: generateAuthorizationError(),
                message: 'You only have access to your own cart.',
                code: EErrors.AUTHORIZATION_ERROR,
            })

        const cart = await CartModel.findOne({ _id: cid })
        const product = await ProductModel.findOne({ _id: pid })

        if (!cart)
            CustomError.createError({
                name: 'Cart error',
                cause: generateNullError('Cart'),
                message: 'Error trying to find cart',
                code: EErrors.NULL_ERROR,
            })
        if (!product)
            CustomError.createError({
                name: 'Product error',
                cause: generateNullError('Product'),
                message: 'Error trying to find product',
                code: EErrors.NULL_ERROR,
            })

        const productIndex = cart.products.findIndex(p =>
            p.product.equals(product._id)
        )

        const products = [...cart.products]
        products.splice(productIndex, 1)
        const updatedCart = await cartsService.updateCart(cid, { products })

        res.json({ status: 'success', payload: updatedCart })
    } catch (error) {
        req.logger.error(error.toString())
        res.json({ status: 'error', error })
    }
}

// Finalizar compra
export const purchase = async (req, res) => {
    try {
        const { cid } = req.params
        const purchaser = req.user.email
        const { outOfStock, ticket } = await cartsService.purchase(cid, purchaser)

        if (outOfStock.length > 0) {
            const ids = outOfStock.map(p => p._id)
            req.logger.info('One or more products were out of stock.')
            return res.json({ status: 'success', payload: ids })
        }

        res.json({ status: 'success', payload: ticket })
    } catch (error) {
        req.logger.error(error.toString())
        res.json({ status: 'error', error })
    }
}

export const prepareCheckout = async (req, res) => {
    try {
      const { cid } = req.params
      const purchaser = req.user.email
      const { outOfStock, available, preferenceId } = await cartsService.prepareCheckout(cid, purchaser)
  
      if (outOfStock.length > 0) {
        req.logger.info('One or more products were out of stock.')
        return res.json({ status: 'error', payload: { outOfStock }})
      }
  
      res.json({ status: 'success', payload: { items: available, preferenceId }})
    } catch (error) {
      req.logger.error(error.toString())
      res.json({ status: 'error', error })
    }
  }
  
  export const finishCheckout = async (req, res) => {
    try {
      const { cid } = req.params
      const { purchaser, ...payment } = req.query
  
      if(payment.type !== 'payment') return
      const data = await mercadopago.payment.findById(payment['data.id'])
      const ticket = await cartsService.finishCheckout(cid, data.body, purchaser)
  
      if(!ticket) return res.json({ status: 'error', error: 'Error during payment' })
      res.json({ status: 'success', payload: ticket })
    } catch (error) {
      req.logger.error(error.toString())
      res.json({ status: 'error', error })
    }
  }