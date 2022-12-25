import { Router } from 'express'
import CartsManager from '../cartsManager.js'

const cartsRouter = Router()
const cartsManager = new CartsManager('./carrito.json')

cartsRouter.post('/', async (req, res) => {
    const cart = await cartsManager.addCart()

    res.json({status: 'success', message: cart})
})

cartsRouter.get('/:cid', async (req, res) => {
    const idCart = req.params.cid
    const cartById = await cartsManager.getCartsById(idCart)

    res.json({cartById})
})

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    const idCart = req.params.cid
    const idProd = req.params.pid
    const productAdded = await cartsManager.updateCart(idCart, idProd)

    res.json({status: 'success', message: 'Product Added to Cart!', product: productAdded})
})

export default cartsRouter