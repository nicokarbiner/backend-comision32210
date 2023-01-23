import { Router } from 'express'
import cartModel from '../dao/models/cart.model.js'
import productModel from '../dao/models/product.model.js'

const router = Router()

// Crear carrito
router.post('/', async (req, res) => {
    try {
        const cart = await cartModel.create({products: []})
        res.json({ status: "success", payload: cart })
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

// Obtener productos de un carrito
router.get('/:cid', async (req, res) => {
    try {
        const cid = req.params.cid

        const products = await cartModel.findOne({_id: cid}).lean()

        res.json({ status: "success", payload: products })    
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

// Agregar producto a un carrito
router.post('/:cid/products/:pid', async (req, res) => {
    try {const cid = req.params.cid
        const pid = req.params.pid

        const cart = await cartModel.findOne({_id: cid})
        if(!cart) return res.send({status: "error", error: 'No se ha encontrado el carrito'})

        const product = await productModel.findOne({_id: pid})
        if(!product) return res.send({status: "error", error: 'No se ha encontrado el producto'})

        const productIndex = cart.products.findIndex(p => p.product.equals(product._id))
        if(productIndex === -1) {
            cart.products.push({product: product._id, quantity: 1})
            await cart.save()
        } else {
            cart.products[productIndex].quantity++
            await cartModel.updateOne({_id: cid}, cart)
        }

        res.json({ status: "success", payload: cart })
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

export default router